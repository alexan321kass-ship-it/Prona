import { Module } from "@nestjs/common";
import { PedidosService } from "./pedidos.service";
import { PedidosController } from "./pedidos.controller";
import { SeguimientoController } from "./seguimiento.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";

@Module({
  imports: [NotificacionesModule],
  providers: [PedidosService],
  controllers: [PedidosController, SeguimientoController],
})
export class PedidosModule {}
