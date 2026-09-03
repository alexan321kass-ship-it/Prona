import 'package:flutter/foundation.dart';
import '../../domain/entities/notificacion.dart';
import 'notification_repository.dart';

class NotificationProvider with ChangeNotifier {
  final NotificationRepository _repository;
  
  NotificationProvider(this._repository);

  List<NotificacionEntity> _notifications = [];
  bool _isLoading = false;
  String? errorMessage;
  int _unreadCount = 0;

  List<NotificacionEntity> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get error => errorMessage;
  int get unreadCount => _unreadCount;

  Future<void> fetchNotifications() async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _repository.getAll();
      _notifications = data['notificaciones'];
      _unreadCount = data['noLeidas'];
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(int id) async {
    try {
      await _repository.markAsRead(id);
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1 && !_notifications[index].leida) {
        // Quick local update
        final current = _notifications[index];
        _notifications[index] = NotificacionEntity(
          id: current.id,
          idPedido: current.idPedido,
          mensaje: current.mensaje,
          leida: true,
          fecha: current.fecha,
        );
        _unreadCount = _unreadCount > 0 ? _unreadCount - 1 : 0;
        notifyListeners();
      }
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _repository.markAllAsRead();
      await fetchNotifications();
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    }
  }
}

