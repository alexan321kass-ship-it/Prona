import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";

class PedidoProductoDto {
  @IsNumber()
  id_producto: number;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precio_unitario: number;
}

export class CreatePedidoDto {
  @IsNumber()
  id_cliente: number;

  @IsNumber()
  @IsOptional()
  id_usuario?: number;

  @IsString()
  @IsOptional()
  estado_pedido?: string;

  @IsString()
  @IsOptional()
  fecha_pedido?: string;

  @IsString()
  @IsOptional()
  fecha_vigencia?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PedidoProductoDto)
  productos?: PedidoProductoDto[];
}

export class UpdatePedidoDto {
  @IsString()
  @IsOptional()
  estado_pedido?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
