import {
  IsInt,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export class DetalleCotizacionDto {
  @IsInt()
  @IsNotEmpty()
  id_producto: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  cantidad: number;
}

export class CreateCotizacionDto {
  @IsInt()
  @IsNotEmpty()
  id_cliente: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCotizacionDto)
  @IsNotEmpty()
  detalles: DetalleCotizacionDto[];
}

export enum EstadoCotizacion {
  Pendiente = "Pendiente",
  Aprobada = "Aprobada",
  Rechazada = "Rechazada",
}

export class UpdateEstadoCotizacionDto {
  @IsEnum(EstadoCotizacion)
  @IsNotEmpty()
  estado: EstadoCotizacion;
}
