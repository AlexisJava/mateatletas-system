/**
 * Re-exportación de tipos de Gamificación desde el contrato oficial
 *
 * IMPORTANTE: Este archivo NO define tipos propios, solo re-exporta
 * los tipos canónicos desde @mateatletas/contracts
 */

import type {
  Logro,
  DashboardGamificacion,
  Puntos,
  Ranking,
  RankingGlobalItem,
  RankingIntegrante,
  ProgresoRuta,
  AccionPuntuable,
  PuntoObtenido,
  OtorgarPuntosInput,
  RecursosEstudiante,
  TransaccionRecurso,
} from '@mateatletas/contracts';
import { logroSchema, logrosListSchema } from '@mateatletas/contracts';

// Re-exportar tipos del contrato (source of truth)
export type {
  Logro,
  DashboardGamificacion,
  Puntos,
  Ranking,
  RankingGlobalItem,
  RankingIntegrante,
  ProgresoRuta,
  AccionPuntuable,
  PuntoObtenido,
  OtorgarPuntosInput,
  RecursosEstudiante,
  TransaccionRecurso,
};

// Alias para compatibilidad con código legacy
export type ProximaClase = DashboardGamificacion['proximasClases'][number];
export type RankingEquipoEntry = RankingIntegrante;
export type RankingGlobalEntry = RankingGlobalItem;

/**
 * Tipos locales para endpoints V2 (sin schemas definidos aún en contracts)
 * TODO: Mover estos a contracts cuando el backend los implemente
 */

export interface ProgresoLogros {
  total_logros: number;
  logros_desbloqueados: number;
  porcentaje: number;
  por_categoria: {
    [key: string]: {
      total: number;
      desbloqueados: number;
      logros: (Logro & { desbloqueado: boolean; fecha_desbloqueo: Date | null })[];
    };
  };
}

export interface ProgresoLogroV2 {
  total: number;
  desbloqueados: number;
  porcentaje: number;
  categorias: Record<
    string,
    {
      total: number;
      desbloqueados: number;
      logros?: Array<Logro & { desbloqueado: boolean; fecha_desbloqueo: string | null; secreto?: boolean }>;
    }
  >;
}

export interface RecursosResponse {
  xp: number;
  monedas: number;
  nivel: number;
  xp_siguiente_nivel: number;
}

export interface RachaResponse {
  dias_consecutivos: number;
  ultima_actividad: string;
  record_personal: number;
}

export interface DesbloquearLogroResponse {
  success: boolean;
  logro: string;
  estudiante: string;
}

/**
 * Normaliza y valida un Logro desde el backend
 * Convierte fecha_desbloqueo de string a Date si es necesario
 *
 * @param raw - Logro crudo desde la API
 * @returns Logro validado
 * @throws ZodError si el objeto no cumple el schema
 */
export function normalizarLogro(raw: Logro): Logro {
  const validado = logroSchema.parse(raw);

  // Convertir fecha_desbloqueo de string a Date si existe
  if (validado.fecha_desbloqueo && typeof validado.fecha_desbloqueo === 'string') {
    return {
      ...validado,
      fecha_desbloqueo: new Date(validado.fecha_desbloqueo),
    };
  }

  return validado;
}

/**
 * Normaliza un array de logros
 */
export function normalizarLogros(raw: Logro[]): Logro[] {
  const validados = logrosListSchema.parse(raw);
  return validados.map(normalizarLogro);
}
