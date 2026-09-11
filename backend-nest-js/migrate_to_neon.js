/**
 * Migra todos los datos del dump local de PostgreSQL hacia Neon.
 * Corre con: node migrate_to_neon.js
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log("=== MIGRANDO DATOS LOCALES A NEON ===\n");

  // -- CLIENTES con nombres editados manualmente --
  console.log("📋 Sincronizando clientes...");
  const clientesLocales = [
    { identificacion: "1020304050", nombre_cliente: "Don Pan", correo_cliente: "juan.perez@example.com", telefono_cliente: "3001234567", direccion_cliente: "Calle 123 # 45-67" },
    { identificacion: "1030405060", nombre_cliente: "Las palmas", correo_cliente: "maria.gomez@example.com", telefono_cliente: "3109876543", direccion_cliente: "Carrera 45 # 12-34" },
    { identificacion: "1040506070", nombre_cliente: "D-TODOS", correo_cliente: "carlos.rodriguez@example.com", telefono_cliente: "3205554433", direccion_cliente: "Avenida 68 # 90-12" },
    { identificacion: "1050607080", nombre_cliente: "Merka 1", correo_cliente: "ana.martinez@example.com", telefono_cliente: "3156667788", direccion_cliente: "Transversal 30 # 20-10" },
    { identificacion: "1060708090", nombre_cliente: "Super-Market", correo_cliente: "luis.torres@example.com", telefono_cliente: "3112223344", direccion_cliente: "Diagonal 15 # 8-42" }
  ];

  for (const c of clientesLocales) {
    const existe = await prisma.cliente.findUnique({ where: { identificacion: c.identificacion } });
    if (!existe) {
      await prisma.cliente.create({ data: c });
      console.log(`  ✅ Creado: ${c.nombre_cliente}`);
    } else {
      // Actualizar el nombre si fue editado manualmente
      await prisma.cliente.update({ where: { identificacion: c.identificacion }, data: { nombre_cliente: c.nombre_cliente } });
      console.log(`  🔄 Actualizado: ${c.nombre_cliente}`);
    }
  }

  // -- PRODUCTOS adicionales que pudieran haberse creado desde la app --
  console.log("\n📦 Verificando productos adicionales...");
  const productosExtra = [
    { codigo_interno: "PAN-001", nombre_producto: "Pan Integral con Semillas", descripcion: "Pan integral con linaza y chía", precio: 3800, stock: 250, nombre_categoria: "Panaderia" },
    { codigo_interno: "PAN-002", nombre_producto: "Mini Croissant Mantequilla", descripcion: "Croissant artesanal", precio: 4200, stock: 100, nombre_categoria: "Panaderia" },
    { codigo_interno: "PAN-003", nombre_producto: "Pan de Queso Doble Crema", descripcion: "Panecillo relleno de queso", precio: 5500, stock: 200, nombre_categoria: "Panaderia" },
    { codigo_interno: "FRU-001", nombre_producto: "Mix de Nueces Premium", descripcion: "Almendras, nueces y marañones", precio: 12000, stock: 60, nombre_categoria: "Frutos secos" },
    { codigo_interno: "FRU-002", nombre_producto: "Maní Salado Tostado", descripcion: "Maní crocante tostado, 500g", precio: 5500, stock: 150, nombre_categoria: "Frutos secos" },
    { codigo_interno: "FRU-003", nombre_producto: "Pasas y Arándanos", descripcion: "Mezcla de frutas deshidratadas", precio: 8000, stock: 90, nombre_categoria: "Frutos secos" },
    { codigo_interno: "DUL-001", nombre_producto: "Turrón de Maní", descripcion: "Turrón crujiente con maní", precio: 3500, stock: 130, nombre_categoria: "Dulces" },
    { codigo_interno: "DUL-002", nombre_producto: "Bocadillo Veleño", descripcion: "Bocadillo de guayaba con panela", precio: 4000, stock: 110, nombre_categoria: "Dulces" },
    { codigo_interno: "DUL-003", nombre_producto: "Arequipe Artesanal", descripcion: "Arequipe cremoso, 250g", precio: 6500, stock: 70, nombre_categoria: "Dulces" }
  ];

  const cats = await prisma.categoria.findMany();
  const catMap = {};
  cats.forEach(c => catMap[c.nombre_categoria] = c.id_categoria);

  for (const p of productosExtra) {
    const existe = await prisma.producto.findUnique({ where: { codigo_interno: p.codigo_interno } });
    if (!existe) {
      await prisma.producto.create({
        data: {
          codigo_interno: p.codigo_interno,
          nombre_producto: p.nombre_producto,
          descripcion: p.descripcion,
          precio: p.precio,
          stock: p.stock,
          estado: true,
          id_categoria: catMap[p.nombre_categoria]
        }
      });
      console.log(`  ✅ ${p.nombre_producto}`);
    }
  }

  // -- Avena Instantánea (CER-002) --
  const aveRaw = await prisma.producto.findUnique({ where: { codigo_interno: "CER-002" } });
  if (!aveRaw) {
    await prisma.producto.create({
      data: { codigo_interno: "CER-002", nombre_producto: "Avena Instantánea", descripcion: "Hojuelas de avena precocida", precio: 4500, stock: 120, estado: true, id_categoria: catMap["Cereales"] }
    });
    console.log("  ✅ Avena Instantánea");
  }

  console.log("\n🎉 ¡Migración completada! Todos los datos están ahora en NEON.");
}

main()
  .catch(e => { console.error("Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
