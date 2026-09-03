import { IsString, IsEmail, IsOptional, IsNotEmpty } from "class-validator";

// DTO para registrar un cliente nuevo
export class CreateClienteDto {
  // El nombre es obligatorio
  @IsString()
  @IsNotEmpty()
  nombre_cliente: string;

  // La cédula o identificación también
  @IsString()
  @IsNotEmpty()
  identificacion: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;
}

export class UpdateClienteDto {
  @IsString()
  @IsOptional()
  nombre_cliente?: string;

  @IsString()
  @IsOptional()
  identificacion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;
}
