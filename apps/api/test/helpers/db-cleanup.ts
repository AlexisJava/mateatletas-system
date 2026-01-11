/**
 * ============================================================================
 * DB CLEANUP - Funciones de Limpieza de Base de Datos
 * ============================================================================
 *
 * Funciones para limpiar tablas entre tests de integración.
 * Respeta el orden de foreign keys.
 */

import { PrismaService } from '../../src/core/database/prisma.service';

// ============================================================================
// LIMPIEZA DE GAMIFICACIÓN
// ============================================================================

/**
 * Limpia las tablas de gamificación en orden correcto
 * para respetar foreign keys
 */
export async function cleanGamificationTables(prisma: PrismaService) {
  // Primero tablas hijas, luego padres
  // NOTA: NO borrar prisma.logro - son datos de configuración/seed, no datos de test

  await prisma.transaccionRecurso.deleteMany({});
  await prisma.puntoObtenido.deleteMany({});
  await prisma.logroEstudiante.deleteMany({});
  await prisma.recursosEstudiante.deleteMany({});
  await prisma.rachaEstudiante.deleteMany({});
  await prisma.progresoContenido.deleteMany({});
  await prisma.nodoContenido.deleteMany({});

  // Planificaciones (tienen FK a contenido vía teoria_id/practica_id)
  await prisma.estadoClaseGrupo.deleteMany({});
  await prisma.asignacionPlanificacion.deleteMany({});
  await prisma.clasePlanificacion.deleteMany({});
  await prisma.planificacion.deleteMany({});

  // Ahora sí se puede borrar contenido
  await prisma.contenido.deleteMany({});
}

// ============================================================================
// LIMPIEZA DE ESTUDIANTES
// ============================================================================

/**
 * Limpia estudiantes, tutores y sus datos relacionados
 */
export async function cleanEstudiantes(prisma: PrismaService) {
  await cleanGamificationTables(prisma);
  await prisma.estudiante.deleteMany({});
  await prisma.tutor.deleteMany({});
}

// ============================================================================
// LIMPIEZA COMPLETA
// ============================================================================

/**
 * Limpieza completa de todas las tablas relevantes para tests
 * Orden: hijos primero, padres después
 */
export async function cleanAllTestTables(prisma: PrismaService) {
  // Seguridad - Limpiar intentos de login para evitar bloqueos entre tests
  await prisma.loginAttempt.deleteMany({});

  // Activity Feed
  await prisma.reaccionFeed.deleteMany({});
  await prisma.actividadFeed.deleteMany({});

  // Progreso y tareas
  await prisma.progresoTareaEstudiante.deleteMany({});
  await prisma.progresoClaseEstudiante.deleteMany({});

  // Inscripciones
  await prisma.inscripcionComision.deleteMany({});
  await prisma.inscripcionClaseGrupo.deleteMany({});

  // Asistencias
  await prisma.asistenciaClaseGrupo.deleteMany({});
  await prisma.asistenciaLive.deleteMany({});

  // Gamificación
  await cleanGamificationTables(prisma);

  // Suscripciones
  await prisma.pagoSuscripcion.deleteMany({});
  await prisma.historialEstadoSuscripcion.deleteMany({});
  await prisma.suscripcion.deleteMany({});

  // Comisiones y ClaseGrupos
  await prisma.comision.deleteMany({});
  await prisma.claseGrupo.deleteMany({});

  // Clases individuales (necesita borrar inscripciones primero)
  await prisma.inscripcionClase.deleteMany({});
  await prisma.clase.deleteMany({});

  // Grupos Pedagógicos (Sistema Casa/Mundo 2026 - renombrado de Grupo)
  await prisma.grupoPedagogico.deleteMany({});

  // Inscripciones Mensuales (tienen FK a producto, tutor, estudiante)
  await prisma.inscripcionMensual.deleteMany({});

  // Productos y Planes
  await prisma.producto.deleteMany({});
  await prisma.planSuscripcion.deleteMany({});

  // Sistema Casa/Mundo 2026 - Asignaciones docente
  await prisma.docenteCasa.deleteMany({});
  await prisma.docenteMundo.deleteMany({});

  // Usuarios
  await prisma.estudiante.deleteMany({});
  await prisma.tutor.deleteMany({});
  await prisma.docente.deleteMany({});
  await prisma.admin.deleteMany({});
}
