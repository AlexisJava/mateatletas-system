import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importData() {
  console.log('🚀 Importando datos a Railway...\n');

  try {
    // Leer archivo exportado
    const dataPath = path.join(__dirname, 'exported-data.json');

    if (!fs.existsSync(dataPath)) {
      throw new Error(`❌ Archivo no encontrado: ${dataPath}`);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    console.log('📦 Datos cargados desde archivo\n');

    // Importar en orden de dependencias
    const importOrder = [
      // 1. Usuarios (sin dependencias)
      { name: 'admins', data: data.admins },
      { name: 'tutores', data: data.tutores },
      { name: 'docentes', data: data.docentes },

      // 2. Estructuras académicas
      { name: 'sectores', data: data.sectores },
      { name: 'equipos', data: data.equipos },
      { name: 'grupos', data: data.grupos },
      { name: 'rutasCurriculares', data: data.rutasCurriculares },

      // 3. Estudiantes
      { name: 'estudiantes', data: data.estudiantes },
      { name: 'estudiantesSectores', data: data.estudiantesSectores },

      // 4. Productos
      { name: 'productos', data: data.productos },

      // 5. Inscripciones
      { name: 'membresias', data: data.membresias },
      { name: 'inscripcionesCurso', data: data.inscripcionesCurso },
      { name: 'inscripcionesMensuales', data: data.inscripcionesMensuales },

      // 6. Clases
      { name: 'claseGrupos', data: data.claseGrupos },
      { name: 'clases', data: data.clases },
      { name: 'inscripcionesClaseGrupo', data: data.inscripcionesClaseGrupo },
      { name: 'inscripcionesClase', data: data.inscripcionesClase },

      // 7. Asistencias
      { name: 'asistencias', data: data.asistencias },

      // 8. Gamificación (LogroCurso y LogroDesbloqueado eliminados en refactor 2026)
      { name: 'puntosObtenidos', data: data.puntosObtenidos },
      { name: 'accionesPuntuables', data: data.accionesPuntuables },

      // 9. Alertas
      { name: 'alertas', data: data.alertas },
      { name: 'notificaciones', data: data.notificaciones },

      // 10. Eventos
      { name: 'eventos', data: data.eventos },
      { name: 'tareas', data: data.tareas },
      { name: 'notas', data: data.notas },
    ];

    console.log('📊 Iniciando importación...\n');

    for (const { name, data: records } of importOrder) {
      if (!records || records.length === 0) {
        console.log(`⏭️  ${name.padEnd(30)} 0 registros (saltado)`);
        continue;
      }

      try {
        // Mapear nombre de tabla
        const tableMap: Record<string, string> = {
          admins: 'admin',
          tutores: 'tutor',
          docentes: 'docente',
          sectores: 'sector',
          equipos: 'equipo',
          grupos: 'grupo',
          rutasCurriculares: 'rutaCurricular',
          estudiantes: 'estudiante',
          estudiantesSectores: 'estudianteSector',
          productos: 'producto',
          membresias: 'membresia',
          inscripcionesCurso: 'inscripcionCurso',
          inscripcionesMensuales: 'inscripcionMensual',
          claseGrupos: 'claseGrupo',
          clases: 'clase',
          inscripcionesClaseGrupo: 'inscripcionClaseGrupo',
          inscripcionesClase: 'inscripcionClase',
          asistencias: 'asistencia',
          puntosObtenidos: 'puntoObtenido',
          accionesPuntuables: 'accionPuntuable',
          alertas: 'alerta',
          notificaciones: 'notificacion',
          eventos: 'evento',
          tareas: 'tarea',
          notas: 'nota',
        };

        const tableName = tableMap[name];
        if (!tableName) {
          console.log(`⚠️  ${name.padEnd(30)} No mapeado (saltado)`);
          continue;
        }

        // @ts-ignore - dynamic table access
        const model = prisma[tableName];

        if (!model) {
          console.log(`⚠️  ${name.padEnd(30)} Modelo no existe (saltado)`);
          continue;
        }

        // Insertar registros uno por uno (más lento pero más seguro)
        let inserted = 0;
        for (const record of records) {
          try {
            await model.create({ data: record });
            inserted++;
          } catch (error: any) {
            console.log(`   ⚠️  Error en registro de ${name}: ${error.message}`);
          }
        }

        console.log(`✅ ${name.padEnd(30)} ${inserted}/${records.length} registros importados`);
      } catch (error: any) {
        console.log(`❌ ${name.padEnd(30)} Error: ${error.message}`);
      }
    }

    console.log('\n================================');
    console.log('✅ Importación completada');
    console.log('================================\n');

  } catch (error) {
    console.error('\n❌ Error fatal al importar datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData()
  .then(() => {
    console.log('🎉 Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
