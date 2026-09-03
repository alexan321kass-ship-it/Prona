import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Agregando clientes y ventas de prueba...');

  // 1. Obtener al menos un usuario para asociarlo a las ventas
  const admin = await (prisma as any).usuario.findFirst({
    where: { id_rol: 1 } // Administrador
  });

  const id_usuario = admin ? admin.id_usuario : 1;

  // 2. Obtener productos disponibles para hacer las ventas
  const productos = await (prisma as any).producto.findMany({
    take: 3
  });

  if (productos.length === 0) {
    console.error('No hay productos en la base de datos para crear ventas.');
    return;
  }

  // 3. Crear 3 clientes de prueba
  const clientesData = [
    { nombre_cliente: 'Supermercado Central', identificacion: '800123456', correo_cliente: 'compras@central.com', telefono_cliente: '3001234567', direccion_cliente: 'Av. Principal # 100' },
    { nombre_cliente: 'Tienda La Esquina', identificacion: '800654321', correo_cliente: 'contacto@laesquina.com', telefono_cliente: '3107654321', direccion_cliente: 'Calle 50 # 20-30' },
    { nombre_cliente: 'Minimarket Los Andes', identificacion: '900987654', correo_cliente: 'admin@losandes.com', telefono_cliente: '3209871234', direccion_cliente: 'Carrera 15 # 45-67' },
  ];

  const clientesCreados: any[] = [];
  for (const c of clientesData) {
    let cliente = await (prisma as any).cliente.findUnique({
      where: { identificacion: c.identificacion }
    });
    if (!cliente) {
      cliente = await (prisma as any).cliente.create({ data: c });
    }
    clientesCreados.push(cliente);
  }

  console.log(`Se agregaron ${clientesCreados.length} clientes.`);

  // 4. Crear 3 ventas de prueba
  for (let i = 0; i < 3; i++) {
    const cliente = clientesCreados[i];
    const producto = productos[i % productos.length];
    const cantidad = (i + 1) * 2;
    const precio = Number(producto.precio);
    const subtotal = cantidad * precio;

    const nuevaVenta = await (prisma as any).venta.create({
      data: {
        estado_venta: 'Pagada',
        subtotal: subtotal,
        descuento: 0,
        impuestos: 0,
        // Omitimos "total" ya que es una columna autogenerada en MySQL
        id_cliente: cliente.id_cliente,
        id_usuario: id_usuario,
        detalle_venta: {
          create: [
            {
              id_producto: producto.id_producto,
              cantidad: cantidad,
              precio_unitario: precio
            }
          ]
        }
      }
    });

    console.log(`Venta #${nuevaVenta.id_venta} creada para el cliente ${cliente.nombre_cliente} por un subtotal de $${subtotal}`);
  }

  console.log('¡Datos de prueba agregados exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
