import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'client_provider.dart';
import '../../core/navigation/app_routes.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/widgets/skeleton_loader.dart';

class ClientListScreen extends StatefulWidget {
  const ClientListScreen({super.key});

  @override
  State<ClientListScreen> createState() => _ClientListScreenState();
}

class _ClientListScreenState extends State<ClientListScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ClientProvider>().fetchClients();
    });
  }

  void _onSearch(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      if (mounted) {
        context.read<ClientProvider>().searchClients(query);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Directorio de Clientes'),
      ),
      body: Consumer<ClientProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              // Search Bar
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar por nombre o identificación...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchController.text.isNotEmpty 
                      ? IconButton(icon: const Icon(Icons.clear_rounded), onPressed: () {
                          _searchController.clear();
                          _onSearch('');
                        })
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
                  onSubmitted: _onSearch,
                  onChanged: (val) => setState(() {}),
                ),
              ),
              
              Expanded(
                child: provider.isLoading && provider.clients.isEmpty
                    ? _buildSkeletonList()
                    : provider.clients.isEmpty
                        ? _buildEmptyState(theme)
                        : RefreshIndicator(
                            onRefresh: () async {
                              await provider.fetchClients();
                            },
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              itemCount: provider.clients.length,
                              itemBuilder: (context, index) {
                                final client = provider.clients[index];
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
                                        gradient: LinearGradient(
                                          colors: [theme.primaryColor.withOpacity(0.1), theme.primaryColor.withOpacity(0.05)],
                                        ),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: Text(
                                          client.nombre[0].toUpperCase(), 
                                          style: GoogleFonts.plusJakartaSans(
                                            color: theme.primaryColor, 
                                            fontWeight: FontWeight.w800,
                                            fontSize: 18,
                                          ),
                                        ),
                                      ),
                                    ),
                                    title: Text(
                                      client.nombre, 
                                      style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16),
                                    ),
                                    subtitle: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(Icons.badge_outlined, size: 14, color: theme.hintColor),
                                            const SizedBox(width: 4),
                                            Text(
                                              client.identificacion,
                                              style: GoogleFonts.plusJakartaSans(fontSize: 12, color: theme.hintColor, fontWeight: FontWeight.w500),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    trailing: IconButton(
                                      icon: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Colors.blue.withOpacity(0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.edit_rounded, color: Colors.blue, size: 20),
                                      ),
                                      onPressed: () {
                                        Navigator.pushNamed(context, AppRoutes.clientForm, arguments: client);
                                      },
                                    ),
                                    onTap: () {
                                      Navigator.pushNamed(context, AppRoutes.clientDetail, arguments: client);
                                    },
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
        onPressed: () => Navigator.pushNamed(context, AppRoutes.clientForm),
        label: const Text('Nuevo Cliente'),
        icon: const Icon(Icons.person_add_rounded),
      ),
    );
  }

  Widget _buildSkeletonList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: 6,
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

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.people_outline_rounded, size: 80, color: theme.disabledColor.withOpacity(0.2)),
          const SizedBox(height: 16),
          Text('No hay clientes registrados', style: GoogleFonts.plusJakartaSans(color: theme.disabledColor, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }
}
