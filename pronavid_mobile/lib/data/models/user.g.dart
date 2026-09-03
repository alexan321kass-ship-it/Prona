// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: JsonConverters.intFromUnknown(json['id_usuario']),
  nombreUsuario: json['nombre_usuario'] as String?,
  primerNombre: json['primer_nombre'] as String?,
  primerApellido: json['primer_apellido'] as String?,
  correo: json['correo'] as String,
  idRol: JsonConverters.intFromUnknownStrict(json['id_rol']),
  tipoDocumento: json['tipo_documento'] as String?,
  numeroDocumento: json['numero_documento'] as String?,
  telefono: json['telefono'] as String?,
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  'id_usuario': instance.id,
  'nombre_usuario': instance.nombreUsuario,
  'primer_nombre': instance.primerNombre,
  'primer_apellido': instance.primerApellido,
  'correo': instance.correo,
  'id_rol': instance.idRol,
  'tipo_documento': instance.tipoDocumento,
  'numero_documento': instance.numeroDocumento,
  'telefono': instance.telefono,
};
