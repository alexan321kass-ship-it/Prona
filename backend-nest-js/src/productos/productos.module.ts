import { Module } from "@nestjs/common";
import { ProductosService } from "./productos.service";
import { ProductosController } from "./productos.controller";
import { NotificacionesModule } from "../notificaciones/notificaciones.module";
import { CategoriasModule } from "../categorias/categorias.module";
import { ImageStorageModule } from "../common/image-storage/image-storage.module";

// El decorador @Module organiza el código en bloques lógicos nwn
@Module({
  imports: [NotificacionesModule, CategoriasModule, ImageStorageModule],
  // Providers son los servicios que Nest va a manejar por nosotros tras bambalinas
  providers: [ProductosService],
  // Controllers son los que escuchan las peticiones de afuera (Get, Post, etc)
  controllers: [ProductosController],
})
// Exportamos para que el AppModule pueda usar todo esto
export class ProductosModule {}
