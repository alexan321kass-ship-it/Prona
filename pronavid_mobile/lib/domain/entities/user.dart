class UserEntity {
  final int id;
  final String nombre;
  final String correo;
  final int idRol;
  final String? tipoDocumento;
  final String? numeroDocumento;
  final String? telefono;

  UserEntity({
    required this.id,
    required this.nombre,
    required this.correo,
    required this.idRol,
    this.tipoDocumento,
    this.numeroDocumento,
    this.telefono,
  });

  bool get isAdmin => idRol == 1;
}


