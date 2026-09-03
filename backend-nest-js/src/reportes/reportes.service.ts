import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  // Helper para convertir tipos BigInt y Decimal a tipos numéricos serializables por JSON
  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "bigint") return Number(obj);
    if (obj instanceof Date) return obj;

    if (
      typeof obj === "object" &&
      (obj.constructor?.name === "Decimal" || obj.s !== undefined)
    ) {
      return Number(obj);
    }

    if (Array.isArray(obj))
      return obj.map((item) => this.serializeBigInt(item));
    if (typeof obj === "object") {
      const newObj = {};
      for (const key in obj) {
        newObj[key] = this.serializeBigInt(obj[key]);
      }
      return newObj;
    }
    return obj;
  }

  // Obtener historial detallado de transacciones de venta
  async getHistorial() {
    const result = await this.prisma.$queryRaw`
      SELECT 
          v.id_venta,
          v.estado_venta,
          v.fecha_venta AS fecha,
          p.nombre_producto AS producto,
          dv.cantidad,
          c.nombre_cliente AS cliente,
          (dv.cantidad * p.precio) AS total
      FROM venta v
      JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      JOIN producto p ON dv.id_producto = p.id_producto
      JOIN pedido pe ON v.id_pedido = pe.id_pedido
      JOIN cliente c ON pe.id_cliente = c.id_cliente
      ORDER BY v.fecha_venta DESC
    `;
    return this.serializeBigInt(result);
  }

  // Identificar los productos con mayor volumen de ventas
  async getMasVendidos() {
    const ventas = await this.prisma.$queryRaw`
      SELECT 
          MONTHNAME(v.fecha_venta) AS mes,
          p.nombre_producto AS producto,
          SUM(dv.cantidad) AS cantidad
      FROM venta v
      JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      JOIN producto p ON dv.id_producto = p.id_producto
      GROUP BY mes, producto
      ORDER BY cantidad DESC
    `;

    const totales = await this.prisma.$queryRaw`
      SELECT 
          p.nombre_producto AS producto,
          SUM(dv.cantidad) AS total
      FROM detalle_venta dv
      JOIN producto p ON dv.id_producto = p.id_producto
      GROUP BY p.id_producto
      ORDER BY total DESC
    `;

    return {
      ventas: this.serializeBigInt(ventas),
      totales: this.serializeBigInt(totales),
    };
  }

  // Análisis de clientes frecuentes y sus productos de mayor consumo
  async getClientesFrecuentes() {
    const result = await this.prisma.$queryRaw`
      WITH compras AS (
          SELECT 
              c.id_cliente,
              c.nombre_cliente,
              p.nombre_producto,
              SUM(dv.cantidad) AS total_producto
          FROM cliente c
          JOIN pedido pe ON c.id_cliente = pe.id_cliente
          JOIN venta v ON pe.id_pedido = v.id_pedido
          JOIN detalle_venta dv ON v.id_venta = dv.id_venta
          JOIN producto p ON dv.id_producto = p.id_producto
          GROUP BY c.id_cliente, p.id_producto
      ),
      producto_top AS (
          SELECT *,
              ROW_NUMBER() OVER(PARTITION BY id_cliente ORDER BY total_producto DESC) AS rn
          FROM compras
      ),
      totales AS (
          SELECT 
              id_cliente,
              nombre_cliente,
              SUM(total_producto) AS cantidad_total
          FROM compras
          GROUP BY id_cliente, nombre_cliente
      )
      SELECT 
          t.nombre_cliente,
          t.cantidad_total AS cantidad,
          pt.nombre_producto AS producto_mas_comprado
      FROM totales t
      JOIN producto_top pt ON t.id_cliente = pt.id_cliente AND pt.rn = 1
      ORDER BY t.cantidad_total DESC
    `;
    return this.serializeBigInt(result);
  }

  // Obtener resumen global de ingresos y unidades vendidas
  async getResumen() {
    const result: any[] = await this.prisma.$queryRaw`
      SELECT 
          COUNT(DISTINCT v.id_venta) AS totalVentas,
          SUM(dv.cantidad) AS totalProductos,
          SUM(dv.cantidad * p.precio) AS totalIngresos
      FROM venta v
      JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      JOIN producto p ON dv.id_producto = p.id_producto
    `;
    const serialized = this.serializeBigInt(result);
    return (
      serialized[0] || { totalVentas: 0, totalProductos: 0, totalIngresos: 0 }
    );
  }

  // Reporte de rendimiento de ventas segmentado por mes (año actual)
  async getVentasMensuales() {
    const result = await this.prisma.$queryRaw`
      SELECT 
          DATE_FORMAT(v.fecha_venta, '%Y-%m') as mes_key,
          MONTHNAME(v.fecha_venta) as mes,
          SUM(dv.cantidad * p.precio) as total_valor,
          SUM(dv.cantidad) as total_unidades
      FROM venta v
      JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      JOIN producto p ON dv.id_producto = p.id_producto
      WHERE YEAR(v.fecha_venta) = YEAR(CURDATE())
      GROUP BY mes_key, mes
      ORDER BY mes_key ASC
    `;
    return this.serializeBigInt(result);
  }

  // Métricas operativas generales del sistema
  async getMetricasGrales() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM cliente) as total_clientes,
        (SELECT COUNT(*) FROM producto WHERE stock > 0) as productos_activos,
        COALESCE((SELECT SUM(dv.cantidad * p.precio) FROM detalle_venta dv JOIN producto p ON dv.id_producto = p.id_producto), 0) as ingresos_historicos,
        (SELECT COUNT(id_pedido) FROM pedido WHERE estado_pedido = 'Pendiente') as pedidos_pendientes
    `;
    const serialized = this.serializeBigInt(result);
    return (
      serialized[0] || {
        total_clientes: 0,
        productos_activos: 0,
        ingresos_historicos: 0,
        pedidos_pendientes: 0,
      }
    );
  }
}
