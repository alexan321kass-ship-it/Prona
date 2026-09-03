import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'order_provider.dart';
import '../../domain/entities/pedido.dart';
import '../../domain/entities/pedido_detalle.dart';
import '../auth/auth_provider.dart';
import '../../core/app_theme.dart';

class OrderDetailScreen extends StatefulWidget {
  final int orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  bool _isLoading = true;
  PedidoEntity? _pedido;
  List<PedidoDetalleEntity>? _detalles;
  double _total = 0;

  @override
  void initState() {
    super.initState();
    _loadOrderDetails();
  }

  Future<void> _loadOrderDetails() async {
    try {
      final data = await context.read<OrderProvider>().getOrderDetails(widget.orderId);
      setState(() {
        _pedido = data['pedido'];
        _detalles = data['detalles'];
        _total = _detalles!.fold(0.0, (sum, item) => sum + (item.cantidad * item.precioUnitario));
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
        Navigator.pop(context);
      }
    }
  }

  Future<void> _updateStatus(String newStatus) async {
    try {
      await context.read<OrderProvider>().updateOrderStatus(widget.orderId, newStatus);
      await _loadOrderDetails();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Estado actualizado')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(appBar: AppBar(title: const Text('Cargando...')), body: const Center(child: CircularProgressIndicator()));
    }

    final clientName = _pedido!.cliente?.nombre ?? 'Cliente #${_pedido!.idCliente}';
    final estados = ['Pendiente', 'En_proceso', 'Entregado', 'Cancelado'];

    final auth = context.read<AuthProvider>();
    final rol = auth.user?.idRol ?? 2;


    return Scaffold(
      appBar: AppBar(
        title: Text('Pedido #${_pedido!.id}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Información General', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                    const Divider(),
                    const SizedBox(height: 8),
                    _buildInfoRow('Cliente', clientName),
                    _buildInfoRow('Fecha', _pedido!.fecha.split('T')[0]),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Text('Estado: ', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                        if (rol == 1)
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: estados.contains(_pedido!.estado) ? _pedido!.estado : null,
                              decoration: const InputDecoration(isDense: true, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                              items: estados.map((e) => DropdownMenuItem(value: e, child: Text(e.replaceAll('_', ' ')))).toList(),
                              onChanged: (val) {
                                if (val != null && val != _pedido!.estado) {
                                  _updateStatus(val);
                                }
                              },
                            ),
                          )
                        else
                          Expanded(
                            child: Text(
                              _pedido!.estado.replaceAll('_', ' '),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _pedido!.estado.getOrderColor(context),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Productos del Pedido', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Card(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _detalles!.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final item = _detalles![index];
                  final productName = item.producto?.name ?? 'Producto #${item.idProducto}';
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                      child: Text('${item.cantidad}x', style: TextStyle(color: Theme.of(context).primaryColor, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                    title: Text(productName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('\$${item.precioUnitario} c/u'),
                    trailing: Text('\$${(item.cantidad * item.precioUnitario).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text('Total:', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(width: 16),
                Text('\$${_total.toStringAsFixed(0)}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          SizedBox(width: 100, child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }
}
