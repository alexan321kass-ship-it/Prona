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
import { PedidosService } from "./pedidos.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles.decorator";
import { CreatePedidoDto, UpdatePedidoDto } from "./dto/pedido.dto";

@ApiBearerAuth("JWT-auth")
@Controller("pedidos")
@UseGuards(AuthGuard("jwt"))
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  // Listado de pedidos con soporte para filtrado por estado y paginación
  @Get()
  async findAll(
    @Query("estado") estado?: string,
    @Query("limite") limite?: string,
    @Query("pagina") pagina?: string,
  ) {
    const limit = limite ? Number(limite) : 50;
    const page = pagina ? Number(pagina) : 1;
    const offset = (page - 1) * limit;

    const pedidos = await this.pedidosService.getAll(limit, offset, estado);
    const total = await this.pedidosService.count(estado);

    return {
      pedidos,
      total,
      pagina: page,
      limite: limit,
    };
  }

  // Consultar pedidos por identificador de cliente
  @Get("cliente/:id")
  async findByCliente(@Param("id", ParseIntPipe) id: number) {
    const pedidos = await this.pedidosService.getByCliente(id);
    return { pedidos };
  }

  // Búsqueda de pedidos por cadena de texto
  @Get("buscar")
  async search(@Query("q") q: string) {
    const pedidos = await this.pedidosService.search(q);
    return { pedidos };
  }

  // Obtener resumen estadístico de pedidos
  @Get("estadisticas/resumen")
  async getStats() {
    return this.pedidosService.getStats();
  }

  // Obtener detalle de un pedido específico incluyendo sus productos
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const pedido = await this.pedidosService.getById(id);
    const detalles = await this.pedidosService.getDetalles(id);
    return { pedido, detalles };
  }

  // Registrar un nuevo pedido
  @Post()
  async create(@Body() createPedidoDto: CreatePedidoDto) {
    const pedido = await this.pedidosService.create(createPedidoDto);
    return {
      message: "Pedido creado exitosamente",
      id_pedido: pedido.id_pedido,
    };
  }

  // Actualizar estado de un pedido (solo Administradores)
  @Put(":id")
  @Roles("Administrador")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    await this.pedidosService.update(id, updatePedidoDto);
    return { message: "Pedido actualizado correctamente" };
  }

  // Eliminar un pedido del sistema (solo Administradores)
  @Delete(":id")
  @Roles("Administrador")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.pedidosService.delete(id);
    return { message: "Pedido eliminado correctamente" };
  }
}
