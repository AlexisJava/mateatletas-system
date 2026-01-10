/**
 * ============================================================================
 * FACTORIES INDEX - Re-export de todas las factories
 * ============================================================================
 *
 * Punto de entrada único para importar factories en tests.
 * Mantiene compatibilidad con imports existentes.
 *
 * Uso:
 *   import { createTestEstudiante, createFullAulaSetup } from '../../fixtures/factories';
 */

// Usuarios
export {
  createTestTutor,
  createTestDocente,
  createTestAdmin,
  createTestEstudiante,
  hashPassword,
  DEFAULT_PASSWORD,
  type TestTutorWithPassword,
  type TestEstudianteWithPassword,
  type TestDocenteWithPassword,
  type CreateEstudianteOptions,
  type CreateTestTutorOptions,
  type CreateTestDocenteOptions,
  type CreateTestAdminOptions,
} from './usuario.factory';

// Planes y Suscripciones
export {
  createTestPlan,
  createTestSuscripcion,
  type PlanTipo,
  type CreateTestSuscripcionOptions,
} from './plan.factory';

// Grupos y Clases
export {
  createTestSector,
  createTestGrupo,
  createTestClaseGrupo,
  createTestInscripcionClaseGrupo,
  createTestClase,
  type CreateTestSectorOptions,
  type CreateTestGrupoOptions,
  type CreateClaseGrupoOptions,
  type CreateTestClaseOptions,
} from './grupo.factory';

// Productos y Comisiones
export {
  createTestProducto,
  createTestComision,
  createTestInscripcionComision,
  type CreateTestProductoOptions,
  type CreateComisionOptions,
} from './comision.factory';

// Contenido y Planificaciones
export {
  createTestContenido,
  createTestContenidoPlanificacion,
  createTestPlanificacion,
  createTestAsignacionPlanificacion,
  type CreateTestContenidoOptions,
  type CreateTestContenidoPlanificacionOptions,
  type CreateTestPlanificacionOptions,
  type CreateTestAsignacionPlanificacionOptions,
} from './contenido.factory';

// Gamificación
export {
  createTestLogro,
  createTestActividadFeed,
  createTestReaccionFeed,
  type TipoActividadFeed,
  type CreateTestLogroOptions,
  type CreateTestActividadFeedOptions,
} from './gamificacion.factory';

// Escenarios Completos
export {
  createEstudianteConComision,
  createEstudianteConClaseGrupo,
  createFullAulaSetup,
  type CreateEstudianteConComisionOptions,
  type CreateEstudianteConClaseGrupoOptions,
  type CreateFullAulaSetupOptions,
} from './scenarios.factory';
