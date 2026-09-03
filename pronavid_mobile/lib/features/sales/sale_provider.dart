import 'package:flutter/foundation.dart';
import '../../domain/entities/venta.dart';
import '../../domain/entities/sale_stats.dart';
import 'sale_repository.dart';

class SaleProvider with ChangeNotifier {
  final SaleRepository _repository;
  
  SaleProvider(this._repository);

  List<VentaEntity> _sales = [];
  bool _isLoading = false;
  String? errorMessage;

  List<VentaEntity> get sales => _sales;
  bool get isLoading => _isLoading;
  String? get error => errorMessage;

  Future<void> fetchSales() async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _repository.getAll();
      _sales = data['ventas'];
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  SaleStatsEntity _stats = SaleStatsEntity.empty();
  SaleStatsEntity get stats => _stats;

  Future<void> fetchStats() async {
    try {
      _stats = await _repository.getStats();
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    }
  }


  Future<Map<String, dynamic>> getSaleDetails(int id) async {
    return await _repository.getById(id);
  }

  Future<Map<String, dynamic>> returnSale(int id, String reason) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _repository.returnSale(id, reason);
      await fetchSales(); // recargar lista
      return res;
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

