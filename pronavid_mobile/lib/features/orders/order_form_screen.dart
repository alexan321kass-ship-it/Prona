import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'order_provider.dart';
import '../../domain/entities/cliente.dart';
import '../../domain/entities/product.dart';

// Widgets
import 'widgets/order_item_tile.dart';
import 'widgets/order_summary.dart';
import 'widgets/client_picker_sheet.dart';
import 'widgets/product_picker_sheet.dart';

class OrderFormScreen extends StatefulWidget {
  const OrderFormScreen({super.key});

  @override
  State<OrderFormScreen> createState() => _OrderFormScreenState();
}

class _OrderFormScreenState extends State<OrderFormScreen> {
  ClienteEntity? _selectedClient;
  final List<Map<String, dynamic>> _items = [];
  bool _isSubmitting = false;

  void _addItem(ProductEntity product) {
    setState(() {
      final index = _items.indexWhere((item) => item['product'].id == product.id);
      if (index != -1) {
        _items[index]['cantidad']++;
      } else {
        _items.add({
          'product': product,
          'cantidad': 1,
          'precio_unitario': product.price,
        });
      }
    });
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
  }

  void _updateQuantity(int index, int delta) {
    setState(() {
      final newQty = _items[index]['cantidad'] + delta;
      if (newQty > 0) {
        _items[index]['cantidad'] = newQty;
      }
    });
  }

  double get _total => _items.fold(0, (sum, item) => sum + (item['cantidad'] * item['precio_unitario']));

  Future<void> _submitOrder() async {
    if (_selectedClient == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor selecciona un Cliente')));
      return;
    }
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Agrega al menos un producto')));
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final orderData = {
        'id_cliente': _selectedClient!.id,
        'productos': _items.map((item) => {
          'id_producto': item['product'].id,
          'cantidad': item['cantidad'],
          'precio_unitario': item['precio_unitario'],
        }).toList(),
      };

      await context.read<OrderProvider>().createOrder(orderData);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pedido creado exitosamente'), backgroundColor: Colors.green));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showClientPicker() async {
    final client = await showModalBottomSheet<ClienteEntity>(
      context: context,
      isScrollControlled: true,
      builder: (context) => const ClientPickerSheet(),
    );
    if (client != null) {
      setState(() => _selectedClient = client);
    }
  }

  void _showProductPicker() async {
    final product = await showModalBottomSheet<ProductEntity>(
      context: context,
      isScrollControlled: true,
      builder: (context) => const ProductPickerSheet(),
    );
    if (product != null) {
      _addItem(product);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nuevo Pedido')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildClientSelector(),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Productos', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.add_circle, color: Colors.blue),
                        onPressed: _showProductPicker,
                      ),
                    ],
                  ),
                  const Divider(),
                  if (_items.isEmpty)
                    const Center(child: Padding(padding: EdgeInsets.all(32.0), child: Text('No hay productos agregados', style: TextStyle(color: Colors.grey))))
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _items.length,
                      itemBuilder: (context, index) {
                        return OrderItemTile(
                          item: _items[index],
                          onAdd: () => _updateQuantity(index, 1),
                          onRemove: () => _updateQuantity(index, -1),
                          onDelete: () => _removeItem(index),
                        );
                      },
                    ),
                ],
              ),
            ),
          ),
          OrderSummary(
            total: _total,
            isSubmitting: _isSubmitting,
            onConfirm: _submitOrder,
          ),
        ],
      ),
    );
  }

  Widget _buildClientSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Cliente', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        InkWell(
          onTap: _showClientPicker,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.person, color: Colors.blue),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _selectedClient?.nombre ?? 'Seleccionar Cliente',
                    style: TextStyle(
                      color: _selectedClient == null ? Colors.grey : Colors.black,
                      fontSize: 16,
                    ),
                  ),
                ),
                const Icon(Icons.arrow_drop_down),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
