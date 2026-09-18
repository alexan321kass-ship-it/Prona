import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";
import * as dns from "dns";
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

  private getMailTransporter() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/["'\s]/g, "") : "";

    if (smtpUser && smtpPass) {
      const isGmail = (process.env.SMTP_HOST || "smtp.gmail.com").includes("gmail") || smtpUser.endsWith("@gmail.com");

      if (isGmail) {
        return nodemailer.createTransport({
          service: "gmail",
          family: 4,
          lookup: (hostname: string, options: any, callback: any) => {
            const cb = typeof options === "function" ? options : callback;
            dns.lookup(hostname, { family: 4 }, cb);
          },
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: { rejectUnauthorized: false },
        } as any);
      }

      const port = Number(process.env.SMTP_PORT) || 587;
      const secure = process.env.SMTP_SECURE !== undefined 
        ? process.env.SMTP_SECURE === "true" 
        : port === 465;

      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port,
        secure,
        family: 4,
        lookup: (hostname: string, options: any, callback: any) => {
          const cb = typeof options === "function" ? options : callback;
          dns.lookup(hostname, { family: 4 }, cb);
        },
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: { rejectUnauthorized: false },
      } as any);
    }

    return null;
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
      throw new BadRequestException("No existe un usuario registrado con este correo electrónico");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const secret =
      (process.env.JWT_SECRET || "fallback_secret") + user.contrasena;
    const payload = { correo: user.correo, code };
    const token = this.jwtService.sign(payload, { secret, expiresIn: "15m" });

    console.log("=============================================");
    console.log(`[RECUPERACIÓN DE CONTRASEÑA]`);
    console.log(`Correo Ingresado: ${cleanCorreo}`);
    console.log(`Usuario en BD: ${user.primer_nombre} (ID: ${user.id_usuario})`);
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

    // Recolectar destinatarios
    const recipientSet = new Set<string>();
    if (!/@(example\.com|test\.com|localhost|invalid)$/i.test(cleanCorreo)) {
      recipientSet.add(cleanCorreo);
    }
    if (process.env.SMTP_USER) {
      recipientSet.add(process.env.SMTP_USER.trim());
    }

    const destinationEmail = Array.from(recipientSet).join(", ");

    // Enviar correo de forma asíncrona (background) para respuesta HTTP instantánea
    this.sendEmailAsync(
      destinationEmail,
      fromSender,
      `Código de verificación Pronavid: ${code}`,
      htmlContent,
      user.primer_nombre,
      code,
    );

    return { message: "Código enviado. Revisa tu correo.", resetToken: token };
  }

  private async sendEmailAsync(
    destinationEmail: string,
    fromSender: string,
    subject: string,
    htmlContent: string,
    nombreUsuario: string,
    code: string,
  ) {
    console.log(`[AUTH MAILER] Iniciando envío de correo a [${destinationEmail}]...`);

    // Opción 1: Resend HTTP API (Puerto 443 HTTPS - Funciona 100% en Render sin bloqueos de puerto)
    const rawResendKey = process.env.RESEND_API_KEY;
    if (rawResendKey && rawResendKey.trim() !== "") {
      try {
        const cleanApiKey = rawResendKey.replace(/["'\s]/g, "").trim();
        const recipients = destinationEmail.split(",").map((e) => e.trim()).filter((e) => e.length > 0);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cleanApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Pronavid Soporte <onboarding@resend.dev>",
            to: recipients,
            subject,
            html: htmlContent,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          console.log(`[AUTH MAILER ÉXITO (Resend HTTP)] Correo entregado a [${destinationEmail}]. ID: ${data.id}`);
          return;
        } else {
          console.error(`[AUTH MAILER ERROR (Resend HTTP)] Respuesta de Resend (Status ${res.status}):`, data);
        }
      } catch (e) {
        console.error(`[AUTH MAILER ERROR (Resend HTTP)] Excepción:`, e.message || e);
      }
    }

    // Opción 2: Brevo HTTP API (Puerto 443 HTTPS - Funciona 100% en Render)
    if (process.env.BREVO_API_KEY) {
      try {
        const recipients = destinationEmail.split(",").map((e) => ({ email: e.trim() }));
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": process.env.BREVO_API_KEY.trim(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Pronavid Soporte", email: process.env.SMTP_USER || "no-reply@pronavid.com" },
            to: recipients,
            subject,
            htmlContent,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          console.log(`[AUTH MAILER ÉXITO (Brevo HTTP)] Correo entregado a [${destinationEmail}]. MessageId: ${data.messageId}`);
          return;
        } else {
          console.error(`[AUTH MAILER ERROR (Brevo HTTP)] Error de Brevo:`, data);
        }
      } catch (e) {
        console.error(`[AUTH MAILER ERROR (Brevo HTTP)] Excepción:`, e.message || e);
      }
    }

    // Opción 3: Nodemailer SMTP (Fallback)
    try {
      const transporter = this.getMailTransporter();
      if (transporter) {
        const info = await transporter.sendMail({
          from: fromSender,
          to: destinationEmail,
          subject,
          text: `Hola ${nombreUsuario}, tu código de verificación de recuperación de contraseña es: ${code}`,
          html: htmlContent,
        });
        console.log(`[AUTH MAILER ÉXITO (SMTP)] Correo entregado a [${destinationEmail}]. MessageId: ${info.messageId}`);
      } else {
        console.warn("[AUTH MAILER WARN] Sin credenciales SMTP ni API Key de correo configuradas.");
      }
    } catch (err) {
      console.error(`[AUTH MAILER ERROR (SMTP)] Falló el envío a [${destinationEmail}]:`, err.message || err);
    }
  }

  async resetPassword(token: string, code: string, nuevaContrasena: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.decode(token);
    } catch (e) {
      throw new BadRequestException("Token inválido");
    }

    const user = await this.prisma.usuario.findFirst({
      where: { correo: { equals: decoded.correo, mode: "insensitive" } },
    });

    const secret =
      (process.env.JWT_SECRET || "fallback_secret") +
      (user ? user.contrasena : "$2b$10$fallbackhashpasswordfordummyuser");

    try {
      const verified: any = this.jwtService.verify(token, { secret });
      if (verified.code !== code) throw new Error();
    } catch (e) {
      throw new BadRequestException("Código inválido o expirado");
    }

    if (user) {
      const hashedPass = await bcrypt.hash(nuevaContrasena, 10);
      await this.prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: { contrasena: hashedPass, requiere_cambio_contrasena: false },
      });
    }

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
