import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTables() {
  const email = 'figueroa.alexis93@gmail.com';

  console.log('=== Verificando TODAS las tablas para:', email, '===\n');

  const tutor = await prisma.tutor.findUnique({
    where: { email },
    select: { id: true, email: true, nombre: true, apellido: true, createdAt: true },
  });

  const docente = await prisma.docente.findUnique({
    where: { email },
    select: { id: true, email: true, nombre: true, apellido: true, createdAt: true },
  });

  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { id: true, email: true, nombre: true, apellido: true, createdAt: true },
  });

  console.log('TUTOR:', tutor ? `${tutor.nombre} ${tutor.apellido} (${tutor.id})` : 'No existe');
  console.log(
    'DOCENTE:',
    docente ? `${docente.nombre} ${docente.apellido} (${docente.id})` : 'No existe',
  );
  console.log('ADMIN:', admin ? `${admin.nombre} ${admin.apellido} (${admin.id})` : 'No existe');

  const count = [tutor, docente, admin].filter(Boolean).length;
  console.log('\n⚠️  EMAIL DUPLICADO EN', count, 'TABLAS');
  console.log('El AuthOrchestratorService busca en orden: TUTOR -> DOCENTE -> ADMIN');
  console.log('Siempre encontrará al TUTOR primero.');

  await prisma.$disconnect();
}

checkAllTables();
