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

describe("CP-010-005: Consultar un cliente recién creado sin ventas", () => {
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

  it("Debe cargar sin errores y retornar un arreglo vacío", async () => {
    (prismaService.venta.findMany as jest.Mock).mockResolvedValue([]);

    const resultado = await ventasService.getByCliente(999);

    expect(resultado).toEqual([]);
    expect(prismaService.venta.findMany).toHaveBeenCalledTimes(1);
    expect(prismaService.venta.findMany).toHaveBeenCalledWith({
      where: { pedido: { id_cliente: 999 } },
      include: { pedido: { select: { estado_pedido: true } } },
      orderBy: { fecha_venta: "desc" },
    });
  });
});
