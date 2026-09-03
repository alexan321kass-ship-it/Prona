import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Restaurando productos correctos...');

  // Eliminar productos y detalles asociados (si los hay) para evitar conflictos,
  // pero el usuario pidio insertar, asumimos que faltan
  
  await prisma.producto.createMany({
    skipDuplicates: true,
    data: [
      { id_producto: 1, codigo_interno: 'GAL001', nombre_producto: 'Galleta de avena y miel', descripcion: 'Galleta dulce a base de avena, miel y canela.', precio: 2500.00, stock: 150, id_categoria: 1 },
      { id_producto: 2, codigo_interno: 'GAL002', nombre_producto: 'Galleta de chocolate', descripcion: 'Galleta crujiente con chips de chocolate.', precio: 2800.00, stock: 100, id_categoria: 1 },
      { id_producto: 3, codigo_interno: 'CER001', nombre_producto: 'Cereal de maíz', descripcion: 'Cereal clásico de hojuelas de maíz.', precio: 6000.00, stock: 180, id_categoria: 2 },
      { id_producto: 4, codigo_interno: 'CER002', nombre_producto: 'Cereal de avena con miel', descripcion: 'Cereal de avena tostada endulzado con miel.', precio: 6500.00, stock: 120, id_categoria: 2 },
      { id_producto: 5, codigo_interno: 'PAN001', nombre_producto: 'Panecillo integral', descripcion: 'Panecillo bajo en grasa con fibra natural.', precio: 2000.00, stock: 100, id_categoria: 3 },
      { id_producto: 6, codigo_interno: 'YOG001', nombre_producto: 'Yogur natural 200ml', descripcion: 'Yogur artesanal sin azúcar.', precio: 1800.00, stock: 250, id_categoria: 4 },
      { id_producto: 7, codigo_interno: 'YOG002', nombre_producto: 'Yogur de fresa 200ml', descripcion: 'Yogur natural con pulpa de fresa.', precio: 1900.00, stock: 230, id_categoria: 4 },
      { id_producto: 8, codigo_interno: 'TUR001', nombre_producto: 'Turrón de maní', descripcion: 'Turrón artesanal con maní y miel.', precio: 3200.00, stock: 160, id_categoria: 1 },
      { id_producto: 9, codigo_interno: 'BAR001', nombre_producto: 'Barra energética de avena', descripcion: 'Snack saludable de avena y frutos secos.', precio: 3500.00, stock: 181, id_categoria: 1 },
      { id_producto: 10, codigo_interno: 'POS001', nombre_producto: 'Flan de vainilla', descripcion: 'Postre lácteo con sabor a vainilla.', precio: 2700.00, stock: 146, id_categoria: 1 },
      { id_producto: 14, codigo_interno: null, nombre_producto: 'Aceite de Coco', descripcion: '100% natural prensado en frío', precio: 25000.00, stock: 50, id_categoria: 1 },
      { id_producto: 15, codigo_interno: 'PROD-001', nombre_producto: 'Paracetamol 500mg', descripcion: 'Caja x 100 tabletas', precio: 5.50, stock: 50, id_categoria: 1 }
    ]
  });

  console.log('Productos restaurados exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error restaurando productos:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
