import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ClientesModule } from "./clientes/clientes.module";
import { PedidosModule } from "./pedidos/pedidos.module";
import { ProductosModule } from "./productos/productos.module";
import { CategoriasModule } from "./categorias/categorias.module";
import { VentasModule } from "./ventas/ventas.module";
import { CotizacionesModule } from "./cotizaciones/cotizaciones.module";
import { NotificacionesModule } from "./notificaciones/notificaciones.module";
import { ReportesModule } from "./reportes/reportes.module";
import { UsersModule } from "./users/users.module";
import { RolesGuard } from "./auth/roles.guard";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ScheduleModule } from "@nestjs/schedule";

// Módulo principal del sistema donde se consolidan todos los módulos de negocio
@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Servido de archivos estáticos (para imágenes de productos)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
    }),
    // Cron Jobs
    ScheduleModule.forRoot(),
    // Módulos funcionales
    PrismaModule,
    AuthModule,
    ClientesModule,
    PedidosModule,
    CategoriasModule,
    ProductosModule,
    CotizacionesModule,
    VentasModule,
    NotificacionesModule,
    ReportesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guardias globales para autenticación (JWT) y autorización (Roles)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Validación de Token
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Validación de Permisos
    },
  ],
})
export class AppModule {}
