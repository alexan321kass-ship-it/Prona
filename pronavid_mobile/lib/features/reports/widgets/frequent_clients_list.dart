import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../domain/entities/report_metrics.dart';

class FrequentClientsList extends StatelessWidget {
  final List<FrequentClientEntity> clients;

  const FrequentClientsList({super.key, required this.clients});

  @override
  Widget build(BuildContext context) {
    if (clients.isEmpty) return const Center(child: Text('No hay datos de clientes'));
    return Column(
      children: clients.take(5).map((client) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey.withOpacity(0.1)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.purple.withOpacity(0.1),
                child: const Icon(Icons.person_rounded, color: Colors.purple),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(client.nombre, style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, fontSize: 14)),
                    Text('Favorito: ${client.productoTop}', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('${client.cantidad}', style: GoogleFonts.oswald(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.purple)),
                  const Text('compras', style: TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
