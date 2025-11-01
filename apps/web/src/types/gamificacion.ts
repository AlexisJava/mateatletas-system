import type { Logro } from '@mateatletas/contracts';
import { logroSchema, logrosListSchema } from '@mateatletas/contracts';

export type { Logro };

// ============================================
// TIPOS EXTENDIDOS (modelos completos del backend)
// ============================================

/**
 * LogroEstudiante - Modelo completo de Prisma
 * Representa la relación estudiante-logro con fecha de desbloqueo
 */
export interface LogroEstudiante {
  id: string;
  estudiante_id: string;
  logro_id: string;
  fecha_desbloqueo: Date;
  visto: boolean;
  logro: Logro; // Relación con el logro completo
}

/**
 * RecursosEstudiante - Modelo completo de Prisma
 * Contiene XP, monedas y otros recursos del estudiante
 */
export interface RecursosEstudiante {
  // Campos de Prisma
  id: string;
  estudiante_id: string;
  xp_total: number;
  monedas_total: number;
  ultima_actualizacion: Date;
  createdAt: Date;
  updatedAt: Date;

  // Campos calculados que el backend agrega
  nivel: number;
  xp_progreso: number;
  xp_necesario: number;
  porcentaje_nivel: number;
}

/**
 * RachaEstudiante - Modelo completo de Prisma
 * Seguimiento de días consecutivos de actividad
 */
export interface RachaEstudiante {
  id: string;
  estudiante_id: string;
  racha_actual: number;
  racha_maxima: number;
  ultima_actividad: Date | null;
  inicio_racha_actual: Date | null;
  total_dias_activos: number;
  updated_at: Date;
}

/**
 * TransaccionRecurso - Modelo completo de Prisma
 * Historial de cambios en recursos del estudiante
 */
export interface TransaccionRecurso {
  id: string;
  recursos_estudiante_id: string;
  tipo_recurso: 'XP' | 'MONEDAS' | 'GEMAS';
  cantidad: number;
  razon: string;
  fecha: Date;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * ProgresoLogros - Para hooks que agrupan logros por categoría
 * Usado en useLogros para mostrar progreso de logros desbloqueados
 */
export interface ProgresoLogros {
  total: number;
  desbloqueados: number;
  porcentaje: number;
  total_logros: number; // Alias de total
  logros_desbloqueados: number; // Alias de desbloqueados
  por_categoria: Record<
    string,
    {
      total: number;
      desbloqueados: number;
      logros: LogroEstudiante[];
    }
  >;
}

/**
 * NotificacionLogro - Para sistema de notificaciones
 * Usado en useNotificacionesLogros para mostrar logros recién desbloqueados
 */
export interface NotificacionLogro {
  logro: LogroEstudiante;
  recompensas: {
    monedas: number;
    xp: number;
  };
  timestamp: Date;
  mostrada: boolean;
}

// ============================================
// NOTA: LogroConRecompensas y LogroUI ya no son necesarios
// Los campos monedas_recompensa, xp_recompensa, secreto, titulo y extras
// ahora están incluidos en el tipo base Logro del contrato
// ============================================

// ============================================
// NORMALIZADORES
// ============================================

export function normalizarLogro(raw: Logro): Logro {
  const validado = logroSchema.parse(raw);

  if (validado.fecha_desbloqueo && typeof validado.fecha_desbloqueo === 'string') {
    return {
      ...validado,
      fecha_desbloqueo: new Date(validado.fecha_desbloqueo),
    };
  }

  return validado;
}

export function normalizarLogros(raw: Logro[]): Logro[] {
  const validados = logrosListSchema.parse(raw);
  return validados.map(normalizarLogro);
}
