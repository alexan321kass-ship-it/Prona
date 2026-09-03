import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Core
import 'core/api_client.dart';


// Providers
import 'features/auth/auth_provider.dart';
import 'features/clients/client_provider.dart';
import 'features/orders/order_provider.dart';
import 'features/products/product_provider.dart';
import 'features/products/category_provider.dart';
import 'features/cotizaciones/cotizacion_provider.dart';
import 'features/sales/sale_provider.dart';
import 'features/notifications/notification_provider.dart';
import 'features/reports/report_provider.dart';
import 'features/users/user_provider.dart';

// Repositories
import 'features/auth/auth_repository.dart';
import 'features/clients/client_repository.dart';
import 'features/orders/order_repository.dart';
import 'features/products/product_repository.dart';
import 'features/products/category_repository.dart';
import 'features/cotizaciones/cotizacion_repository.dart';
import 'features/sales/sale_repository.dart';
import 'features/notifications/notification_repository.dart';
import 'features/reports/report_repository.dart';
import 'features/users/user_repository.dart';

import 'core/navigation/app_routes.dart';
import 'features/auth/login_screen.dart';
import 'features/dashboard/dashboard_screen.dart';
import 'core/app_theme.dart';

// Plugin global para notificaciones locales (barra del sistema)
final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

// Canal de Android para notificaciones de alta importancia
const AndroidNotificationChannel channel = AndroidNotificationChannel(
  'pronavid_channel',
  'Notificaciones Pronavid',
  description: 'Notificaciones de pedidos y productos de Pronavid',
  importance: Importance.high,
);

// Background message handler
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Handles background messages
  debugPrint("Handling a background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('Error inicializando Firebase: $e');
  }

  // Configurar la barra del sistema (System Navigation Bar y Status Bar)
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Inicializar flutter_local_notifications
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  const InitializationSettings initializationSettings =
      InitializationSettings(android: initializationSettingsAndroid);
  await flutterLocalNotificationsPlugin.initialize(initializationSettings);

  // Crear el canal de notificación en Android
  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  // Instancia única del cliente API (Singleton)
  final apiClient = ApiClient();

  // Instanciar repositorios con inyección de dependencias
  final authRepo = AuthRepository(apiClient);
  final productRepo = ProductRepository(apiClient);
  final categoryRepo = CategoryRepository(apiClient);
  final cotizacionRepo = CotizacionRepository(apiClient);
  final clientRepo = ClientRepository(apiClient);
  final orderRepo = OrderRepository(apiClient);
  final saleRepo = SaleRepository(apiClient);
  final notifRepo = NotificationRepository(apiClient);
  final userRepo = UserRepository(apiClient);
  final reportRepo = ReportRepository(apiClient);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepo)),
        ChangeNotifierProvider(create: (_) => ProductProvider(productRepo)),
        ChangeNotifierProvider(create: (_) => CategoryProvider(categoryRepo)),
        ChangeNotifierProvider(create: (_) => CotizacionProvider(cotizacionRepo)),
        ChangeNotifierProvider(create: (_) => ClientProvider(clientRepo)),
        ChangeNotifierProvider(create: (_) => OrderProvider(orderRepo)),
        ChangeNotifierProvider(create: (_) => SaleProvider(saleRepo)),
        ChangeNotifierProvider(create: (_) => NotificationProvider(notifRepo)),
        ChangeNotifierProvider(create: (_) => UserProvider(userRepo)),
        ChangeNotifierProvider(create: (_) => ReportProvider(reportRepo)),
      ],
      child: const PronavidApp(),
    ),
  );
}

class PronavidApp extends StatefulWidget {
  const PronavidApp({super.key});

  @override
  State<PronavidApp> createState() => _PronavidAppState();
}

class _PronavidAppState extends State<PronavidApp> {
  @override
  void initState() {
    super.initState();
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null) {
        // Mostrar notificación en la BARRA DEL SISTEMA (aunque la app esté abierta)
        flutterLocalNotificationsPlugin.show(
          message.hashCode,
          message.notification!.title ?? 'Pronavid',
          message.notification!.body ?? '',
          NotificationDetails(
            android: AndroidNotificationDetails(
              channel.id,
              channel.name,
              channelDescription: channel.description,
              importance: Importance.high,
              priority: Priority.high,
              icon: '@mipmap/ic_launcher',
            ),
          ),
        );

        // También mostrar SnackBar dentro de la app
        final context = AppRoutes.navigatorKey.currentContext;
        if (context != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${message.notification!.title ?? 'Nueva notificación'}: ${message.notification!.body ?? ''}'),
              duration: const Duration(seconds: 5),
              behavior: SnackBarBehavior.floating,
            ),
          );
          // Recargar notificaciones si el provider está disponible
          try {
            Provider.of<NotificationProvider>(context, listen: false).fetchNotifications();
          } catch (_) {}
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      navigatorKey: AppRoutes.navigatorKey,
      title: 'Pronavid',
      theme: AppTheme.lightTheme,
      onGenerateRoute: AppRoutes.onGenerateRoute,
      builder: (context, child) {
        final mediaQueryData = MediaQuery.of(context);
        final scale = mediaQueryData.textScaler.clamp(minScaleFactor: 1.0, maxScaleFactor: 1.1);
        return MediaQuery(
          data: mediaQueryData.copyWith(textScaler: scale),
          child: child!,
        );
      },
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (auth.isAuthenticated) {
            return const DashboardScreen();
          }
          return const LoginScreen();
        },
      ),
    );
  }
}
