import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'cotizacion_provider.dart';

class CotizacionListScreen extends StatefulWidget {
  const CotizacionListScreen({super.key});

  @override
  State<CotizacionListScreen> createState() => _CotizacionListScreenState();
}

class _CotizacionListScreenState extends State<CotizacionListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CotizacionProvider>().fetchCotizaciones();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Historial de Cotizaciones'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => context.read<CotizacionProvider>().fetchCotizaciones(),
          ),
        ],
      ),
      body: Consumer<CotizacionProvider>(
        builder: (context, provider, _) {
          return Column(
            children: [
              // Chips de filtro
              _FiltrosEstado(provider: provider, theme: theme),
              const SizedBox(height: 4),

              // Lista
              Expanded(
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : provider.cotizaciones.isEmpty
                        ? _EstadoVacio(filtro: provider.filtroEstado)
                        : RefreshIndicator(
                            onRefresh: () => provider.fetchCotizaciones(),
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: provider.cotizaciones.length,
                              itemBuilder: (context, i) => _TarjetaCotizacion(
                                cotizacion: provider.cotizaciones[i],
                                theme: theme,
                                onUpdateEstado: (id, estado) => _cambiarEstado(context, provider, id, estado),
                                onDelete: (id) => _eliminar(context, provider, id),
                              ),
                            ),
                          ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _cambiarEstado(BuildContext context, CotizacionProvider provider, int id, String estado) async {
    final ok = await provider.updateEstado(id, estado);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(ok ? 'Estado actualizado a $estado' : provider.errorMessage ?? 'Error'),
      backgroundColor: ok ? Colors.green : Colors.red,
    ));
  }

  Future<void> _eliminar(BuildContext context, CotizacionProvider provider, int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('¿Eliminar cotización?'),
        content: const Text('Esta acción no se puede deshacer.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true || !context.mounted) return;
    final ok = await provider.delete(id);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(ok ? 'Cotización eliminada' : provider.errorMessage ?? 'Error'),
      backgroundColor: ok ? Colors.green : Colors.red,
    ));
  }
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

class _FiltrosEstado extends StatelessWidget {
  final CotizacionProvider provider;
  final ThemeData theme;

  const _FiltrosEstado({required this.provider, required this.theme});

  @override
  Widget build(BuildContext context) {
    final filtros = ['Todos', 'Pendiente', 'Aprobada', 'Rechazada'];
    return SizedBox(
      height: 48,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        scrollDirection: Axis.horizontal,
        itemCount: filtros.length,
        itemBuilder: (_, i) {
          final f = filtros[i];
          final isSelected = provider.filtroEstado == f;
          final count = f == 'Todos'
              ? provider.todasLasCotizaciones.length
              : provider.countByEstado(f);
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text('$f ($count)'),
              selected: isSelected,
              onSelected: (_) => provider.setFiltro(f),
              selectedColor: theme.primaryColor,
              checkmarkColor: Colors.white,
              labelStyle: GoogleFonts.plusJakartaSans(
                color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                fontSize: 12,
              ),
              showCheckmark: false,
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: isSelected ? theme.primaryColor : theme.dividerColor.withOpacity(0.2)),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Tarjeta de cotización ────────────────────────────────────────────────────

class _TarjetaCotizacion extends StatefulWidget {
  final Map<String, dynamic> cotizacion;
  final ThemeData theme;
  final Future<void> Function(int id, String estado) onUpdateEstado;
  final Future<void> Function(int id) onDelete;

  const _TarjetaCotizacion({
    required this.cotizacion,
    required this.theme,
    required this.onUpdateEstado,
    required this.onDelete,
  });

  @override
  State<_TarjetaCotizacion> createState() => _TarjetaCotizacionState();
}

class _TarjetaCotizacionState extends State<_TarjetaCotizacion> {
  bool _expanded = false;

  String _formatMoneda(dynamic v) =>
      'COP ${double.tryParse(v.toString())?.toStringAsFixed(0) ?? '0'}';

  String _formatFecha(String? f) {
    if (f == null) return '';
    final dt = DateTime.tryParse(f);
    if (dt == null) return f;
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  double _calcularTotal() {
    final detalles = (widget.cotizacion['detalle_cotizacion'] as List?) ?? [];
    return detalles.fold(0.0, (sum, d) =>
        sum + (double.tryParse(d['precio_unitario'].toString()) ?? 0) * ((d['cantidad'] as num?) ?? 0));
  }

  Color _colorEstado(String estado) {
    switch (estado) {
      case 'Aprobada': return Colors.green;
      case 'Rechazada': return Colors.red;
      default: return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.cotizacion;
    final theme = widget.theme;
    final estado = c['estado'] ?? 'Pendiente';
    final detalles = (c['detalle_cotizacion'] as List?) ?? [];
    final total = _calcularTotal();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _expanded ? theme.primaryColor : Colors.transparent,
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Cabecera
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // ID Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: theme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '#${c['id_cotizacion']}',
                      style: GoogleFonts.plusJakartaSans(
                        color: theme.primaryColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          c['cliente']?['nombre_cliente'] ?? 'Cliente',
                          style: GoogleFonts.plusJakartaSans(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                          ),
                        ),
                        Text(
                          _formatFecha(c['fecha_cotizacion']),
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _colorEstado(estado).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          estado,
                          style: GoogleFonts.plusJakartaSans(
                            color: _colorEstado(estado),
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _formatMoneda(total),
                        style: GoogleFonts.plusJakartaSans(
                          color: theme.primaryColor,
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: Colors.grey[400],
                  ),
                ],
              ),
            ),
          ),

          // Detalle expandido
          if (_expanded) ...[
            Divider(height: 1, color: theme.dividerColor.withOpacity(0.5)),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Asesor
                  if (c['usuario'] != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        'Asesor: ${c['usuario']['primer_nombre']} ${c['usuario']['primer_apellido']}',
                        style: GoogleFonts.plusJakartaSans(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ),

                  // Tabla de productos
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        // Encabezado
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          child: Row(
                            children: [
                              Expanded(child: Text('Producto', style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[600]))),
                              Text('Cant.', style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[600])),
                              const SizedBox(width: 12),
                              SizedBox(width: 90, child: Text('Subtotal', textAlign: TextAlign.right, style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[600]))),
                            ],
                          ),
                        ),
                        const Divider(height: 1),
                        ...detalles.map<Widget>((d) {
                          final subtotal = (double.tryParse(d['precio_unitario'].toString()) ?? 0) * ((d['cantidad'] as num?) ?? 0);
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    d['producto']?['nombre_producto'] ?? 'Producto',
                                    style: GoogleFonts.plusJakartaSans(fontSize: 13, fontWeight: FontWeight.w600),
                                  ),
                                ),
                                Text(
                                  '×${d['cantidad']}',
                                  style: GoogleFonts.plusJakartaSans(fontSize: 12, color: Colors.grey[600]),
                                ),
                                const SizedBox(width: 12),
                                SizedBox(
                                  width: 90,
                                  child: Text(
                                    _formatMoneda(subtotal),
                                    textAlign: TextAlign.right,
                                    style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w700),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                        const Divider(height: 1),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('TOTAL', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 13)),
                              Text(
                                _formatMoneda(total),
                                style: GoogleFonts.plusJakartaSans(color: theme.primaryColor, fontWeight: FontWeight.w800, fontSize: 15),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Botones de acción
                  if (estado == 'Pendiente') ...[
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.check_circle_outline, size: 16),
                            label: const Text('Aprobar'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.green,
                              side: const BorderSide(color: Colors.green),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () => widget.onUpdateEstado(c['id_cotizacion'], 'Aprobada'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.cancel_outlined, size: 16),
                            label: const Text('Rechazar'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red,
                              side: const BorderSide(color: Colors.red),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () => widget.onUpdateEstado(c['id_cotizacion'], 'Rechazada'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.grey),
                          tooltip: 'Eliminar',
                          onPressed: () => widget.onDelete(c['id_cotizacion']),
                        ),
                      ],
                    ),
                  ] else ...[
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.replay_rounded, size: 16),
                        label: const Text('Reabrir como Pendiente'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.orange,
                          side: const BorderSide(color: Colors.orange),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => widget.onUpdateEstado(c['id_cotizacion'], 'Pendiente'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

class _EstadoVacio extends StatelessWidget {
  final String filtro;
  const _EstadoVacio({required this.filtro});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            filtro == 'Todos' ? 'No hay cotizaciones' : 'No hay cotizaciones "$filtro"',
            style: GoogleFonts.plusJakartaSans(color: Colors.grey[500], fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
