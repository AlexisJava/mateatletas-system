/**
 * Seed Mínimo - Solo datos esenciales para desarrollo
 * Ejecutar: npx ts-node prisma/seed-minimal.ts
 */
import {
  PrismaClient,
  DiaSemana,
  CasaTipo,
  MundoTipo,
  TierNombre,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed Mínimo - Iniciando...\n');

  // 1. Admin
  console.log('👤 Creando Admin...');
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mateatletas.com' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'admin@mateatletas.com',
      passwordHash: adminPassword,
      nombre: 'Admin',
      apellido: 'Mateatletas',
    },
  });
  console.log(`   ✅ Admin: ${admin.email} / Admin123!\n`);

  // 2. Tiers
  console.log('🎮 Creando Tiers...');
  const tiersData = [
    {
      nombre: TierNombre.STEAM_LIBROS,
      precioMensual: 40000,
      mundosAsync: 3,
      mundosSync: 0,
      tieneDocente: false,
      descripcion: 'Plataforma STEAM completa',
      activo: true,
      orden: 1,
    },
    {
      nombre: TierNombre.STEAM_ASINCRONICO,
      precioMensual: 65000,
      mundosAsync: 3,
      mundosSync: 0,
      tieneDocente: false,
      descripcion: 'STEAM + clases grabadas',
      activo: true,
      orden: 2,
    },
    {
      nombre: TierNombre.STEAM_SINCRONICO,
      precioMensual: 95000,
      mundosAsync: 3,
      mundosSync: 1,
      tieneDocente: true,
      descripcion: 'STEAM + clases en vivo',
      activo: true,
      orden: 3,
    },
  ];
  for (const tier of tiersData) {
    await prisma.tier.upsert({
      where: { nombre: tier.nombre },
      update: tier,
      create: tier,
    });
  }
  console.log('   ✅ 3 tiers creados\n');

  // 3. Docente de prueba
  console.log('👩‍🏫 Creando Docente...');
  const docentePassword = await bcrypt.hash('Docente123!', 10);
  const docente = await prisma.docente.upsert({
    where: { email: 'docente@mateatletas.com' },
    update: { passwordHash: docentePassword },
    create: {
      email: 'docente@mateatletas.com',
      passwordHash: docentePassword,
      nombre: 'María',
      apellido: 'García',
      telefono: '1155667788',
      experienciaAnos: 5,
      activo: true,
    },
  });
  console.log(`   ✅ Docente: ${docente.email} / Docente123!\n`);

  // 4. Grupo Pedagógico y ClaseGrupo de prueba
  console.log('📚 Creando Grupo Pedagógico...');
  const grupo = await prisma.grupoPedagogico.upsert({
    where: { id: 'ctest0grupo00000000000001' },
    update: {},
    create: {
      id: 'ctest0grupo00000000000001',
      nombre: 'Matemáticas Quantum',
      descripcion: 'Grupo de matemáticas para 6-9 años',
      casaTipo: CasaTipo.QUANTUM,
      mundoTipo: MundoTipo.MATEMATICAS,
      edadMinima: 6,
      edadMaxima: 9,
      activo: true,
    },
  });

  const claseGrupo = await prisma.claseGrupo.upsert({
    where: { id: 'ctest0clasegr000000000001' },
    update: {},
    create: {
      id: 'ctest0clasegr000000000001',
      nombre: 'Mate Quantum - Lunes 16hs',
      grupoId: grupo.id,
      docenteId: docente.id,
      diaSemana: DiaSemana.LUNES,
      horaInicio: '16:00',
      horaFin: '17:00',
      cupoMaximo: 15,
      anioLectivo: 2026,
      activo: true,
    },
  });
  console.log(`   ✅ ClaseGrupo: ${claseGrupo.nombre}\n`);

  // 5. Tutor de prueba
  console.log('👨‍👩‍👧 Creando Tutor...');
  const tutorPassword = await bcrypt.hash('Tutor123!', 10);
  const tutor = await prisma.tutor.upsert({
    where: { email: 'tutor@mateatletas.com' },
    update: { passwordHash: tutorPassword },
    create: {
      email: 'tutor@mateatletas.com',
      passwordHash: tutorPassword,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '1144556677',
      activo: true,
    },
  });
  console.log(`   ✅ Tutor: ${tutor.email} / Tutor123!\n`);

  // 6. Estudiante de prueba
  console.log('🧒 Creando Estudiante...');
  const estudiantePassword = await bcrypt.hash('Estudiante123!', 10);
  const estudiante = await prisma.estudiante.upsert({
    where: { id: 'ctest0estudiante00000001' },
    update: {},
    create: {
      id: 'ctest0estudiante00000001',
      nombre: 'Lucas',
      apellido: 'Pérez',
      fechaNacimiento: new Date('2018-05-15'),
      gradoActual: 2,
      tutorId: tutor.id,
      passwordHash: estudiantePassword,
      username: 'lucas_perez',
      activo: true,
    },
  });

  // Crear recursos del estudiante
  await prisma.recursosEstudiante.upsert({
    where: { estudianteId: estudiante.id },
    update: {},
    create: {
      estudianteId: estudiante.id,
      xpTotal: 0,
      nivelActual: 1,
      monedas: 100,
      gemas: 10,
    },
  });
  console.log(`   ✅ Estudiante: ${estudiante.username} / Estudiante123!\n`);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ SEED COMPLETADO\n');
  console.log('📋 Credenciales de acceso:');
  console.log('   Admin:      admin@mateatletas.com / Admin123!');
  console.log('   Docente:    docente@mateatletas.com / Docente123!');
  console.log('   Tutor:      tutor@mateatletas.com / Tutor123!');
  console.log('   Estudiante: lucas_perez / Estudiante123!');
  console.log('═══════════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
