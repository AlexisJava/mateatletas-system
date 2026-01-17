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

  // NOTA: Planificaciones se limpian en cleanAllTestTables() para evitar
  // conflictos de orden con ClaseGrupo y sus dependencias

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
 * Orden: hijos primero, padres después (respetando FKs)
 *
 * IMPORTANTE: El orden de borrado debe respetar las foreign keys.
 * Actualizado para Sistema Casa/Mundo 2026 (commit 98b1ed2b)
 */
export async function cleanAllTestTables(prisma: PrismaService) {
  // Seguridad - Limpiar intentos de login para evitar bloqueos entre tests
  await prisma.loginAttempt.deleteMany({});

  // Activity Feed
  await prisma.reaccionFeed.deleteMany({});
  await prisma.actividadFeed.deleteMany({});

  // ============================================================================
  // SISTEMA DE PLANIFICACIONES (orden crítico por FKs)
  // TareaAsignada → AsignacionPlanificacion → ClaseGrupo
  // EstadoClaseGrupo → AsignacionPlanificacion → ClaseGrupo
  // ============================================================================

  // 1. Progreso de tareas (FK → TareaAsignada)
  await prisma.progresoTareaEstudiante.deleteMany({});

  // 2. Tareas asignadas (FK → AsignacionPlanificacion)
  await prisma.tareaAsignada.deleteMany({});

  // 3. Estados de clase grupo (FK → AsignacionPlanificacion)
  await prisma.estadoClaseGrupo.deleteMany({});

  // 4. Progreso de clases estudiante
  await prisma.progresoClaseEstudiante.deleteMany({});

  // 5. Asignaciones de planificación (FK → ClaseGrupo, Planificacion, Docente)
  await prisma.asignacionPlanificacion.deleteMany({});

  // 6. Clases de planificación (FK → Planificacion)
  await prisma.clasePlanificacion.deleteMany({});

  // 7. Planificaciones
  await prisma.planificacion.deleteMany({});

  // ============================================================================
  // SISTEMA DE OBSERVACIONES (orden crítico por FKs)
  // SeguimientoObservacion → Observacion
  // ObservacionEstudiante → Observacion, Estudiante
  // ============================================================================
  await prisma.seguimientoObservacion.deleteMany({});
  await prisma.observacionEstudiante.deleteMany({});
  await prisma.observacion.deleteMany({});

  // ============================================================================
  // INSCRIPCIONES Y ASISTENCIAS (FK → ClaseGrupo)
  // Deben borrarse ANTES de ClaseGrupo
  // ============================================================================
  await prisma.inscripcionComision.deleteMany({});
  await prisma.asistenciaComision.deleteMany({});
  await prisma.inscripcionClaseGrupo.deleteMany({});
  await prisma.asistenciaClaseGrupo.deleteMany({});
  await prisma.asistenciaLive.deleteMany({});

  // ============================================================================
  // GAMIFICACIÓN (sin dependencias a ClaseGrupo)
  // ============================================================================
  await cleanGamificationTables(prisma);

  // ============================================================================
  // SUSCRIPCIONES
  // ============================================================================
  await prisma.pagoSuscripcion.deleteMany({});
  await prisma.historialEstadoSuscripcion.deleteMany({});
  await prisma.suscripcion.deleteMany({});

  // ============================================================================
  // SUSCRIPCIONES FAMILIARES 2026 (Sistema nuevo)
  // Orden crítico: CambioInscripcion → InscripcionActividad → SuscripcionFamiliar
  // Debe ir ANTES de: Comision, ClaseGrupo, Producto, Estudiante, Tutor
  // ============================================================================
  await prisma.cambioInscripcion.deleteMany({});
  await prisma.inscripcionActividad.deleteMany({});
  await prisma.suscripcionFamiliar.deleteMany({});

  // ============================================================================
  // COMISIONES Y CLASE GRUPOS (ahora sin hijos)
  // ============================================================================
  await prisma.comision.deleteMany({});
  await prisma.claseGrupo.deleteMany({});

  // Clases individuales (necesita borrar inscripciones primero)
  await prisma.inscripcionClase.deleteMany({});
  await prisma.clase.deleteMany({});

  // Grupos Pedagógicos (Sistema Casa/Mundo 2026 - renombrado de Grupo)
  await prisma.grupoPedagogico.deleteMany({});

  // Inscripciones Mensuales (tienen FK a producto, tutor, estudiante)
  await prisma.inscripcionMensual.deleteMany({});

  // Webhooks (DLQ y procesados)
  await prisma.webhookFailed.deleteMany({});
  await prisma.webhookProcessed.deleteMany({});

  // Productos y Planes
  await prisma.producto.deleteMany({});
  await prisma.planSuscripcion.deleteMany({});

  // Sistema Casa/Mundo 2026 - Asignaciones docente
  await prisma.docenteCasa.deleteMany({});
  await prisma.docenteMundo.deleteMany({});

  // ============================================================================
  // USUARIOS (al final, después de todas sus dependencias)
  // ============================================================================

  // Historial de acceso (FK → Estudiante) - DEBE ir antes de estudiante
  await prisma.historialAccesoEstudiante.deleteMany({});

  // Usuarios
  await prisma.estudiante.deleteMany({});
  await prisma.tutor.deleteMany({});
  await prisma.docente.deleteMany({});
  await prisma.admin.deleteMany({});
}
