import '../../core/api_client.dart';
import '../../data/models/product.dart';
import '../../domain/entities/product.dart';
import 'package:dio/dio.dart';

class ProductRepository {
  final ApiClient _apiClient;

  ProductRepository(this._apiClient);

  Future<List<ProductEntity>> getAllProducts() async {
    try {
      final response = await _apiClient.dio.get('/productos');
      final List<dynamic> data = response.data['productos'];
      return data.map((json) => Product.fromJson(json).toEntity()).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar productos');
    }
  }

  Future<ProductEntity> getById(int id) async {
    try {
      final response = await _apiClient.dio.get('/productos/$id');
      return Product.fromJson(response.data['producto']).toEntity();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar producto');
    }
  }

  Future<List<ProductEntity>> getByCategory(int categoryId) async {
    try {
      final response = await _apiClient.dio.get('/productos/categoria/$categoryId');
      final List<dynamic> data = response.data['productos'];
      return data.map((json) => Product.fromJson(json).toEntity()).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar productos por categoría');
    }
  }

  Future<Map<String, dynamic>> create(Map<String, dynamic> data, {String? imagePath}) async {
    try {
      FormData formData = FormData.fromMap({
        'nombre_producto': data['nombre_producto'],
        'descripcion': data['descripcion'] ?? '',
        'precio': data['precio'],
        'stock': data['stock'],
        if (data['id_categoria'] != null) 'id_categoria': data['id_categoria'],
      });

      if (imagePath != null) {
        formData.files.add(MapEntry(
          'imagen',
          await MultipartFile.fromFile(imagePath),
        ));
      }

      final response = await _apiClient.dio.post('/productos', data: formData);
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al crear producto');
    }
  }

  Future<void> update(int id, Map<String, dynamic> data, {String? imagePath}) async {
    try {
      FormData formData = FormData.fromMap({
        if (data['nombre_producto'] != null) 'nombre_producto': data['nombre_producto'],
        if (data['descripcion'] != null) 'descripcion': data['descripcion'],
        if (data['precio'] != null) 'precio': data['precio'],
        if (data['stock'] != null) 'stock': data['stock'],
        if (data['id_categoria'] != null) 'id_categoria': data['id_categoria'],
      });

      if (imagePath != null) {
        formData.files.add(MapEntry(
          'imagen',
          await MultipartFile.fromFile(imagePath),
        ));
      }

      await _apiClient.dio.put('/productos/$id', data: formData);
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar producto');
    }
  }

  Future<Map<String, dynamic>> updateStock(int id, int cantidad, String operacion) async {
    try {
      final response = await _apiClient.dio.put('/productos/$id/stock', data: {
        'cantidad': cantidad,
        'operacion': operacion,
      });
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar stock');
    }
  }

  Future<void> delete(int id) async {
    try {
      await _apiClient.dio.delete('/productos/$id');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al eliminar producto');
    }
  }
}
