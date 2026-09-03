import { Test, TestingModule } from "@nestjs/testing";
import { VentasService } from "../../ventas/ventas.service";
import { PrismaService } from "../../prisma.service";

// Mock local de Prisma: cada archivo de esta suite es autónomo.
const createMockPrisma = () => ({
  detalle_venta: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
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

// CP-RF010.1-0010: Validar inmutabilidad de precios en el historial
describe("CP-RF010.1-0010: Validar inmutabilidad de precios en el historial", () => {
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

  it("Debe conservar el precio unitario del momento de la compra aunque el precio actual cambie", async () => {
    // Arrange: el producto hoy cuesta 1500, pero se vendió a 1200.5
    // (snapshot guardado en detalle_venta.precio_unitario)
    (prismaService.detalle_venta.findMany as jest.Mock).mockResolvedValue([
      {
        id_detalle_venta: 1,
        id_venta: 5,
        id_producto: 7,
        cantidad: 2,
        precio_unitario: 1200.5,
        producto: {
          nombre_producto: "Avena Integral",
          descripcion: "Bolsa 1kg",
        },
      },
    ]);

    // Act
    const detalles = await ventasService.getDetalles(5);

    // Assert
    expect(prismaService.detalle_venta.findMany).toHaveBeenCalledWith({
      where: { id_venta: 5 },
      include: {
        producto: { select: { nombre_producto: true, descripcion: true } },
      },
    });
    expect(detalles).toHaveLength(1);
    expect(detalles[0].precio_unitario).toBe(1200.5);
  });
});
