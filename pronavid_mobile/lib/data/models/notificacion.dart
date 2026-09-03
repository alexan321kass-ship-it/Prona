import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/notificacion.dart';
import '../../core/utils/json_converters.dart';

part 'notificacion.g.dart';

@JsonSerializable()
class Notificacion {
  @JsonKey(name: 'id_notificacion', fromJson: JsonConverters.intFromUnknown)
  final int? id;
  
  @JsonKey(name: 'id_pedido', fromJson: JsonConverters.intFromUnknownStrict)
  final int idPedido;
  
  final String mensaje;
  
  @JsonKey(fromJson: JsonConverters.boolFromUnknown)
  final bool leida;
  
  @JsonKey(name: 'fecha_notificacion')
  final String? fechaNotificacion;

  Notificacion({
    this.id,
    required this.idPedido,
    required this.mensaje,
    required this.leida,
    this.fechaNotificacion,
  });

  NotificacionEntity toEntity() {
    return NotificacionEntity(
      id: id ?? 0,
      idPedido: idPedido,
      mensaje: mensaje,
      leida: leida,
      fecha: fechaNotificacion ?? '',
    );
  }

  factory Notificacion.fromJson(Map<String, dynamic> json) => _$NotificacionFromJson(json);
  Map<String, dynamic> toJson() => _$NotificacionToJson(this);
}
