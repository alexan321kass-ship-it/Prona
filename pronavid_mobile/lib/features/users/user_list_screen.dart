import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'user_provider.dart';
import '../../domain/entities/user.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/app_theme.dart';
import '../../core/widgets/skeleton_loader.dart';
import '../../core/widgets/app_empty_state.dart';
import 'package:google_fonts/google_fonts.dart';


class UserListScreen extends StatefulWidget {
  const UserListScreen({super.key});

  @override
  State<UserListScreen> createState() => _UserListScreenState();
}

class _UserListScreenState extends State<UserListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UserProvider>().fetchUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gestión de Usuarios')),
      body: Consumer<UserProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && provider.users.isEmpty) {
            return _buildSkeletonList();
          }
          if (provider.users.isEmpty) {
            return const AppEmptyState(
              icon: Icons.admin_panel_settings_rounded,
              title: 'No hay usuarios registrados',
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              await provider.fetchUsers();
            },
            child: ListView.builder(
              itemCount: provider.users.length,
              itemBuilder: (context, index) {
                final theme = Theme.of(context);
                final user = provider.users[index];
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
                          user.nombre[0].toUpperCase(), 
                          style: GoogleFonts.plusJakartaSans(
                            color: theme.primaryColor, 
                            fontWeight: FontWeight.w800,
                            fontSize: 18,
                          ),
                        ),
                      ),
                    ),
                    title: Text(
                      user.nombre,
                      style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16),
                    ),
                    subtitle: Text(
                      user.correo,
                      style: GoogleFonts.plusJakartaSans(fontSize: 13, color: theme.hintColor, fontWeight: FontWeight.w500),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.blue.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.edit_rounded, color: Colors.blue, size: 20),
                          ),
                          onPressed: () => Navigator.pushNamed(context, AppRoutes.userForm, arguments: user),
                        ),
                        IconButton(
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.delete_rounded, color: Colors.red, size: 20),
                          ),
                          onPressed: () => _confirmDelete(user),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _confirmDelete(UserEntity user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Usuario'),
        content: Text('¿Estás seguro de que deseas eliminar a ${user.nombre}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await context.read<UserProvider>().deleteUser(user.id);
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Usuario eliminado')));
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
              }
            },
            child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
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
}
