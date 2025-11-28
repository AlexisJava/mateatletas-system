import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpiarEstudiantesYTutores() {
  console.log('🧹 Iniciando limpieza de estudiantes y tutores...\n');

  try {
    // 1. Contar registros antes
    const countEstudiantes = await prisma.estudiante.count();
    const countTutores = await prisma.tutor.count();
    const countDocentes = await prisma.docente.count();

    console.log('📊 Estado ANTES de la limpieza:');
    console.log(`   - Estudiantes: ${countEstudiantes}`);
    console.log(`   - Tutores: ${countTutores}`);
    console.log(`   - Docentes: ${countDocentes}\n`);

    // 2. Eliminar asistencias a clases grupo
    console.log('🗑️  Eliminando asistencias a clases grupo...');
    const deleteAsistenciasClaseGrupo =
      await prisma.asistenciaClaseGrupo.deleteMany({});
    console.log(
      `   ✅ ${deleteAsistenciasClaseGrupo.count} asistencias eliminadas\n`,
    );

    // 3. Eliminar inscripciones a clases grupo
    console.log('🗑️  Eliminando inscripciones a clases grupo...');
    const deleteInscripcionesClaseGrupo =
      await prisma.inscripcionClaseGrupo.deleteMany({});
    console.log(
      `   ✅ ${deleteInscripcionesClaseGrupo.count} inscripciones eliminadas\n`,
    );

    // 4. Eliminar asistencias
    console.log('🗑️  Eliminando asistencias...');
    const deleteAsistencias = await prisma.asistencia.deleteMany({});
    console.log(`   ✅ ${deleteAsistencias.count} asistencias eliminadas\n`);

    // 5. Eliminar inscripciones a clases
    console.log('🗑️  Eliminando inscripciones a clases...');
    const deleteInscripcionesClase = await prisma.inscripcionClase.deleteMany(
      {},
    );
    console.log(
      `   ✅ ${deleteInscripcionesClase.count} inscripciones eliminadas\n`,
    );

    // 6. Eliminar inscripciones a cursos
    console.log('🗑️  Eliminando inscripciones a cursos...');
    const deleteInscripcionesCurso = await prisma.inscripcionCurso.deleteMany(
      {},
    );
    console.log(
      `   ✅ ${deleteInscripcionesCurso.count} inscripciones eliminadas\n`,
    );

    // 7. Eliminar alertas
    console.log('🗑️  Eliminando alertas...');
    const deleteAlertas = await prisma.alerta.deleteMany({});
    console.log(`   ✅ ${deleteAlertas.count} alertas eliminadas\n`);

    // 8. Eliminar todos los estudiantes
    console.log('🗑️  Eliminando TODOS los estudiantes...');
    const deleteEstudiantes = await prisma.estudiante.deleteMany({});
    console.log(`   ✅ ${deleteEstudiantes.count} estudiantes eliminados\n`);

    // 9. Eliminar membresías de tutores
    console.log('🗑️  Eliminando membresías...');
    const deleteMembresias = await prisma.membresia.deleteMany({});
    console.log(`   ✅ ${deleteMembresias.count} membresías eliminadas\n`);

    // 10. Eliminar todos los tutores
    console.log('🗑️  Eliminando TODOS los tutores...');
    const deleteTutores = await prisma.tutor.deleteMany({});
    console.log(`   ✅ ${deleteTutores.count} tutores eliminados\n`);

    // 11. Verificar estado final
    const finalEstudiantes = await prisma.estudiante.count();
    const finalTutores = await prisma.tutor.count();
    const finalDocentes = await prisma.docente.count();

    console.log('📊 Estado DESPUÉS de la limpieza:');
    console.log(`   - Estudiantes: ${finalEstudiantes}`);
    console.log(`   - Tutores: ${finalTutores}`);
    console.log(`   - Docentes: ${finalDocentes}\n`);

    console.log('✅ LIMPIEZA COMPLETADA EXITOSAMENTE\n');
    console.log('🎯 Los docentes se mantuvieron intactos');
    console.log('🎯 Todos los estudiantes y tutores fueron eliminados');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

limpiarEstudiantesYTutores();
