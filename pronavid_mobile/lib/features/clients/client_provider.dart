import 'package:flutter/foundation.dart';
import '../../domain/entities/cliente.dart';
import 'client_repository.dart';

class ClientProvider with ChangeNotifier {
  final ClientRepository _repository;
  
  ClientProvider(this._repository);

  List<ClienteEntity> _clients = [];
  bool _isLoading = false;
  String? errorMessage;


  List<ClienteEntity> get clients => _clients;

  bool get isLoading => _isLoading;
  String? get error => errorMessage;

  Future<void> fetchClients() async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      _clients = await _repository.getAll();
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchClients(String query) async {
    if (query.trim().isEmpty) {
      return fetchClients();
    }
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      _clients = await _repository.search(query);
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createClient(Map<String, dynamic> data) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.create(data);
      await fetchClients();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateClient(int id, Map<String, dynamic> data) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.update(id, data);
      await fetchClients();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteClient(int id) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.delete(id);
      _clients.removeWhere((c) => c.id == id);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}



