const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usuarios = [
    {
      primer_nombre: "Asesor",
      primer_apellido: "A",
      tipo_documento: "CC",
      numero_documento: "1031421234",
      correo: "asesor@pronavid.com",
      contrasena: "$2b$10$QpUdSgVB0zVD1poybJwIteOfHTHwWlCsAaUtAuKOmYqZae/ZWoCpy",
      estado: true,
      requiere_cambio_contrasena: true,
      id_rol: 2
    },
    {
      primer_nombre: "Admin",
      primer_apellido: "A",
      tipo_documento: "CC",
      numero_documento: "79810475",
      correo: "admin@pronavid.com",
      contrasena: "$2b$10$8i4K7SFY/5iGz9IiJSBSI.1qeVLRUkBQV/ro/kOvXvjhhl2GBf5xO",
      estado: true,
      requiere_cambio_contrasena: true,
      id_rol: 1
    }
  ];

  for (const u of usuarios) {
    const existe = await prisma.usuario.findUnique({ where: { correo: u.correo } });
    if (!existe) {
      await prisma.usuario.create({ data: u });
      console.log(`✅ Usuario creado: ${u.primer_nombre} (${u.correo})`);
    } else {
      console.log(`⚠️ Ya existe: ${u.correo}`);
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
