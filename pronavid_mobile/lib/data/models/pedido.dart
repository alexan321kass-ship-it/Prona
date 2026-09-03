import 'package:json_annotation/json_annotation.dart';
import 'cliente.dart';
import 'product.dart';
import '../../domain/entities/pedido.dart';
import '../../domain/entities/pedido_detalle.dart';
import '../../core/utils/json_converters.dart';

part 'pedido.g.dart';

@JsonSerializable()
class Pedido {
  @JsonKey(name: 'id_pedido', fromJson: JsonConverters.intFromUnknown)
  final int? id;
  
  @JsonKey(name: 'id_cliente', fromJson: JsonConverters.intFromUnknownStrict)
  final int idCliente;
  
  @JsonKey(name: 'id_usuario', fromJson: JsonConverters.intFromUnknown)
  final int? idUsuario;
  
  @JsonKey(name: 'fecha_pedido')
  final String? fechaPedido;
  
  @JsonKey(name: 'estado_pedido', defaultValue: 'Pendiente')
  final String estadoPedido;

  @JsonKey(defaultValue: 0.0, fromJson: JsonConverters.doubleFromUnknown)
  final double total;

  
  final String? observaciones;
  final Cliente? cliente;

  Pedido({
    this.id,
    required this.idCliente,
    this.idUsuario,
    this.fechaPedido,
    required this.estadoPedido,
    this.total = 0.0,
    this.observaciones,
    this.cliente,
  });

  PedidoEntity toEntity() {
    return PedidoEntity(
      id: id ?? 0,
      idCliente: idCliente,
      fecha: fechaPedido ?? '',
      estado: estadoPedido,
      total: total,
      observaciones: observaciones,
      cliente: cliente?.toEntity(),
    );
  }

  factory Pedido.fromJson(Map<String, dynamic> json) => _$PedidoFromJson(json);
  Map<String, dynamic> toJson() => _$PedidoToJson(this);
}

@JsonSerializable()
class PedidoDetalle {
  @JsonKey(name: 'id_detalle_pedido', fromJson: JsonConverters.intFromUnknown, readValue: _readIdDetalle)
  final int? id;
  
  @JsonKey(name: 'id_pedido', fromJson: JsonConverters.intFromUnknown, readValue: _readIdPedido)
  final int? idPedido;
  
  @JsonKey(name: 'id_producto', fromJson: JsonConverters.intFromUnknownStrict)
  final int idProducto;
  
  @JsonKey(fromJson: JsonConverters.intFromUnknownStrict)
  final int cantidad;
  
  @JsonKey(name: 'precio_unitario', fromJson: JsonConverters.doubleFromUnknown)
  final double precioUnitario;
  
  final Product? producto;

  PedidoDetalle({
    this.id,
    this.idPedido,
    required this.idProducto,
    required this.cantidad,
    required this.precioUnitario,
    this.producto,
  });

  PedidoDetalleEntity toEntity() {
    return PedidoDetalleEntity(
      id: id ?? 0,
      idPedido: idPedido,
      idProducto: idProducto,
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      producto: producto?.toEntity(),
    );
  }

  // Estos readValue son específicos de PedidoDetalle (fallbacks de campo)
  static Object? _readIdDetalle(Map json, String key) => json[key] ?? json['id_detalle_venta'];
  static Object? _readIdPedido(Map json, String key) => json[key] ?? json['id_venta'];

  factory PedidoDetalle.fromJson(Map<String, dynamic> json) => _$PedidoDetalleFromJson(json);
  Map<String, dynamic> toJson() => _$PedidoDetalleToJson(this);
}
