const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Estudiante123!', 10);

  const user = await prisma.user.create({
    data: {
      email: 'juan.estudiante@mateatletas.com',
      password: hashedPassword,
      nombre: 'Juan',
      apellido: 'Pérez',
      role: 'tutor',
      ha_completado_onboarding: true,
    },
  });

  const estudiante = await prisma.estudiante.create({
    data: {
      user_id: user.id,
      telefono: '1234567890',
      fecha_nacimiento: new Date('2010-01-15'),
    },
  });

  console.log('');
  console.log('✅ ESTUDIANTE CREADO EXITOSAMENTE!');
  console.log('==================================');
  console.log('📧 Email:    juan.estudiante@mateatletas.com');
  console.log('🔑 Password: Estudiante123!');
  console.log('👤 User ID:  ' + user.id);
  console.log('🎓 Student ID: ' + estudiante.id);
  console.log('==================================');
  console.log('');
  console.log('Ahora ve a: http://localhost:3000/login');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
