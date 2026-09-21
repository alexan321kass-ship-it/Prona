import { IsString, IsEmail, IsOptional, IsNotEmpty, Matches, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

// DTO para registrar un cliente nuevo
export class CreateClienteDto {
  // El nombre es obligatorio y no puede contener números
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre del cliente no permite números ni caracteres especiales' })
  nombre_cliente: string;

  // La cédula o identificación sólo puede contener números y guiones
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9-]+$/, { message: 'La identificación solo puede contener números' })
  identificacion: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{7,10}$/, { message: 'El teléfono solo puede contener entre 7 y 10 números' })
  telefono?: string;

  @IsString()
  @IsOptional()
  telefono_cliente?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  direccion_cliente?: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  correo_cliente?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsOptional()
  estado_cliente?: any;
}

export class UpdateClienteDto {
  @IsOptional()
  id_cliente?: any;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre del cliente no permite números ni caracteres especiales' })
  nombre_cliente?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9-]+$/, { message: 'La identificación solo puede contener números' })
  identificacion?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{7,10}$/, { message: 'El teléfono solo puede contener entre 7 y 10 números' })
  telefono?: string;

  @IsString()
  @IsOptional()
  telefono_cliente?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  direccion_cliente?: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  correo_cliente?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsOptional()
  estado_cliente?: any;

  @IsOptional()
  fecha_creacion?: any;

  @IsOptional()
  fecha_actualizacion?: any;
}

