import 'cliente.dart';
import 'pedido_detalle.dart';

class PedidoEntity {
  final int id;
  final int idCliente;
  final String fecha;
  final String estado;
  final double total;
  final String? observaciones;
  final ClienteEntity? cliente;
  final List<PedidoDetalleEntity> detalles;

  PedidoEntity({
    required this.id,
    required this.idCliente,
    required this.fecha,
    required this.estado,
    required this.total,
    this.observaciones,
    this.cliente,
    this.detalles = const [],
  });

}

