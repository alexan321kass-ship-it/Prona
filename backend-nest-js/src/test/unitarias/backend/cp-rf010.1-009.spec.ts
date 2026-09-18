import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
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
  producto: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  detalle_venta: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  detalle_devolucion: {
    create: jest.fn(),
  },
  devolucion: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
});

const correrTransaccionConMock = (prisma: PrismaService): void => {
  (prisma.$transaction as jest.Mock).mockImplementation(
    (callback: (tx: PrismaService) => unknown) => callback(prisma),
  );
};

describe("CP-RF010.1-009: Validar inhabilitación de devolución sobre venta cancelada", () => {
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

  it("Debe lanzar BadRequestException al intentar devolver una venta Cancelada", async () => {
    correrTransaccionConMock(prismaService);
    (prismaService.venta.findUnique as jest.Mock).mockResolvedValue({
      id_venta: 302,
      estado_venta: "Cancelada",
      detalle_venta: [],
      devolucion: [],
    });

    await expect(
      ventasService.crearDevolucion(302, "Mercancía vencida", 1),
    ).rejects.toThrow(BadRequestException);
    expect(prismaService.devolucion.create).not.toHaveBeenCalled();
    expect(prismaService.venta.update).not.toHaveBeenCalled();
  });

  it("Debe lanzar BadRequestException si la venta ya fue devuelta", async () => {
    correrTransaccionConMock(prismaService);
    (prismaService.venta.findUnique as jest.Mock).mockResolvedValue({
      id_venta: 304,
      estado_venta: "Pagada",
      detalle_venta: [],
      devolucion: [{ id_devolucion: 1 }],
    });

    await expect(
      ventasService.crearDevolucion(304, "Devolución duplicada", 1),
    ).rejects.toThrow(BadRequestException);
    expect(prismaService.devolucion.create).not.toHaveBeenCalled();
  });
});
