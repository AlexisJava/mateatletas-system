/**
 * ============================================================================
 * GAMIFICACION FACTORY - Factories para Logros, Activity Feed, etc.
 * ============================================================================
 *
 * Factories para crear logros, actividades del feed y reacciones en tests.
 */

import { PrismaService } from '../../../src/core/database/prisma.service';

// ============================================================================
// HELPERS
// ============================================================================

function generateUniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// TIPOS
// ============================================================================

export type TipoActividadFeed =
  | 'LECCION_COMPLETADA'
  | 'CLASE_COMPLETADA'
  | 'TAREA_COMPLETADA'
  | 'TAREA_PERFECTA'
  | 'PLANIFICACION_COMPLETADA'
  | 'LOGRO_DESBLOQUEADO'
  | 'NIVEL_SUBIDO'
  | 'RACHA_EXTENDIDA';

// ============================================================================
// FACTORY: LOGRO
// ============================================================================

export interface CreateTestLogroOptions {
  codigo?: string;
  nombre?: string;
  xp_recompensa?: number;
  categoria?: string;
  rareza?: string;
}

/**
 * Crea un logro de prueba
 */
export async function createTestLogro(
  prisma: PrismaService,
  data?: CreateTestLogroOptions,
) {
  const codigo = data?.codigo ?? `test_logro_${generateUniqueSuffix()}`;

  // Usar upsert para evitar constraint violation si el logro ya existe (ej: seeded)
  return prisma.logro.upsert({
    where: { codigo },
    update: {},
    create: {
      codigo,
      nombre: data?.nombre ?? 'Test Logro',
      descripcion: 'Logro de prueba',
      categoria: data?.categoria ?? 'PARTICIPACION',
      rareza: data?.rareza ?? 'COMUN',
      xp_recompensa: data?.xp_recompensa ?? 50,
      icono: '🎯',
      criterio_tipo: 'manual',
      criterio_valor: '{}',
    },
  });
}

// ============================================================================
// FACTORY: ACTIVIDAD FEED
// ============================================================================

export interface CreateTestActividadFeedOptions {
  tipo?: TipoActividadFeed;
  mensaje?: string;
  xpGanado?: number;
  casaId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Crea una actividad en el feed
 */
export async function createTestActividadFeed(
  prisma: PrismaService,
  estudianteId: string,
  options?: CreateTestActividadFeedOptions,
) {
  return prisma.actividadFeed.create({
    data: {
      estudiante_id: estudianteId,
      tipo: options?.tipo ?? 'LECCION_COMPLETADA',
      mensaje: options?.mensaje ?? 'Completó una lección',
      xp_ganado: options?.xpGanado ?? 10,
      casa_id: options?.casaId,
      metadata: options?.metadata ?? {},
    },
  });
}

// ============================================================================
// FACTORY: REACCIÓN FEED
// ============================================================================

/**
 * Crea una reacción a una actividad
 */
export async function createTestReaccionFeed(
  prisma: PrismaService,
  actividadId: string,
  estudianteId: string,
  emoji: string = '👏',
) {
  return prisma.reaccionFeed.create({
    data: {
      actividad_id: actividadId,
      estudiante_id: estudianteId,
      emoji,
    },
  });
}
