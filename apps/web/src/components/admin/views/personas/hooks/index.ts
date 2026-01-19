/**
 * Personas Hooks - Barrel exports
 */

export { usePersonas } from './usePersonas';

// Asignaciones Casa/Mundo (FASE 2)
export { useDocenteAsignaciones } from './useDocenteAsignaciones';
export type {
  CasaTipo,
  MundoTipo,
  TipoAsignacionDocente,
  DocenteAsignacionesPerfil,
  FiltrosAsignaciones,
  AsignacionesStats,
} from './useDocenteAsignaciones';
export { CASA_CONFIG, MUNDO_CONFIG, TIPO_ASIGNACION_CONFIG } from './useDocenteAsignaciones';
