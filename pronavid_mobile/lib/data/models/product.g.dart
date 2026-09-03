// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Product _$ProductFromJson(Map<String, dynamic> json) => Product(
  id: (json['id_producto'] as num?)?.toInt(),
  name: json['nombre_producto'] as String,
  descripcion: json['descripcion'] as String?,
  precio: JsonConverters.doubleFromUnknown(json['precio']),
  stock: JsonConverters.intFromUnknownStrict(json['stock']),
  categoryId: (json['id_categoria'] as num?)?.toInt(),
  imagen: json['imagen_url'] as String?,
);

Map<String, dynamic> _$ProductToJson(Product instance) => <String, dynamic>{
  'id_producto': instance.id,
  'nombre_producto': instance.name,
  'descripcion': instance.descripcion,
  'precio': instance.precio,
  'stock': instance.stock,
  'id_categoria': instance.categoryId,
  'imagen': instance.imagen,
};
