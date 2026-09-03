import '../../core/api_client.dart';
import 'package:dio/dio.dart';

class ReportRepository {
  final ApiClient _apiClient;

  ReportRepository(this._apiClient);

  Future<Map<String, dynamic>> getResumen() async {
    try {
      final response = await _apiClient.dio.get('/reportes/resumen');
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar resumen');
    }
  }

  Future<Map<String, dynamic>> getMetricasGrales() async {
    try {
      final response = await _apiClient.dio.get('/reportes/metricas-grales');
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar métricas globales');
    }
  }

  Future<List<dynamic>> getVentasMensuales() async {
    try {
      final response = await _apiClient.dio.get('/reportes/mensual');
      // El backend devuelve directamente un array, no un objeto con propiedad 'ventasMensuales'
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar ventas mensuales');
    }
  }

  Future<List<dynamic>> getMasVendidos() async {
    try {
      final response = await _apiClient.dio.get('/reportes/mas-vendido');
      return response.data['totales'] as List<dynamic>;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar productos más vendidos');
    }
  }

  Future<List<dynamic>> getClientesFrecuentes() async {
    try {
      final response = await _apiClient.dio.get('/reportes/cliente-frecuente');
      return response.data['clientes'] as List<dynamic>;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar clientes frecuentes');
    }
  }

  Future<List<dynamic>> getHistorial() async {
    try {
      final response = await _apiClient.dio.get('/reportes/historial');
      return response.data['ventas'] as List<dynamic>;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar historial de ventas');
    }
  }
}
