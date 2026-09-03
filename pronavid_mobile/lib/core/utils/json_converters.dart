/// Utilidades centralizadas para parseo seguro de JSON del backend.
/// Reemplaza los métodos estáticos duplicados en cada modelo.
class JsonConverters {
  JsonConverters._(); // No instanciable

  /// Convierte cualquier valor dinámico a int nullable.
  static int? intFromUnknown(dynamic value) {
    if (value == null) return null;
    if (value is String) return int.tryParse(value);
    if (value is num) return value.toInt();
    return null;
  }

  /// Convierte cualquier valor dinámico a int (nunca null, default 0).
  static int intFromUnknownStrict(dynamic value) {
    if (value == null) return 0;
    if (value is String) return int.tryParse(value) ?? 0;
    if (value is num) return value.toInt();
    return 0;
  }

  /// Convierte cualquier valor dinámico a double (nunca null, default 0.0).
  static double doubleFromUnknown(dynamic value) {
    if (value == null) return 0.0;
    if (value is String) return double.tryParse(value) ?? 0.0;
    if (value is num) return value.toDouble();
    return 0.0;
  }

  /// Convierte cualquier valor dinámico a bool (nunca null, default false).
  static bool boolFromUnknown(dynamic value) {
    if (value == null) return false;
    if (value is bool) return value;
    if (value == 1) return true;
    if (value == 0) return false;
    if (value is String) return value.toLowerCase() == 'true' || value == '1';
    return false;
  }
}
