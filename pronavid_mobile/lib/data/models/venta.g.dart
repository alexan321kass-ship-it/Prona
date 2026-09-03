// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'venta.dart';

// **************************************************************************.
// JsonSerializableGenerator
// **************************************************************************


Venta _$VentaFromJson(Map<String, dynamic> json) => Venta(
  id: JsonConverters.intFromUnknown(json['id_venta']),
  idPedido: JsonConverters.intFromUnknownStrict(json['id_pedido']),
  idUsuario: JsonConverters.intFromUnknown(json['id_usuario']),
  fechaVenta: json['fecha_venta'] as String?,
  estadoVenta: json['estado_venta'] as String?,
  total: JsonConverters.doubleFromUnknown(json['total']),
);

Map<String, dynamic> _$VentaToJson(Venta instance) => <String, dynamic>{
  'id_venta': instance.id,
  'id_pedido': instance.idPedido,
  'id_usuario': instance.idUsuario,
  'fecha_venta': instance.fechaVenta,
  'estado_venta': instance.estadoVenta,
  'total': instance.total,
};
