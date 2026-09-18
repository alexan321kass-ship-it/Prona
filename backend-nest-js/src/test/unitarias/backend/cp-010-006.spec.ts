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

describe("CP-010-006: Validar campo de nombre de cliente e identificación", () => {
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

  it("Cada venta del historial debe exponer nombre_cliente e identificacion", async () => {
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([
      {
        id_venta: 101,
        estado_venta: "Pagada",
        total: 119.0,
        pedido: {
          estado_pedido: "Entregado",
          cliente: {
            nombre_cliente: "Farmacia Salud y Vida",
            identificacion: "900123456",
          },
        },
      },
    ]);

    const resultado = await ventasService.getAll(50, 0);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre_cliente).toBe("Farmacia Salud y Vida");
    expect(resultado[0].identificacion).toBe("900123456");
    expect(resultado[0].id_venta).toBe(101);
    expect(resultado[0].estado_venta).toBe("Pagada");
  });
});
