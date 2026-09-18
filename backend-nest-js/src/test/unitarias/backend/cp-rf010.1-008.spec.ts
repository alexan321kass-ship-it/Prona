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

describe("CP-RF010.1-008: Validar visualización de venta anulada/cancelada", () => {
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

  it("Debe incluir la venta cancelada en el historial con su estado explícito 'Cancelada'", async () => {
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([
      {
        id_venta: 302,
        estado_venta: "Cancelada",
        total: 119.0,
        pedido: { estado_pedido: "Entregado" },
      },
      {
        id_venta: 301,
        estado_venta: "Pagada",
        total: 59.5,
        pedido: { estado_pedido: "Entregado" },
      },
    ]);

    const resultado = await ventasService.getAll(50, 0);

    expect(resultado).toHaveLength(2);
    expect(resultado).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id_venta: 302, estado_venta: "Cancelada" }),
      ]),
    );
  });

  it("Debe conservar el estado 'Cancelada' en el historial por cliente", async () => {
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([
      {
        id_venta: 303,
        estado_venta: "Cancelada",
        total: 99.0,
        pedido: { estado_pedido: "Entregado" },
      },
    ]);

    const resultado = await ventasService.getByCliente(1);

    expect(resultado[0].estado_venta).toBe("Cancelada");
  });
});
