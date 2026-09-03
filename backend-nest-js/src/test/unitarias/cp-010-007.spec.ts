import { Test, TestingModule } from "@nestjs/testing";
import { VentasService } from "../../ventas/ventas.service";
import { VentasController } from "../../ventas/ventas.controller";
import { PrismaService } from "../../prisma.service";

// Mock local de Prisma: cada archivo de esta suite es autónomo.
const createMockPrisma = () => ({
  venta: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
});

// CP-010-007: Validar límite de filas visibles (Paginación)
describe("CP-010-007: Validar límite de filas visibles (Paginación)", () => {
  // ---- Nivel de servicio ----
  describe("VentasService", () => {
    let ventasService: VentasService;
    let prismaService: PrismaService;

    beforeEach(async () => {
      const mockPrismaService = createMockPrisma();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VentasService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
        ],
      }).compile();

      ventasService = module.get<VentasService>(VentasService);
      prismaService = module.get<PrismaService>(PrismaService);
    });

    it("Debe limitar la consulta a 50 registros por defecto (take: 50, skip: 0)", async () => {
      // Arrange
      (prismaService.venta.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      await ventasService.getAll();

      // Assert
      expect(prismaService.venta.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50, skip: 0 }),
      );
    });

    it("Debe aplicar take/skip cuando se pasa una página específica", async () => {
      // Arrange
      (prismaService.venta.findMany as jest.Mock).mockResolvedValue([]);

      // Act: página 3 de 20 registros => offset = (3 - 1) * 20 = 40
      await ventasService.getAll(20, 40);

      // Assert
      expect(prismaService.venta.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20, skip: 40 }),
      );
    });
  });

  // ---- Nivel de controlador ----
  describe("VentasController", () => {
    const ventasServiceMock = {
      getAll: jest.fn(),
      count: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      ventasServiceMock.getAll.mockResolvedValue([]);
      ventasServiceMock.count.mockResolvedValue(0);
    });

    it("Debe usar limite=50 y pagina=1 por defecto cuando no se pasan query params", async () => {
      // Arrange
      const controller = new VentasController(
        ventasServiceMock as unknown as VentasService,
      );

      // Act
      const resultado = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
      );

      // Assert
      expect(ventasServiceMock.getAll).toHaveBeenCalledWith(
        50,
        0,
        undefined,
        undefined,
      );
      expect(ventasServiceMock.count).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(resultado).toEqual({
        ventas: [],
        total: 0,
        pagina: 1,
        limite: 50,
      });
    });

    it("Debe respetar los query params limite y pagina enviados", async () => {
      // Arrange
      const controller = new VentasController(
        ventasServiceMock as unknown as VentasService,
      );

      // Act: limite=20, pagina=3 => offset = (3 - 1) * 20 = 40
      await controller.findAll("20", "3", undefined, undefined);

      // Assert
      expect(ventasServiceMock.getAll).toHaveBeenCalledWith(
        20,
        40,
        undefined,
        undefined,
      );
      expect(ventasServiceMock.count).toHaveBeenCalled();
    });
  });
});
