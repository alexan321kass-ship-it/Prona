import 'package:flutter/foundation.dart';
import 'auth_repository.dart';
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../core/api_client.dart';
import '../../data/models/user.dart';
import '../../domain/entities/user.dart';

class AuthProvider with ChangeNotifier {
  final AuthRepository _repository;
  
  AuthProvider(this._repository) {
    _checkInitialAuth();
  }

  UserEntity? _user;
  bool _isLoading = false;
  String? errorMessage;

  UserEntity? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => errorMessage;
  bool get isAuthenticated => _user != null;

  Future<void> _setupFCM() async {
    if (_user == null) return;
    try {
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      await messaging.subscribeToTopic('user_${_user!.id}');
      if (_user!.idRol != null) {
        await messaging.subscribeToTopic('role_${_user!.idRol}');
      }
      debugPrint('FCM subscribed to topics for user ${_user!.id}');
    } catch (e) {
      debugPrint('Error setting up FCM topics: $e');
    }
  }

  Future<void> _cleanupFCM() async {
    if (_user == null) return;
    try {
      final messaging = FirebaseMessaging.instance;
      await messaging.unsubscribeFromTopic('user_${_user!.id}');
      if (_user!.idRol != null) {
        await messaging.unsubscribeFromTopic('role_${_user!.idRol}');
      }
      debugPrint('FCM unsubscribed from topics for user ${_user!.id}');
    } catch (e) {
      debugPrint('Error cleaning up FCM topics: $e');
    }
  }

  Future<void> _checkInitialAuth() async {
    final storage = ApiClient().storage;
    final storedUser = await storage.read(key: 'user_data');
    if (storedUser != null) {
      try {
        final Map<String, dynamic> userData = json.decode(storedUser);
        _user = User.fromJson(userData).toEntity();
        _setupFCM();
        notifyListeners();
      } catch (e) {
        debugPrint('Error loading stored user: $e');
        await storage.delete(key: 'user_data');
      }
    }
  }

  Future<bool> login(String email, String password) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      final userEntity = await _repository.login(email, password);
      if (userEntity != null) {
        _user = userEntity;
        // Store user data locally
        await ApiClient().storage.write(
          key: 'user_data', 
          value: json.encode(User(
            id: _user!.id,
            nombreUsuario: _user!.nombre,
            correo: _user!.correo,
            idRol: _user!.idRol,
            tipoDocumento: _user!.tipoDocumento,
            numeroDocumento: _user!.numeroDocumento,
            telefono: _user!.telefono,
          ).toJson())
        );
        _isLoading = false;
        _setupFCM();
        notifyListeners();
        return true;
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _repository.register(userData);
      _isLoading = false;
      notifyListeners();
      return data != null;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _repository.forgotPassword(email);
      _isLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<Map<String, dynamic>> resetPassword(String token, String code, String newPassword) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _repository.resetPassword(token, code, newPassword);
      _isLoading = false;
      notifyListeners();
      return res;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    await _cleanupFCM();
    await _repository.logout();
    _user = null;
    await ApiClient().storage.delete(key: 'user_data');
    notifyListeners();
  }
}

