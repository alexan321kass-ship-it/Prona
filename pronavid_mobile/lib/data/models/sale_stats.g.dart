// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sale_stats.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SaleStatsModel _$SaleStatsModelFromJson(Map<String, dynamic> json) =>
    SaleStatsModel(
      pedidosHoy: JsonConverters.intFromUnknownStrict(json['pedidosHoy']),
      ventasHoyTotal: JsonConverters.doubleFromUnknown(json['ventasHoyTotal']),
      clientesNuevosMes: JsonConverters.intFromUnknownStrict(
        json['clientesNuevosMes'],
      ),
      promedioVenta: JsonConverters.doubleFromUnknown(json['promedioVenta']),
    );

Map<String, dynamic> _$SaleStatsModelToJson(SaleStatsModel instance) =>
    <String, dynamic>{
      'pedidosHoy': instance.pedidosHoy,
      'ventasHoyTotal': instance.ventasHoyTotal,
      'clientesNuevosMes': instance.clientesNuevosMes,
      'promedioVenta': instance.promedioVenta,
    };
