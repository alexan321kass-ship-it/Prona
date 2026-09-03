import '../../core/api_client.dart';
import 'package:dio/dio.dart';

class CategoryRepository {
  final ApiClient _apiClient;

  CategoryRepository(this._apiClient);

  Future<List<dynamic>> getCategories() async {
    try {
      final response = await _apiClient.dio.get('/productos/categorias');
      return response.data['categorias'];
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar categorías');
    }
  }

  Future<void> createCategory(Map<String, dynamic> data) async {
    try {
      await _apiClient.dio.post('/productos/categorias', data: data);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al crear categoría');
    }
  }

  Future<void> updateCategory(int id, Map<String, dynamic> data) async {
    try {
      await _apiClient.dio.put('/productos/categorias/$id', data: data);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar categoría');
    }
  }

  Future<void> deleteCategory(int id) async {
    try {
      await _apiClient.dio.delete('/productos/categorias/$id');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al eliminar categoría');
    }
  }
}
