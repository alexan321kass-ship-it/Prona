import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
  Request,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { VentasService } from "./ventas.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateVentaDto } from "./dto/venta.dto";

@ApiBearerAuth("JWT-auth")
@Controller("ventas")
@UseGuards(AuthGuard("jwt"))
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  // Listado de ventas con soporte para paginación y filtros de fecha
  @Get()
  async findAll(
    @Query("limite") limite?: string,
    @Query("pagina") pagina?: string,
    @Query("fechaDesde") fechaDesde?: string,
    @Query("fechaHasta") fechaHasta?: string,
  ) {
    const limit = limite ? Number(limite) : 50;
    const page = pagina ? Number(pagina) : 1;
    const offset = (page - 1) * limit;

    const ventas = await this.ventasService.getAll(
      limit,
      offset,
      fechaDesde,
      fechaHasta,
    );
    const total = await this.ventasService.count(fechaDesde, fechaHasta);

    return {
      ventas,
      total,
      pagina: page,
      limite: limit,
    };
  }

  @Get("estadisticas/resumen")
  async getStats() {
    return this.ventasService.getStats();
  }

  @Get("cliente/:id")
  async findByCliente(@Param("id", ParseIntPipe) id: number) {
    const ventas = await this.ventasService.getByCliente(id);
    return { ventas };
  }

  @Get("pedido/:id")
  async findByPedido(@Param("id", ParseIntPipe) id: number) {
    const venta = await this.ventasService.getByPedido(id);
    if (!venta) return { message: "No hay venta para este pedido" };

    const detalles = await this.ventasService.getDetalles(venta.id_venta);
    return { venta, detalles };
  }

  // Obtener una venta por ID incluyendo sus detalles y total calculado
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const venta = await this.ventasService.getById(id);
    const detalles = await this.ventasService.getDetalles(id);

    const totalCalculado = detalles.reduce(
      (sum, d) => sum + Number(d.precio_unitario) * d.cantidad,
      0,
    );

    return { venta, detalles, totalCalculado };
  }

  // Registrar una nueva venta (actualiza inventario y estado del pedido)
  @Post()
  async create(@Body() createVentaDto: CreateVentaDto) {
    const result = await this.ventasService.create(createVentaDto);
    return {
      message: "Venta creada exitosamente",
      id_venta: result.id_venta,
      total: result.total,
    };
  }

  // Registrar una devolución de una venta
  @Post(":id/devolucion")
  async crearDevolucion(
    @Param("id", ParseIntPipe) id: number,
    @Body("motivo") motivo: string,
    @Request() req: any,
  ) {
    if (!motivo || motivo.trim() === "") {
      throw new BadRequestException("El motivo de la devolución es requerido");
    }
    const result = await this.ventasService.crearDevolucion(
      id,
      motivo,
      req.user.id_usuario,
    );
    return {
      message: "Devolución procesada correctamente",
      id_devolucion: result.id_devolucion,
    };
  }
}
