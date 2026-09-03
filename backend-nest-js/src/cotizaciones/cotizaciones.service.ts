import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  CreateCotizacionDto,
  UpdateEstadoCotizacionDto,
} from "./dto/cotizacion.dto";

@Injectable()
export class CotizacionesService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva cotización
  async create(id_usuario: number, data: CreateCotizacionDto) {
    if (!data.detalles || data.detalles.length === 0) {
      throw new BadRequestException(
        "La cotización debe tener al menos un producto",
      );
    }

    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id_cliente: data.id_cliente },
    });

    if (!cliente) {
      throw new NotFoundException(
        `El cliente con ID ${data.id_cliente} no existe`,
      );
    }

    // Ejecutar en una transacción para asegurar consistencia
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear la cabecera de la cotización
      const cotizacion = await tx.cotizacion.create({
        data: {
          id_usuario: id_usuario,
          id_cliente: data.id_cliente,
          estado: "Pendiente",
          fecha_vigencia: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          // fecha_cotizacion usa now() por defecto
        },
      });

      // 2. Procesar los detalles
      for (const detalle of data.detalles) {
        // Obtener el precio actual del producto
        const producto = await tx.producto.findUnique({
          where: { id_producto: detalle.id_producto },
          select: { precio: true, nombre_producto: true },
        });

        if (!producto) {
          throw new NotFoundException(
            `El producto con ID ${detalle.id_producto} no existe`,
          );
        }

        // Crear el detalle de la cotización
        await tx.detalle_cotizacion.create({
          data: {
            id_cotizacion: cotizacion.id_cotizacion,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            precio_unitario: producto.precio,
          },
        });
      }

      // Retornar la cotización creada con sus detalles
      return tx.cotizacion.findUnique({
        where: { id_cotizacion: cotizacion.id_cotizacion },
        include: {
          detalle_cotizacion: {
            include: {
              producto: {
                select: { nombre_producto: true, codigo_interno: true },
              },
            },
          },
          cliente: { select: { nombre_cliente: true, identificacion: true } },
        },
      });
    });
  }

  // Listar todas las cotizaciones
  async findAll(limite: number = 50, offset: number = 0) {
    return this.prisma.cotizacion.findMany({
      take: limite,
      skip: offset,
      orderBy: { fecha_cotizacion: "desc" },
      include: {
        cliente: { select: { nombre_cliente: true, identificacion: true } },
        usuario: { select: { primer_nombre: true, primer_apellido: true } },
        detalle_cotizacion: true,
      },
    });
  }

  // Obtener el total de cotizaciones (para paginación)
  async count() {
    return this.prisma.cotizacion.count();
  }

  // Buscar una cotización específica
  async findById(id: number) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
      include: {
        cliente: true,
        usuario: {
          select: { primer_nombre: true, primer_apellido: true, correo: true },
        },
        detalle_cotizacion: {
          include: {
            producto: {
              select: { nombre_producto: true, codigo_interno: true },
            },
          },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización con ID ${id} no encontrada`);
    }

    return cotizacion;
  }

  // Actualizar el estado de una cotización
  async updateEstado(id: number, dto: UpdateEstadoCotizacionDto) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización con ID ${id} no encontrada`);
    }

    return this.prisma.cotizacion.update({
      where: { id_cotizacion: id },
      data: { estado: dto.estado },
      include: {
        cliente: { select: { nombre_cliente: true } },
      },
    });
  }

  // Eliminar una cotización
  async delete(id: number) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
      include: { detalle_cotizacion: true },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización con ID ${id} no encontrada`);
    }

    if (cotizacion.estado !== "Pendiente") {
      throw new BadRequestException(
        "Solo se pueden eliminar cotizaciones en estado Pendiente",
      );
    }

    // Eliminar en transacción (primero detalles, luego cabecera)
    return this.prisma.$transaction(async (tx) => {
      await tx.detalle_cotizacion.deleteMany({
        where: { id_cotizacion: id },
      });

      await tx.cotizacion.delete({
        where: { id_cotizacion: id },
      });

      return { message: "Cotización eliminada exitosamente" };
    });
  }
}
