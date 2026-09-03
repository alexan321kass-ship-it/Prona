import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../clients/client_provider.dart';
import '../../../domain/entities/cliente.dart';

class ClientPickerSheet extends StatelessWidget {
  const ClientPickerSheet({super.key});

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
            child: Text('Seleccionar Cliente', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          Expanded(
            child: Consumer<ClientProvider>(
              builder: (context, provider, _) {
                if (provider.clients.isEmpty) {
                  provider.fetchClients();
                  return const Center(child: CircularProgressIndicator());
                }
                return ListView.builder(
                  controller: scrollController,
                  itemCount: provider.clients.length,
                  itemBuilder: (context, index) {
                    final client = provider.clients[index];
                    return ListTile(
                      title: Text(client.nombre),
                      subtitle: Text(client.identificacion),
                      onTap: () => Navigator.pop(context, client),
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
