export const createMockPrismaService = () => ({
  venta: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  producto: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  cliente: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  pedido: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  detalle_venta: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(createMockPrismaService())),
});
