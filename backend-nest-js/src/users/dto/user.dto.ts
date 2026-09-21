import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  MinLength,
  Matches,
} from "class-validator";

// DTO para actualizar los datos de un usuario
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "El primer nombre no puede contener números ni caracteres especiales",
  })
  primer_nombre?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "El primer apellido no puede contener números ni caracteres especiales",
  })
  primer_apellido?: string;

  @IsString()
  @IsOptional()
  tipo_documento?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, {
    message: "El número de documento solo puede contener números",
  })
  numero_documento?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  // Si van a cambiar la clave, que tenga al menos 6 caracteres nwn
  @IsString()
  @IsOptional()
  @MinLength(6)
  contrasena?: string;

  @IsString()
  @IsOptional()
  contrasena_actual?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  contrasena_nueva?: string;

  // 1 para Activo, 0 para Inactivo (bueno, depende del boolean xd)
  @IsNumber()
  @IsOptional()
  estado?: number;

  @IsNumber()
  @IsOptional()
  id_rol?: number;
}
