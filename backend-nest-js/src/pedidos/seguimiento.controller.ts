import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from "@nestjs/common";
import { PedidosService } from "./pedidos.service";
import { Roles } from "../auth/roles.decorator";

@Controller("seguimiento")
export class SeguimientoController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get("buscar")
  @Roles("Administrador", "Asesor")
  async buscar(@Query("query") query: string) {
    try {
      if (!query || query.trim() === "") {
        throw new BadRequestException("Debe enviar un valor de búsqueda");
      }
      const resultados = await this.pedidosService.search(query);
      return resultados;
    } catch (error) {
      console.error("Error in SeguimientoController.buscar:", error);
      throw error;
    }
  }

  @Get("sugerencias")
  @Roles("Administrador", "Asesor")
  async getSugerencias() {
    try {
      return await this.pedidosService.getSugerencias();
    } catch (error) {
      console.error("Error in SeguimientoController.sugerencias:", error);
      throw error;
    }
  }

  @Get("detalle/:id")
  @Roles("Administrador", "Asesor")
  async getDetalle(@Param("id", ParseIntPipe) id: number) {
    const pedido = await this.pedidosService.getById(id);
    const detalles = await this.pedidosService.getDetalles(id);

    // Calcular total
    const total = detalles.reduce(
      (sum, p) => sum + Number(p.cantidad) * Number(p.producto.precio),
      0,
    );

    return {
      pedido,
      productos: detalles,
      total,
    };
  }

  @Put("actualizar-estado/:id")
  @Roles("Administrador")
  async actualizarEstado(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { nuevoEstado: string },
  ) {
    if (!body.nuevoEstado) {
      throw new BadRequestException("Estado requerido");
    }

    await this.pedidosService.update(id, { estado_pedido: body.nuevoEstado });

    return {
      message: "Estado actualizado exitosamente",
      id,
      nuevoEstado: body.nuevoEstado,
    };
  }
}
