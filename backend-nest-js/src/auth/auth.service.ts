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
          requiere_cambio_contrasena: user.requiere_cambio_contrasena,
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

  private async createMailTransporter() {
    if (process.env.SMTP_HOST || process.env.SMTP_USER) {
      const port = Number(process.env.SMTP_PORT) || 587;
      const isGmail = process.env.SMTP_HOST?.includes("gmail") || process.env.SMTP_SERVICE === "gmail";

      if (isGmail) {
        return nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: { rejectUnauthorized: false },
        });
      }

      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: port,
        secure: process.env.SMTP_SECURE === "true" || port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });
    }

    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        tls: { rejectUnauthorized: false },
      });
    } catch (e) {
      console.warn("[AUTH MAILER] No se pudo crear cuenta de prueba Ethereal:", e.message);
      return null;
    }
  }

  async forgotPassword(correo: string) {
    if (!correo || !correo.trim()) {
      throw new BadRequestException("Debe ingresar un correo electrónico válido");
    }

    const cleanCorreo = correo.trim().toLowerCase();

    const user = await this.prisma.usuario.findFirst({
      where: {
        correo: {
          equals: cleanCorreo,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        "No se encontró ningún usuario registrado con el correo ingresado",
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const secret =
      (process.env.JWT_SECRET || "fallback_secret") + user.contrasena;
    const payload = { correo: user.correo, code };
    const token = this.jwtService.sign(payload, { secret, expiresIn: "15m" });

    console.log("=============================================");
    console.log(`[RECUPERACIÓN DE CONTRASEÑA]`);
    console.log(`Usuario: ${user.primer_nombre} ${user.primer_apellido}`);
    console.log(`Correo: ${user.correo}`);
    console.log(`CÓDIGO GENERADO: ${code}`);
    console.log("=============================================");

    const fromSender =
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER
        ? `"Pronavid Soporte" <${process.env.SMTP_USER}>`
        : '"Pronavid Soporte" <no-reply@pronavid.com>');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px;">Pronavid</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Recuperación de Contraseña</p>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #334155; font-size: 16px; margin: 0 0 10px 0;">Hola <strong>${user.primer_nombre}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
            Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación de 6 dígitos para completar el proceso:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #bfdbfe; display: inline-block;">
              ${code}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
        </div>
        <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          &copy; ${new Date().getFullYear()} Pronavid. Todos los derechos reservados.
        </div>
      </div>
    `;

    try {
      const transporter = await this.createMailTransporter();
      if (transporter) {
        const info = await transporter.sendMail({
          from: fromSender,
          to: user.correo,
          subject: "Tu código de recuperación - Pronavid",
          text: `Hola ${user.primer_nombre}, tu código de verificación de recuperación de contraseña es: ${code}`,
          html: htmlContent,
        });

        if (nodemailer.getTestMessageUrl(info)) {
          console.log("URL DE VISTA PREVIA ETHEREAL:", nodemailer.getTestMessageUrl(info));
        }
      } else {
        console.warn("[AUTH MAILER] Sin transporte SMTP activo. El código fue registrado en consola.");
      }
    } catch (error) {
      console.error("[AUTH MAILER ERROR] No se pudo entregar el correo por SMTP:", error.message || error);
      // No lanzamos excepción 500 para permitir el flujo de recuperación y pruebas
    }

    return { message: "Código enviado. Revisa tu correo.", resetToken: token };
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
