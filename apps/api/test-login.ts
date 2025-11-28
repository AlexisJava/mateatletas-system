import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'alexis.figueroa@est.fi.uncoma.edu.ar';
  const password = 'Alexis93$';

  console.log('🧪 Simulando proceso de login...\n');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}\n`);

  // 1. Buscar como tutor
  console.log('1️⃣ Buscando en tabla Tutor...');
  const tutor = await prisma.tutor.findUnique({
    where: { email },
  });
  console.log(
    `   ${tutor ? '✅' : '❌'} Tutor: ${tutor ? 'ENCONTRADO' : 'No encontrado'}`,
  );

  // 2. Buscar como docente
  console.log('\n2️⃣ Buscando en tabla Docente...');
  const docente = await prisma.docente.findUnique({
    where: { email },
  });
  console.log(
    `   ${docente ? '✅' : '❌'} Docente: ${docente ? 'ENCONTRADO' : 'No encontrado'}`,
  );

  // 3. Buscar como admin
  console.log('\n3️⃣ Buscando en tabla Admin...');
  const admin = await prisma.admin.findUnique({
    where: { email },
  });
  console.log(
    `   ${admin ? '✅' : '❌'} Admin: ${admin ? 'ENCONTRADO' : 'No encontrado'}`,
  );

  if (!admin) {
    console.log('\n❌ No se encontró el admin con ese email');
    return;
  }

  console.log(`\n4️⃣ Verificando contraseña...`);
  console.log(`   Password a verificar: "${password}"`);
  console.log(`   Hash en DB: ${admin.password_hash}`);

  const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

  console.log(
    `\n${isPasswordValid ? '✅' : '❌'} Resultado: ${isPasswordValid ? 'CONTRASEÑA VÁLIDA' : 'CONTRASEÑA INVÁLIDA'}`,
  );

  if (isPasswordValid) {
    console.log('\n🎉 ¡LOGIN EXITOSO! El email y contraseña son correctos.');
  } else {
    console.log('\n❌ LOGIN FALLIDO - La contraseña no coincide con el hash');
    console.log('\nProbando con variaciones de la contraseña:');

    const variations = [
      'Alexis93',
      'alexis93$',
      'ALEXIS93$',
      'Alexis93$',
      'Alexis93$ ',
      ' Alexis93$',
    ];

    for (const variation of variations) {
      const match = await bcrypt.compare(variation, admin.password_hash);
      console.log(`   "${variation}": ${match ? '✅ MATCH' : '❌'}`);
    }
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
