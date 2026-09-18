import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../../../app.module";

describe("Flujo Punto a Punto - Autenticación y Rutas Protegidas (E2E)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("1. Ruta pública /api debe responder saludando sin requerir autenticación", async () => {
    await request(app.getHttpServer())
      .get("/api")
      .expect(200)
      .expect("Hello World!");
  });

  it("2. Intento de acceder a /api/productos sin JWT debe ser rechazado con 401 Unauthorized", async () => {
    await request(app.getHttpServer())
      .get("/api/productos")
      .expect(401);
  });
});
