import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'sale_provider.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/app_theme.dart';
import '../../core/widgets/skeleton_loader.dart';
import '../../core/widgets/app_empty_state.dart';
import 'package:google_fonts/google_fonts.dart';

class SaleListScreen extends StatefulWidget {
  const SaleListScreen({super.key});

  @override
  State<SaleListScreen> createState() => _SaleListScreenState();
}

class _SaleListScreenState extends State<SaleListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SaleProvider>().fetchSales();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de Ventas'),
      ),
      body: Consumer<SaleProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.sales.isEmpty) {
            return _buildSkeletonList();
          }

          if (provider.sales.isEmpty) {
            return const AppEmptyState(
              icon: Icons.receipt_long_rounded,
              title: 'No hay ventas registradas',
              subtitle: 'Las ventas aparecerán aquí una vez que los pedidos sean completados.',
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              await provider.fetchSales();
            },
            child: ListView.builder(
              itemCount: provider.sales.length,
              itemBuilder: (context, index) {
                final theme = Theme.of(context);
                final sale = provider.sales[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
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
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.monetization_on_rounded, color: Colors.green),
                    ),
                    title: Text(
                      'Venta #${sale.id}',
                      style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16),
                    ),
                    subtitle: Text(
                      'Pedido #${sale.idPedido} • ${sale.fecha.split('T')[0]}',
                      style: GoogleFonts.plusJakartaSans(fontSize: 13, color: theme.hintColor, fontWeight: FontWeight.w500),
                    ),
                    trailing: Text(
                      '\$${sale.total.toStringAsFixed(0)}',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.green,
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                      ),
                    ),
                    onTap: () => Navigator.pushNamed(context, AppRoutes.saleDetail, arguments: sale.id),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildSkeletonList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: SkeletonLoader(
          width: double.infinity,
          height: 80,
          borderRadius: BorderRadius.circular(24),
        ),
      ),
    );
  }
}
