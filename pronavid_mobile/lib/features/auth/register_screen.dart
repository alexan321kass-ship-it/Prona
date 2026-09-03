import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'auth_provider.dart';
import 'package:google_fonts/google_fonts.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _apellidoController = TextEditingController();
  final _numDocController = TextEditingController();
  final _correoController = TextEditingController();
  final _contrasenaController = TextEditingController();
  final _confirmarController = TextEditingController();
  final _codigoAdminController = TextEditingController();
  
  String _tipoDoc = 'CC';
  String _rol = 'Asesor';

  void _handleRegister() async {
    if (_formKey.currentState!.validate()) {
      final userData = {
        'primer_nombre': _nombreController.text.trim(),
        'primer_apellido': _apellidoController.text.trim(),
        'tipo_documento': _tipoDoc,
        'numero_documento': _numDocController.text.trim(),
        'correo': _correoController.text.trim(),
        'contrasena': _contrasenaController.text,
        'id_rol': _rol == 'Administrador' ? 1 : 2,
      };

      try {
        final success = await context.read<AuthProvider>().register(userData);
        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('¡Registro exitoso! Inicia sesión'), backgroundColor: Colors.green),
          );
          Navigator.pop(context);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: Text('CREAR CUENTA', style: GoogleFonts.oswald(fontWeight: FontWeight.w700, letterSpacing: 1.5)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'ÚNETE A LA FAMILIA PRONAVID',
                textAlign: TextAlign.center,
                style: GoogleFonts.oswald(
                  fontSize: 24, 
                  fontWeight: FontWeight.w700, 
                  color: theme.primaryColor,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Completa tus datos para empezar',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 40),
              
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _nombreController,
                      decoration: const InputDecoration(labelText: 'Nombre'),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Requerido';
                        if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$').hasMatch(v)) return 'Solo letras';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _apellidoController,
                      decoration: const InputDecoration(labelText: 'Apellido'),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Requerido';
                        if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$').hasMatch(v)) return 'Solo letras';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  SizedBox(
                    width: 100,
                    child: DropdownButtonFormField<String>(
                      initialValue: _tipoDoc,
                      decoration: const InputDecoration(labelText: 'Tipo'),
                      items: ['CC', 'TI', 'CE'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                      onChanged: (v) => setState(() => _tipoDoc = v!),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _numDocController,
                      decoration: const InputDecoration(labelText: 'Documento'),
                      keyboardType: TextInputType.number,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Requerido';
                        if (!RegExp(r'^\d+$').hasMatch(v)) return 'Solo números';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _correoController,
                decoration: const InputDecoration(labelText: 'Correo electrónico', prefixIcon: Icon(Icons.email_rounded)),
                keyboardType: TextInputType.emailAddress,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Requerido';
                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v)) return 'Correo inválido';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _contrasenaController,
                decoration: const InputDecoration(labelText: 'Contraseña', prefixIcon: Icon(Icons.lock_rounded)),
                obscureText: true,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Requerido';
                  if (v.length < 6) return 'Mínimo 6 caracteres';
                  if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d)').hasMatch(v)) return 'Debe contener letras y números';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _confirmarController,
                decoration: const InputDecoration(labelText: 'Confirmar Contraseña', prefixIcon: Icon(Icons.lock_clock_rounded)),
                obscureText: true,
                validator: (v) => v != _contrasenaController.text ? 'No coinciden' : null,
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                initialValue: _rol,
                decoration: const InputDecoration(labelText: 'Tipo de cuenta'),
                items: ['Asesor', 'Administrador'].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                onChanged: (v) => setState(() => _rol = v!),
              ),
              const SizedBox(height: 16),

              if (_rol == 'Administrador')
                TextFormField(
                  controller: _codigoAdminController,
                  decoration: const InputDecoration(labelText: 'Código Admin', prefixIcon: Icon(Icons.verified_user_rounded)),
                  obscureText: true,
                ),
              
              const SizedBox(height: 40),

              ElevatedButton(
                onPressed: isLoading ? null : _handleRegister,
                child: isLoading 
                  ? const CircularProgressIndicator(color: Colors.white) 
                  : const Text('REGISTRARSE'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
