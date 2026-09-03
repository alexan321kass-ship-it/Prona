import { Test, TestingModule } from "@nestjs/testing";
import { VentasService } from "../../ventas/ventas.service";
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

// CP-010-002: Validar orden cronológico inverso del historial
describe("CP-010-002: Validar orden cronológico inverso del historial", () => {
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

  it("Debe solicitar a la BD el historial ordenado de la más reciente a la más antigua (getByCliente)", async () => {
    // Arrange
    const masAntigua = {
      id_venta: 201,
      fecha_venta: new Date("2026-03-01T10:00:00Z"),
      estado_venta: "Pagada",
      pedido: { estado_pedido: "Entregado" },
    };
    const masReciente = {
      id_venta: 202,
      fecha_venta: new Date("2026-04-01T10:00:00Z"),
      estado_venta: "Pagada",
      pedido: { estado_pedido: "Entregado" },
    };
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([
      masReciente,
      masAntigua,
    ]);

    // Act
    const resultado = await ventasService.getByCliente(1);

    // Assert
    expect(prismaService.venta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { fecha_venta: "desc" } }),
    );
    expect(resultado[0].id_venta).toBe(202);
    expect(resultado[1].id_venta).toBe(201);
    expect(resultado[0].fecha_venta!.getTime()).toBeGreaterThan(
      resultado[1].fecha_venta!.getTime(),
    );
  });

  it("Debe solicitar a la BD el historial ordenado descendente por fecha (getAll)", async () => {
    // Arrange
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    await ventasService.getAll(50, 0);

    // Assert
    expect(prismaService.venta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { fecha_venta: "desc" } }),
    );
  });
});
