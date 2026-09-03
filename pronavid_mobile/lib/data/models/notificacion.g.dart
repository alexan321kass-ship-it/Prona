// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notificacion.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Notificacion _$NotificacionFromJson(Map<String, dynamic> json) => Notificacion(
  id: JsonConverters.intFromUnknown(json['id_notificacion']),
  idPedido: JsonConverters.intFromUnknownStrict(json['id_pedido']),
  mensaje: json['mensaje'] as String,
  leida: JsonConverters.boolFromUnknown(json['leida']),
  fechaNotificacion: json['fecha_notificacion'] as String?,
);

Map<String, dynamic> _$NotificacionToJson(Notificacion instance) =>
    <String, dynamic>{
      'id_notificacion': instance.id,
      'id_pedido': instance.idPedido,
      'mensaje': instance.mensaje,
      'leida': instance.leida,
      'fecha_notificacion': instance.fechaNotificacion,
    };
