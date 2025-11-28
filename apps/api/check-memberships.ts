import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMemberships() {
  console.log('🔍 Verificando membresías en la base de datos...\n');

  const membresias = await prisma.membresia.findMany({
    include: {
      tutor: {
        select: {
          nombre: true,
          apellido: true,
          email: true,
        },
      },
      producto: true,
    },
  });

  console.log(`Total de membresías: ${membresias.length}\n`);

  for (const m of membresias) {
    console.log(`📋 Membresía ID: ${m.id}`);
    console.log(
      `   Tutor: ${m.tutor.nombre} ${m.tutor.apellido} (${m.tutor.email})`,
    );
    console.log(`   Tutor ID: ${m.tutor_id}`);
    console.log(`   Producto: ${m.producto.nombre}`);
    console.log(`   Estado: ${m.estado}`);
    console.log(`   Fecha inicio: ${m.fecha_inicio}`);
    console.log(`   Próximo pago: ${m.fecha_proximo_pago}`);
    console.log('');
  }

  await prisma.$disconnect();
}

checkMemberships();
