const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  console.log('\n=== AUDITORÍA REGISTRO/ONBOARDING ===\n');

  // 1. Tutores
  const tutores = await prisma.tutor.findMany({
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      username: true,
      ha_completado_onboarding: true,
      fecha_registro: true,
      _count: {
        select: { estudiantes: true },
      },
    },
  });

  console.log('=== TUTORES ===');
  console.log('Total: ' + tutores.length);
  tutores.forEach(function (t) {
    console.log('  - ' + t.nombre + ' ' + t.apellido);
    console.log('    Email: ' + (t.email || 'NO TIENE'));
    console.log('    Username: ' + (t.username || 'NO TIENE'));
    console.log(
      '    Onboarding: ' +
        (t.ha_completado_onboarding ? 'COMPLETADO' : 'PENDIENTE'),
    );
    console.log('    Fecha registro: ' + (t.fecha_registro || 'NO TIENE'));
    console.log('    Hijos: ' + t._count.estudiantes);
    console.log('');
  });

  // 2. Estudiantes
  const estudiantes = await prisma.estudiante.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      username: true,
      edad: true,
      nivelEscolar: true,
      casaId: true,
      tutor_id: true,
      sector_id: true,
      password_hash: true,
      tutor: {
        select: { nombre: true, apellido: true, email: true },
      },
      casa: {
        select: { nombre: true, tipo: true },
      },
      sector: {
        select: { nombre: true },
      },
    },
  });

  console.log('\n=== ESTUDIANTES ===');
  console.log('Total: ' + estudiantes.length);
  estudiantes.forEach(function (e) {
    console.log(
      '  - ' + e.nombre + ' ' + e.apellido + ' (' + e.edad + ' años)',
    );
    console.log('    Username: ' + (e.username || 'NO TIENE'));
    console.log(
      '    Password: ' + (e.password_hash ? 'TIENE HASH' : 'SIN PASSWORD'),
    );
    console.log('    Nivel: ' + e.nivelEscolar);
    var casaInfo = e.casa
      ? e.casa.nombre + ' (' + e.casa.tipo + ')'
      : 'SIN ASIGNAR';
    console.log('    Casa: ' + casaInfo);
    console.log('    Sector: ' + (e.sector ? e.sector.nombre : 'SIN SECTOR'));
    var tutorInfo = e.tutor
      ? e.tutor.nombre + ' ' + e.tutor.apellido + ' (' + e.tutor.email + ')'
      : 'SIN TUTOR';
    console.log('    Tutor: ' + tutorInfo);
    console.log('');
  });

  // 3. Casas
  const casas = await prisma.casa.findMany({
    select: {
      id: true,
      tipo: true,
      nombre: true,
      edadMinima: true,
      edadMaxima: true,
      _count: {
        select: { estudiantes: true },
      },
    },
  });

  console.log('\n=== CASAS ===');
  console.log('Total: ' + casas.length);
  casas.forEach(function (c) {
    console.log(
      '  - ' +
        c.nombre +
        ' (' +
        c.tipo +
        '): edad ' +
        c.edadMinima +
        '-' +
        c.edadMaxima +
        ', ' +
        c._count.estudiantes +
        ' estudiantes',
    );
  });

  // 4. Sectores
  const sectores = await prisma.sector.findMany({
    select: {
      id: true,
      nombre: true,
      _count: {
        select: { estudiantes: true },
      },
    },
  });

  console.log('\n=== SECTORES ===');
  console.log('Total: ' + sectores.length);
  sectores.forEach(function (s) {
    console.log(
      '  - ' + s.nombre + ': ' + s._count.estudiantes + ' estudiantes',
    );
  });

  // 5. Estadísticas resumen
  console.log('\n=== RESUMEN ===');
  var onboardingCompleto = tutores.filter(function (t) {
    return t.ha_completado_onboarding;
  }).length;
  var sinEmail = tutores.filter(function (t) {
    return !t.email;
  }).length;
  var sinUsername = estudiantes.filter(function (e) {
    return !e.username;
  }).length;
  var sinPassword = estudiantes.filter(function (e) {
    return !e.password_hash;
  }).length;
  var sinCasa = estudiantes.filter(function (e) {
    return !e.casaId;
  }).length;
  var sinTutor = estudiantes.filter(function (e) {
    return !e.tutor_id;
  }).length;
  var sinSector = estudiantes.filter(function (e) {
    return !e.sector_id;
  }).length;

  console.log(
    'Tutores con onboarding completo: ' +
      onboardingCompleto +
      '/' +
      tutores.length,
  );
  console.log('Tutores sin email: ' + sinEmail);
  console.log('Estudiantes sin username: ' + sinUsername);
  console.log('Estudiantes sin password: ' + sinPassword);
  console.log('Estudiantes sin casa: ' + sinCasa);
  console.log('Estudiantes sin tutor: ' + sinTutor);
  console.log('Estudiantes sin sector: ' + sinSector);

  await prisma.$disconnect();
}

audit().catch(console.error);
