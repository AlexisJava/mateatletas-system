import type { Logro as ContractsLogro } from '@mateatletas/contracts';

/**
 * Tipos para el sistema de gamificación
 * Usados por la API de gamificación y componentes relacionados
 */

export interface RecursosEstudiante {
  xp_actual: number;
  xp_siguiente_nivel: number;
  nivel_actual: number;
  monedas: number;
  gemas: number;
  puntos_totales: number;
}

export interface TransaccionRecurso {
  id: string;
  tipo: 'XP' | 'MONEDAS' | 'GEMAS';
  cantidad: number;
  motivo: string;
  fecha: string;
  balance_anterior: number;
  balance_nuevo: number;
}

export interface RachaEstudiante {
  dias_consecutivos: number;
  mejor_racha: number;
  ultima_actividad: string;
  activo_hoy: boolean;
}

export interface LogroEstudiante {
  id: string;
  logro: ContractsLogro;
  desbloqueado: boolean;
  fecha_desbloqueo?: string;
  progreso_actual?: number;
  progreso_objetivo?: number;
}

export interface ProgresoLogros {
  total: number;
  desbloqueados: number;
  porcentaje: number;
  total_logros: number;
  logros_desbloqueados: number;
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
 * Normaliza logros del backend al formato esperado por el frontend
 */
export function normalizarLogros<T extends ContractsLogro>(logros: T[]): T[] {
  return logros.map((logro) => ({
    ...logro,
    // Asegurar que los campos opcionales tengan valores por defecto
    icono: logro.icono || '🏆',
    puntos_recompensa: logro.puntos_recompensa || 0,
    monedas_recompensa: logro.monedas_recompensa || 0,
  }));
}
