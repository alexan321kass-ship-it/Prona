abstract class Failure {
  final String message;
  Failure(this.message);

  @override
  String toString() => message;
}

class ServerFailure extends Failure {
  ServerFailure([super.message = 'Error en el servidor']);
}

class NetworkFailure extends Failure {
  NetworkFailure([super.message = 'Sin conexión a internet']);
}

class AuthFailure extends Failure {
  AuthFailure([super.message = 'Sesión no válida']);
}

class ValidationFailure extends Failure {
  ValidationFailure([super.message = 'Datos inválidos']);
}
