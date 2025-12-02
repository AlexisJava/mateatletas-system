import { Sparkles, Zap, Rocket, type LucideIcon } from 'lucide-react';

/**
 * Modelo Mateatletas 2026 - Configuración de Casas
 *
 * Las Casas son grupos de estudiantes organizados por rango de edad:
 * - QUANTUM: 6-9 años (Exploradores)
 * - VERTEX: 10-12 años (Constructores)
 * - PULSAR: 13-17 años (Dominadores)
 */

export type CasaName = 'Quantum' | 'Vertex' | 'Pulsar';

export interface CasaConfig {
  edadMin: number;
  edadMax: number;
  color: string;
  emoji: string;
  descripcion: string;
  icon: LucideIcon;
}

/**
 * Configuración completa de las Casas 2026
 */
export const CASAS_CONFIG: Record<CasaName, CasaConfig> = {
  Quantum: {
    edadMin: 6,
    edadMax: 9,
    color: '#8B5CF6', // Violeta
    emoji: '⚛️',
    descripcion: 'Exploradores (6-9 años)',
    icon: Sparkles,
  },
  Vertex: {
    edadMin: 10,
    edadMax: 12,
    color: '#10B981', // Verde
    emoji: '🔷',
    descripcion: 'Constructores (10-12 años)',
    icon: Zap,
  },
  Pulsar: {
    edadMin: 13,
    edadMax: 17,
    color: '#F59E0B', // Naranja
    emoji: '💫',
    descripcion: 'Dominadores (13-17 años)',
    icon: Rocket,
  },
} as const;

/**
 * Lista ordenada de nombres de Casa
 */
export const CASA_NAMES: CasaName[] = ['Quantum', 'Vertex', 'Pulsar'];

/**
 * Determina la Casa de un estudiante basándose en su edad
 * @param edad - Edad del estudiante en años
 * @returns Nombre de la Casa o null si está fuera de rango
 */
export function getCasaByEdad(edad: number): CasaName | null {
  if (edad >= 6 && edad <= 9) return 'Quantum';
  if (edad >= 10 && edad <= 12) return 'Vertex';
  if (edad >= 13 && edad <= 17) return 'Pulsar';
  return null;
}

/**
 * Interface para distribución de estudiantes por Casa
 */
export interface CasaDistribution {
  Quantum: number;
  Vertex: number;
  Pulsar: number;
  SinCasa: number;
}

/**
 * Distribución inicial vacía
 */
export const EMPTY_CASA_DISTRIBUTION: CasaDistribution = {
  Quantum: 0,
  Vertex: 0,
  Pulsar: 0,
  SinCasa: 0,
};

/**
 * Calcula el total de estudiantes en una distribución
 */
export function getTotalFromDistribution(distribution: CasaDistribution): number {
  return distribution.Quantum + distribution.Vertex + distribution.Pulsar + distribution.SinCasa;
}

/**
 * Calcula el porcentaje de una Casa respecto al total
 */
export function getCasaPercentage(
  distribution: CasaDistribution,
  casa: CasaName | 'SinCasa',
): number {
  const total = getTotalFromDistribution(distribution);
  if (total === 0) return 0;
  return Math.round((distribution[casa] / total) * 100);
}
