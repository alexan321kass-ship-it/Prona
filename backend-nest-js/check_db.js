const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany();
  console.log('Users in DB:', users.length);
  if (users.length > 0) {
    console.log('First user:', users[0].correo);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
