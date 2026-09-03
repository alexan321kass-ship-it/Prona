import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/sale_stats.dart';
import '../../core/utils/json_converters.dart';

part 'sale_stats.g.dart';

@JsonSerializable()
class SaleStatsModel {
  @JsonKey(fromJson: JsonConverters.intFromUnknownStrict)
  final int pedidosHoy;
  
  @JsonKey(fromJson: JsonConverters.doubleFromUnknown)
  final double ventasHoyTotal;
  
  @JsonKey(fromJson: JsonConverters.intFromUnknownStrict)
  final int clientesNuevosMes;
  
  @JsonKey(fromJson: JsonConverters.doubleFromUnknown)
  final double promedioVenta;

  SaleStatsModel({
    required this.pedidosHoy,
    required this.ventasHoyTotal,
    required this.clientesNuevosMes,
    required this.promedioVenta,
  });

  SaleStatsEntity toEntity() {
    return SaleStatsEntity(
      pedidosHoy: pedidosHoy,
      ventasHoyTotal: ventasHoyTotal,
      clientesNuevosMes: clientesNuevosMes,
      promedioVenta: promedioVenta,
    );
  }

  factory SaleStatsModel.fromJson(Map<String, dynamic> json) => _$SaleStatsModelFromJson(json);
  Map<String, dynamic> toJson() => _$SaleStatsModelToJson(this);
}
