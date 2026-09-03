import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { CotizacionesService } from "./cotizaciones.service";
import {
  CreateCotizacionDto,
  UpdateEstadoCotizacionDto,
} from "./dto/cotizacion.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth("JWT-auth")
@UseGuards(AuthGuard("jwt"))
@Controller("cotizaciones")
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  // Crear una nueva cotización
  @Post()
  async create(@Request() req: any, @Body() dto: CreateCotizacionDto) {
    // req.user viene del token JWT
    const id_usuario = req.user.id_usuario;
    const cotizacion = await this.cotizacionesService.create(id_usuario, dto);
    return {
      message: "Cotización creada exitosamente",
      cotizacion,
    };
  }

  // Listar todas las cotizaciones con paginación
  @Get()
  async findAll(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

    const cotizaciones = await this.cotizacionesService.findAll(limit, offset);
    const total = await this.cotizacionesService.count();

    return {
      cotizaciones,
      meta: { total, limit, offset },
    };
  }

  // Obtener detalles de una cotización por ID
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const cotizacion = await this.cotizacionesService.findById(id);
    return { cotizacion };
  }

  // Actualizar el estado de una cotización (Pendiente -> Aprobada/Rechazada)
  @Put(":id/estado")
  async updateEstado(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoCotizacionDto,
  ) {
    const cotizacion = await this.cotizacionesService.updateEstado(id, dto);
    return {
      message: "Estado de la cotización actualizado",
      cotizacion,
    };
  }

  // Eliminar una cotización (solo si está Pendiente)
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.cotizacionesService.delete(id);
  }
}
