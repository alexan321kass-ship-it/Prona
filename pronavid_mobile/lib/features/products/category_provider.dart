import 'package:flutter/foundation.dart';
import 'category_repository.dart';

class CategoryProvider with ChangeNotifier {
  final CategoryRepository _repository;

  CategoryProvider(this._repository);

  List<dynamic> _categories = [];
  bool _isLoading = false;
  String? errorMessage;

  List<dynamic> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get error => errorMessage;

  Future<void> fetchCategories() async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      _categories = await _repository.getCategories();
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createCategory(Map<String, dynamic> data) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.createCategory(data);
      await fetchCategories();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateCategory(int id, Map<String, dynamic> data) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.updateCategory(id, data);
      await fetchCategories();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteCategory(int id) async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.deleteCategory(id);
      _categories.removeWhere((c) => c['id_categoria'] == id);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
