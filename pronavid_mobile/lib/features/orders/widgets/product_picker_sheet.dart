import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../products/product_provider.dart';
import '../../../domain/entities/product.dart';

class ProductPickerSheet extends StatelessWidget {
  const ProductPickerSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) => Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Agregar Producto', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          Expanded(
            child: Consumer<ProductProvider>(
              builder: (context, provider, _) {
                if (provider.products.isEmpty) {
                  provider.fetchProducts();
                  return const Center(child: CircularProgressIndicator());
                }
                return ListView.builder(
                  controller: scrollController,
                  itemCount: provider.products.length,
                  itemBuilder: (context, index) {
                    final product = provider.products[index];
                    return ListTile(
                      title: Text(product.name),
                      subtitle: Text('\$${product.price} - Stock: ${product.stock}'),
                      trailing: const Icon(Icons.add_circle, color: Colors.blue),
                      onTap: () => Navigator.pop(context, product),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
