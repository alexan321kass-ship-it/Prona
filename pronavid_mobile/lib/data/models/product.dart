import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/product.dart';
import '../../core/utils/json_converters.dart';

part 'product.g.dart';

@JsonSerializable()
class Product {
  @JsonKey(name: 'id_producto')
  final int? id;
  @JsonKey(name: 'nombre_producto')
  final String name;
  final String? descripcion;
  
  @JsonKey(fromJson: JsonConverters.doubleFromUnknown)
  final double precio;
  
  @JsonKey(fromJson: JsonConverters.intFromUnknownStrict)
  final int stock;
  
  @JsonKey(name: 'id_categoria')
  final int? categoryId;
  @JsonKey(name: 'imagen_url')
  final String? imagen;

  Product({
    this.id,
    required this.name,
    this.descripcion,
    required this.precio,
    required this.stock,
    this.categoryId,
    this.imagen,
  });

  ProductEntity toEntity() {
    return ProductEntity(
      id: id ?? 0,
      name: name,
      description: descripcion,
      price: precio,
      stock: stock,
      categoryId: categoryId,
      image: imagen,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);
}
