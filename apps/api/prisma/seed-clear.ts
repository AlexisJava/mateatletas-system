import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para LIMPIAR COMPLETAMENTE la base de datos
 * ⚠️  CUIDADO: Esto elimina TODOS los datos existentes
 */
async function clearDatabase() {
  console.log('🗑️  LIMPIANDO BASE DE DATOS...\n');
  console.log('⚠️  Esta operación eliminará TODOS los datos actuales\n');

  try {
    // Orden de eliminación: de hijos a padres (respetando foreign keys)

    console.log('📊 Eliminando progreso de lecciones...');
    await prisma.progresoLeccion.deleteMany({});

    console.log('🏆 Eliminando logros desbloqueados...');
    await prisma.logroDesbloqueado.deleteMany({});

    console.log('⭐ Eliminando puntos obtenidos...');
    await prisma.puntoObtenido.deleteMany({});

    console.log('📚 Eliminando lecciones...');
    await prisma.leccion.deleteMany({});

    console.log('📦 Eliminando módulos...');
    await prisma.modulo.deleteMany({});

    console.log('🚨 Eliminando alertas...');
    await prisma.alerta.deleteMany({});

    console.log('📝 Eliminando asistencias...');
    await prisma.asistencia.deleteMany({});

    console.log('🎫 Eliminando inscripciones a clases...');
    await prisma.inscripcionClase.deleteMany({});

    console.log('📅 Eliminando clases...');
    await prisma.clase.deleteMany({});

    console.log('🎓 Eliminando inscripciones a cursos...');
    await prisma.inscripcionCurso.deleteMany({});

    console.log('💰 Eliminando membresías...');
    await prisma.membresia.deleteMany({});

    console.log('👨‍🎓 Eliminando estudiantes...');
    await prisma.estudiante.deleteMany({});

    console.log('👨‍🏫 Eliminando docentes...');
    await prisma.docente.deleteMany({});

    console.log('👨‍👩‍👧 Eliminando tutores...');
    await prisma.tutor.deleteMany({});

    console.log('👑 Eliminando admins...');
    await prisma.admin.deleteMany({});

    console.log('🛡️  Eliminando equipos...');
    await prisma.equipo.deleteMany({});

    console.log('🧭 Eliminando rutas curriculares...');
    await prisma.rutaCurricular.deleteMany({});

    console.log('🛒 Eliminando productos...');
    await prisma.producto.deleteMany({});

    console.log('🎯 Eliminando acciones puntuables...');
    await prisma.accionPuntuable.deleteMany({});

    console.log('🏅 Eliminando logros...');
    await prisma.logro.deleteMany({});


    console.log('\n✅ Base de datos limpiada exitosamente!');
    console.log('📊 Todos los datos han sido eliminados\n');

  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
    throw error;
  }
}

// Ejecutar
clearDatabase()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
