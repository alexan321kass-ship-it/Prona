import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MinLength,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ description: "Primer nombre del usuario", example: "Juan" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "El primer nombre no puede contener números ni caracteres especiales",
  })
  primer_nombre: string;

  @ApiProperty({ description: "Primer apellido del usuario", example: "Pérez" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "El primer apellido no puede contener números ni caracteres especiales",
  })
  primer_apellido: string;

  @ApiProperty({ description: "Tipo de documento (CC, TI, CE)", example: "CC" })
  @IsString()
  @IsNotEmpty()
  tipo_documento: string;

  @ApiProperty({ description: "Número de documento", example: "123456789" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, {
    message: "El número de documento solo puede contener números",
  })
  numero_documento: string;

  @ApiProperty({
    description: "Correo electrónico",
    example: "juan.perez@example.com",
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    description: "Contraseña (mínimo 6 caracteres)",
    example: "password123",
  })
  @IsString()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({
    description: "ID del rol asignado (1: Admin, 2: Vendedor)",
    example: 2,
  })
  @IsNumber()
  id_rol: number;
}

export class LoginDto {
  @ApiProperty({
    description: "Correo electrónico",
    example: "admin@pronavid.com",
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "contrasena_segura",
  })
  @IsString()
  @IsNotEmpty()
  contrasena: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: "Correo electrónico para recuperar la contraseña",
    example: "usuario@example.com",
  })
  @IsEmail()
  correo: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: "Token de sesión devuelto al solicitar el código",
    example: "eyJhbG...",
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: "Código de 6 dígitos recibido en el correo",
    example: "482931",
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description: "Nueva contraseña",
    example: "nueva_password123",
  })
  @IsString()
  @MinLength(6)
  nuevaContrasena: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: "Nueva contraseña elegida por el usuario",
    example: "nueva_password123",
  })
  @IsString()
  @MinLength(6)
  nuevaContrasena: string;
}
