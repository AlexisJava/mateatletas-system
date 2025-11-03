const { PrismaClient } = require('../apps/api/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function verificarTodasRelaciones() {
  try {
    console.log('=== VERIFICANDO TODAS LAS TABLAS Y RELACIONES ===\n');

    // Verificar tabla Grupo (la vieja)
    try {
      const totalGruposViejos = await prisma.grupo.count();
      console.log(`Total Grupos (modelo viejo): ${totalGruposViejos}`);
      if (totalGruposViejos > 0) {
        const muestraGrupos = await prisma.grupo.findMany({ take: 3 });
        console.log('Muestra de Grupos viejos:');
        muestraGrupos.forEach(g => console.log(`  - ${g.codigo}: ${g.nombre}`));
      }
    } catch (e) {
      console.log('No existe tabla Grupo o error:', e.message);
    }

    console.log();

    // Verificar ClaseGrupo (la nueva)
    const totalClaseGrupos = await prisma.claseGrupo.count();
    console.log(`Total ClaseGrupo (modelo nuevo): ${totalClaseGrupos}`);
    if (totalClaseGrupos > 0) {
      const muestraClaseGrupos = await prisma.claseGrupo.findMany({ take: 5 });
      console.log('Muestra de ClaseGrupos:');
      muestraClaseGrupos.forEach(g => {
        console.log(`  - ${g.codigo}: ${g.nombre} (${g.dia_semana} ${g.hora_inicio})`);
      });
    }

    console.log();

    // Verificar estudiantes
    const totalEstudiantes = await prisma.estudiante.count();
    console.log(`Total Estudiantes: ${totalEstudiantes}`);

    if (totalEstudiantes > 0) {
      const estudiante = await prisma.estudiante.findFirst();
      console.log('Campos del estudiante:');
      console.log(JSON.stringify(estudiante, null, 2));
    }

    console.log();

    // Verificar si hay campo grupo_id o similar en estudiante
    console.log('=== BUSCANDO OTRAS POSIBLES RELACIONES ===');

    // Verificar inscripciones_clase_grupo
    const totalInscGrupos = await prisma.inscripcionClaseGrupo.count();
    console.log(`InscripcionClaseGrupo: ${totalInscGrupos}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTodasRelaciones();
