const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.usuario.findMany({
    select: {
      id_usuario: true,
      correo: true,
      id_rol: true,
      estado: true
    }
  });
  console.log("Usuarios en la base de datos:");
  console.table(users);
}
listUsers().catch(console.error).finally(() => prisma.$disconnect());
