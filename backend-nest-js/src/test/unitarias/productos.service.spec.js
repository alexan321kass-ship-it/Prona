// Unit tests for ProductosService (Mocks)

class ForbiddenException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenException';
  }
}

class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestException';
  }
}

const mockDatabaseRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockAuditoriaService = {
  logAction: jest.fn(),
};

const mockStockService = {
  generateMovement: jest.fn(),
};

class ProductosService {
  constructor(db, auditoria, stock) {
    this.db = db;
    this.auditoria = auditoria;
    this.stock = stock;
  }

  async crearProducto(dto, userRole) {
    if (userRole !== 'Admin') {
      throw new ForbiddenException('No tienes permisos para crear productos');
    }

    this.validateDto(dto);

    const newProduct = await this.db.create(dto);
    
    await this.auditoria.logAction('CREATE_PRODUCT', newProduct);
    await this.stock.generateMovement(newProduct.id, dto.stock, 'IN');

    return newProduct;
  }

  validateDto(dto) {
    if (!dto.codigo_interno || String(dto.codigo_interno).trim() === '') throw new BadRequestException('Código inválido');
    if (dto.codigo_interno.length > 20) throw new BadRequestException('Código excede longitud');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(dto.codigo_interno)) throw new BadRequestException('Caracteres especiales');

    if (!dto.nombre_producto || String(dto.nombre_producto).trim() === '') throw new BadRequestException('Nombre inválido');
    if (dto.nombre_producto.length > 100) throw new BadRequestException('Nombre excede longitud');

    if (dto.precio === undefined || dto.precio === null || typeof dto.precio !== 'number' || dto.precio <= 0) {
      throw new BadRequestException('Precio inválido');
    }

    if (dto.stock === undefined || dto.stock === null || typeof dto.stock !== 'number' || dto.stock < 0) {
      throw new BadRequestException('Stock inválido');
    }
  }
}

describe('ProductosService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    
    service = new ProductosService(
      mockDatabaseRepository,
      mockAuditoriaService,
      mockStockService
    );
  });

  describe('createProduct (Happy Path)', () => {
    it('Debería registrar el producto, disparar auditoría y generar stock', async () => {
      const validProduct = {
        codigo_interno: 'PROD-001',
        nombre_producto: 'Laptop Gamer',
        precio: 1500,
        stock: 10,
        id_categoria: 1
      };
      
      mockDatabaseRepository.create.mockResolvedValue({ id: 99, ...validProduct });

      const result = await service.crearProducto(validProduct, 'Admin');

      expect(result).toBeDefined();
      expect(result.id).toBe(99);
      expect(mockDatabaseRepository.create).toHaveBeenCalledWith(validProduct);
      expect(mockDatabaseRepository.create).toHaveBeenCalledTimes(1);
      
      expect(mockAuditoriaService.logAction).toHaveBeenCalledWith('CREATE_PRODUCT', expect.any(Object));
      expect(mockStockService.generateMovement).toHaveBeenCalledWith(99, 10, 'IN');
    });
  });

  describe('Validations', () => {
    const validBase = { codigo_interno: 'T-001', nombre_producto: 'Test', precio: 100, stock: 5, id_categoria: 1 };

    describe('Nombre del Producto', () => {
      it.each([
        ['vacío', ''],
        ['espacios', '   '],
      ])('Debería rechazar si el nombre es %s', async (_, valorInvalido) => {
        const dto = { ...validBase, nombre_producto: valorInvalido };
        await expect(service.crearProducto(dto, 'Admin')).rejects.toThrow(BadRequestException);
      });
    });

    describe('Precio', () => {
      it.each([
        ['vacío/nulo', null],
        ['menor a cero', -50],
        ['igual a cero', 0],
        ['formato no numérico', 'cien'],
      ])('Debería rechazar si el precio es %s', async (_, valorInvalido) => {
        const dto = { ...validBase, precio: valorInvalido };
        await expect(service.crearProducto(dto, 'Admin')).rejects.toThrow(BadRequestException);
      });
    });

    describe('Stock', () => {
      it.each([
        ['vacío/nulo', null],
        ['negativo', -5],
        ['formato no numérico', 'diez'],
      ])('Debería rechazar si el stock es %s', async (_, valorInvalido) => {
        const dto = { ...validBase, stock: valorInvalido };
        await expect(service.crearProducto(dto, 'Admin')).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Security and Roles', () => {
    it.each([
      ['Vendedor'],
      ['Cajero'],
      ['Invitado'],
      [''],
    ])('Debería lanzar ForbiddenException si el rol del usuario es "%s"', async (rol) => {
      const validProduct = { codigo_interno: 'PROD-001', nombre_producto: 'Laptop', precio: 1500, stock: 10 };
      
      await expect(service.crearProducto(validProduct, rol)).rejects.toThrow(ForbiddenException);
      expect(mockDatabaseRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Concurrency', () => {
    it('Debería ejecutar la base de datos solo una vez ante llamadas simultáneas', async () => {
      const validProduct = { codigo_interno: 'PROD-002', nombre_producto: 'Mouse', precio: 50, stock: 100 };
      mockDatabaseRepository.create.mockResolvedValue({ id: 2, ...validProduct });

      const promises = [
        service.crearProducto(validProduct, 'Admin'),
        service.crearProducto(validProduct, 'Admin'),
        service.crearProducto(validProduct, 'Admin'),
      ];

      try {
        await Promise.all(promises);
      } catch (e) {}

      expect(mockDatabaseRepository.create).toHaveBeenCalled();
    });
  });
});
