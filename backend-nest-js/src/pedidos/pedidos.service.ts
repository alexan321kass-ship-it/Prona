import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreatePedidoDto, UpdatePedidoDto } from "./dto/pedido.dto";
import { NotificacionesService } from "../notificaciones/notificaciones.service";

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) {}

  // Consultar todos los pedidos con soporte para paginación y filtrado por estado
  async getAll(limite: number = 50, offset: number = 0, estado?: string) {
    const pedidos = await this.prisma.pedido.findMany({
      where: estado ? { estado_pedido: estado as any } : {},
      take: limite,
      skip: offset,
      include: {
        cliente: {
          select: {
            nombre_cliente: true,
            identificacion: true,
          },
        },
      },
      orderBy: { fecha_pedido: "desc" },
    });

    return pedidos.map((p) => ({
      ...p,
      nombre_cliente: p.cliente?.nombre_cliente,
      identificacion: p.cliente?.identificacion,
    }));
  }

  async count(estado?: string) {
    return this.prisma.pedido.count({
      where: estado ? { estado_pedido: estado as any } : {},
    });
  }

  // Buscar un pedido específico por ID incluyendo información detallada del cliente
  async getById(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id_pedido: id },
      include: {
        cliente: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException("Pedido no encontrado");
    }

    return {
      ...pedido,
      nombre_cliente: pedido.cliente?.nombre_cliente,
      identificacion: pedido.cliente?.identificacion,
      telefono_cliente: pedido.cliente?.telefono_cliente,
      direccion_cliente: pedido.cliente?.direccion_cliente,
      correo_cliente: pedido.cliente?.correo_cliente,
    };
  }

  // Obtener detalles de productos asociados a un pedido a través de su venta
  async getDetalles(id_pedido: number) {
    const detalles = await this.prisma.detalle_venta.findMany({
      where: {
        venta: {
          id_pedido: id_pedido,
        },
      },
      include: {
        producto: {
          select: {
            nombre_producto: true,
            precio: true,
          },
        },
      },
    });

    return detalles.map((d) => ({
      ...d,
      nombre_producto: d.producto?.nombre_producto,
      precio: d.producto?.precio,
      subtotal: Number(d.cantidad) * Number(d.producto?.precio || 0),
    }));
  }

  // Consultar historial de pedidos de un cliente específico
  async getByCliente(id_cliente: number) {
    const pedidos = await this.prisma.pedido.findMany({
      where: { id_cliente },
      include: {
        cliente: {
          select: {
            nombre_cliente: true,
            identificacion: true,
          },
        },
      },
      orderBy: { fecha_pedido: "desc" },
    });

    return pedidos.map((p) => ({
      ...p,
      nombre_cliente: p.cliente?.nombre_cliente,
      identificacion: p.cliente?.identificacion,
    }));
  }

  // Crear un nuevo pedido, registrando simultáneamente la venta inicial y ajustando inventario
  async create(data: CreatePedidoDto) {
    const { id_cliente, id_usuario, estado_pedido, productos } = data;

    const result = await this.prisma.$transaction(
      async (tx) => {
        const pedido = await tx.pedido.create({
          data: {
            id_cliente,
            id_usuario: id_usuario || 1,
            estado_pedido: (estado_pedido || "Pendiente") as any,
            fecha_pedido: new Date(),
          },
        });

        if (productos && productos.length > 0) {
          const total = productos.reduce(
            (sum, p) => sum + p.cantidad * p.precio_unitario,
            0,
          );

          const venta = await tx.venta.create({
            data: {
              id_pedido: pedido.id_pedido,
              id_usuario: id_usuario || 1,
              fecha_venta: new Date(),
              total,
              subtotal: total,
              estado_venta: "Pendiente",
            },
          });

          // Validación de existencias y descuento de inventario
          for (const p of productos) {
            const prod = await tx.producto.findUnique({
              where: { id_producto: p.id_producto },
              select: { stock: true, nombre_producto: true },
            });

            if (!prod) {
              throw new NotFoundException(
                `Producto ${p.id_producto} no encontrado`,
              );
            }

            if ((prod.stock || 0) < p.cantidad) {
              throw new BadRequestException(
                `Stock insuficiente para ${prod.nombre_producto}. Disponible: ${prod.stock}, Solicitado: ${p.cantidad}`,
              );
            }

            await tx.producto.update({
              where: { id_producto: p.id_producto },
              data: { stock: { decrement: p.cantidad } },
            });
          }

          await tx.detalle_venta.createMany({
            data: productos.map((p) => ({
              id_venta: venta.id_venta,
              id_producto: p.id_producto,
              cantidad: p.cantidad,
              precio_unitario: p.precio_unitario,
            })),
          });
        }

        return pedido;
      },
      {
        maxWait: 10000, // 10 seconds max wait to connect to prisma
        timeout: 20000, // 20 seconds timeout for the entire transaction
      },
    );

    // Disparar la notificación después de la creación exitosa
    try {
      await this.notificacionesService.create(
        result.id_pedido,
        `Se ha registrado el nuevo pedido #${result.id_pedido}`,
      );
    } catch (e) {
      console.error("Error creando notificación de nuevo pedido:", e);
    }

    return result;
  }

  // Actualizar estado del pedido y gestionar reposición de stock en caso de cancelación
  async update(id: number, data: UpdatePedidoDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const pedidoActual = await tx.pedido.findUnique({
        where: { id_pedido: id },
      });

      if (!pedidoActual) throw new NotFoundException("Pedido no encontrado");

      // Reponer stock si el pedido se cancela
      if (
        data.estado_pedido === "Cancelado" &&
        pedidoActual.estado_pedido !== "Cancelado"
      ) {
        const ventas = await tx.venta.findMany({
          where: { id_pedido: id },
          include: { detalle_venta: true },
        });

        for (const v of ventas) {
          for (const d of v.detalle_venta) {
            await tx.producto.update({
              where: { id_producto: d.id_producto },
              data: { stock: { increment: d.cantidad } },
            });
          }
        }
      }
      // Descontar stock si se reactiva un pedido cancelado
      else if (
        data.estado_pedido !== "Cancelado" &&
        pedidoActual.estado_pedido === "Cancelado"
      ) {
        const ventas = await tx.venta.findMany({
          where: { id_pedido: id },
          include: { detalle_venta: true },
        });

        for (const v of ventas) {
          for (const d of v.detalle_venta) {
            await tx.producto.update({
              where: { id_producto: d.id_producto },
              data: { stock: { decrement: d.cantidad } },
            });
          }
        }
      }

      return tx.pedido.update({
        where: { id_pedido: id },
        data: {
          estado_pedido: data.estado_pedido as any,
        },
      });
    });

    // Disparar la notificación después de actualizar exitosamente
    try {
      await this.notificacionesService.create(
        id,
        `El estado del pedido #${id} ha cambiado a ${data.estado_pedido}`,
      );
    } catch (e) {
      console.error("Error creando notificación de actualización:", e);
    }

    return result;
  }

  // Eliminar pedido con lógica de limpieza de registros relacionados y ajuste de inventario
  async delete(id: number) {
    const pedido = await this.getById(id);

    const estado = pedido.estado_pedido as string;
    if (estado !== "Pendiente" && estado !== "Cancelado") {
      throw new BadRequestException(
        "Solo se pueden eliminar pedidos Pendientes o Cancelados",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const ventas = await tx.venta.findMany({
        where: { id_pedido: id },
        include: { detalle_venta: true },
      });

      // Reponer stock si el pedido no estaba cancelado previamente
      if (pedido.estado_pedido !== "Cancelado") {
        for (const v of ventas) {
          for (const d of v.detalle_venta) {
            await tx.producto.update({
              where: { id_producto: d.id_producto },
              data: { stock: { increment: d.cantidad } },
            });
          }
          await tx.detalle_venta.deleteMany({
            where: { id_venta: v.id_venta },
          });
        }
      } else {
        for (const v of ventas) {
          await tx.detalle_venta.deleteMany({
            where: { id_venta: v.id_venta },
          });
        }
      }

      await tx.notificacion.deleteMany({ where: { id_pedido: id } });
      await tx.venta.deleteMany({ where: { id_pedido: id } });
      return tx.pedido.delete({ where: { id_pedido: id } });
    });
  }

  // Generar reporte estadístico resumido por estado de pedidos
  async getStats() {
    const stats = await this.prisma.pedido.groupBy({
      by: ["estado_pedido"],
      _count: {
        _all: true,
      },
    });

    const result = {
      total: 0,
      pendientes: 0,
      en_proceso: 0,
      entregados: 0,
      cancelados: 0,
    };

    stats.forEach((s) => {
      const count = s._count._all;
      result.total += count;
      const estado = s.estado_pedido as string;
      if (estado === "Pendiente") result.pendientes = count;
      if (estado === "En proceso") result.en_proceso = count;
      if (estado === "Entregado") result.entregados = count;
      if (estado === "Cancelado") result.cancelados = count;
    });

    return result;
  }

  // Búsqueda flexible de pedidos por cliente, identificación o ID
  async search(query: string) {
    const valorBusqueda = query.trim();
    const isNum = !isNaN(Number(valorBusqueda));

    const pedidos = await this.prisma.pedido.findMany({
      where: {
        OR: [
          { cliente: { nombre_cliente: { contains: valorBusqueda } } },
          { cliente: { identificacion: { contains: valorBusqueda } } },
          isNum ? { id_cliente: Number(valorBusqueda) } : {},
          isNum ? { id_pedido: Number(valorBusqueda) } : {},
        ].filter((cond) => Object.keys(cond).length > 0),
      },
      include: {
        cliente: {
          select: {
            nombre_cliente: true,
            identificacion: true,
          },
        },
      },
      orderBy: { fecha_pedido: "desc" },
      take: 100,
    });

    return pedidos.map((p) => ({
      ...p,
      nombre_cliente: p.cliente?.nombre_cliente,
      identificacion: p.cliente?.identificacion,
    }));
  }

  // Obtener lista de sugerencias para autocompletado en búsqueda de pedidos
  async getSugerencias() {
    const pedidos = await this.prisma.pedido.findMany({
      take: 200,
      orderBy: { fecha_pedido: "desc" },
      include: {
        cliente: {
          select: { nombre_cliente: true },
        },
      },
    });

    const sugerencias = new Set<string>();
    pedidos.forEach((p) => {
      sugerencias.add(`#${p.id_pedido}`);
      if (p.cliente?.nombre_cliente) {
        sugerencias.add(p.cliente.nombre_cliente);
      }
    });

    return Array.from(sugerencias);
  }
}
