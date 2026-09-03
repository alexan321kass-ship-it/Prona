import { IsNumber, IsArray, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";

// Estructura de cada producto dentro de la venta
class VentaDetalleDto {
  @IsNumber()
  id_producto: number;

  @IsNumber()
  cantidad: number;

  // Precio unitario opcional, si no se manda se toma el del producto nwn
  @IsNumber()
  @IsOptional()
  precio_unitario?: number;
}

// Datos necesarios para registrar una venta
export class CreateVentaDto {
  // Al ID del pedido que se está pagando
  @IsNumber()
  id_pedido: number;

  // Quien está haciendo la venta (opcional si ya está en el pedido)
  @IsNumber()
  @IsOptional()
  id_usuario?: number;

  // Lista de productos que se llevan
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentaDetalleDto)
  detalles: VentaDetalleDto[];
}
