import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require("cookie-parser");

// Punto de entrada de la aplicación
async function bootstrap() {
  // Creamos la aplicación usando el AppModule
  const app = await NestFactory.create(AppModule);

  // Habilitamos cookie-parser para manejar tokens JWT en cookies HttpOnly
  app.use(cookieParser());

  // Habilitamos CORS para mayor seguridad
  app.enableCors({
    // Configuración dinámica para manejar distintos entornos
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4000",
        "http://127.0.0.1",
        "http://10.0.2.2:4000",
        "http://10.0.2.2",
        "http://10.1.202.209:4000",
        "http://10.1.202.209",
        "http://172.23.64.1:4000",
        "http://172.23.64.1",
        "http://192.168.2.3:4000",
        "http://192.168.2.3",
        "http://10.1.202.101:4000",
        "http://10.1.202.101",
        "http://[::1]:5173",
        "http://[::1]:3000",
        "http://[::1]:4000",
        "http://[::1]",
      ];

      // Permite peticiones locales con cualquier puerto (útil para puertos dinámicos de Flutter Web / Emuladores)
      const isLocal =
        /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|10\.1\.202\.209)(:\d+)?$/.test(
          origin,
        );

      if (
        !origin ||
        isLocal ||
        allowedOrigins.includes(origin) ||
        /\.pronavid\.com$/.test(origin)
      ) {
        callback(null, true);
      } else {
        console.error(`🚨 Origen bloqueado por CORS: ${origin}`);
        callback(
          new Error(`Bloqueado por CORS: Origen no permitido (${origin})`),
        );
      }
    },
    // Métodos HTTP permitidos, incluyendo HEAD
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    // Ampliación de las cabeceras permitidas
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
  });

  // Todas nuestras rutas van a empezar con /api (ej: /api/productos)
  app.setGlobalPrefix("api");

  // Aquí configuramos la validación global.
  // Si alguien manda datos que no debe, Nest le dice "no, gracias" automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //SWAGGER

  const config = new DocumentBuilder()
    .setTitle("API de Pronavid")
    .setDescription(
      `## Sistema de Gestión de Ventas\n\n` +
        `### Roles\n` +
        `- **Rol 1** = Administrador (acceso total)\n` +
        `- **Rol 2** = Vendedor (acceso limitado)`,
    )
    .setVersion("1.0")
    .setContact("Equipo Pronavid", "", "admin@pronavid.com")
    .addTag("Auth", "Registro, login y perfil")
    .addTag("Clientes", "Gestión de clientes")
    .addTag("Productos", "Catálogo y stock")
    .addTag("Pedidos", "Órdenes de compra")
    .addTag("Ventas", "Registro de ventas")
    .addTag("Notificaciones", "Avisos de pedidos")
    .addTag("Reportes", "Estadísticas SQL")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Ingresa tu token JWT",
        in: "header",
      },
      "JWT-auth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api/docs", app, document, {
    explorer: true,
    customSiteTitle: "Pronavid API Docs",
    swaggerOptions: {
      filter: true,
      showRequestHeaders: true,
      persistAuthorization: true,
      docExpansion: "none",
      defaultModelsExpandDepth: 2,
      tagsSorter: "alpha",
      syntaxHighlight: { activate: true, theme: "monokai" },
    },
  });

  await app.listen(process.env.PORT || 4000, "0.0.0.0");
  console.log(`¡Servidor listo! Corriendo en: ${await app.getUrl()}`);
  console.log(`Swagger disponible en: ${await app.getUrl()}/api/docs`);
}
bootstrap();
