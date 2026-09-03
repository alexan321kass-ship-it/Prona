import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'order_provider.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/widgets/skeleton_loader.dart';

class OrderListScreen extends StatefulWidget {
  const OrderListScreen({super.key});

  @override
  State<OrderListScreen> createState() => _OrderListScreenState();
}

class _OrderListScreenState extends State<OrderListScreen> {
  final List<String> _estados = ['Pendiente', 'En_proceso', 'Entregado', 'Cancelado'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().fetchOrders();
    });
  }


  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Gestión de Pedidos'),
      ),
      body: Consumer<OrderProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              // Horizontal Status Filter
              SizedBox(
                height: 52,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  itemCount: _estados.length + 1,
                  itemBuilder: (context, index) {
                    final bool isSelected = (index == 0 && provider.selectedEstado == null) ||
                        (index > 0 && provider.selectedEstado == _estados[index - 1]);
                    
                    final String label = index == 0 ? 'Todos' : _estados[index - 1].replaceAll('_', ' ');

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(label),
                        selected: isSelected,
                        onSelected: (val) {
                          if (index == 0) {
                            provider.setEstadoFilter(null);
                          } else {
                            provider.setEstadoFilter(_estados[index - 1]);
                          }
                        },
                        selectedColor: theme.primaryColor,
                        labelStyle: GoogleFonts.plusJakartaSans(
                          color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 12,
                        ),
                        showCheckmark: false,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    );
                  },
                ),
              ),
              
              Expanded(
                child: provider.isLoading && provider.orders.isEmpty
                    ? _buildSkeletonList()
                    : RefreshIndicator(
                        onRefresh: () async {
                          await provider.fetchOrders();
                        },
                        child: provider.orders.isEmpty
                            ? ListView(
                                physics: const AlwaysScrollableScrollPhysics(),
                                children: [
                                  SizedBox(
                                    height: MediaQuery.of(context).size.height * 0.6,
                                    child: _buildEmptyState(theme),
                                  ),
                                ],
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 20),
                                itemCount: provider.orders.length,
                                itemBuilder: (context, index) {
                                  final order = provider.orders[index];
                                  final clientName = order.cliente?.nombre ?? 'Cliente #${order.idCliente}';
                                  final statusColor = order.estado.getOrderColor(context);

                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.03),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                  border: Border.all(color: theme.dividerColor.withOpacity(0.05)),
                                ),
                                child: InkWell(
                                  onTap: () => Navigator.pushNamed(context, AppRoutes.orderDetail, arguments: order.id),
                                  borderRadius: BorderRadius.circular(24),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Row(
                                      children: [
                                        // Status Icon
                                        Container(
                                          width: 50,
                                          height: 50,
                                          decoration: BoxDecoration(
                                            color: statusColor.withOpacity(0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: Icon(Icons.receipt_long_rounded, color: statusColor, size: 24),
                                        ),
                                        const SizedBox(width: 16),
                                        // Info
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Flexible(
                                                    child: Text(
                                                      'Pedido #${order.id}',
                                                      style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16),
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  _buildStatusBadge(order.estado.replaceAll('_', ' '), statusColor),
                                                ],
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                clientName,
                                                style: GoogleFonts.plusJakartaSans(fontSize: 14, color: theme.hintColor, fontWeight: FontWeight.w600),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 8),
                                              Row(
                                                children: [
                                                  Icon(Icons.calendar_today_rounded, size: 14, color: theme.disabledColor),
                                                  const SizedBox(width: 4),
                                                  Flexible(
                                                    child: Text(
                                                      order.fecha.isNotEmpty
                                                          ? order.fecha.split('T')[0]
                                                          : '—',
                                                      style: GoogleFonts.plusJakartaSans(fontSize: 12, color: theme.disabledColor, fontWeight: FontWeight.w500),
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                  const Spacer(),
                                                  Text(
                                                    'Ver detalles',
                                                    style: GoogleFonts.plusJakartaSans(
                                                      fontWeight: FontWeight.w600,
                                                      fontSize: 12,
                                                      color: theme.primaryColor,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Icon(Icons.chevron_right_rounded, size: 16, color: theme.primaryColor),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    ),
                                  ),
                                );
                              },
                            ),
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.orderForm),
        label: const Text('Nuevo Pedido'),
        icon: const Icon(Icons.add_shopping_cart_rounded),
      ),
    );
  }

  Widget _buildSkeletonList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: 4,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: SkeletonLoader(
          width: double.infinity,
          height: 100,
          borderRadius: BorderRadius.circular(24),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text.toUpperCase(),
        style: GoogleFonts.plusJakartaSans(color: color, fontSize: 10, fontWeight: FontWeight.w800),
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 80, color: theme.disabledColor.withOpacity(0.2)),
          const SizedBox(height: 16),
          Text('No hay pedidos que mostrar', style: GoogleFonts.plusJakartaSans(color: theme.disabledColor, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
