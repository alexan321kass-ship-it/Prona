import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/venta.dart';
import '../../core/utils/json_converters.dart';

part 'venta.g.dart';

@JsonSerializable()
class Venta {
  @JsonKey(name: 'id_venta', fromJson: JsonConverters.intFromUnknown)
  final int? id;
  
  @JsonKey(name: 'id_pedido', fromJson: JsonConverters.intFromUnknownStrict)
  final int idPedido;
  
  @JsonKey(name: 'id_usuario', fromJson: JsonConverters.intFromUnknown)
  final int? idUsuario;
  
  @JsonKey(name: 'fecha_venta')
  final String? fechaVenta;
  
  @JsonKey(name: 'estado_venta')
  final String? estadoVenta;
  
  @JsonKey(fromJson: JsonConverters.doubleFromUnknown)
  final double total;

  Venta({
    this.id,
    required this.idPedido,
    this.idUsuario,
    this.fechaVenta,
    this.estadoVenta,
    required this.total,
  });

  VentaEntity toEntity() {
    return VentaEntity(
      id: id ?? 0,
      idPedido: idPedido,
      idUsuario: idUsuario,
      fecha: fechaVenta ?? '',
      total: total,
      estadoVenta: estadoVenta ?? '',
    );
  }

  factory Venta.fromJson(Map<String, dynamic> json) => _$VentaFromJson(json);
  Map<String, dynamic> toJson() => _$VentaToJson(this);
}
