/**
 * Exportaciones del sistema de planificaciones compartidas
 */

// Componentes
export { PlanificacionApp } from './components/PlanificacionApp';
export { GameScore } from './components/GameScore';
export { ActivityTimer } from './components/ActivityTimer';
export { ProgressTracker } from './components/ProgressTracker';
export { AchievementPopup } from './components/AchievementPopup';

// Hooks
export { usePlanificacionTracking } from './hooks/usePlanificacionTracking';

// Types
export type {
  PlanificacionMetadata,
  SemanaMetadata,
  ProgresoEstudiante,
  PlanificacionState,
  GameScoreProps,
  ActivityTimerProps,
  ProgressTrackerProps,
  AchievementData,
  AchievementPopupProps,
} from './types';

// ============================================================================
// NUEVO SISTEMA SIMPLIFICADO (Convention over Configuration)
// ============================================================================
export { PlanificacionWrapper, usePlanificacion } from './PlanificacionWrapper';
export { usePlanificacionProgress } from './usePlanificacionProgress';
export type {
  PlanificacionConfig,
  InfoSemanasActivas,
  UsePlanificacionProgressReturn,
} from './types';
