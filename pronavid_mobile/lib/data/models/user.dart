import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/user.dart';
import '../../core/utils/json_converters.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  @JsonKey(name: 'id_usuario', fromJson: JsonConverters.intFromUnknown)
  final int? id;
  
  @JsonKey(name: 'nombre_usuario', includeIfNull: true)
  final String? nombreUsuario;

  @JsonKey(name: 'primer_nombre')
  final String? primerNombre;

  @JsonKey(name: 'primer_apellido')
  final String? primerApellido;
  
  final String correo;
  
  @JsonKey(name: 'id_rol', fromJson: JsonConverters.intFromUnknownStrict)
  final int idRol;
  
  @JsonKey(name: 'tipo_documento')
  final String? tipoDocumento;

  @JsonKey(name: 'numero_documento')
  final String? numeroDocumento;

  final String? telefono;

  User({
    this.id,
    this.nombreUsuario,
    this.primerNombre,
    this.primerApellido,
    required this.correo,
    required this.idRol,
    this.tipoDocumento,
    this.numeroDocumento,
    this.telefono,
  });

  UserEntity toEntity() {
    String finalNombre = nombreUsuario ?? '';
    if (finalNombre.isEmpty && primerNombre != null) {
      finalNombre = '$primerNombre ${primerApellido ?? ''}'.trim();
    }
    if (finalNombre.isEmpty) finalNombre = correo.split('@')[0];

    return UserEntity(
      id: id ?? 0,
      nombre: finalNombre,
      correo: correo,
      idRol: idRol,
      tipoDocumento: tipoDocumento,
      numeroDocumento: numeroDocumento,
      telefono: telefono,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
