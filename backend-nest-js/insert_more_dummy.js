const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Agregando datos adicionales...');
  
  const user = await prisma.usuario.findFirst();
  const cliente = await prisma.cliente.findFirst();
  const producto = await prisma.producto.findFirst();

  console.log('User:', !!user, 'Cliente:', !!cliente, 'Producto:', !!producto);

  if (!user || !cliente || !producto) {
    console.log('Creando producto de emergencia...');
    await prisma.producto.create({
      data: {
        codigo_interno: 'PROD-EMERG',
        nombre_producto: 'Producto Emergencia',
        precio: 1000,
        id_categoria: 1
      }
    });
  }

  const p2 = await prisma.producto.findFirst();

  const pedido = await prisma.pedido.create({
    data: {
      estado_pedido: 'Pendiente',
      id_cliente: cliente.id_cliente,
      id_usuario: user.id_usuario,
    }
  });

  const venta = await prisma.venta.create({
    data: {
      estado_venta: 'Pagada',
      subtotal: 2500.0,
      id_cliente: cliente.id_cliente,
      id_usuario: user.id_usuario,
      id_pedido: pedido.id_pedido,
      detalle_venta: {
        create: [
          {
            id_producto: p2.id_producto,
            cantidad: 1,
            precio_unitario: 2500.0,
          }
        ]
      }
    }
  });

  const hoy = new Date();
  await prisma.cotizacion.create({
    data: {
      estado: 'Pendiente',
      fecha_vigencia: hoy,
      id_usuario: user.id_usuario,
      id_cliente: cliente.id_cliente,
      detalle_cotizacion: {
        create: [
          {
            id_producto: p2.id_producto,
            cantidad: 1,
            precio_unitario: 2500.0,
          }
        ]
      }
    }
  });
  console.log('Tablas llenas exitosamente!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
