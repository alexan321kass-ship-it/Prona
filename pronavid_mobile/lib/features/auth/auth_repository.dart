import '../../core/api_client.dart';
import '../../data/models/user.dart';
import '../../domain/entities/user.dart';
import 'package:dio/dio.dart';
import '../../core/error/failures.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  Future<UserEntity?> login(String email, String password) async {
    try {
      final response = await _apiClient.dio.post('/auth/login', data: {
        'correo': email,
        'contrasena': password,
      });
      if (response.data != null && response.data['user'] != null) {
        return User.fromJson(response.data['user']).toEntity();
      }
      return null;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al iniciar sesión');
    }
  }


  Future<Map<String, dynamic>?> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiClient.dio.post('/auth/register', data: userData);
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al registrar usuario');
    }
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await _apiClient.dio.post('/auth/forgot-password', data: {
        'correo': email,
      });
      return response.data; // should contain { message, resetToken }
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al solicitar código de recuperación');
    }
  }

  Future<Map<String, dynamic>> resetPassword(String token, String code, String newPassword) async {
    try {
      final response = await _apiClient.dio.post('/auth/reset-password', data: {
        'token': token,
        'codigo': code,
        'nuevaContrasena': newPassword,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al restablecer contraseña');
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.dio.post('/auth/logout');
      await _apiClient.storage.delete(key: 'session_cookie');
    } catch (e) {
      // Ignorar error de red al hacer logout, pero limpiar localmente
      await _apiClient.storage.delete(key: 'session_cookie');
    }
  }

  Failure _handleDioError(DioException e, String defaultMessage) {
    if (e.response == null) {
      return NetworkFailure(
        'No se pudo conectar al servidor en:\n${e.requestOptions.uri}\n\n'
        'Verifique que el backend esté corriendo y que la dirección IP sea accesible.',
      );
    }
    final message = e.response?.data['message'] ?? defaultMessage;
    return ServerFailure(message);
  }
}
