import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/cliente.dart';
import '../../core/utils/json_converters.dart';

part 'cliente.g.dart';

@JsonSerializable()
class Cliente {
  @JsonKey(name: 'id_cliente', fromJson: JsonConverters.intFromUnknown)
  final int? id;
  
  @JsonKey(name: 'nombre_cliente', defaultValue: 'Sin Nombre')
  final String nombre;
  
  final String identificacion;
  
  @JsonKey(name: 'telefono_cliente')
  final String? telefono;
  
  @JsonKey(name: 'direccion_cliente')
  final String? direccion;
  
  @JsonKey(name: 'correo_cliente')
  final String? correo;

  Cliente({
    this.id,
    required this.nombre,
    required this.identificacion,
    this.telefono,
    this.direccion,
    this.correo,
  });

  ClienteEntity toEntity() {
    return ClienteEntity(
      id: id ?? 0,
      nombre: nombre,
      identificacion: identificacion,
      telefono: telefono,
      direccion: direccion,
      correo: correo,
    );
  }

  factory Cliente.fromJson(Map<String, dynamic> json) => _$ClienteFromJson(json);
  Map<String, dynamic> toJson() => _$ClienteToJson(this);
}
