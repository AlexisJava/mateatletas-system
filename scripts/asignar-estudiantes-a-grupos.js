const { PrismaClient } = require('../apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function asignarEstudiantesAGrupos() {
  try {
    console.log('🔄 Asignando estudiantes a grupos...\n');

    // Obtener todos los estudiantes
    const estudiantes = await prisma.estudiante.findMany({
      include: { tutor: true },
    });

    // Obtener grupos disponibles
    const grupos = await prisma.claseGrupo.findMany({
      where: { activo: true },
      orderBy: { codigo: 'asc' },
    });

    console.log(`📊 Estudiantes encontrados: ${estudiantes.length}`);
    console.log(`📊 Grupos disponibles: ${grupos.length}\n`);

    if (grupos.length === 0) {
      console.log('❌ No hay grupos disponibles. Primero crea grupos.');
      return;
    }

    // Asignar estudiantes a grupos según su edad
    const asignaciones = [];

    for (const estudiante of estudiantes) {
      // Verificar si ya está inscrito
      const yaInscrito = await prisma.inscripcionClaseGrupo.findFirst({
        where: {
          estudiante_id: estudiante.id,
          fecha_baja: null,
        },
      });

      if (yaInscrito) {
        console.log(`⏭️  ${estudiante.nombre} ${estudiante.apellido} ya tiene grupo asignado`);
        continue;
      }

      // Asignar según edad - usamos el grupo B1 para niños pequeños (edad <= 7)
      // B2 para edad 8-10, B3 para 11+
      let grupoAsignado;

      if (estudiante.edad <= 7) {
        grupoAsignado = grupos.find((g) => g.codigo === 'B1');
      } else if (estudiante.edad <= 10) {
        grupoAsignado = grupos.find((g) => g.codigo === 'B2');
      } else {
        grupoAsignado = grupos.find((g) => g.codigo === 'B3');
      }

      // Si no encontramos grupo específico, usar el primero disponible
      if (!grupoAsignado) {
        grupoAsignado = grupos[0];
      }

      // Crear inscripción
      const inscripcion = await prisma.inscripcionClaseGrupo.create({
        data: {
          estudiante_id: estudiante.id,
          clase_grupo_id: grupoAsignado.id,
          tutor_id: estudiante.tutor_id,
          fecha_inscripcion: new Date(),
        },
      });

      asignaciones.push({
        estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
        edad: estudiante.edad,
        grupo: `${grupoAsignado.codigo} - ${grupoAsignado.dia_semana} ${grupoAsignado.hora_inicio}`,
      });

      console.log(
        `✅ ${estudiante.nombre} ${estudiante.apellido} (${estudiante.edad} años) -> ${grupoAsignado.codigo} - ${grupoAsignado.dia_semana} ${grupoAsignado.hora_inicio}`,
      );
    }

    console.log(`\n✨ Total de asignaciones creadas: ${asignaciones.length}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarEstudiantesAGrupos();
