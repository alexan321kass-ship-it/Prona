import { Module } from "@nestjs/common";
import { CotizacionesService } from "./cotizaciones.service";
import { CotizacionesController } from "./cotizaciones.controller";

@Module({
  providers: [CotizacionesService],
  controllers: [CotizacionesController],
})
export class CotizacionesModule {}
