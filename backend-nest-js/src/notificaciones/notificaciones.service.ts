import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import * as fs from "fs";
import * as path from "path";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class NotificacionesService {
  private isFirebaseInitialized = false;

  constructor(private prisma: PrismaService) {}

  private initFirebase(): boolean {
    if (this.isFirebaseInitialized) return true;
    if (getApps().length > 0) {
      this.isFirebaseInitialized = true;
      return true;
    }

    try {
      const credPath =
        process.env.FIREBASE_CREDENTIALS_PATH ||
        "firebase-service-account.json";
      const absolutePath = path.isAbsolute(credPath)
        ? credPath
        : path.join(process.cwd(), credPath);

      if (fs.existsSync(absolutePath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(absolutePath, "utf8"),
        );
        initializeApp({
          credential: cert(serviceAccount),
        });
        this.isFirebaseInitialized = true;
        console.log("Firebase Admin SDK inicializado exitosamente.");
        return true;
      } else {
        console.warn(
          `Firebase Admin SDK no inicializado: no se encontró el archivo de credenciales en ${absolutePath}`,
        );
        return false;
      }
    } catch (error) {
      console.error("Error al inicializar Firebase Admin SDK:", error);
      return false;
    }
  }

  async sendPushNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!this.initFirebase()) {
      return;
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        topic,
        data: data || {},
      };

      const response = await getMessaging().send(message);
      console.log(
        `Mensaje push enviado exitosamente al topic ${topic}:`,
        response,
      );
    } catch (error) {
      console.error(`Error enviando mensaje push al topic ${topic}:`, error);
    }
  }

  // Obtener todas las notificaciones con paginación
  async getAll(
    limite: number = 20,
    offset: number = 0,
    soloNoLeidas: boolean = false,
  ) {
    const notificaciones = await this.prisma.notificacion.findMany({
      take: limite,
      skip: offset,
      include: {
        pedido: {
          include: {
            cliente: { select: { nombre_cliente: true } },
          },
        },
      },
      orderBy: { fecha_notificacion: "desc" },
    });

    return notificaciones.map((n) => ({
      ...n,
      nombre_cliente: n.pedido?.cliente?.nombre_cliente,
      id_pedido: n.pedido?.id_pedido,
    }));
  }

  async countNoLeidas() {
    // Respuesta simulada (el esquema actual no incluye campo de lectura)
    return 0;
  }

  // Listar notificaciones asociadas a un pedido específico
  async getByPedido(id_pedido: number) {
    return this.prisma.notificacion.findMany({
      where: { id_pedido },
      include: {
        pedido: {
          include: {
            cliente: { select: { nombre_cliente: true } },
          },
        },
      },
      orderBy: { fecha_notificacion: "desc" },
    });
  }

  // Obtener una notificación individual por su ID
  async getById(id: number) {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id_notificacion: id },
      include: {
        pedido: {
          include: {
            cliente: { select: { nombre_cliente: true } },
          },
        },
      },
    });

    if (!notificacion) {
      throw new NotFoundException("Notificación no encontrada");
    }

    return notificacion;
  }

  // Generar una nueva notificación de sistema vinculada a un pedido
  async create(id_pedido: number, mensaje: string) {
    if (!id_pedido) throw new BadRequestException("ID de pedido es requerido");
    if (!mensaje || !mensaje.trim())
      throw new BadRequestException("El mensaje es requerido");

    const notificacion = await this.prisma.notificacion.create({
      data: {
        id_pedido,
        mensaje: mensaje.trim(),
        fecha_notificacion: new Date(),
      },
      include: {
        pedido: {
          select: {
            id_usuario: true,
          },
        },
      },
    });

    // Enviar notificación Push al usuario creador del pedido
    if (notificacion.pedido?.id_usuario) {
      const topic = `user_${notificacion.pedido.id_usuario}`;
      this.sendPushNotification(
        topic,
        "Actualización de Pedido",
        mensaje.trim(),
        {
          id_pedido: id_pedido.toString(),
          id_notificacion: notificacion.id_notificacion.toString(),
        },
      );
    }

    // También enviar al rol administrador (id_rol = 1)
    this.sendPushNotification(
      "role_1",
      "Nuevo Evento de Pedido",
      mensaje.trim(),
      {
        id_pedido: id_pedido.toString(),
      },
    );

    const { pedido, ...notifData } = notificacion;
    return notifData;
  }

  // Marcar notificación como procesada
  async marcarLeida(id: number) {
    return { success: true, id_notificacion: id };
  }

  async marcarTodasLeidas() {
    return { count: 0 };
  }

  // Eliminar registro de notificación
  async delete(id: number) {
    return this.prisma.notificacion.delete({
      where: { id_notificacion: id },
    });
  }

  @Cron("* * * * *")
  async notificarPedidosPendientes() {
    if (!this.initFirebase()) return;

    try {
      // Buscar pedidos recientes (último minuto)
      const hace1Minuto = new Date(Date.now() - 1 * 60 * 1000);

      const pedidosRecientes = await this.prisma.pedido.findMany({
        where: { fecha_pedido: { gte: hace1Minuto } },
        select: { id_pedido: true },
      });

      // Buscar pedidos pendientes de actualizar
      const pedidosPendientes = await this.prisma.pedido.findMany({
        where: { estado_pedido: "Pendiente" },
        select: { id_pedido: true },
      });

      const countRecientes = pedidosRecientes.length;
      const countPendientes = pedidosPendientes.length;

      if (countRecientes > 0 || countPendientes > 0) {
        const title = "Revisión de Pedidos";
        const body = `Tienes ${countRecientes} pedidos recientes y ${countPendientes} pendientes por actualizar.`;

        // Enviar al topic del admin (role_1)
        await this.sendPushNotification("role_1", title, body, {
          tipo: "cron_resumen_pedidos",
        });
      }
    } catch (error) {
      console.error(
        "Error en el cron job de notificaciones de pedidos:",
        error,
      );
    }
  }
}
