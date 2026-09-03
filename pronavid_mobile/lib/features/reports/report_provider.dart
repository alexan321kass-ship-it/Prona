import 'package:flutter/foundation.dart';
import 'report_repository.dart';
import '../../domain/entities/report_metrics.dart';
import '../../data/models/report_mapper.dart';

class ReportProvider with ChangeNotifier {
  final ReportRepository _repository;
  
  ReportProvider(this._repository);
  
  bool _isLoading = false;
  String? errorMessage;
  DashboardMetricsEntity? _metrics;


  bool get isLoading => _isLoading;
  String? get error => errorMessage;
  DashboardMetricsEntity? get metrics => _metrics;

  Future<void> fetchAllReports() async {
    errorMessage = null;
    _isLoading = true;
    notifyListeners();

    try {
      final res = await Future.wait([
        _repository.getMetricasGrales(),
        _repository.getVentasMensuales(),
        _repository.getMasVendidos(),
        _repository.getResumen(),
        _repository.getClientesFrecuentes(),
        _repository.getHistorial(),
      ]);

      _metrics = ReportMapper.fromJson(
        metricas: res[0] as Map<String, dynamic>,
        mensual: res[1] as List<dynamic>,
        masVendidos: res[2] as List<dynamic>,
        resumen: res[3] as Map<String, dynamic>,
        clientesFrecuentes: res[4] as List<dynamic>,
        historial: res[5] as List<dynamic>,
      );

    } catch (e) {
      errorMessage = e.toString();
      debugPrint(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

