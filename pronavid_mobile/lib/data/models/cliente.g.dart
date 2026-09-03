// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cliente.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Cliente _$ClienteFromJson(Map<String, dynamic> json) => Cliente(
  id: JsonConverters.intFromUnknown(json['id_cliente']),
  nombre: json['nombre_cliente'] as String? ?? 'Sin Nombre',
  identificacion: json['identificacion'] as String,
  telefono: json['telefono_cliente'] as String?,
  direccion: json['direccion_cliente'] as String?,
  correo: json['correo_cliente'] as String?,
);

Map<String, dynamic> _$ClienteToJson(Cliente instance) => <String, dynamic>{
  'id_cliente': instance.id,
  'nombre_cliente': instance.nombre,
  'identificacion': instance.identificacion,
  'telefono_cliente': instance.telefono,
  'direccion_cliente': instance.direccion,
  'correo_cliente': instance.correo,
};
