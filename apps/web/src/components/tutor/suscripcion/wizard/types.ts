/**
 * Tipos e interfaces del Wizard de Nueva Suscripción
 *
 * Centraliza todos los tipos usados por el wizard para mantener
 * consistencia y facilitar el mantenimiento.
 */

import type { HijoInfo } from '@/lib/api/tutores.api';
import type { TierNombre } from '@mateatletas/contracts';

/** Pasos del wizard unificado */
export type WizardStep = 'hijo' | 'producto' | 'horario' | 'tier' | 'confirmar';

/** Tipos de Casa del sistema 2026 */
export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';

/** Tipos de Mundo STEAM */
export type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';

/** Datos de un nuevo hijo a registrar */
export interface NuevoHijoData {
  readonly nombre: string;
  readonly apellido: string;
  readonly fechaNacimiento: string;
  readonly nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
}

/** Información de un grupo de clase (horario) */
export interface ClaseGrupoInfo {
  readonly id: string;
  readonly nombre: string;
  readonly diaSemana: string;
  readonly horaInicio: string;
  readonly horaFin: string;
  readonly docente?: {
    readonly nombre: string;
    readonly apellido: string;
  };
  readonly cupoDisponible: number;
}

/** Producto con información de Casa/Mundo del backend */
export interface ProductoConCasa {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly tipo: string;
  readonly casa: CasaTipo | null;
  readonly mundo: MundoTipo | null;
  readonly activo: boolean;
  readonly claseGrupos?: ClaseGrupoInfo[];
}

/** Selección completa del wizard */
export interface WizardSeleccion {
  readonly hijo: HijoInfo | null;
  readonly nuevoHijo: NuevoHijoData | null;
  readonly producto: ProductoConCasa | null;
  readonly claseGrupo: ClaseGrupoInfo | null;
  readonly tier: TierNombre | null;
}

/** Resultado del cálculo de casa con posible error de validación */
export interface CalcularCasaResult {
  readonly casa: CasaTipo | null;
  readonly error: string | null;
}

/** Configuración de una Casa para UI */
export interface CasaConfig {
  readonly nombre: string;
  readonly edadMin: number;
  readonly edadMax: number;
  readonly color: string;
}

/** Configuración de un Mundo para UI */
export interface MundoConfig {
  readonly nombre: string;
  readonly emoji: string;
  readonly color: string;
}

/** Re-export TierNombre para uso interno */
export type { TierNombre };
export type { HijoInfo };
