import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'product_provider.dart';
import 'category_provider.dart';
import '../../core/navigation/app_routes.dart';
import '../../domain/entities/product.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/api_client.dart';
import '../../core/widgets/skeleton_loader.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<ProductProvider>();
      context.read<CategoryProvider>().fetchCategories();
      provider.fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Catálogo de Productos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.layers_outlined),
            tooltip: 'Gestionar Categorías',
            onPressed: () => Navigator.pushNamed(context, AppRoutes.categories),
          ),
        ],
      ),
      body: Consumer<ProductProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              // Search Bar
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar por nombre o descripción...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchController.text.isNotEmpty 
                      ? IconButton(icon: const Icon(Icons.clear), onPressed: () => setState(() => _searchController.clear()))
                      : null,
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(color: theme.dividerColor.withOpacity(0.05)),
                    ),
                  ),
                  onChanged: (value) => setState(() {}),
                ),
              ),
              
              // Categories Horizontal List
              SizedBox(
                height: 45,
                child: Consumer<CategoryProvider>(
                  builder: (context, categoryProvider, _) {
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      scrollDirection: Axis.horizontal,
                      itemCount: categoryProvider.categories.length + 1,
                      itemBuilder: (context, index) {
                        final bool isSelected = (index == 0 && provider.selectedCategory == null) ||
                            (index > 0 && provider.selectedCategory == categoryProvider.categories[index - 1]['id_categoria']);
                        
                        final String label = index == 0 ? 'Todos' : categoryProvider.categories[index - 1]['nombre_categoria'];

                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(label),
                            selected: isSelected,
                            onSelected: (val) {
                              if (index == 0) {
                                provider.setCategoryFilter(null);
                              } else {
                                provider.setCategoryFilter(categoryProvider.categories[index - 1]['id_categoria']);
                              }
                            },
                        selectedColor: theme.primaryColor,
                        checkmarkColor: Colors.white,
                        labelStyle: GoogleFonts.plusJakartaSans(
                          color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 13,
                        ),
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: isSelected ? theme.primaryColor : theme.dividerColor.withOpacity(0.1)),
                        ),
                        showCheckmark: false,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                      ),
                    );
                  },
                );
              },
            ),
          ),
              const SizedBox(height: 16),

              // Product List
              Expanded(
                child: provider.isLoading && provider.products.isEmpty
                    ? _buildSkeletonList()
                    : RefreshIndicator(
                        onRefresh: () async {
                          await provider.fetchProducts(forceRefresh: true);
                        },
                        child: _buildProductGrid(provider, theme),
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.productForm),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
    );
  }

  Widget _buildProductGrid(ProductProvider provider, ThemeData theme) {
    final products = provider.products.where((p) {
      if (_searchController.text.isEmpty) return true;
      return p.name.toLowerCase().contains(_searchController.text.toLowerCase()) ||
          (p.description?.toLowerCase().contains(_searchController.text.toLowerCase()) ?? false);
    }).toList();

    if (products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 80, color: theme.disabledColor.withOpacity(0.2)),
            const SizedBox(height: 16),
            Text('No se encontraron productos', style: GoogleFonts.plusJakartaSans(color: theme.disabledColor, fontWeight: FontWeight.w600)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: InkWell(
            onTap: () => Navigator.pushNamed(context, AppRoutes.productDetail, arguments: product),

            borderRadius: BorderRadius.circular(24),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  // Product Image Placeholder/Actual
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: theme.primaryColor.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: product.image != null && product.image!.isNotEmpty
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(20),
                            child: CachedNetworkImage(
                              imageUrl: '${ApiClient().serverUrl.replaceAll('/api', '')}/${product.image}',
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                              ),
                              errorWidget: (_, __, ___) => Icon(Icons.medication_rounded, color: theme.primaryColor.withOpacity(0.5), size: 40),
                            ),
                          )
                        : Center(
                            child: Icon(Icons.medication_rounded, color: theme.primaryColor.withOpacity(0.5), size: 40),
                          ),
                  ),
                  const SizedBox(width: 16),
                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          product.description ?? 'Sin descripción disponible',
                          style: GoogleFonts.plusJakartaSans(fontSize: 13, color: theme.hintColor, fontWeight: FontWeight.w500),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '\$${product.price.toStringAsFixed(0)}',
                              style: GoogleFonts.plusJakartaSans(
                                color: theme.primaryColor,
                                fontWeight: FontWeight.w800,
                                fontSize: 18,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: product.stock > 10 ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                'Stock: ${product.stock}',
                                style: GoogleFonts.plusJakartaSans(
                                  color: product.stock > 10 ? Colors.green : Colors.orange,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 11,
                                ),
                              ),
                            ),
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
    );
  }

  Widget _buildSkeletonList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: 5,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: SkeletonLoader(
          width: double.infinity,
          height: 114,
          borderRadius: BorderRadius.circular(24),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
