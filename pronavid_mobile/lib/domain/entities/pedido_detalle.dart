import 'product.dart';

class PedidoDetalleEntity {
  final int id;
  final int? idPedido;
  final int idProducto;
  final int cantidad;
  final double precioUnitario;
  final ProductEntity? producto;

  PedidoDetalleEntity({
    required this.id,
    this.idPedido,
    required this.idProducto,
    required this.cantidad,
    required this.precioUnitario,
    this.producto,
  });
}
