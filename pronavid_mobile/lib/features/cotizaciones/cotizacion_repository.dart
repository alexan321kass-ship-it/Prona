import '../../core/api_client.dart';
import 'package:dio/dio.dart';

class CotizacionRepository {
  final ApiClient _apiClient;

  CotizacionRepository(this._apiClient);

  Future<List<dynamic>> getCotizaciones() async {
    try {
      final response = await _apiClient.dio.get('/cotizaciones');
      return response.data['cotizaciones'] ?? [];
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar cotizaciones');
    }
  }

  Future<void> updateEstado(int id, String estado) async {
    try {
      await _apiClient.dio.put('/cotizaciones/$id/estado', data: {'estado': estado});
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar estado');
    }
  }

  Future<void> delete(int id) async {
    try {
      await _apiClient.dio.delete('/cotizaciones/$id');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al eliminar cotización');
    }
  }
}
