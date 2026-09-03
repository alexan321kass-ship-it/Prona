import 'package:flutter/material.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/auth/forgot_password_screen.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/clients/client_list_screen.dart';
import '../../features/clients/client_detail_screen.dart';
import '../../features/clients/client_form_screen.dart';
import '../../features/products/product_list_screen.dart';
import '../../features/products/product_detail_screen.dart';
import '../../features/products/product_form_screen.dart';
import '../../features/orders/order_list_screen.dart';
import '../../features/orders/order_detail_screen.dart';
import '../../features/orders/order_form_screen.dart';
import '../../features/sales/sale_list_screen.dart';
import '../../features/sales/sale_detail_screen.dart';
import '../../features/notifications/notification_list_screen.dart';
import '../../features/users/user_list_screen.dart';
import '../../features/users/user_form_screen.dart';
import '../../features/reports/report_screen.dart';
import '../../features/products/category_list_screen.dart';
import '../../features/cotizaciones/cotizacion_list_screen.dart';

// Entities
import '../../domain/entities/cliente.dart';
import '../../domain/entities/product.dart';
import '../../domain/entities/user.dart';

class AppRoutes {
  AppRoutes._();

  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String dashboard = '/dashboard';
  static const String clients = '/clients';
  static const String clientDetail = '/client-detail';
  static const String clientForm = '/client-form';
  static const String products = '/products';
  static const String productDetail = '/product-detail';
  static const String productForm = '/product-form';
  static const String orders = '/orders';
  static const String orderDetail = '/order-detail';
  static const String orderForm = '/order-form';
  static const String sales = '/sales';
  static const String saleDetail = '/sale-detail';
  static const String notifications = '/notifications';
  static const String users = '/users';
  static const String userForm = '/user-form';
  static const String reports = '/reports';
  static const String categories = '/categories';
  static const String cotizaciones = '/cotizaciones';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case register:
        return MaterialPageRoute(builder: (_) => const RegisterScreen());
      case forgotPassword:
        return MaterialPageRoute(builder: (_) => const ForgotPasswordScreen());
      case dashboard:
        return MaterialPageRoute(builder: (_) => const DashboardScreen());
      case clients:
        return MaterialPageRoute(builder: (_) => const ClientListScreen());
      case clientDetail:
        final client = settings.arguments as ClienteEntity;
        return MaterialPageRoute(builder: (_) => ClientDetailScreen(client: client));
      case clientForm:
        final client = settings.arguments as ClienteEntity?;
        return MaterialPageRoute(builder: (_) => ClientFormScreen(client: client));
      case products:
        return MaterialPageRoute(builder: (_) => const ProductListScreen());
      case productDetail:
        final product = settings.arguments as ProductEntity;
        return MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product));
      case productForm:
        final product = settings.arguments as ProductEntity?;
        return MaterialPageRoute(builder: (_) => ProductFormScreen(product: product));
      case orders:
        return MaterialPageRoute(builder: (_) => const OrderListScreen());
      case orderDetail:
        final orderId = settings.arguments as int;
        return MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: orderId));
      case orderForm:
        return MaterialPageRoute(builder: (_) => const OrderFormScreen());
      case sales:
        return MaterialPageRoute(builder: (_) => const SaleListScreen());
      case saleDetail:
        final saleId = settings.arguments as int;
        return MaterialPageRoute(builder: (_) => SaleDetailScreen(saleId: saleId));
      case notifications:
        return MaterialPageRoute(builder: (_) => const NotificationListScreen());
      case users:
        return MaterialPageRoute(builder: (_) => const UserListScreen());
      case userForm:
        final user = settings.arguments as UserEntity;
        return MaterialPageRoute(builder: (_) => UserFormScreen(user: user));
      case reports:
        return MaterialPageRoute(builder: (_) => const ReportScreen());
      case categories:
        return MaterialPageRoute(builder: (_) => const CategoryListScreen());
      case cotizaciones:
        return MaterialPageRoute(builder: (_) => const CotizacionListScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}
