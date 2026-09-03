import '../../core/api_client.dart';
import '../../data/models/pedido.dart';
import '../../domain/entities/pedido.dart';
import '../../domain/entities/pedido_detalle.dart';
import 'package:dio/dio.dart';

class OrderRepository {
  final ApiClient _apiClient;

  OrderRepository(this._apiClient);

  Future<Map<String, dynamic>> getAll({int limit = 50, int page = 1, String? estado}) async {
    try {
      final response = await _apiClient.dio.get('/pedidos', queryParameters: {
        'limite': limit,
        'pagina': page,
        if (estado != null) 'estado': estado,
      });
      final List<dynamic> pedidosJson = response.data['pedidos'];
      final pedidos = pedidosJson.map((json) => Pedido.fromJson(json).toEntity()).toList();
      return {
        'pedidos': pedidos,
        'total': response.data['total'],
      };
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar pedidos');
    }
  }

  Future<Map<String, dynamic>> getById(int id) async {
    try {
      final response = await _apiClient.dio.get('/pedidos/$id');
      final pedido = Pedido.fromJson(response.data['pedido']).toEntity();
      final List<dynamic> detallesJson = response.data['detalles'];
      final detalles = detallesJson.map((j) => PedidoDetalle.fromJson(j).toEntity()).toList();
      return {'pedido': pedido, 'detalles': detalles};
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar pedido');
    }
  }

  Future<Map<String, dynamic>> create(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.dio.post('/pedidos', data: data);
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al crear pedido');
    }
  }

  Future<void> updateEstado(int id, String estado) async {
    try {
      await _apiClient.dio.put('/pedidos/$id', data: {'estado_pedido': estado});
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar estado del pedido');
    }
  }

  Future<void> delete(int id) async {
    try {
      await _apiClient.dio.delete('/pedidos/$id');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al eliminar pedido');
    }
  }
}
