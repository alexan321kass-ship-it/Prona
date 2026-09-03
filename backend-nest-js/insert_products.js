const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Agregando productos de prueba...');
  await prisma.producto.create({
    data: {
      codigo_interno: 'PROD-001',
      nombre_producto: 'Galletas Chocochips',
      descripcion: 'Deliciosas galletas con chispas de chocolate',
      precio: 2500,
      stock: 100,
      id_categoria: 1,
    }
  });
  await prisma.producto.create({
    data: {
      codigo_interno: 'PROD-002',
      nombre_producto: 'Cereal de Miel',
      descripcion: 'Cereal crujiente con miel natural',
      precio: 6000,
      stock: 50,
      id_categoria: 1,
    }
  });
  await prisma.producto.create({
    data: {
      codigo_interno: 'PROD-003',
      nombre_producto: 'Yogur de Fresa',
      descripcion: 'Yogur natural con trozos de fresa',
      precio: 1800,
      stock: 200,
      id_categoria: 1,
    }
  });
  console.log('Productos agregados.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
