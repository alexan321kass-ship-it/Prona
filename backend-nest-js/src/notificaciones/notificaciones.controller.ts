import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { NotificacionesService } from "./notificaciones.service";
import { AuthGuard } from "@nestjs/passport";

@ApiBearerAuth("JWT-auth")
@Controller("notificaciones")
@UseGuards(AuthGuard("jwt"))
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  // Listado de notificaciones con paginación
  @Get()
  async findAll(
    @Query("limite") limite?: string,
    @Query("pagina") pagina?: string,
    @Query("soloNoLeidas") soloNoLeidas?: string,
  ) {
    const limit = limite ? Number(limite) : 20;
    const page = pagina ? Number(pagina) : 1;
    const offset = (page - 1) * limit;

    const notificaciones = await this.notificacionesService.getAll(
      limit,
      offset,
      soloNoLeidas === "true",
    );
    const noLeidas = await this.notificacionesService.countNoLeidas();

    return {
      notificaciones,
      noLeidas,
      pagina: page,
      limite: limit,
    };
  }

  // Consultar notificaciones vinculadas a un pedido
  @Get("pedido/:id")
  async findByPedido(@Param("id", ParseIntPipe) id: number) {
    const notificaciones = await this.notificacionesService.getByPedido(id);
    return { notificaciones };
  }

  // Obtener una notificación específica por ID
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const notificacion = await this.notificacionesService.getById(id);
    return { notificacion };
  }

  @Post("custom")
  async sendCustom(
    @Body()
    body: {
      topic: string;
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ) {
    await this.notificacionesService.sendPushNotification(
      body.topic,
      body.title,
      body.body,
      body.data ?? {},
    );
    return { message: "Notificación personalizada enviada" };
  }

  // Registrar una nueva notificación manual
  @Post()
  async create(@Body() body: { id_pedido: number; mensaje: string }) {
    const result = await this.notificacionesService.create(
      body.id_pedido,
      body.mensaje,
    );
    return {
      message: "Notificación creada exitosamente",
      id_notificacion: result.id_notificacion,
    };
  }

  // Marcar notificación individual como leída
  @Put(":id/leer")
  async marcarLeida(@Param("id", ParseIntPipe) id: number) {
    await this.notificacionesService.marcarLeida(id);
    return { message: "Notificación marcada como leída" };
  }

  // Marcar todas las notificaciones como leídas
  @Put("leer-todas")
  async marcarTodasLeidas() {
    const result = await this.notificacionesService.marcarTodasLeidas();
    return {
      message: "Todas las notificaciones marcadas como leídas",
      actualizadas: result.count,
    };
  }

  // Eliminar una notificación
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.notificacionesService.delete(id);
    return { message: "Notificación eliminada exitosamente" };
  }
}
