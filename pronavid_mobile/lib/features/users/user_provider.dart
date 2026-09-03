import 'package:flutter/foundation.dart';
import 'user_repository.dart';
import '../../domain/entities/user.dart';

class UserProvider with ChangeNotifier {
  final UserRepository _repository;
  
  UserProvider(this._repository);

  List<UserEntity> _users = [];
  bool _isLoading = false;
  String? errorMessage;


  List<UserEntity> get users => _users;
  bool get isLoading => _isLoading;
  String? get error => errorMessage;


  Future<void> fetchUsers() async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      _users = await _repository.getAll();
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateUser(int id, Map<String, dynamic> data) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.update(id, data);
      await fetchUsers();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteUser(int id) async {
    try {
      await _repository.delete(id);
      _users.removeWhere((u) => u.id == id);
      notifyListeners();
    } catch (e) {
      debugPrint(e.toString());
      rethrow;
    }
  }
}


