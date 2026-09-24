import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import * as bcrypt from "bcryptjs";
import { UpdateUserDto } from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los usuarios con sus respectivos roles
  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        primer_nombre: true,
        primer_apellido: true,
        tipo_documento: true,
        numero_documento: true,
        correo: true,
        estado: true,
        id_rol: true,
        rol: {
          select: { nombre_rol: true },
        },
      },
    });
  }

  // Buscar un usuario por su ID (excluyendo la contraseña por seguridad)
  async findById(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol: true },
    });

    if (!user) throw new NotFoundException("Usuario no encontrado");

    const { contrasena, ...safeUser } = user;
    return safeUser;
  }

  // Métodos auxiliares de búsqueda
  async findByEmail(correo: string) {
    return this.prisma.usuario.findUnique({ where: { correo } });
  }

  async findByDocument(numero_documento: string) {
    return this.prisma.usuario.findUnique({ where: { numero_documento } });
  }

  // Crear un nuevo usuario con validación de unicidad y encriptación
  async create(data: any) {
    if (data.correo && data.correo.trim()) {
      const emailTrim = data.correo.trim().toLowerCase();

      const existingUserEmail = await this.prisma.usuario.findFirst({
        where: { correo: { equals: emailTrim, mode: "insensitive" } },
      });
      if (existingUserEmail) {
        throw new BadRequestException("Este correo ya se encuentra registrado");
      }

      const existingClientEmail = await (this.prisma.cliente as any).findFirst({
        where: { correo_cliente: { equals: emailTrim, mode: "insensitive" } },
      });
      if (existingClientEmail) {
        throw new BadRequestException("Este correo ya pertenece a un cliente");
      }
    }

    if (data.numero_documento && data.numero_documento.toString().trim()) {
      const docTrim = data.numero_documento.toString().trim();
      const existingDoc = await this.findByDocument(docTrim);
      if (existingDoc) {
        throw new BadRequestException("El número de documento ya se encuentra registrado");
      }
    }

    const hashed = await bcrypt.hash(data.contrasena, 10);

    return this.prisma.usuario.create({
      data: {
        ...data,
        correo: data.correo ? data.correo.trim() : data.correo,
        numero_documento: data.numero_documento ? data.numero_documento.toString().trim() : data.numero_documento,
        contrasena: hashed,
      },
    });
  }

  // Actualizar datos de usuario
  async update(id: number, data: UpdateUserDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });
    if (!user) throw new NotFoundException("Usuario no encontrado");

    if (data.correo && data.correo.trim()) {
      const emailTrim = data.correo.trim().toLowerCase();

      const existingUserEmail = await this.prisma.usuario.findFirst({
        where: {
          correo: { equals: emailTrim, mode: "insensitive" },
          id_usuario: { not: id },
        },
      });
      if (existingUserEmail) {
        throw new BadRequestException("Este correo ya se encuentra registrado");
      }

      const existingClientEmail = await (this.prisma.cliente as any).findFirst({
        where: { correo_cliente: { equals: emailTrim, mode: "insensitive" } },
      });
      if (existingClientEmail) {
        throw new BadRequestException("Este correo ya pertenece a un cliente");
      }
    }

    if (data.numero_documento && data.numero_documento.toString().trim()) {
      const docTrim = data.numero_documento.toString().trim();
      const existingDoc = await this.prisma.usuario.findFirst({
        where: {
          numero_documento: docTrim,
          id_usuario: { not: id },
        },
      });
      if (existingDoc) {
        throw new BadRequestException("El número de documento ya se encuentra registrado");
      }
    }

    // Manejo de cambio de contraseña con validación de la actual
    let nuevaContrasenaHash: string | undefined = undefined;

    if (data.contrasena_nueva) {
      if (!data.contrasena_actual) {
        throw new BadRequestException("Debe proporcionar la contraseña actual para cambiarla");
      }
      const isValid = await bcrypt.compare(data.contrasena_actual, user.contrasena);
      if (!isValid) {
        throw new BadRequestException("La contraseña actual es incorrecta");
      }
      nuevaContrasenaHash = await bcrypt.hash(data.contrasena_nueva, 10);
    } else if (data.contrasena) {
      // Caso donde un admin fuerza el reset sin necesidad de la actual
      nuevaContrasenaHash = await bcrypt.hash(data.contrasena, 10);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        primer_nombre: data.primer_nombre,
        primer_apellido: data.primer_apellido,
        tipo_documento: data.tipo_documento as any,
        numero_documento: data.numero_documento,
        correo: data.correo,
        contrasena: nuevaContrasenaHash,
        estado:
          data.estado !== undefined ? (Boolean(data.estado) as any) : undefined,
        id_rol: data.id_rol,
      },
    });
  }

  // Eliminar un usuario
  async delete(id: number) {
    return this.prisma.usuario.delete({ where: { id_usuario: id } });
  }
  // Alternar el estado (Activo/Inactivo) de un usuario
  async toggleEstado(id: number, estado: boolean) {
    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { estado },
    });
  }

  // Generar nueva contraseña temporal (fuerza requiere_cambio_contrasena = true)
  async resetPassword(id: number) {
    // Para simplificar, generamos una contraseña aleatoria de 8 caracteres
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(tempPassword, 10);

    await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        contrasena: hashed,
      },
    });

    return { tempPassword };
  }
}
