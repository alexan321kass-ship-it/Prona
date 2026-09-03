import 'package:flutter/foundation.dart';
import 'cotizacion_repository.dart';

class CotizacionProvider with ChangeNotifier {
  final CotizacionRepository _repository;

  CotizacionProvider(this._repository);

  List<dynamic> _cotizaciones = [];
  bool _isLoading = false;
  String? errorMessage;
  String _filtroEstado = 'Todos';

  List<dynamic> get cotizaciones => _filtroEstado == 'Todos'
      ? _cotizaciones
      : _cotizaciones.where((c) => c['estado'] == _filtroEstado).toList();
  List<dynamic> get todasLasCotizaciones => _cotizaciones;
  bool get isLoading => _isLoading;
  String get filtroEstado => _filtroEstado;

  int countByEstado(String estado) =>
      _cotizaciones.where((c) => c['estado'] == estado).length;

  Future<void> fetchCotizaciones() async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();
    try {
      _cotizaciones = await _repository.getCotizaciones();
    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setFiltro(String estado) {
    _filtroEstado = estado;
    notifyListeners();
  }

  Future<bool> updateEstado(int id, String nuevoEstado) async {
    try {
      await _repository.updateEstado(id, nuevoEstado);
      final idx = _cotizaciones.indexWhere((c) => c['id_cotizacion'] == id);
      if (idx != -1) {
        _cotizaciones[idx] = {..._cotizaciones[idx], 'estado': nuevoEstado};
        notifyListeners();
      }
      return true;
    } catch (e) {
      errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> delete(int id) async {
    try {
      await _repository.delete(id);
      _cotizaciones.removeWhere((c) => c['id_cotizacion'] == id);
      notifyListeners();
      return true;
    } catch (e) {
      errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
