const { PrismaClient } = require('../apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function verificarDatos() {
  try {
    const totalEstudiantes = await prisma.estudiante.count();
    const totalGrupos = await prisma.claseGrupo.count();
    const totalInscripciones = await prisma.inscripcionClaseGrupo.count();
    const inscripcionesActivas = await prisma.inscripcionClaseGrupo.count({
      where: { fecha_baja: null }
    });
    const inscripcionesConBaja = await prisma.inscripcionClaseGrupo.count({
      where: { fecha_baja: { not: null } }
    });

    console.log('=== RESUMEN DE DATOS ===');
    console.log(`Total estudiantes: ${totalEstudiantes}`);
    console.log(`Total grupos (ClaseGrupo): ${totalGrupos}`);
    console.log(`Total inscripciones: ${totalInscripciones}`);
    console.log(`  - Activas (sin fecha_baja): ${inscripcionesActivas}`);
    console.log(`  - Con baja: ${inscripcionesConBaja}`);

    // Mostrar algunas inscripciones de muestra
    if (totalInscripciones > 0) {
      console.log('\n=== MUESTRA DE INSCRIPCIONES ===');
      const muestraInscripciones = await prisma.inscripcionClaseGrupo.findMany({
        take: 5,
        include: {
          estudiante: { select: { nombre: true, apellido: true } },
          claseGrupo: { select: { nombre: true, codigo: true, dia_semana: true, hora_inicio: true } },
        },
      });

      muestraInscripciones.forEach(i => {
        console.log(`- ${i.estudiante.nombre} ${i.estudiante.apellido} -> ${i.claseGrupo.nombre} (${i.claseGrupo.dia_semana} ${i.claseGrupo.hora_inicio})`);
        console.log(`  fecha_baja: ${i.fecha_baja || 'null (activa)'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDatos();
