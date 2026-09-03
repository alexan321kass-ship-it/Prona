import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

// DTO para cuando vamos a crear un producto nuevo
export class CreateProductoDto {
  @ApiProperty({
    description: "Código interno opcional",
    example: "PROD-001",
    required: false,
  })
  @IsString()
  @IsOptional()
  codigo_interno?: string;

  @ApiProperty({
    description: "Nombre del producto",
    example: "Martillo de Thor",
  })
  @IsString()
  @IsNotEmpty()
  nombre_producto: string;

  @ApiProperty({
    description: "Descripción opcional",
    example: "Para clavar clavos divinos",
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: "Precio unitario", example: 150000.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio: number;

  @ApiProperty({ description: "Stock inicial", example: 10, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiProperty({ description: "ID de la categoría", example: 1 })
  @Type(() => Number)
  @IsNumber()
  id_categoria: number;

  @ApiProperty({
    description: "URL de la imagen del producto",
    example: "uploads/productos/imagen-1712248800000.webp",
    required: false,
  })
  @IsString()
  @IsOptional()
  imagen_url?: string;
}

// DTO para cuando queremos editar algo.
// Aquí TODO es opcional porque tal vez solo queremos cambiar el precio y ya.
export class UpdateProductoDto {
  @ApiProperty({
    description: "Código interno opcional",
    example: "PROD-001",
    required: false,
  })
  @IsString()
  @IsOptional()
  codigo_interno?: string;

  @ApiProperty({
    description: "Nombre del producto",
    example: "Martillo de Thor Editado",
    required: false,
  })
  @IsString()
  @IsOptional()
  nombre_producto?: string;

  @ApiProperty({
    description: "Descripción opcional",
    example: "Descripción editada",
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: "Precio unitario",
    example: 160000.0,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  precio?: number;

  @ApiProperty({ description: "Stock actual", example: 15, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiProperty({
    description: "ID de la categoría",
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  id_categoria?: number;

  @ApiProperty({
    description: "URL de la imagen del producto",
    example: "uploads/productos/imagen-1712248800000.webp",
    required: false,
  })
  @IsString()
  @IsOptional()
  imagen_url?: string;
}
