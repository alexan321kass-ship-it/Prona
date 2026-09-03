import '../../core/api_client.dart';
import '../../data/models/venta.dart';
import '../../domain/entities/venta.dart';
import '../../domain/entities/sale_stats.dart';
import '../../data/models/sale_stats.dart';
import 'package:dio/dio.dart';

class SaleRepository {
  final ApiClient _apiClient;

  SaleRepository(this._apiClient);

  Future<Map<String, dynamic>> getAll({int limit = 50, int page = 1}) async {
    try {
      final response = await _apiClient.dio.get('/ventas', queryParameters: {
        'limite': limit,
        'pagina': page,
      });
      final List<dynamic> ventasJson = response.data['ventas'];
      final ventas = ventasJson.map((json) => Venta.fromJson(json).toEntity()).toList();
      return {
        'ventas': ventas,
        'total': response.data['total'],
      };
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar ventas');
    }
  }

  Future<Map<String, dynamic>> getById(int id) async {
    try {
      final response = await _apiClient.dio.get('/ventas/$id');
      final venta = Venta.fromJson(response.data['venta']).toEntity();
      final List<dynamic> detalles = response.data['detalles'];
      return {'venta': venta, 'detalles': detalles, 'totalCalculado': response.data['totalCalculado']};
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar venta');
    }
  }

  Future<Map<String, dynamic>> create(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.dio.post('/ventas', data: data);
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al registrar venta');
    }
  }

  Future<Map<String, dynamic>> returnSale(int id, String reason) async {
    try {
      final response = await _apiClient.dio.post('/ventas/$id/devolucion', data: {
        'motivo': reason,
      });
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al procesar devolución');
    }
  }

  Future<SaleStatsEntity> getStats() async {
    try {
      final response = await _apiClient.dio.get('/ventas/estadisticas/resumen');
      return SaleStatsModel.fromJson(response.data).toEntity();
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar estadísticas');
    }
  }
}
