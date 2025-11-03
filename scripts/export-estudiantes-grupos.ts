import { PrismaClient } from '../apps/api/node_modules/@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportarEstudiantesConGrupos() {
  try {
    console.log('Obteniendo estudiantes con sus grupos...');

    const estudiantes = await prisma.estudiante.findMany({
      include: {
        inscripciones_clase_grupo: {
          where: {
            fecha_baja: null, // Solo inscripciones activas
          },
          include: {
            claseGrupo: true,
          },
        },
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
    });

    // Transformar los datos al formato solicitado
    const resultado = estudiantes.map(estudiante => ({
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      grupos: estudiante.inscripciones_clase_grupo.map(inscripcion => ({
        nombre: inscripcion.claseGrupo.nombre,
        codigo: inscripcion.claseGrupo.codigo,
        dia: inscripcion.claseGrupo.dia_semana,
        hora_inicio: inscripcion.claseGrupo.hora_inicio,
        hora_fin: inscripcion.claseGrupo.hora_fin,
      })),
    }));

    // Filtrar estudiantes sin grupos si es necesario
    const estudiantesConGrupos = resultado.filter(e => e.grupos.length > 0);

    console.log(`Total de estudiantes: ${resultado.length}`);
    console.log(`Estudiantes con grupos activos: ${estudiantesConGrupos.length}`);

    // Guardar el JSON
    const outputPath = path.join(__dirname, 'estudiantes-grupos.json');
    fs.writeFileSync(outputPath, JSON.stringify(estudiantesConGrupos, null, 2), 'utf-8');

    console.log(`✓ Archivo generado: ${outputPath}`);
    console.log(`Total de estudiantes exportados: ${estudiantesConGrupos.length}`);

    // Mostrar resumen de grupos
    const totalInscripciones = estudiantesConGrupos.reduce((acc, e) => acc + e.grupos.length, 0);
    console.log(`Total de inscripciones a grupos: ${totalInscripciones}`);

  } catch (error) {
    console.error('Error al exportar estudiantes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportarEstudiantesConGrupos();
