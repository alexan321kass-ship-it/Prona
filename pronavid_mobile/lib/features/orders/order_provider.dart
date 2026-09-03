import 'package:flutter/foundation.dart';
import '../../domain/entities/pedido.dart';
import '../../domain/entities/pedido_detalle.dart';
import 'order_repository.dart';

class OrderProvider with ChangeNotifier {
  final OrderRepository _repository;
  
  OrderProvider(this._repository);

  List<PedidoEntity> _orders = [];
  PedidoEntity? _currentOrder;

  List<PedidoDetalleEntity> _currentDetails = [];
  bool _isLoading = false;
  String? errorMessage;
  int _totalOrders = 0;
  String? _selectedEstado;

  List<PedidoEntity> get orders => _orders;
  PedidoEntity? get currentOrder => _currentOrder;
  List<PedidoDetalleEntity> get currentDetails => _currentDetails;
  bool get isLoading => _isLoading;
  String? get error => errorMessage;
  int get totalOrders => _totalOrders;
  String? get selectedEstado => _selectedEstado;

  Future<void> fetchOrders({String? estado}) async {
    errorMessage = null;
    _isLoading = true;
    _selectedEstado = estado;
    notifyListeners();
    try {
      final data = await _repository.getAll(estado: estado);
      _orders = data['pedidos'];
      _totalOrders = data['total'];
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setEstadoFilter(String? estado) {
    fetchOrders(estado: estado);
  }

  Future<Map<String, dynamic>> getOrderDetails(int id) async {
    return await _repository.getById(id);
  }

  Future<void> createOrder(Map<String, dynamic> data) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.create(data);
      await fetchOrders(estado: _selectedEstado);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateOrderStatus(int id, String newStatus) async {
    try {
      await _repository.updateEstado(id, newStatus);
      await fetchOrders(estado: _selectedEstado);
    } catch (e) {
      debugPrint(e.toString());
      rethrow;
    }
  }

  Future<void> deleteOrder(int id) async {
    try {
      await _repository.delete(id);
      _orders.removeWhere((o) => o.id == id);
      notifyListeners();
    } catch (e) {
      debugPrint(e.toString());
      rethrow;
    }
  }
}



