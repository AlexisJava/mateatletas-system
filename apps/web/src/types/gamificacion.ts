import type { Logro as ContractsLogro } from '@mateatletas/contracts';

/**
 * Tipos para el sistema de gamificación
 * Usados por la API de gamificación y componentes relacionados
 */

export interface RecursosEstudiante {
  xpActual: number;
  xpSiguienteNivel: number;
  nivelActual: number;
  monedas: number;
  gemas: number;
  puntosTotales: number;
}

export interface TransaccionRecurso {
  id: string;
  tipo: 'XP' | 'MONEDAS' | 'GEMAS';
  cantidad: number;
  motivo: string;
  fecha: string;
  balanceAnterior: number;
  balanceNuevo: number;
}

export interface RachaEstudiante {
  diasConsecutivos: number;
  mejorRacha: number;
  ultimaActividad: string;
  activoHoy: boolean;
}

export interface LogroEstudiante {
  id: string;
  logro: ContractsLogro;
  desbloqueado: boolean;
  fechaDesbloqueo?: string;
  progresoActual?: number;
  progresoObjetivo?: number;
}

export interface ProgresoLogros {
  total: number;
  desbloqueados: number;
  porcentaje: number;
  totalLogros: number;
  logrosDesbloqueados: number;
  porCategoria: Record<
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
    xpRecompensa: logro.xpRecompensa || 0,
    monedasRecompensa: logro.monedasRecompensa || 0,
  }));
}

/**
 * Mapea logros normalizados al formato LogroEstudiante
 */
export function mapLogrosToEstudiante(
  _estudianteId: string,
  logros: ContractsLogro[],
): LogroEstudiante[] {
  return logros.map((logro) => ({
    id: logro.id,
    logro,
    desbloqueado: logro.desbloqueado ?? false,
    fechaDesbloqueo:
      typeof logro.fechaDesbloqueo === 'string'
        ? logro.fechaDesbloqueo
        : logro.fechaDesbloqueo?.toISOString(),
  }));
}
