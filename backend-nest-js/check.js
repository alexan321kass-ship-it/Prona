const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const pedidos = await prisma.pedido.count();
  console.log("Pedidos:", pedidos);
  const ventas = await prisma.venta.count();
  console.log("Ventas:", ventas);
  const clientes = await prisma.cliente.count();
  console.log("Clientes:", clientes);
}
check().catch(console.error).finally(() => prisma.$disconnect());
