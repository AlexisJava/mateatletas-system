import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Listando todos los admins en Railway:\n');

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      password_hash: true,
      fecha_registro: true,
    },
  });

  if (admins.length === 0) {
    console.log('❌ No hay admins en la base de datos');
    return;
  }

  console.log(`✅ Se encontraron ${admins.length} admin(s):\n`);

  for (const admin of admins) {
    console.log(`👤 ${admin.nombre} ${admin.apellido}`);
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   🆔 ID: ${admin.id}`);
    console.log(`   🔑 Hash: ${admin.password_hash.substring(0, 20)}...`);
    console.log(`   📅 Registro: ${admin.fecha_registro}`);
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
