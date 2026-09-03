class ClienteEntity {
  final int id;
  final String nombre;
  final String identificacion;
  final String? telefono;
  final String? direccion;
  final String? correo;

  ClienteEntity({
    required this.id,
    required this.nombre,
    required this.identificacion,
    this.telefono,
    this.direccion,
    this.correo,
  });
}
