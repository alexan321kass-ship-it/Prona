import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateVentaDto } from "./dto/venta.dto";

@Injectable()
export class VentasService {
  constructor(private prisma: PrismaService) {}

  // Consultar historial de ventas con paginación y filtros por rango de fechas
  async getAll(
    limite: number = 50,
    offset: number = 0,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    const where: any = {};
    if (fechaDesde || fechaHasta) {
      where.fecha_venta = {};
      if (fechaDesde) where.fecha_venta.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha_venta.lte = new Date(fechaHasta);
    }

    const ventas = await this.prisma.venta.findMany({
      where,
      take: limite,
      skip: offset,
      include: {
        pedido: {
          include: {
            cliente: {
              select: { nombre_cliente: true, identificacion: true },
            },
          },
        },
      },
      orderBy: { fecha_venta: "desc" },
    });

    // Mapeo para simplificar la estructura de respuesta para el frontend
    return ventas.map((v) => ({
      ...v,
      nombre_cliente: v.pedido?.cliente?.nombre_cliente,
      identificacion: v.pedido?.cliente?.identificacion,
    }));
  }

  async count(fechaDesde?: string, fechaHasta?: string) {
    const where: any = {};
    if (fechaDesde || fechaHasta) {
      where.fecha_venta = {};
      if (fechaDesde) where.fecha_venta.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha_venta.lte = new Date(fechaHasta);
    }
    return this.prisma.venta.count({ where });
  }

  // Obtener una venta por su ID incluyendo información del cliente
  async getById(id: number) {
    const venta = await this.prisma.venta.findUnique({
      where: { id_venta: id },
      include: {
        pedido: {
          include: { cliente: true },
        },
      },
    });

    if (!venta) {
      throw new NotFoundException("Venta no encontrada");
    }

    return {
      ...venta,
      nombre_cliente: venta.pedido?.cliente?.nombre_cliente,
      identificacion: venta.pedido?.cliente?.identificacion,
    };
  }

  async getDetalles(id_venta: number) {
    return this.prisma.detalle_venta.findMany({
      where: { id_venta },
      include: {
        producto: {
          select: { nombre_producto: true, descripcion: true },
        },
      },
    });
  }

  async getByCliente(id_cliente: number) {
    return this.prisma.venta.findMany({
      where: {
        pedido: { id_cliente },
      },
      include: {
        pedido: {
          select: { estado_pedido: true },
        },
      },
      orderBy: { fecha_venta: "desc" },
    });
  }

  async getByPedido(id_pedido: number) {
    return this.prisma.venta.findFirst({
      where: { id_pedido },
      include: {
        pedido: {
          include: { cliente: { select: { nombre_cliente: true } } },
        },
      },
    });
  }

  // Procesar creación de venta, actualización de inventario y estado de pedido mediante transacción
  async create(data: CreateVentaDto) {
    const { id_pedido, detalles, id_usuario } = data;

    return this.prisma.$transaction(async (tx) => {
      // Validar existencia del pedido
      const pedido = await tx.pedido.findUnique({ where: { id_pedido } });
      if (!pedido) throw new BadRequestException("El pedido no existe");

      // Evitar duplicidad de ventas para un mismo pedido
      const ventaExistente = await tx.venta.findFirst({ where: { id_pedido } });
      if (ventaExistente)
        throw new BadRequestException("El pedido ya tiene una venta");

      let total = 0;
      const detallesProcessed: any[] = [];

      // Validación de stock y cálculo de totales
      for (const d of detalles) {
        const producto = await tx.producto.findUnique({
          where: { id_producto: d.id_producto },
        });
        if (!producto || (producto.stock || 0) < d.cantidad) {
          throw new BadRequestException(
            `Producto ${d.id_producto} inválido o sin stock suficiente`,
          );
        }
        const precio_unitario = d.precio_unitario || Number(producto.precio);
        total += d.cantidad * precio_unitario;

        detallesProcessed.push({
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario,
        });
      }

      // Registrar cabecera de la venta
      const venta = await tx.venta.create({
        data: {
          id_pedido,
          id_usuario: id_usuario || pedido.id_usuario,
          fecha_venta: new Date(),
          total,
          subtotal: total,
          estado_venta: "Pagada",
        },
      });

      // Registrar detalles y actualizar niveles de inventario
      for (const d of detallesProcessed) {
        await tx.detalle_venta.create({
          data: {
            id_venta: venta.id_venta,
            ...d,
          },
        });
        await tx.producto.update({
          where: { id_producto: d.id_producto },
          data: { stock: { decrement: d.cantidad } },
        });
      }

      // Actualizar estado del pedido a Entregado
      await tx.pedido.update({
        where: { id_pedido },
        data: { estado_pedido: "Entregado" },
      });

      return { ...venta, totalCalculado: total };
    });
  }

  // Generar estadísticas agregadas para el dashboard móvil (Resumen de hoy)
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Estadísticas de ventas de hoy
    const salesToday = await this.prisma.venta.aggregate({
      where: {
        fecha_venta: {
          gte: today,
          lt: tomorrow,
        },
      },
      _count: { _all: true },
      _sum: { total: true },
    });

    // Promedio de venta global
    const globalStats = await this.prisma.venta.aggregate({
      _avg: { total: true },
    });

    // Conteo de clientes (como no hay fecha de creación, enviamos el total)
    const totalClientes = await this.prisma.cliente.count();

    return {
      pedidosHoy: salesToday._count._all || 0,
      ventasHoyTotal: Number(salesToday._sum.total) || 0,
      clientesNuevosMes: totalClientes,
      promedioVenta: Number(globalStats._avg.total) || 0,
    };
  }

  // Procesar la devolución de una venta: devuelve stock y cancela la venta
  async crearDevolucion(id_venta: number, motivo: string, id_usuario: number) {
    return this.prisma.$transaction(
      async (tx) => {
        // Verificar que la venta exista
        const venta = await tx.venta.findUnique({
          where: { id_venta },
          include: { detalle_venta: true, devolucion: true },
        });

        if (!venta) throw new NotFoundException("Venta no encontrada");
        if (venta.estado_venta === "Cancelada")
          throw new BadRequestException(
            "La venta ya está cancelada o devuelta",
          );
        if (venta.devolucion && venta.devolucion.length > 0)
          throw new BadRequestException("Esta venta ya fue devuelta");

        // Crear el registro principal de devolución
        const devolucion = await tx.devolucion.create({
          data: {
            motivo,
            venta: { connect: { id_venta } },
            usuario: { connect: { id_usuario } },
          },
        });

        // Procesar cada producto en la venta
        for (const detalle of venta.detalle_venta) {
          // Registrar detalle_devolucion
          await tx.detalle_devolucion.create({
            data: {
              id_devolucion: devolucion.id_devolucion,
              id_producto: detalle.id_producto,
              cantidad: detalle.cantidad,
              precio_unitario: detalle.precio_unitario,
            },
          });

          // Retornar el stock al inventario
          await tx.producto.update({
            where: { id_producto: detalle.id_producto },
            data: { stock: { increment: detalle.cantidad } },
          });
        }

        // Cambiar estado de la venta para excluirla de totales contables
        await tx.venta.update({
          where: { id_venta },
          data: { estado_venta: "Cancelada" },
        });

        return devolucion;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );
  }
}
