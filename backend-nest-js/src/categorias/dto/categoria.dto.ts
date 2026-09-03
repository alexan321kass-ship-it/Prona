import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre_categoria: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}

export class UpdateCategoriaDto {
  @IsString()
  @IsOptional()
  nombre_categoria?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
