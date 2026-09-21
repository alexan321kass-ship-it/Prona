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

  private validarDatosCliente(nombre?: string, iden?: string, tel?: string, correo?: string, direccion?: string) {
    if (nombre !== undefined) {
      if (!nombre.trim()) {
        throw new BadRequestException("El nombre del cliente es requerido");
      }
      if (/\d/.test(nombre)) {
        throw new BadRequestException("El nombre del cliente no puede contener números");
      }
      if (/[<>{}\[\]\\^~*|=#$%@!?;:\"'`+]/g.test(nombre)) {
        throw new BadRequestException("El nombre del cliente no permite caracteres especiales");
      }
    }

    if (iden !== undefined) {
      if (!iden.trim()) {
        throw new BadRequestException("La identificación es requerida");
      }
      if (!/^[0-9-]+$/.test(iden.trim())) {
        throw new BadRequestException("La identificación solo puede contener números");
      }
    }

    if (tel && tel.trim() && !/^\d{7,10}$/.test(tel.trim())) {
      throw new BadRequestException("El teléfono solo puede contener entre 7 y 10 números");
    }

    if (correo && correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      throw new BadRequestException("El correo electrónico no tiene un formato válido");
    }

    if (direccion && direccion.trim() && /[<>{}\[\]\\^~*|=#$%@!?\"'`+]/g.test(direccion.trim())) {
      throw new BadRequestException("La dirección no permite caracteres especiales");
    }
  }

  // Registrar un nuevo cliente con validación de identificación única
  async create(data: CreateClienteDto) {
    const { nombre_cliente, identificacion, telefono, direccion, correo } =
      data;

    this.validarDatosCliente(nombre_cliente, identificacion, telefono, correo, direccion);

    const exists = await this.prisma.cliente.findUnique({
      where: { identificacion: identificacion.trim() },
    });

    if (exists) {
      throw new BadRequestException(
        "Ya existe un cliente con esa identificación",
      );
    }

    return (this.prisma.cliente as any).create({
      data: {
        nombre_cliente: nombre_cliente.trim(),
        identificacion: identificacion.trim(),
        telefono_cliente: telefono ? telefono.trim() : null,
        direccion_cliente: direccion ? direccion.trim() : null,
        correo_cliente: correo ? correo.trim() : null,
        estado: data.estado !== undefined ? Boolean(data.estado) : true,
      },
    });
  }

  // Actualizar datos de un cliente existente
  async update(id: number, data: UpdateClienteDto) {
    const existing = await this.getById(id);

    this.validarDatosCliente(
      data.nombre_cliente,
      data.identificacion,
      data.telefono,
      data.correo,
      data.direccion,
    );

    if (
      data.identificacion &&
      data.identificacion.trim() !== existing.identificacion
    ) {
      const exists = await (this.prisma.cliente as any).findUnique({
        where: { identificacion: data.identificacion.trim() },
      });
      if (exists) {
        throw new BadRequestException(
          "Ya existe otro cliente con esa identificación",
        );
      }
    }

    return (this.prisma.cliente as any).update({
      where: { id_cliente: id },
      data: {
        nombre_cliente: data.nombre_cliente?.trim(),
        identificacion: data.identificacion?.trim(),
        telefono_cliente: data.telefono !== undefined ? data.telefono?.trim() : undefined,
        direccion_cliente: data.direccion !== undefined ? data.direccion?.trim() : undefined,
        correo_cliente: data.correo !== undefined ? data.correo?.trim() : undefined,
        estado: data.estado !== undefined ? Boolean(data.estado) : undefined,
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
