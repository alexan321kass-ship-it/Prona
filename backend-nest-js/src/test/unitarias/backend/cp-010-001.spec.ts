import { Test, TestingModule } from "@nestjs/testing";
import { VentasService } from "../../../ventas/ventas.service";
import { PrismaService } from "../../../prisma.service";

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

    (prismaService.venta.findMany as jest.Mock).mockResolvedValue(mockVentas);

    const resultado = await ventasService.getByCliente(idCliente);

    expect(prismaService.venta.findMany).toHaveBeenCalledTimes(1);
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

    expect(resultado).toHaveLength(2);
    expect(resultado[0].id_venta).toBe(101);
    expect(resultado[0].total).toBe(119.0);
    expect(resultado[0].pedido?.estado_pedido).toBe("Entregado");
    expect(resultado[1].id_venta).toBe(102);
  });
});
