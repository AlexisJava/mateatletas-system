import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para eliminar estudiantes de prueba
 *
 * IDENTIFICACIÓN DE ESTUDIANTES DE PRUEBA:
 * - Nombres genéricos: Juan, Pepe, Emma (con apellidos repetidos o genéricos)
 * - Creados recientemente (hoy)
 * - O todos los estudiantes si quieres resetear completamente
 *
 * USO:
 * npx tsx prisma/delete-test-students.ts
 */

async function main() {
  console.log('🗑️  Iniciando limpieza de estudiantes de prueba...\n');

  // Opción 1: Listar todos los estudiantes primero
  const todosLosEstudiantes = await prisma.estudiante.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      createdAt: true,
      tutor: {
        select: {
          nombre: true,
          apellido: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`📋 Total de estudiantes en la base de datos: ${todosLosEstudiantes.length}\n`);

  if (todosLosEstudiantes.length === 0) {
    console.log('✅ No hay estudiantes para eliminar.');
    return;
  }

  // Mostrar lista
  console.log('Lista de estudiantes:');
  todosLosEstudiantes.forEach((est, index) => {
    console.log(
      `  ${index + 1}. ${est.nombre} ${est.apellido} (Tutor: ${est.tutor.nombre} ${est.tutor.apellido}) - Creado: ${est.createdAt.toLocaleString()}`
    );
  });

  console.log('\n⚠️  OPCIONES DE LIMPIEZA:\n');
  console.log('  1️⃣  Eliminar TODOS los estudiantes');
  console.log('  2️⃣  Eliminar estudiantes creados HOY');
  console.log('  3️⃣  Eliminar estudiantes de prueba (nombres: Juan, Pepe, Emma, etc.)');
  console.log('\n🔧 Modifica este script y descomenta la opción que quieras usar.\n');

  // ==========================================
  // OPCIÓN 1: ELIMINAR TODOS LOS ESTUDIANTES
  // ==========================================
  // DESCOMENTAR LA SIGUIENTE LÍNEA PARA ELIMINAR TODOS:
  // await eliminarTodos();

  // ==========================================
  // OPCIÓN 2: ELIMINAR ESTUDIANTES DE HOY
  // ==========================================
  // DESCOMENTAR LA SIGUIENTE LÍNEA:
  // await eliminarDeHoy();

  // ==========================================
  // OPCIÓN 3: ELIMINAR POR NOMBRES ESPECÍFICOS
  // ==========================================
  // DESCOMENTAR Y MODIFICAR LA LISTA:
  // await eliminarPorNombres(['Juan', 'Pepe', 'Emma', 'asdifnasodfin']);

  // ==========================================
  // OPCIÓN 4: ELIMINAR ESTUDIANTES SIN SECTOR (PREINSCRIPTOS)
  // ==========================================
  await eliminarSinSector();
}

async function eliminarTodos() {
  console.log('❌ Eliminando TODOS los estudiantes...\n');

  const deleted = await prisma.estudiante.deleteMany({});

  console.log(`✅ Eliminados ${deleted.count} estudiantes.`);
  console.log('⚠️  Los tutores sin estudiantes permanecen en la base de datos.');
}

async function eliminarDeHoy() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  console.log(`🗓️  Eliminando estudiantes creados desde: ${hoy.toLocaleString()}\n`);

  const deleted = await prisma.estudiante.deleteMany({
    where: {
      createdAt: {
        gte: hoy,
      },
    },
  });

  console.log(`✅ Eliminados ${deleted.count} estudiantes creados hoy.`);
}

async function eliminarPorNombres(nombres: string[]) {
  console.log(`🎯 Eliminando estudiantes con nombres: ${nombres.join(', ')}\n`);

  const deleted = await prisma.estudiante.deleteMany({
    where: {
      nombre: {
        in: nombres,
      },
    },
  });

  console.log(`✅ Eliminados ${deleted.count} estudiantes.`);
}

async function eliminarSinSector() {
  console.log('📝 Eliminando estudiantes SIN SECTOR (Preinscriptos)...\n');

  const deleted = await prisma.estudiante.deleteMany({
    where: {
      sector_id: null,
    },
  });

  console.log(`✅ Eliminados ${deleted.count} estudiantes sin sector.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
