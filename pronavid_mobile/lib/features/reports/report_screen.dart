import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'report_provider.dart';

// Widgets
import 'widgets/premium_metric_card.dart';
import 'widgets/revenue_trend_chart.dart';
import 'widgets/top_products_chart.dart';
import 'widgets/chart_container.dart';
import 'widgets/frequent_clients_list.dart';
import 'widgets/transaction_history_list.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReportProvider>().fetchAllReports();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('DASHBOARD DE MÉTRICAS', style: GoogleFonts.oswald(fontWeight: FontWeight.w700, letterSpacing: 1.5)),
        centerTitle: true,
      ),
      body: Consumer<ReportProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final metrics = provider.metrics;
          if (metrics == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock_person_rounded, size: 64, color: theme.primaryColor.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  const Text('Error cargando reportes o usuario sin permisos', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            );
          }

          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ANÁLISIS DE RENDIMIENTO',
                        style: GoogleFonts.oswald(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.grey, letterSpacing: 2),
                      ),
                      const SizedBox(height: 24),
                      
                      // 4 Métricas Principales (Grid)
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.35,
                        children: [
                          PremiumMetricCard(title: 'INGRESOS', value: '\$${(metrics.ingresosHistoricos / 1000000).toStringAsFixed(1)}M', icon: Icons.payments_rounded, color: Colors.green),
                          PremiumMetricCard(title: 'PEDIDOS', value: '${metrics.totalVentas}', icon: Icons.shopping_bag_rounded, color: Colors.blue),
                          PremiumMetricCard(title: 'CLIENTES', value: '${metrics.totalClientes}', icon: Icons.people_alt_rounded, color: Colors.purple),
                          PremiumMetricCard(title: 'UNIDADES', value: '${metrics.totalProductos}', icon: Icons.inventory_2_rounded, color: Colors.orange),
                        ],
                      ),
                      
                      const SizedBox(height: 40),
                      const _SectionHeader(title: 'TENDENCIA DE INGRESOS MENSUALES'),
                      const SizedBox(height: 20),
                      ChartContainer(
                        height: 250,
                        child: RevenueTrendChart(data: metrics.ventasMensuales),
                      ),

                      const SizedBox(height: 40),
                      const _SectionHeader(title: 'TOP PRODUCTOS (UNIDADES)'),
                      const SizedBox(height: 20),
                      ChartContainer(
                        height: 300,
                        child: TopProductsChart(data: metrics.masVendidos),
                      ),

                      const SizedBox(height: 40),
                      const _SectionHeader(title: 'CLIENTES MÁS FIELES'),
                      const SizedBox(height: 20),
                      FrequentClientsList(clients: metrics.clientesFrecuentes),

                      const SizedBox(height: 40),
                      const _SectionHeader(title: 'HISTORIAL DE TRANSACCIONES'),
                      const SizedBox(height: 20),
                      TransactionHistoryList(history: metrics.historialVentas),
                      
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: GoogleFonts.oswald(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: 1,
      ),
    );
  }
}
