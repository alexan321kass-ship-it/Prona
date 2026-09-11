import { Controller, Post, Body, Get, Request, Res } from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "./dto/auth.dto";
import { Public } from "./public.decorator";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // Registro de usuarios (/api/auth/register)
  @Public()
  @Post("register")
  async registro(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Inicio de sesión (/api/auth/login)
  // Ahora el token se envía como cookie HttpOnly (no visible desde JS del navegador)
  @Public()
  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(
      loginDto.correo,
      loginDto.contrasena,
    );

    // Asignamos el token como cookie segura HttpOnly
    res.cookie("token", data.token, {
      httpOnly: true, // JavaScript del navegador NO puede leer esta cookie
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      sameSite: "lax", // Protección contra CSRF
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Devolvemos la respuesta incluyendo el token para compatibilidad con el móvil
    return {
      message: data.message,
      user: data.user,
      token: data.token,
    };
  }

  // Cierre de sesión — destruye la cookie del token
  @Public()
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return { message: "Sesión cerrada correctamente" };
  }

  // Obtener perfil del usuario autenticado
  @Get("perfil")
  @ApiBearerAuth("JWT-auth")
  async perfil(@Request() req: any) {
    return req.user;
  }

  // Solicitar recuperación de contraseña (envía correo)
  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.correo);
  }

  // Restablecer contraseña con el token
  @Public()
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.token,
      dto.codigo,
      dto.nuevaContrasena,
    );
  }

  // Cambiar contraseña obligatoria (requiere JWT)
  @ApiBearerAuth("JWT-auth")
  @Post("change-password")
  async changePassword(
    @Request() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id_usuario,
      dto.nuevaContrasena,
    );
  }
}
