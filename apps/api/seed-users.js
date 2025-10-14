const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuarios de prueba para todos los roles...\n');

  const password = await bcrypt.hash('Test123!', 10);

  // 1. ADMIN
  console.log('👑 Creando Admin...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password,
      nombre: 'Admin',
      apellido: 'Test',
      role: 'admin',
      ha_completado_onboarding: true,
    },
  });
  console.log('   ✅ Admin creado:', admin.email);

  // 2. DOCENTE
  console.log('\n👨‍🏫 Creando Docente...');
  const docenteUser = await prisma.user.upsert({
    where: { email: 'docente@test.com' },
    update: {},
    create: {
      email: 'docente@test.com',
      password,
      nombre: 'María',
      apellido: 'González',
      role: 'docente',
      ha_completado_onboarding: true,
    },
  });

  try {
    const docente = await prisma.docente.upsert({
      where: { user_id: docenteUser.id },
      update: {},
      create: {
        user_id: docenteUser.id,
        especialidad: 'Matemáticas',
        años_experiencia: 5,
        calificacion_promedio: 4.8,
        bio: 'Profesora de matemáticas con 5 años de experiencia',
        disponible: true,
      },
    });
    console.log('   ✅ Docente creado:', docenteUser.email);
  } catch (e) {
    console.log('   ⚠️ Docente ya existe');
  }

  // 3. TUTOR (Padre/Madre)
  console.log('\n👨‍👩‍👧 Creando Tutor...');
  const tutor = await prisma.user.upsert({
    where: { email: 'tutor@test.com' },
    update: {},
    create: {
      email: 'tutor@test.com',
      password,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      role: 'tutor',
      telefono: '1234567890',
      ha_completado_onboarding: true,
    },
  });
  console.log('   ✅ Tutor creado:', tutor.email);

  // 4. ESTUDIANTE
  console.log('\n🎓 Creando Estudiante...');
  const estudianteUser = await prisma.user.upsert({
    where: { email: 'estudiante@test.com' },
    update: {},
    create: {
      email: 'estudiante@test.com',
      password,
      nombre: 'Juan',
      apellido: 'Pérez',
      role: 'tutor',
      ha_completado_onboarding: true,
    },
  });

  try {
    const estudiante = await prisma.estudiante.upsert({
      where: { user_id: estudianteUser.id },
      update: {},
      create: {
        user_id: estudianteUser.id,
        telefono: '0987654321',
        fecha_nacimiento: new Date('2010-05-15'),
      },
    });
    console.log('   ✅ Estudiante creado:', estudianteUser.email);

    // 5. Crear equipo para el estudiante
    console.log('\n🏆 Creando Equipo de prueba...');
    const equipo = await prisma.equipo.upsert({
      where: { nombre: 'Equipo Alfa' },
      update: {},
      create: {
        nombre: 'Equipo Alfa',
        puntos_totales: 0,
        color: '#667eea',
        nivel_actual: 1,
      },
    });

    // Asignar estudiante al equipo
    await prisma.estudiante.update({
      where: { id: estudiante.id },
      data: { equipo_id: equipo.id },
    });
    console.log('   ✅ Equipo creado y estudiante asignado');
  } catch (e) {
    console.log('   ⚠️ Estudiante ya existe');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ USUARIOS DE PRUEBA CREADOS EXITOSAMENTE');
  console.log('='.repeat(60));
  console.log('\n📋 CREDENCIALES (todas usan la misma contraseña):');
  console.log('\n   🔑 Password para todos: Test123!\n');
  console.log('┌─────────────┬──────────────────────┬─────────────────────┐');
  console.log('│    ROL      │        EMAIL         │     DASHBOARD       │');
  console.log('├─────────────┼──────────────────────┼─────────────────────┤');
  console.log('│ 👑 Admin    │ admin@test.com       │ /admin/dashboard    │');
  console.log('│ 👨‍🏫 Docente  │ docente@test.com     │ /docente/dashboard  │');
  console.log('│ 👨‍👩‍👧 Tutor    │ tutor@test.com       │ /login              │');
  console.log('│ 🎓 Estudiante│ estudiante@test.com  │ /estudiante/cursos  │');
  console.log('└─────────────┴──────────────────────┴─────────────────────┘');
  console.log('\n🚀 Ahora puedes usar estos usuarios para probar el sistema');
  console.log('\n📝 Guarda estas credenciales en: docs/CREDENCIALES.md\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
