import '../../core/api_client.dart';
import '../../data/models/cliente.dart';
import '../../domain/entities/cliente.dart';
import 'package:dio/dio.dart';

class ClientRepository {
  final ApiClient _apiClient;

  ClientRepository(this._apiClient);

  Future<List<ClienteEntity>> getAll() async {
    try {
      final response = await _apiClient.dio.get('/clientes');
      final List<dynamic> data = response.data['clientes'];
      return data.map((json) => Cliente.fromJson(json).toEntity()).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar clientes');
    }
  }

  Future<List<ClienteEntity>> search(String query) async {
    try {
      final response = await _apiClient.dio.get('/clientes/buscar', queryParameters: {'q': query});
      final List<dynamic> data = response.data['clientes'];
      return data.map((json) => Cliente.fromJson(json).toEntity()).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al buscar clientes');
    }
  }

  Future<ClienteEntity> getById(int id) async {
    try {
      final response = await _apiClient.dio.get('/clientes/$id');
      return Cliente.fromJson(response.data['cliente']).toEntity();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar cliente');
    }
  }

  Future<Map<String, dynamic>> create(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.dio.post('/clientes', data: data);
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al crear cliente');
    }
  }

  Future<void> update(int id, Map<String, dynamic> data) async {
    try {
      await _apiClient.dio.put('/clientes/$id', data: data);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar cliente');
    }
  }

  Future<void> delete(int id) async {
    try {
      await _apiClient.dio.delete('/clientes/$id');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al eliminar cliente');
    }
  }
}
