import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'navigation/app_routes.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio dio;
  final storage = const FlutterSecureStorage(aOptions: AndroidOptions(encryptedSharedPreferences: true));

  // --- CONFIGURACIÓN DEL SERVIDOR ---
  // La IP ahora se carga desde el archivo .env usando flutter_dotenv
  // Asegúrate de tener el archivo .env en la raíz del proyecto (ver .env.example)
  final String serverUrl = dotenv.env['API_URL'] ?? (kIsWeb ? 'http://localhost:4000' : 'http://127.0.0.1:4000');
  late final String baseUrl = '$serverUrl/api';


  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      responseType: ResponseType.json,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Interceptor to attach cookies or tokens if needed
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Read session cookie if we stored it manually, or JWT
        String? cookie = await storage.read(key: 'session_cookie');
        if (cookie != null) {
          options.headers['Cookie'] = cookie;
        }
        return handler.next(options);
      },
      onResponse: (response, handler) async {
        // Guardamos la cookie de la respuesta si el backend usa Set-Cookie
        final cookies = response.headers['set-cookie'];
        if (cookies != null && cookies.isNotEmpty) {
          // Extraemos solo la parte de 'token=xxx', ignorando Path, HttpOnly, etc.
          final rawCookie = cookies.first;
          final cleanCookie = rawCookie.split(';').first;
          await storage.write(key: 'session_cookie', value: cleanCookie);
        }
        return handler.next(response);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          // Si el token expira o es inválido, cerramos sesión
          storage.delete(key: 'session_cookie');
          AppRoutes.navigatorKey.currentState?.pushNamedAndRemoveUntil(AppRoutes.login, (route) => false);
          return handler.next(e);
        }

        // Retry logic for network errors or 5xx
        if (_shouldRetry(e)) {
          int retries = e.requestOptions.extra['retries'] ?? 0;
          if (retries < 3) {
            e.requestOptions.extra['retries'] = retries + 1;
            try {
              // Wait before retrying (exponential backoff)
              await Future.delayed(Duration(milliseconds: 500 * (retries + 1)));
              final response = await dio.fetch(e.requestOptions);
              return handler.resolve(response);
            } catch (retryError) {
              return handler.next(retryError is DioException ? retryError : e);
            }
          }
        }

        return handler.next(e);
      },
    ));
  }

  bool _shouldRetry(DioException e) {
    return e.type == DioExceptionType.connectionTimeout ||
           e.type == DioExceptionType.sendTimeout ||
           e.type == DioExceptionType.receiveTimeout ||
           e.type == DioExceptionType.connectionError ||
           (e.response != null && e.response!.statusCode != null && e.response!.statusCode! >= 500);
  }
}
