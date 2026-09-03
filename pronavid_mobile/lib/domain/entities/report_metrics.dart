class DashboardMetricsEntity {
  final double ingresosHistoricos;
  final int totalClientes;
  final int productosActivos;
  final int totalVentas;
  final int totalProductos;
  final List<MonthlySaleEntity> ventasMensuales;
  final List<TopProductEntity> masVendidos;
  final List<FrequentClientEntity> clientesFrecuentes;
  final List<SaleHistoryEntity> historialVentas;

  DashboardMetricsEntity({
    required this.ingresosHistoricos,
    required this.totalClientes,
    required this.productosActivos,
    required this.totalVentas,
    required this.totalProductos,
    required this.ventasMensuales,
    required this.masVendidos,
    required this.clientesFrecuentes,
    required this.historialVentas,
  });
}

class MonthlySaleEntity {
  final String mes;
  final double total;

  MonthlySaleEntity({required this.mes, required this.total});
}

class TopProductEntity {
  final String nombre;
  final int cantidad;

  TopProductEntity({required this.nombre, required this.cantidad});
}

class FrequentClientEntity {
  final String nombre;
  final int cantidad;
  final String productoTop;

  FrequentClientEntity({required this.nombre, required this.cantidad, required this.productoTop});
}

class SaleHistoryEntity {
  final String fecha;
  final String producto;
  final int cantidad;
  final String cliente;
  final double total;

  SaleHistoryEntity({
    required this.fecha,
    required this.producto,
    required this.cantidad,
    required this.cliente,
    required this.total,
  });
}
