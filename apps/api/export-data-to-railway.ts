import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  console.log('🔄 Exportando datos de la base de datos local...\n');

  try {
    // Exportar en orden de dependencias (padres primero)
    const data = {
      // 1. Usuarios (no tienen dependencias)
      admins: await prisma.admin.findMany(),
      tutores: await prisma.tutor.findMany(),
      docentes: await prisma.docente.findMany(),

      // 2. Estructuras académicas
      sectores: await prisma.sector.findMany(),
      equipos: await prisma.equipo.findMany(),
      grupos: await prisma.grupo.findMany(),
      rutasCurriculares: await prisma.rutaCurricular.findMany(),

      // 3. Estudiantes (dependen de tutores, equipos, sectores)
      estudiantes: await prisma.estudiante.findMany(),
      estudiantesSectores: await prisma.estudianteSector.findMany(),

      // 4. Productos
      productos: await prisma.producto.findMany(),

      // 5. Inscripciones (dependen de estudiantes y productos)
      membresias: await prisma.membresia.findMany(),
      inscripcionesCurso: await prisma.inscripcionCurso.findMany(),
      inscripcionesMensuales: await prisma.inscripcionMensual.findMany(),

      // 6. Clases y Grupos de Clases
      claseGrupos: await prisma.claseGrupo.findMany(),
      clases: await prisma.clase.findMany(),
      inscripcionesClaseGrupo: await prisma.inscripcionClaseGrupo.findMany(),
      inscripcionesClase: await prisma.inscripcionClase.findMany(),

      // 7. Asistencias
      asistencias: await prisma.asistencia.findMany(),

      // 8. Gamificación (LogroCurso y LogroDesbloqueado eliminados en refactor 2026)
      puntosObtenidos: await prisma.puntoObtenido.findMany(),
      accionesPuntuables: await prisma.accionPuntuable.findMany(),

      // 9. Alertas y Notificaciones
      alertas: await prisma.alerta.findMany(),
      notificaciones: await prisma.notificacion.findMany(),

      // 10. Eventos y Tareas
      eventos: await prisma.evento.findMany(),
      tareas: await prisma.tarea.findMany(),
      notas: await prisma.nota.findMany(),
    };

    // Contar registros
    console.log('📊 Resumen de datos exportados:');
    console.log('================================');
    Object.entries(data).forEach(([tabla, registros]) => {
      const count = Array.isArray(registros) ? registros.length : 0;
      if (count > 0) {
        console.log(`✓ ${tabla.padEnd(30)} ${count.toString().padStart(5)} registros`);
      }
    });
    console.log('================================\n');

    // Guardar en archivo JSON
    const outputPath = path.join(__dirname, 'exported-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`✅ Datos exportados exitosamente a: ${outputPath}`);
    console.log(`📦 Tamaño del archivo: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);

    return data;
  } catch (error) {
    console.error('❌ Error al exportar datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportData()
  .then(() => {
    console.log('🎉 Exportación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
