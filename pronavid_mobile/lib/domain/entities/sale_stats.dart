class SaleStatsEntity {
  final int pedidosHoy;
  final double ventasHoyTotal;
  final int clientesNuevosMes;
  final double promedioVenta;

  SaleStatsEntity({
    required this.pedidosHoy,
    required this.ventasHoyTotal,
    required this.clientesNuevosMes,
    required this.promedioVenta,
  });

  factory SaleStatsEntity.empty() {
    return SaleStatsEntity(
      pedidosHoy: 0,
      ventasHoyTotal: 0.0,
      clientesNuevosMes: 0,
      promedioVenta: 0.0,
    );
  }
}
