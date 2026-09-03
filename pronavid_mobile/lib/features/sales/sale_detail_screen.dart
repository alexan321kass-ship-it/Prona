import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'sale_provider.dart';
import '../../domain/entities/venta.dart';

class SaleDetailScreen extends StatelessWidget {
  final int saleId;

  const SaleDetailScreen({super.key, required this.saleId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Detalle de Venta #$saleId'),
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: context.read<SaleProvider>().getSaleDetails(saleId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final data = snapshot.data!;
          final venta = data['venta'] as VentaEntity;
          final detalles = data['detalles'] as List<dynamic>;
          final double totalCalculado = (data['totalCalculado'] as num).toDouble();

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        _buildInfoRow('ID Venta', '#${venta.id}'),
                        _buildInfoRow('ID Pedido', '#${venta.idPedido}'),
                        _buildInfoRow('Fecha', venta.fecha.substring(0, 10)),
                        const Divider(),
                        _buildInfoRow('Total en Factura', '\$${venta.total.toStringAsFixed(0)}', isTotal: true),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Detalle de Productos',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: detalles.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (context, index) {
                    final item = detalles[index];
                    final double precioUnitario = double.tryParse(item['precio_unitario'].toString()) ?? 0.0;
                    final int cantidad = int.tryParse(item['cantidad'].toString()) ?? 0;
                    final subtotal = precioUnitario * cantidad;
                    
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(item['producto']['nombre_producto']?.toString() ?? 'Producto'),
                      subtitle: Text('$cantidad unidades x \$${precioUnitario.toStringAsFixed(0)}'),
                      trailing: Text('\$${subtotal.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                    );
                  },
                ),
                const Divider(thickness: 2),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Calculado', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text('\$${totalCalculado.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
                    ],
                  ),
                ),
                if (venta.estadoVenta != 'Cancelada') ...[
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final controller = TextEditingController();
                        final result = await showDialog<String>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Devolver Venta'),
                            content: TextField(
                              controller: controller,
                              decoration: const InputDecoration(
                                hintText: 'Motivo de la devolución',
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Cancelar'),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                                onPressed: () {
                                  if (controller.text.trim().isNotEmpty) {
                                    Navigator.pop(context, controller.text.trim());
                                  }
                                },
                                child: const Text('Confirmar', style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        );

                        if (result != null && result.isNotEmpty && context.mounted) {
                          try {
                            await context.read<SaleProvider>().returnSale(venta.id, result);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Venta devuelta correctamente')),
                              );
                              Navigator.pop(context); // Volver atrás
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Error: ${e.toString()}')),
                              );
                            }
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      icon: const Icon(Icons.undo, color: Colors.white),
                      label: const Text('Devolver Venta', style: TextStyle(color: Colors.white, fontSize: 16)),
                    ),
                  ),
                ] else ...[
                  const SizedBox(height: 24),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: const Center(
                      child: Text(
                        'Esta venta ya fue cancelada / devuelta',
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(
            value,
            style: TextStyle(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              fontSize: isTotal ? 18 : 14,
              color: isTotal ? Colors.green : Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}
