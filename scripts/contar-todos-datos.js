const { PrismaClient } = require('../apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function contarTodosDatos() {
  try {
    console.log('=== CONTEO COMPLETO DE DATOS ===\n');

    const counts = {
      estudiantes: await prisma.estudiante.count(),
      tutores: await prisma.tutor.count(),
      docentes: await prisma.docente.count(),
      grupos: await prisma.grupo.count(),
      claseGrupos: await prisma.claseGrupo.count(),
      inscripcionesClaseGrupo: await prisma.inscripcionClaseGrupo.count(),
      clases: await prisma.clase.count(),
      inscripcionesClase: await prisma.inscripcionClase.count(),
      sectores: await prisma.sector.count(),
      estudianteSectores: await prisma.estudianteSector.count(),
    };

    console.log('Conteo de registros por tabla:');
    Object.entries(counts).forEach(([tabla, count]) => {
      console.log(`  ${tabla.padEnd(30)} ${count}`);
    });

    console.log('\n=== MUESTRAS DE DATOS ===\n');

    // Ver todos los estudiantes
    if (counts.estudiantes > 0) {
      const estudiantes = await prisma.estudiante.findMany({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          username: true,
        }
      });
      console.log('ESTUDIANTES:');
      estudiantes.forEach(e => console.log(`  - ${e.nombre} ${e.apellido} (${e.username})`));
    }

    // Ver inscripciones
    if (counts.inscripcionesClaseGrupo > 0) {
      console.log('\nINSCRIPCIONES A CLASE GRUPO:');
      const inscripciones = await prisma.inscripcionClaseGrupo.findMany({
        include: {
          estudiante: { select: { nombre: true, apellido: true } },
          claseGrupo: { select: { nombre: true, codigo: true } },
        },
        take: 10,
      });
      inscripciones.forEach(i => {
        console.log(`  - ${i.estudiante.nombre} ${i.estudiante.apellido} -> ${i.claseGrupo.nombre}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

contarTodosDatos();
