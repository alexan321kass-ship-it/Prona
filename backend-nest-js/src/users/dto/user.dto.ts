import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  MinLength,
} from "class-validator";

// DTO para actualizar los datos de un usuario
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  primer_nombre?: string;

  @IsString()
  @IsOptional()
  primer_apellido?: string;

  @IsString()
  @IsOptional()
  tipo_documento?: string;

  @IsString()
  @IsOptional()
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
