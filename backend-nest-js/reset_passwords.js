const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPasswords() {
  console.log("Generando hashes...");
  const salt = await bcrypt.genSalt(10);
  const hashedSuperAdmin = await bcrypt.hash('Super123!', salt);
  const hashedAdmin = await bcrypt.hash('Admin123!', salt);
  const hashedAsesor = await bcrypt.hash('Asesor123!', salt);

  console.log("Actualizando contraseñas...");
  
  await prisma.usuario.updateMany({
    where: { correo: 'superadmin@pronavid.com' },
    data: { contrasena: hashedSuperAdmin }
  });

  await prisma.usuario.updateMany({
    where: { correo: 'admin@pronavid.com' },
    data: { contrasena: hashedAdmin }
  });

  await prisma.usuario.updateMany({
    where: { correo: 'asesor@pronavid.com' },
    data: { contrasena: hashedAsesor }
  });

  console.log("Contraseñas actualizadas con éxito!");
}

resetPasswords().catch(console.error).finally(() => prisma.$disconnect());
