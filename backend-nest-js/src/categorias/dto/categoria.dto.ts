import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches } from "class-validator";

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "El nombre de la categoría no permite números ni caracteres especiales",
  })
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
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "El nombre de la categoría no permite números ni caracteres especiales",
  })
  nombre_categoria?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
