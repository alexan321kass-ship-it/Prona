class NotificacionEntity {
  final int id;
  final int idPedido;
  final String mensaje;
  final bool leida;
  final String fecha;

  NotificacionEntity({
    required this.id,
    required this.idPedido,
    required this.mensaje,
    required this.leida,
    required this.fecha,
  });
}
