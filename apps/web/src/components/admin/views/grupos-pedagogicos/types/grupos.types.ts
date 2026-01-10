/**
 * Tipos para la vista de Grupos Pedagógicos
 * Sistema Casa/Mundo 2026
 */

import type {
  CasaTipo,
  MundoTipo,
  GrupoPedagogico,
  FiltrosGrupoPedagogico,
} from '@/lib/api/admin.api';

export type { CasaTipo, MundoTipo, GrupoPedagogico, FiltrosGrupoPedagogico };

/** Stats de la vista */
export interface GruposStats {
  totalGrupos: number;
  porCasa: Record<CasaTipo | 'SIN_ASIGNAR', number>;
  porMundo: Record<MundoTipo | 'SIN_ASIGNAR', number>;
  conClases: number;
  conComisiones: number;
}

/** Configuración de colores por Casa */
export const CASA_CONFIG: Record<CasaTipo, { label: string; color: string; bgColor: string }> = {
  QUANTUM: {
    label: 'Quantum (6-9)',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  VERTEX: {
    label: 'Vertex (10-12)',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  PULSAR: {
    label: 'Pulsar (13-17)',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
};

/** Configuración de colores por Mundo */
export const MUNDO_CONFIG: Record<MundoTipo, { label: string; color: string; bgColor: string }> = {
  MATEMATICA: {
    label: 'Matemática',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  PROGRAMACION: {
    label: 'Programación',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  CIENCIAS: {
    label: 'Ciencias',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
  },
};
