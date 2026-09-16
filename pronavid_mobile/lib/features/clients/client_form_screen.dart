import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../domain/entities/cliente.dart';
import 'client_provider.dart';

class ClientFormScreen extends StatefulWidget {
  final ClienteEntity? client;

  const ClientFormScreen({super.key, this.client});

  @override
  State<ClientFormScreen> createState() => _ClientFormScreenState();
}

class _ClientFormScreenState extends State<ClientFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _idController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.client != null) {
      _nameController.text = widget.client!.nombre;
      _idController.text = widget.client!.identificacion;
      _phoneController.text = widget.client!.telefono ?? '';
      _addressController.text = widget.client!.direccion ?? '';
      _emailController.text = widget.client!.correo ?? '';
    }
  }

  Future<void> _saveClient() async {
    if (!_formKey.currentState!.validate()) return;

    final data = {
      'nombre_cliente': _nameController.text,
      'identificacion': _idController.text,
      if (_phoneController.text.isNotEmpty) 'telefono': _phoneController.text,
      if (_addressController.text.isNotEmpty) 'direccion': _addressController.text,
      if (_emailController.text.isNotEmpty) 'correo': _emailController.text,
    };

    try {
      final provider = context.read<ClientProvider>();
      if (widget.client == null) {
        await provider.createClient(data);
      } else {
        await provider.updateClient(widget.client!.id, data);
      }
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(widget.client == null ? 'Cliente registrado' : 'Cliente actualizado')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ClientProvider>();
    final isEditing = widget.client != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Editar Cliente' : 'Nuevo Cliente'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Nombre Completo *', prefixIcon: Icon(Icons.person)),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Requerido';
                  if (RegExp(r'\d').hasMatch(val)) return 'El nombre no puede contener números';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _idController,
                decoration: const InputDecoration(labelText: 'Identificación / NIT *', prefixIcon: Icon(Icons.badge)),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Requerido';
                  if (!RegExp(r'^[0-9-]+$').hasMatch(val.trim())) return 'La identificación solo puede contener números';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Teléfono', prefixIcon: Icon(Icons.phone)),
                validator: (val) {
                  if (val != null && val.trim().isNotEmpty && !RegExp(r'^\d{7,10}$').hasMatch(val.trim())) {
                    return 'Entre 7 y 10 dígitos numéricos';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Correo Electrónico', prefixIcon: Icon(Icons.email)),
                validator: (val) {
                  if (val != null && val.trim().isNotEmpty && !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(val.trim())) {
                    return 'Correo electrónico inválido';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _addressController,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Dirección', prefixIcon: Icon(Icons.location_on)),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: provider.isLoading ? null : _saveClient,
                child: provider.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(isEditing ? 'Guardar Cambios' : 'Registrar Cliente'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _idController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _emailController.dispose();
    super.dispose();
  }
}
