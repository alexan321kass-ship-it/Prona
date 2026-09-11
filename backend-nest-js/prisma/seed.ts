import { PrismaClient, usuario_tipo_documento } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear Roles
  const adminRole = await prisma.rol.upsert({
    where: { nombre_rol: 'Administrador' },
    update: {},
    create: {
      nombre_rol: 'Administrador',
    },
  });

  const asesorRole = await prisma.rol.upsert({
    where: { nombre_rol: 'Asesor' },
    update: {},
    create: {
      nombre_rol: 'Asesor',
    },
  });

  console.log({ adminRole, asesorRole });

  // Crear Usuario Administrador
  const adminUser = await prisma.usuario.upsert({
    where: { correo: 'alexan321kass@gmail.com' },
    update: {},
    create: {
      primer_nombre: 'Alexxx',
      primer_apellido: 'Merchan',
      tipo_documento: usuario_tipo_documento.CC,
      numero_documento: '1033704653',
      correo: 'alexan321kass@gmail.com',
      contrasena: '$2b$10$JfRrRyEdV8lEBOywCkOoyOBnnw0ehzXdDLhGm.m9LfyduGCP4oJ5O',
      estado: true,
      requiere_cambio_contrasena: false,
      id_rol: adminRole.id_rol,
    },
  });

  console.log({ adminUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
