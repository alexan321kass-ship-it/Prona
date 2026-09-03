import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateClienteDto, UpdateClienteDto } from "./dto/cliente.dto";

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  // Obtener listado completo de clientes
  async getAll() {
    return this.prisma.cliente.findMany({
      orderBy: { nombre_cliente: "asc" },
    });
  }

  // Búsqueda de clientes por nombre o identificación
  async search(q: string) {
    if (!q || q.trim() === "") {
      throw new BadRequestException("Debe proporcionar un término de búsqueda");
    }

    return this.prisma.cliente.findMany({
      where: {
        OR: [
          { nombre_cliente: { contains: q } },
          { identificacion: { contains: q } },
        ],
      },
      orderBy: { nombre_cliente: "asc" },
    });
  }

  // Obtener información detallada de un cliente por ID
  async getById(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id_cliente: id },
    });

    if (!cliente) {
      throw new NotFoundException("Cliente no encontrado");
    }

    return cliente;
  }

  // Registrar un nuevo cliente con validación de identificación única
  async create(data: CreateClienteDto) {
    const { nombre_cliente, identificacion, telefono, direccion, correo } =
      data;

    const exists = await this.prisma.cliente.findUnique({
      where: { identificacion },
    });

    if (exists) {
      throw new BadRequestException(
        "Ya existe un cliente con esa identificación",
      );
    }

    return this.prisma.cliente.create({
      data: {
        nombre_cliente: nombre_cliente.trim(),
        identificacion: identificacion.trim(),
        telefono_cliente: telefono || null,
        direccion_cliente: direccion || null,
        correo_cliente: correo || null,
      },
    });
  }

  // Actualizar datos de un cliente existente
  async update(id: number, data: UpdateClienteDto) {
    const existing = await this.getById(id);

    if (
      data.identificacion &&
      data.identificacion !== existing.identificacion
    ) {
      const exists = await this.prisma.cliente.findUnique({
        where: { identificacion: data.identificacion },
      });
      if (exists) {
        throw new BadRequestException(
          "Ya existe otro cliente con esa identificación",
        );
      }
    }

    return this.prisma.cliente.update({
      where: { id_cliente: id },
      data: {
        nombre_cliente: data.nombre_cliente?.trim(),
        identificacion: data.identificacion?.trim(),
        telefono_cliente: data.telefono,
        direccion_cliente: data.direccion,
        correo_cliente: data.correo,
      },
    });
  }

  // Eliminar un cliente (solo si no tiene historial de pedidos ni cotizaciones)
  async delete(id: number) {
    await this.getById(id);

    const hasPedidos = await this.prisma.pedido.findFirst({
      where: { id_cliente: id },
    });

    if (hasPedidos) {
      throw new BadRequestException(
        "No se puede eliminar el cliente porque tiene pedidos asociados",
      );
    }

    const hasCotizaciones = await this.prisma.cotizacion.findFirst({
      where: { id_cliente: id },
    });

    if (hasCotizaciones) {
      throw new BadRequestException(
        "No se puede eliminar el cliente porque tiene cotizaciones asociadas",
      );
    }

    try {
      return await this.prisma.cliente.delete({
        where: { id_cliente: id },
      });
    } catch (error) {
      throw new BadRequestException(
        "No se pudo eliminar el cliente debido a restricciones de base de datos",
      );
    }
  }
}
