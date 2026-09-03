import '../../core/api_client.dart';
import '../../data/models/notificacion.dart';
import 'package:dio/dio.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository(this._apiClient);

  Future<Map<String, dynamic>> getAll({int limit = 20, int page = 1, bool soloNoLeidas = false}) async {
    try {
      final response = await _apiClient.dio.get('/notificaciones', queryParameters: {
        'limite': limit,
        'pagina': page,
        if (soloNoLeidas) 'soloNoLeidas': 'true',
      });
      final List<dynamic> notifJson = response.data['notificaciones'];
      final notificaciones = notifJson.map((json) => Notificacion.fromJson(json).toEntity()).toList();
      return {
        'notificaciones': notificaciones,
        'noLeidas': response.data['noLeidas'],
      };
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al cargar notificaciones');
    }
  }

  Future<void> markAsRead(int id) async {
    try {
      await _apiClient.dio.put('/notificaciones/$id/leer');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar notificación');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _apiClient.dio.put('/notificaciones/leer-todas');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Error al actualizar notificaciones');
    }
  }
}
