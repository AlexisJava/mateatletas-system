import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBothUsers() {
  const email = 'figueroa.alexis93@gmail.com';

  console.log('=== Checking all tables for email:', email, '===\n');

  const tutor = await prisma.tutor.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      password_hash: true,
      createdAt: true,
    },
  });

  const docente = await prisma.docente.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      password_hash: true,
      createdAt: true,
    },
  });

  const admin = await prisma.admin.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      password_hash: true,
      createdAt: true,
    },
  });

  console.log('TUTOR:');
  if (tutor) {
    console.log('  ID:', tutor.id);
    console.log('  Email:', tutor.email);
    console.log('  Nombre:', tutor.nombre, tutor.apellido);
    console.log('  Has password_hash:', Boolean(tutor.password_hash));
    console.log(
      '  Hash preview:',
      tutor.password_hash
        ? tutor.password_hash.substring(0, 20) + '...'
        : 'NULL',
    );
    console.log('  Created:', tutor.createdAt);
  } else {
    console.log('  Not found');
  }

  console.log('\nDOCENTE:');
  if (docente) {
    console.log('  ID:', docente.id);
    console.log('  Email:', docente.email);
    console.log('  Nombre:', docente.nombre, docente.apellido);
    console.log('  Has password_hash:', Boolean(docente.password_hash));
    console.log(
      '  Hash preview:',
      docente.password_hash
        ? docente.password_hash.substring(0, 20) + '...'
        : 'NULL',
    );
    console.log('  Created:', docente.createdAt);
  } else {
    console.log('  Not found');
  }

  console.log('\nADMIN:');
  if (admin) {
    console.log('  ID:', admin.id);
    console.log('  Email:', admin.email);
    console.log('  Nombre:', admin.nombre, admin.apellido);
    console.log('  Has password_hash:', Boolean(admin.password_hash));
    console.log(
      '  Hash preview:',
      admin.password_hash
        ? admin.password_hash.substring(0, 20) + '...'
        : 'NULL',
    );
    console.log('  Created:', admin.createdAt);
  } else {
    console.log('  Not found');
  }

  console.log('\n=== CONCLUSION ===');
  if (tutor && docente) {
    console.log('⚠️  EMAIL DUPLICADO: Existe como TUTOR y DOCENTE');
    console.log('⚠️  El sistema detecta primero al TUTOR, no al DOCENTE');
    console.log(
      '⚠️  Por eso el login falla - está intentando autenticar como TUTOR',
    );
  }

  await prisma.$disconnect();
}

checkBothUsers();
