import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'user_provider.dart';
import '../../domain/entities/user.dart';

class UserFormScreen extends StatefulWidget {
  final UserEntity user;

  const UserFormScreen({super.key, required this.user});

  @override
  State<UserFormScreen> createState() => _UserFormScreenState();
}

class _UserFormScreenState extends State<UserFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _docNumberController;
  String? _selectedDocType;

  @override
  void initState() {
    super.initState();
    // Nota: nombre en Entity es el nombre completo o calculado
    // En el formulario solemos querer editar los campos individuales si el backend los soporta
    // Por ahora, como es un refactor de "limpieza", seguiremos usando los campos individuales
    // pero viniendo de la entidad si es posible, o dejándolos vacíos si no están en la entidad simplificada.
    
    _firstNameController = TextEditingController(text: widget.user.nombre.split(' ')[0]);
    _lastNameController = TextEditingController(text: widget.user.nombre.contains(' ') ? widget.user.nombre.split(' ').sublist(1).join(' ') : '');
    _emailController = TextEditingController(text: widget.user.correo);
    _docNumberController = TextEditingController(text: widget.user.numeroDocumento);
    _selectedDocType = widget.user.tipoDocumento;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final data = {
      'primer_nombre': _firstNameController.text,
      'primer_apellido': _lastNameController.text,
      'correo': _emailController.text,
      'tipo_documento': _selectedDocType,
      'numero_documento': _docNumberController.text,
    };

    try {
      await context.read<UserProvider>().updateUser(widget.user.id, data);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Usuario actualizado correctamente')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<UserProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Editar Usuario')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _firstNameController,
                decoration: const InputDecoration(labelText: 'Primer Nombre'),
                validator: (val) => val!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _lastNameController,
                decoration: const InputDecoration(labelText: 'Primer Apellido'),
                validator: (val) => val!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedDocType,
                decoration: const InputDecoration(labelText: 'Tipo de Documento'),
                items: ['CC', 'CE', 'NIT', 'PP'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                onChanged: (val) => setState(() => _selectedDocType = val),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _docNumberController,
                decoration: const InputDecoration(labelText: 'Número de Documento'),
                validator: (val) => val!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Correo Electrónico'),
                validator: (val) => val!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _save,
                  child: isLoading ? const CircularProgressIndicator() : const Text('Guardar Cambios'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _docNumberController.dispose();
    super.dispose();
  }
}
