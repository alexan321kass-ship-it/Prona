import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:provider/provider.dart';
import '../auth/auth_provider.dart';
import '../products/product_list_screen.dart';
import '../clients/client_list_screen.dart';
import '../orders/order_list_screen.dart';
import '../sales/sale_provider.dart';
import '../notifications/notification_provider.dart';
import '../reports/report_screen.dart';
import '../../core/navigation/app_routes.dart';

// Widgets
import 'widgets/dashboard_header.dart';
import 'widgets/metric_card.dart';
import 'widgets/action_card.dart';
import 'widgets/section_header.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  bool _isBottomBarVisible = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications();
      context.read<SaleProvider>().fetchStats();
    });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final user = auth.user;
    final int rol = user?.idRol ?? 2;

    return Scaffold(
      body: NotificationListener<UserScrollNotification>(
        onNotification: (notification) {
          if (notification.direction == ScrollDirection.forward) {
            if (!_isBottomBarVisible) setState(() => _isBottomBarVisible = true);
          } else if (notification.direction == ScrollDirection.reverse) {
            if (_isBottomBarVisible) setState(() => _isBottomBarVisible = false);
          }
          return true;
        },
        child: IndexedStack(
          index: _selectedIndex,
          children: [
            _HomeContent(onNavigate: _onItemTapped),
            const ProductListScreen(),
            const OrderListScreen(),
            const ClientListScreen(),
            if (rol == 1) const ReportScreen(),
          ],
        ),
      ),
      bottomNavigationBar: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        color: Colors.white,
        height: _isBottomBarVisible ? kBottomNavigationBarHeight + MediaQuery.of(context).padding.bottom : 0,
        child: Wrap(
          children: [
            Container(
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: BottomNavigationBar(
                currentIndex: _selectedIndex,
                onTap: _onItemTapped,
                elevation: 0,
                items: [
                  const BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), activeIcon: Icon(Icons.dashboard_rounded), label: 'Inicio'),
                  const BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), activeIcon: Icon(Icons.inventory_2_rounded), label: 'Productos'),
                  const BottomNavigationBarItem(icon: Icon(Icons.shopping_cart_outlined), activeIcon: Icon(Icons.shopping_cart_rounded), label: 'Pedidos'),
                  const BottomNavigationBarItem(icon: Icon(Icons.people_outline_rounded), activeIcon: Icon(Icons.people_rounded), label: 'Clientes'),
                  if (rol == 1) const BottomNavigationBarItem(icon: Icon(Icons.analytics_outlined), activeIcon: Icon(Icons.analytics_rounded), label: 'Reportes'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeContent extends StatelessWidget {
  final Function(int) onNavigate;

  const _HomeContent({required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final String nombre = user?.nombre ?? 'Usuario';
    final int rol = user?.idRol ?? 2;

    return CustomScrollView(
      slivers: [
        DashboardHeader(
          nombre: nombre,
          rol: rol,
          onLogout: () async {
            await auth.logout();
            if (context.mounted) {
              Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (route) => false);
            }
          },
          notificationAction: Consumer<NotificationProvider>(
            builder: (context, provider, child) {
              return Badge(
                label: Text('${provider.unreadCount}'),
                isLabelVisible: provider.unreadCount > 0,
                backgroundColor: Colors.white,
                textColor: theme.primaryColor,
                child: IconButton(
                  icon: const Icon(Icons.notifications_none_rounded, color: Colors.white),
                  onPressed: () => Navigator.pushNamed(context, AppRoutes.notifications),
                ),
              );
            },
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(title: 'RESUMEN DE HOY'),
                const SizedBox(height: 20),
                Consumer<SaleProvider>(
                  builder: (context, provider, child) {
                    final stats = provider.stats;
                    return Row(
                      children: [
                        Expanded(
                          child: MetricCard(
                            title: 'PEDIDOS',
                            value: '${stats.pedidosHoy}',
                            icon: Icons.receipt_long_rounded,
                            color: theme.primaryColor,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: MetricCard(
                            title: 'VENTAS',
                            value: '\$${(stats.ventasHoyTotal / 1000).toStringAsFixed(1)}k',
                            icon: Icons.auto_graph_rounded,
                            color: theme.colorScheme.secondary,
                          ),
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 40),
                const SectionHeader(title: 'ACCESOS RÁPIDOS'),
                const SizedBox(height: 20),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                  children: [
                    ActionCard(
                      title: 'NUEVO PEDIDO',
                      icon: Icons.add_shopping_cart_rounded,
                      color: theme.primaryColor,
                      onTap: () => Navigator.pushNamed(context, AppRoutes.orderForm),
                    ),
                    ActionCard(
                      title: 'CLIENTES',
                      icon: Icons.people_alt_rounded,
                      color: theme.colorScheme.secondary,
                      onTap: () => onNavigate(3),
                    ),
                    ActionCard(
                      title: 'CATÁLOGO',
                      icon: Icons.menu_book_rounded,
                      color: Colors.indigo,
                      onTap: () => onNavigate(1),
                    ),
                    ActionCard(
                      title: 'HISTORIAL',
                      icon: Icons.history_rounded,
                      color: Colors.blueGrey,
                      onTap: () => Navigator.pushNamed(context, AppRoutes.sales),
                    ),
                    ActionCard(
                      title: 'COTIZACIONES',
                      icon: Icons.receipt_long_rounded,
                      color: const Color(0xFF2980B9),
                      onTap: () => Navigator.pushNamed(context, AppRoutes.cotizaciones),
                    ),
                    if (rol == 1) ActionCard(
                      title: 'USUARIOS',
                      icon: Icons.admin_panel_settings_rounded,
                      color: Colors.purple,
                      onTap: () => Navigator.pushNamed(context, AppRoutes.users),
                    ),
                    if (rol == 1) ActionCard(
                      title: 'MÉTRICAS',
                      icon: Icons.bar_chart_rounded,
                      color: Colors.pink,
                      onTap: () => onNavigate(4),
                    ),
                  ],
                ),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
