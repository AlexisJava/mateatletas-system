/**
 * Tipos para el sistema de carga dinámica de planificaciones
 * Router: /estudiante/planificaciones/[codigo]
 */

import type { CodigoCiencia } from '../../gimnasio/views/types/entrenamientos.types';

/**
 * Códigos válidos de planificaciones que se pueden cargar
 */
export type CodigoPlanificacionValido = CodigoCiencia;

/**
 * Props que puede aceptar cada componente de planificación
 * Son opcionales para mantener compatibilidad con planificaciones que usan PlanificacionWrapper
 */
export interface PlanificacionComponentProps {
  estudianteId?: string;
  nivelEstudiante?: number; // 1-10
}

/**
 * Tipo del componente React de planificación
 */
export type PlanificacionComponent = React.ComponentType<PlanificacionComponentProps>;

/**
 * Módulo exportado por cada planificación
 */
export interface PlanificacionModule {
  default: PlanificacionComponent;
  PLANIFICACION_CONFIG?: {
    codigo: string;
    titulo: string;
    grupo: string;
    mes?: number | null;
    anio: number;
    semanas: number;
  };
}

/**
 * Resultado de validación de código de planificación
 */
export interface ValidacionCodigo {
  valido: boolean;
  codigo: CodigoPlanificacionValido | null;
  error: string | null;
}

/**
 * Estado del loader de planificación
 */
export interface PlanificacionLoaderState {
  isLoading: boolean;
  error: Error | null;
  component: PlanificacionComponent | null;
  config: PlanificacionModule['PLANIFICACION_CONFIG'] | null;
}

/**
 * Props para la página de planificación
 */
export interface PlanificacionPageProps {
  params: {
    codigo: string;
  };
}

/**
 * Props para el layout de planificaciones
 */
export interface PlanificacionesLayoutProps {
  children: React.ReactNode;
}

/**
 * Metadata para cada planificación (para navegación)
 */
export interface PlanificacionMetadata {
  codigo: CodigoPlanificacionValido;
  titulo: string;
  descripcion: string;
  emoji: string;
  nivelRecomendado: {
    min: number;
    max: number;
  };
}

/**
 * Resultado de adaptación por nivel
 */
export interface AdaptacionNivel {
  nivelActual: number;
  dificultadRecomendada: 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
  descripcionNivel: string;
}
