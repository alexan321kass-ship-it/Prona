import '../../core/api_client.dart';
import '../../data/models/user.dart';
import '../../domain/entities/user.dart';
import 'package:dio/dio.dart';

class UserRepository {
  final ApiClient _apiClient;

  UserRepository(this._apiClient);

  Future<List<UserEntity>> getAll() async {
    try {
      final response = await _apiClient.dio.get('/users');
      final List<dynamic> data = response.data;
      return data.map((json) => User.fromJson(json).toEntity()).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar usuarios');
    }
  }

  Future<UserEntity> getById(int id) async {
    try {
      final response = await _apiClient.dio.get('/users/$id');
      return User.fromJson(response.data).toEntity();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar usuario');
    }
  }


  Future<void> update(int id, Map<String, dynamic> data) async {
    try {
      await _apiClient.dio.put('/users/$id', data: data);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar usuario');
    }
  }

  Future<void> delete(int id) async {
    try {
      await _apiClient.dio.delete('/users/$id');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al eliminar usuario');
    }
  }
}
