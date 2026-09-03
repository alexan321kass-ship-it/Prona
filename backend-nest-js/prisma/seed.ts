import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de datos (Seeding)...');

  // 1. Limpiar datos existentes (Opcional, pero recomendado para evitar duplicados en pruebas)
  // Nota: El orden importa por las llaves foráneas
  await (prisma as any).detalle_cotizacion.deleteMany({});
  await (prisma as any).detalle_venta.deleteMany({});
  await (prisma as any).detalle_devolucion.deleteMany({});
  await (prisma as any).devolucion.deleteMany({});
  await (prisma as any).venta.deleteMany({});
  await (prisma as any).notificacion.deleteMany({});
  await (prisma as any).pedido.deleteMany({});
  await (prisma as any).cotizacion.deleteMany({});
  await (prisma as any).producto.deleteMany({});
  await (prisma as any).categoria.deleteMany({});
  await (prisma as any).usuario.deleteMany({});
  await (prisma as any).rol.deleteMany({});
  await (prisma as any).cliente.deleteMany({});

  console.log('🧹 Base de datos limpia.');

  // 2. Roles
  const rolAdmin = await (prisma as any).rol.create({
    data: { id_rol: 1, nombre_rol: 'Administrador' },
  });
  const rolAsesor = await (prisma as any).rol.create({
    data: { id_rol: 2, nombre_rol: 'Asesor' },
  });
  const rolSuperAdmin = await (prisma as any).rol.create({
    data: { id_rol: 3, nombre_rol: 'Super Administrador' },
  });

  console.log('✅ Roles creados: Administrador, Asesor y Super Administrador.');

  // 3. Categorías basadas en la importación
  const categorias = [
    { id_categoria: 1, nombre_categoria: 'Cereales', descripcion: 'Cereales variados' },
    { id_categoria: 2, nombre_categoria: 'Galletas', descripcion: 'Galletas y snacks' },
    { id_categoria: 3, nombre_categoria: 'Frutos Secos', descripcion: 'Frutos secos y semillas' },
    { id_categoria: 4, nombre_categoria: 'Granolas', descripcion: 'Granolas saludables' }
  ];

  for (const cat of categorias) {
    await (prisma as any).categoria.create({
      data: cat,
    });
  }

  console.log('✅ Categorías creadas desde el contexto importado.');

  // 4. Usuarios
  const salt = await bcrypt.genSalt(10);
  const hashedSuperAdmin = await bcrypt.hash('Super123!', salt);
  const hashedAdmin = await bcrypt.hash('Admin123!', salt);
  const hashedAsesor = await bcrypt.hash('Asesor123!', salt);

  await (prisma as any).usuario.create({
    data: {
      primer_nombre: 'Super',
      primer_apellido: 'Administrador',
      tipo_documento: 'CC',
      numero_documento: '0000000000',
      correo: 'superadmin@pronavid.com',
      contrasena: hashedSuperAdmin,
      id_rol: rolSuperAdmin.id_rol,
      estado: true,
      requiere_cambio_contrasena: false,
    },
  });

  await (prisma as any).usuario.create({
    data: {
      primer_nombre: 'Administrador',
      primer_apellido: 'Pronavid',
      tipo_documento: 'CC',
      numero_documento: '1234567890',
      correo: 'admin@pronavid.com',
      contrasena: hashedAdmin,
      id_rol: rolAdmin.id_rol,
      estado: true,
      requiere_cambio_contrasena: false,
    },
  });

  await (prisma as any).usuario.create({
    data: {
      primer_nombre: 'Asesor',
      primer_apellido: 'Ventas',
      tipo_documento: 'CC',
      numero_documento: '0987654321',
      correo: 'asesor@pronavid.com',
      contrasena: hashedAsesor,
      id_rol: rolAsesor.id_rol,
      estado: true,
      requiere_cambio_contrasena: false,
    },
  });

  console.log('👤 Usuarios creados:');
  console.log('   - Super Admin: superadmin@pronavid.com / Super123!');
  console.log('   - Admin: admin@pronavid.com / Admin123!');
  console.log('   - Asesor: asesor@pronavid.com / Asesor123!');

  // 5. Clientes de Ejemplo
  await (prisma as any).cliente.create({
    data: {
      nombre_cliente: 'Farmacia Salud y Vida',
      identificacion: '900123456',
      correo_cliente: 'contacto@saludyvida.com',
      telefono_cliente: '3101234567',
      direccion_cliente: 'Calle 123 # 45-67',
    },
  });

  console.log('✅ Cliente de ejemplo creado.');

  // 6. Productos desde Excel
  console.log('⏳ Importando productos desde Excel (Omitido por falta de archivo)...');
  const excelPath = path.resolve(process.cwd(), '../productos_pronavid_importacion_v2.xlsx');
  try {
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const productosExcel = xlsx.utils.sheet_to_json(sheet) as any[];

  let productosInsertados = 0;
  for (const prod of productosExcel) {
    try {
      await (prisma as any).producto.create({
        data: {
          codigo_interno: prod.codigo_interno || null,
          nombre_producto: prod.nombre_producto,
          descripcion: prod.descripcion || null,
          precio: Number(prod.precio) || 0,
          stock: Number(prod.stock) || 0,
          id_categoria: Number(prod.id_categoria),
        },
      });
      productosInsertados++;
    } catch (err) {
      console.warn(`⚠️ Error al insertar producto ${prod.codigo_interno || prod.nombre_producto}:`, err);
    }
  }

    console.log(`📦 ${productosInsertados} Productos importados exitosamente.`);
  } catch (err) {
    console.warn(`⚠️ Error al importar Excel, omitiendo productos:`, err.message);
  }
  console.log('✨ ¡Siembra completada exitosamente! ✨');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
