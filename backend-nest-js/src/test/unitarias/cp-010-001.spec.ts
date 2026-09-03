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

// CP-010-001: Consultar historial de un cliente con ventas existentes
describe("CP-010-001: Consultar historial de un cliente con ventas existentes", () => {
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

  it("El sistema debe cargar correctamente el listado de ventas del cliente (Historial)", async () => {
    // Arrange: Preparamos los datos simulados que devolvería la base de datos
    const idCliente = 1;
    const mockVentas = [
      {
        id_venta: 101,
        fecha_venta: new Date("2026-03-27T15:00:00Z"),
        estado_venta: "Pagada",
        subtotal: 100.0,
        total: 119.0,
        pedido: {
          estado_pedido: "Entregado",
        },
      },
      {
        id_venta: 102,
        fecha_venta: new Date("2026-03-26T15:00:00Z"),
        estado_venta: "Pagada",
        subtotal: 50.0,
        total: 59.5,
        pedido: {
          estado_pedido: "Entregado",
        },
      },
    ];

    // Configuramos el mock para devolver las ventas simuladas
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue(mockVentas);

    // Act: Llamamos al método que consulta el historial del cliente
    const resultado = await ventasService.getByCliente(idCliente);

    // Assert: Verificamos que los datos devueltos son los correctos
    // 1. Verificamos que se haya llamado a findMany de la BD
    expect(prismaService.venta.findMany).toHaveBeenCalledTimes(1);

    // 2. Verificamos que se haya consultado con el filtro correcto (id_cliente)
    expect(prismaService.venta.findMany).toHaveBeenCalledWith({
      where: {
        pedido: { id_cliente: idCliente },
      },
      include: {
        pedido: {
          select: { estado_pedido: true },
        },
      },
      orderBy: { fecha_venta: "desc" },
    });

    // 3. Verificamos que el listado de ventas (historial) tenga los datos principales
    expect(resultado).toHaveLength(2);
    expect(resultado[0].id_venta).toBe(101);
    expect(resultado[0].total).toBe(119.0);
    expect(resultado[0].pedido?.estado_pedido).toBe("Entregado");
    expect(resultado[1].id_venta).toBe(102);
  });
});
