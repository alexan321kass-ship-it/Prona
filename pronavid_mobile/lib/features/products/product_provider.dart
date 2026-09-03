import 'package:flutter/foundation.dart';
import '../../domain/entities/product.dart';
import 'product_repository.dart';

class ProductProvider with ChangeNotifier {
  final ProductRepository _repository;
  
  ProductProvider(this._repository);

  List<ProductEntity> _products = [];
  bool _isLoading = false;
  String? errorMessage;

  int? _selectedCategory;

  List<ProductEntity> get products => _products;
  int? get selectedCategory => _selectedCategory;
  bool get isLoading => _isLoading;
  String? get error => errorMessage;

  DateTime? _lastFetchTime;
  final Duration _cacheDuration = const Duration(minutes: 5);

  Future<void> fetchProducts({bool forceRefresh = false}) async {
    if (!forceRefresh && _products.isNotEmpty && _lastFetchTime != null && DateTime.now().difference(_lastFetchTime!) < _cacheDuration) {
      return;
    }

    errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      if (_selectedCategory != null) {
        _products = await _repository.getByCategory(_selectedCategory!);
      } else {
        _products = await _repository.getAllProducts();
      }
      _lastFetchTime = DateTime.now();
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCategoryFilter(int? categoryId) {
    _selectedCategory = categoryId;
    _lastFetchTime = null; // Invalidate cache
    fetchProducts();
  }

  Future<void> createProduct(Map<String, dynamic> data, {String? imagePath}) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.create(data, imagePath: imagePath);
      await fetchProducts(); // Refresh list
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProduct(int id, Map<String, dynamic> data, {String? imagePath}) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.update(id, data, imagePath: imagePath);
      await fetchProducts(); // Refresh list
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateStock(int id, int cantidad, String operacion) async {
    try {
      await _repository.updateStock(id, cantidad, operacion);
      // Quick local update instead of full fetch for responsiveness
      final index = _products.indexWhere((p) => p.id == id);
      if (index != -1) {
        // Quick local update is difficult as ProductEntity fields are final.
        // We re-fetch to ensure data consistency with backend.
        await fetchProducts();
      }
    } catch (e) {
      debugPrint(e.toString());
      rethrow;
    }
  }

  Future<void> deleteProduct(int id) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.delete(id);
      _products.removeWhere((p) => p.id == id);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
