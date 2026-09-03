import '../../domain/entities/report_metrics.dart';
import '../../core/utils/json_converters.dart';

class ReportMapper {
  static DashboardMetricsEntity fromJson({
    required Map<String, dynamic> metricas,
    required List<dynamic> mensual,
    required List<dynamic> masVendidos,
    required Map<String, dynamic> resumen,
    required List<dynamic> clientesFrecuentes,
    required List<dynamic> historial,
  }) {
    return DashboardMetricsEntity(
      ingresosHistoricos: JsonConverters.doubleFromUnknown(metricas['ingresos_historicos']),
      totalClientes: JsonConverters.intFromUnknownStrict(metricas['total_clientes']),
      productosActivos: JsonConverters.intFromUnknownStrict(metricas['productos_activos']),
      totalVentas: JsonConverters.intFromUnknownStrict(resumen['totalVentas']),
      totalProductos: JsonConverters.intFromUnknownStrict(resumen['totalProductos']),
      ventasMensuales: mensual.map((m) => MonthlySaleEntity(
        mes: m['mes']?.toString() ?? 'N/A',
        total: JsonConverters.doubleFromUnknown(m['total_valor']),
      )).toList(),
      masVendidos: masVendidos.map((v) => TopProductEntity(
        nombre: v['producto']?.toString() ?? 'Producto',
        cantidad: JsonConverters.intFromUnknownStrict(v['total']),
      )).toList(),
      clientesFrecuentes: clientesFrecuentes.map((c) => FrequentClientEntity(
        nombre: c['nombre_cliente']?.toString() ?? 'Cliente',
        cantidad: JsonConverters.intFromUnknownStrict(c['cantidad']),
        productoTop: c['producto_mas_comprado']?.toString() ?? 'N/A',
      )).toList(),
      historialVentas: historial.map((h) => SaleHistoryEntity(
        fecha: h['fecha']?.toString() ?? 'N/A',
        producto: h['producto']?.toString() ?? 'Producto',
        cantidad: JsonConverters.intFromUnknownStrict(h['cantidad']),
        cliente: h['cliente']?.toString() ?? 'Cliente',
        total: JsonConverters.doubleFromUnknown(h['total']),
      )).toList(),
    );
  }
}
