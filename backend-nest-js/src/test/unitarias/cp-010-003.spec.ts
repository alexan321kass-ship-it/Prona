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

const clienteFake = {
  id_cliente: 1,
  nombre_cliente: "Farmacia Salud y Vida",
  identificacion: "900123456",
};

// CP-010-003: Buscar un cliente o producto específico.
// Nota: la búsqueda por nombre de cliente/producto se resuelve en el frontend
// (SalesHistory.jsx filtra por cliente/producto); el backend filtra por
// id_cliente (getByCliente) y por rango de fechas (getAll).
describe("CP-010-003: Buscar un cliente o producto específico", () => {
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

  it("Debe filtrar el historial por cliente usando pedido.id_cliente", async () => {
    // Arrange
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([
      {
        id_venta: 101,
        estado_venta: "Pagada",
        total: 119.0,
        pedido: { estado_pedido: "Entregado", cliente: clienteFake },
      },
    ]);

    // Act
    const resultado = await ventasService.getByCliente(7);

    // Assert
    expect(prismaService.venta.findMany).toHaveBeenCalledWith({
      where: { pedido: { id_cliente: 7 } },
      include: { pedido: { select: { estado_pedido: true } } },
      orderBy: { fecha_venta: "desc" },
    });
    expect(resultado).toHaveLength(1);
  });

  it("Debe construir el filtro por rango de fechas en el listado general", async () => {
    // Arrange
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([]);

    // Act
    await ventasService.getAll(50, 0, "2026-03-01", "2026-03-31");

    // Assert
    expect(prismaService.venta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          fecha_venta: {
            gte: new Date("2026-03-01"),
            lte: new Date("2026-03-31"),
          },
        },
      }),
    );
  });
});
