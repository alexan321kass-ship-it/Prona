import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppModalPicker extends StatelessWidget {
  final String title;
  final Widget child;
  final double initialChildSize;
  final double maxChildSize;
  final double minChildSize;

  const AppModalPicker({
    super.key,
    required this.title,
    required this.child,
    this.initialChildSize = 0.6,
    this.maxChildSize = 0.9,
    this.minChildSize = 0.4,
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required String title,
    required Widget child,
    double initialChildSize = 0.6,
    double maxChildSize = 0.9,
    double minChildSize = 0.4,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AppModalPicker(
        title: title,
        initialChildSize: initialChildSize,
        maxChildSize: maxChildSize,
        minChildSize: minChildSize,
        child: child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: initialChildSize,
      maxChildSize: maxChildSize,
      minChildSize: minChildSize,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            children: [
              // Handle
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 24),
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(),
              // Content
              Expanded(
                child: child,
              ),
            ],
          ),
        );
      },
    );
  }
}
