import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../domain/entities/report_metrics.dart';

class TransactionHistoryList extends StatelessWidget {
  final List<SaleHistoryEntity> history;

  const TransactionHistoryList({super.key, required this.history});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) return const Center(child: Text('No hay transacciones recientes'));
    return Column(
      children: history.take(8).map((sale) {
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
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.receipt_long_rounded, color: Colors.green, size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(sale.producto, style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold, fontSize: 14), overflow: TextOverflow.ellipsis),
                    Text('${sale.cliente} • ${sale.fecha.split('T').first}', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                  ],
                ),
              ),
              Text(
                '\$${(sale.total / 1000).toStringAsFixed(1)}k', 
                style: GoogleFonts.oswald(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.green),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
