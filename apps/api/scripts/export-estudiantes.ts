import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function exportEstudiantes() {
  try {
    // Obtener todos los grupos con sus estudiantes activos
    const grupos = await prisma.claseGrupo.findMany({
      select: {
        id: true,
        nombre: true,
        inscripciones: {
          where: {
            estado: 'activa',
          },
          select: {
            estudiante: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Formatear los datos por grupo
    const estudiantesPorGrupo = grupos.map((grupo) => ({
      grupo: grupo.nombre,
      estudiantes: grupo.inscripciones
        .map((insc) => ({
          nombre: insc.estudiante.nombre,
          apellido: insc.estudiante.apellido,
        }))
        .sort((a, b) => a.apellido.localeCompare(b.apellido)),
    }));

    const outputPath = join(process.cwd(), 'estudiantes-por-grupo.json');
    writeFileSync(outputPath, JSON.stringify(estudiantesPorGrupo, null, 2), 'utf-8');

    const totalEstudiantes = estudiantesPorGrupo.reduce(
      (sum, g) => sum + g.estudiantes.length,
      0
    );

    console.log(`✅ Exportados ${totalEstudiantes} estudiantes en ${grupos.length} grupos`);
    console.log(`📁 Archivo: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error al exportar estudiantes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportEstudiantes();
