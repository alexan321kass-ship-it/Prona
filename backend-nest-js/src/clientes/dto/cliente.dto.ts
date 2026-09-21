import { IsString, IsEmail, IsOptional, IsNotEmpty, Matches, IsBoolean } from "class-validator";

// DTO para registrar un cliente nuevo
export class CreateClienteDto {
  // El nombre es obligatorio y no puede contener números
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^0-9]+$/, { message: 'El nombre del cliente no puede contener números' })
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
  direccion?: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsOptional()
  correo?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}

export class UpdateClienteDto {
  @IsString()
  @IsOptional()
  @Matches(/^[^0-9]+$/, { message: 'El nombre del cliente no puede contener números' })
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
  direccion?: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsOptional()
  correo?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}

