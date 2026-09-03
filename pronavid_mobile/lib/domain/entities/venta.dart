class VentaEntity {
  final int id;
  final int idPedido;
  final int? idUsuario;
  final String fecha;
  final double total;
  final String estadoVenta;

  VentaEntity({
    required this.id,
    required this.idPedido,
    this.idUsuario,
    required this.fecha,
    required this.total,
    required this.estadoVenta,
  });
}
