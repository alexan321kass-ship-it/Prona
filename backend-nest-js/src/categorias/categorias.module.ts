import { Module } from "@nestjs/common";
import { CategoriasService } from "./categorias.service";
import { CategoriasController } from "./categorias.controller";

@Module({
  providers: [CategoriasService],
  controllers: [CategoriasController],
  // Exportar el servicio para que otros módulos (ej: ProductosModule) puedan validar categorías
  exports: [CategoriasService],
})
export class CategoriasModule {}
