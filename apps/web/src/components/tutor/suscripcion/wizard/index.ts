/**
 * Wizard de Nueva Suscripción
 *
 * Módulo completo para el flujo de inscripción de estudiantes.
 *
 * Estructura:
 * - NuevaSuscripcionWizard: Componente orquestador principal
 * - hooks/useWizardState: Lógica de estado centralizada
 * - steps/: Componentes de cada paso del wizard
 * - components/: Componentes auxiliares reutilizables
 * - types.ts: Definiciones de tipos
 * - utils.ts: Funciones utilitarias puras
 */

export { NuevaSuscripcionWizard, default } from './NuevaSuscripcionWizard';

// Re-exports para uso externo si es necesario
export type {
  WizardStep,
  WizardSeleccion,
  NuevoHijoData,
  ProductoConCasa,
  ClaseGrupoInfo,
  CasaTipo,
  MundoTipo,
} from './types';
