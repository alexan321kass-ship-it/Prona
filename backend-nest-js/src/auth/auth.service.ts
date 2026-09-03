import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";
import { RegisterDto } from "./dto/auth.dto";
import { usuario_tipo_documento } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Registro de un nuevo usuario con validación de duplicados y encriptación
  async register(data: RegisterDto) {
    const {
      primer_nombre,
      primer_apellido,
      tipo_documento,
      numero_documento,
      correo,
      contrasena,
      id_rol,
    } = data;

    try {
      // Verificar si el correo ya existe
      const existingUser = await this.prisma.usuario.findUnique({
        where: { correo },
      });

      if (existingUser) {
        throw new BadRequestException("El correo ya está registrado");
      }

      // Verificar si el número de documento ya existe
      const existingDoc = await this.prisma.usuario.findUnique({
        where: { numero_documento },
      });

      if (existingDoc) {
        throw new BadRequestException(
          "El número de documento ya está registrado",
        );
      }

      // Encriptación de contraseña
      const hashedPass = await bcrypt.hash(contrasena, 10);

      // Creación del registro en base de datos
      await this.prisma.usuario.create({
        data: {
          primer_nombre,
          primer_apellido,
          tipo_documento: tipo_documento as usuario_tipo_documento,
          numero_documento,
          correo,
          contrasena: hashedPass,
          id_rol: Number(id_rol),
        },
      });

      return { message: "Usuario registrado correctamente" };
    } catch (error) {
      console.error("Error en registro:", error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        error.message || "Error interno del servidor",
      );
    }
  }

  // Autenticación de usuario y generación de token JWT
  async login(correo: string, contrasena: string) {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { correo },
      });

      if (!user) {
        throw new BadRequestException("Correo o contraseña incorrectos");
      }

      // Validación de credenciales
      const valid = await bcrypt.compare(contrasena, user.contrasena);

      if (!valid) {
        throw new BadRequestException("Correo o contraseña incorrectos");
      }

      // Generación de JWT Payload
      const payload = { id_usuario: user.id_usuario, id_rol: user.id_rol };
      const token = this.jwtService.sign(payload);

      return {
        message: "Login exitoso",
        token,
        user: {
          id_usuario: user.id_usuario,
          primer_nombre: user.primer_nombre,
          primer_apellido: user.primer_apellido,
          correo: user.correo,
          id_rol: user.id_rol,
        },
      };
    } catch (error) {
      console.error("Login error detailed:", error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        primer_nombre: true,
        primer_apellido: true,
        correo: true,
        id_rol: true,
        requiere_cambio_contrasena: true,
        rol: true,
      },
    });
  }

  async forgotPassword(correo: string) {
    const user = await this.prisma.usuario.findUnique({ where: { correo } });
    if (!user) {
      return {
        message:
          "Si el correo está registrado, recibirás un código de recuperación.",
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const secret =
      (process.env.JWT_SECRET || "fallback_secret") + user.contrasena;
    const payload = { correo: user.correo, code };
    const token = this.jwtService.sign(payload, { secret, expiresIn: "15m" });

    let transporter;
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    try {
      const info = await transporter.sendMail({
        from: '"Pronavid Soporte" <no-reply@pronavid.com>',
        to: user.correo,
        subject: "Tu código de recuperación",
        text: `Tu código de verificación es: ${code}`,
      });
      console.log("=============================================");
      console.log("CÓDIGO GENERADO:", code);
      console.log("URL DEL CORREO:", nodemailer.getTestMessageUrl(info));
      console.log("=============================================");
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("No se pudo enviar el código");
    }

    return { message: "Código enviado", resetToken: token };
  }

  async resetPassword(token: string, code: string, nuevaContrasena: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.decode(token);
    } catch (e) {
      throw new BadRequestException("Token inválido");
    }

    const user = await this.prisma.usuario.findUnique({
      where: { correo: decoded.correo },
    });
    if (!user) throw new BadRequestException("Usuario no encontrado");

    const secret =
      (process.env.JWT_SECRET || "fallback_secret") + user.contrasena;

    try {
      const verified: any = this.jwtService.verify(token, { secret });
      if (verified.code !== code) throw new Error();
    } catch (e) {
      throw new BadRequestException("Código inválido o expirado");
    }

    const hashedPass = await bcrypt.hash(nuevaContrasena, 10);
    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: { contrasena: hashedPass, requiere_cambio_contrasena: false },
    });

    return { message: "Contraseña actualizada correctamente" };
  }

  async changePassword(id_usuario: number, nuevaContrasena: string) {
    const hashedPass = await bcrypt.hash(nuevaContrasena, 10);
    await this.prisma.usuario.update({
      where: { id_usuario },
      data: { contrasena: hashedPass, requiere_cambio_contrasena: false },
    });
    return { message: "Contraseña cambiada correctamente" };
  }
}
