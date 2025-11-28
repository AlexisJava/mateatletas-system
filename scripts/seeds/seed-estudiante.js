const { PrismaClient } = require('.prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Creando estudiante...');

  const hashedPassword = await bcrypt.hash('Estudiante123!', 10);

  // Crear usuario
  const user = await prisma.user.upsert({
    where: { email: 'juan@estudiante.com' },
    update: {},
    create: {
      email: 'juan@estudiante.com',
      password: hashedPassword,
      nombre: 'Juan',
      apellido: 'Pérez',
      role: 'tutor',
      ha_completado_onboarding: true,
    },
  });

  // Crear estudiante
  const estudiante = await prisma.estudiante.upsert({
    where: { user_id: user.id },
    update: {},
    create: {
      user_id: user.id,
      telefono: '1234567890',
      fecha_nacimiento: new Date('2010-01-15'),
    },
  });

  console.log('');
  console.log('==========================================');
  console.log('✅ ESTUDIANTE CREADO EXITOSAMENTE!');
  console.log('==========================================');
  console.log('📧 Email:    juan@estudiante.com');
  console.log('🔑 Password: Estudiante123!');
  console.log('👤 User ID:  ' + user.id);
  console.log('🎓 Student ID: ' + estudiante.id);
  console.log('==========================================');
  console.log('');
  console.log('🎯 SIGUIENTE PASO:');
  console.log('1. Ve a: http://localhost:3000/login');
  console.log('2. Ingresa las credenciales de arriba');
  console.log('3. Luego ve a: http://localhost:3000/estudiante/cursos');
  console.log('');
}

main()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
