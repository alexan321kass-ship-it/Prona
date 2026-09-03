// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pedido.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Pedido _$PedidoFromJson(Map<String, dynamic> json) => Pedido(
  id: JsonConverters.intFromUnknown(json['id_pedido']),
  idCliente: JsonConverters.intFromUnknownStrict(json['id_cliente']),
  idUsuario: JsonConverters.intFromUnknown(json['id_usuario']),
  fechaPedido: json['fecha_pedido'] as String?,
  estadoPedido: json['estado_pedido'] as String? ?? 'Pendiente',
  total: json['total'] == null
      ? 0.0
      : JsonConverters.doubleFromUnknown(json['total']),
  observaciones: json['observaciones'] as String?,
  cliente: json['cliente'] == null
      ? null
      : Cliente.fromJson(json['cliente'] as Map<String, dynamic>),
);

Map<String, dynamic> _$PedidoToJson(Pedido instance) => <String, dynamic>{
  'id_pedido': instance.id,
  'id_cliente': instance.idCliente,
  'id_usuario': instance.idUsuario,
  'fecha_pedido': instance.fechaPedido,
  'estado_pedido': instance.estadoPedido,
  'total': instance.total,
  'observaciones': instance.observaciones,
  'cliente': instance.cliente,
};

PedidoDetalle _$PedidoDetalleFromJson(Map<String, dynamic> json) =>
    PedidoDetalle(
      id: JsonConverters.intFromUnknown(
        PedidoDetalle._readIdDetalle(json, 'id_detalle_pedido'),
      ),
      idPedido: JsonConverters.intFromUnknown(
        PedidoDetalle._readIdPedido(json, 'id_pedido'),
      ),
      idProducto: JsonConverters.intFromUnknownStrict(json['id_producto']),
      cantidad: JsonConverters.intFromUnknownStrict(json['cantidad']),
      precioUnitario: JsonConverters.doubleFromUnknown(json['precio_unitario']),
      producto: json['producto'] == null
          ? null
          : Product.fromJson(json['producto'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$PedidoDetalleToJson(PedidoDetalle instance) =>
    <String, dynamic>{
      'id_detalle_pedido': instance.id,
      'id_pedido': instance.idPedido,
      'id_producto': instance.idProducto,
      'cantidad': instance.cantidad,
      'precio_unitario': instance.precioUnitario,
      'producto': instance.producto,
    };
