/**
 * ============================================================================
 * SCENARIOS FACTORY - Factories para Escenarios Completos
 * ============================================================================
 *
 * Helpers que combinan múltiples factories para crear escenarios comunes
 * de prueba con todos los datos necesarios.
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import { TipoProducto, EstadoInscripcionComision } from '@prisma/client';
import {
  createTestTutor,
  createTestDocente,
  createTestEstudiante,
  createTestAdmin,
} from './usuario.factory';
import {
  createTestPlan,
  createTestSuscripcion,
  PlanTipo,
} from './plan.factory';
import {
  createTestSector,
  createTestGrupo,
  createTestClaseGrupo,
  createTestInscripcionClaseGrupo,
} from './grupo.factory';
import {
  createTestProducto,
  createTestComision,
  createTestInscripcionComision,
} from './comision.factory';
import {
  createTestPlanificacion,
  createTestAsignacionPlanificacion,
} from './contenido.factory';

// ============================================================================
// ESCENARIO: ESTUDIANTE CON COMISIÓN
// ============================================================================

export interface CreateEstudianteConComisionOptions {
  planTipo?: PlanTipo;
  conProgreso?: boolean;
}

/**
 * Crea un escenario completo con estudiante inscrito en comisión
 * Útil para tests de clases en vivo
 */
export async function createEstudianteConComision(
  prisma: PrismaService,
  options?: CreateEstudianteConComisionOptions,
) {
  // Crear plan
  const plan = await createTestPlan(
    prisma,
    options?.planTipo ?? 'STEAM_SINCRONICO',
  );

  // Crear tutor con suscripción
  const { tutor, password: tutorPassword } = await createTestTutor(prisma);
  await createTestSuscripcion(prisma, tutor.id, plan.id);

  // Crear docente
  const { docente, password: docentePassword } =
    await createTestDocente(prisma);

  // Crear producto y comisión
  const producto = await createTestProducto(prisma, {
    tipo: TipoProducto.Curso,
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
  });
  const comision = await createTestComision(prisma, {
    productoId: producto.id,
    docenteId: docente.id,
  });

  // Crear estudiante con plan
  const { estudiante, password: estudiantePassword } =
    await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      planId: plan.id,
    });

  // Inscribir en comisión
  const inscripcion = await createTestInscripcionComision(
    prisma,
    estudiante.id,
    comision.id,
    EstadoInscripcionComision.Confirmada,
  );

  return {
    plan,
    tutor,
    tutorPassword,
    docente,
    docentePassword,
    producto,
    comision,
    estudiante,
    estudiantePassword,
    inscripcion,
  };
}

// ============================================================================
// ESCENARIO: ESTUDIANTE CON CLASE GRUPO
// ============================================================================

export interface CreateEstudianteConClaseGrupoOptions {
  planTipo?: PlanTipo;
}

/**
 * Crea un escenario completo con estudiante inscrito en ClaseGrupo
 * Útil para tests de aula virtual
 */
export async function createEstudianteConClaseGrupo(
  prisma: PrismaService,
  options?: CreateEstudianteConClaseGrupoOptions,
) {
  // Crear plan
  const plan = await createTestPlan(
    prisma,
    options?.planTipo ?? 'STEAM_SINCRONICO',
  );

  // Crear tutor con suscripción
  const { tutor, password: tutorPassword } = await createTestTutor(prisma);
  await createTestSuscripcion(prisma, tutor.id, plan.id);

  // Crear docente
  const { docente, password: docentePassword } =
    await createTestDocente(prisma);

  // Crear sector y ClaseGrupo (sin nombre fijo para evitar unique constraint)
  const sector = await createTestSector(prisma);
  const claseGrupo = await createTestClaseGrupo(prisma, {
    docenteId: docente.id,
    sectorId: sector.id,
  });

  // Crear estudiante con plan
  const { estudiante, password: estudiantePassword } =
    await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      planId: plan.id,
    });

  // Inscribir en ClaseGrupo
  const inscripcion = await createTestInscripcionClaseGrupo(
    prisma,
    estudiante.id,
    claseGrupo.id,
    tutor.id,
  );

  return {
    plan,
    tutor,
    tutorPassword,
    docente,
    docentePassword,
    sector,
    claseGrupo,
    estudiante,
    estudiantePassword,
    inscripcion,
  };
}

// ============================================================================
// ESCENARIO: AULA VIRTUAL COMPLETA
// ============================================================================

export interface CreateFullAulaSetupOptions {
  cantidadClases?: number;
  activarClases?: number[];
}

/**
 * Setup completo para tests de Aula Virtual
 * Crea: admin, docente, sector, grupo, claseGrupo, estudiante, planificación, asignación
 */
export async function createFullAulaSetup(
  prisma: PrismaService,
  options: CreateFullAulaSetupOptions = {},
) {
  // Crear admin para contenido
  const admin = await createTestAdmin(prisma);

  // Crear docente
  const { docente, password: docentePassword } =
    await createTestDocente(prisma);

  // Crear sector
  const sector = await createTestSector(prisma);

  // Crear grupo (GrupoPedagogico desde refactor Casa/Mundo 2026)
  const grupo = await prisma.grupoPedagogico.create({
    data: {
      codigo: `GP-${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nombre: 'Grupo Test Aula',
      activo: true,
      sector_id: sector.id,
    },
  });

  // Crear ClaseGrupo
  const claseGrupo = await createTestClaseGrupo(prisma, {
    docenteId: docente.id,
    grupoId: grupo.id,
    sectorId: sector.id,
  });

  // Crear tutor y estudiante
  const { tutor, password: tutorPassword } = await createTestTutor(prisma);
  const { estudiante, password: estudiantePassword } =
    await createTestEstudiante(prisma, { tutorId: tutor.id });

  // Inscribir estudiante
  const inscripcion = await createTestInscripcionClaseGrupo(
    prisma,
    estudiante.id,
    claseGrupo.id,
    tutor.id,
  );

  // Crear planificación
  const planificacion = await createTestPlanificacion(prisma, admin.id, {
    cantidadClases: options.cantidadClases ?? 2,
  });

  // Asignar planificación y activar clases
  const { asignacion, clases } = await createTestAsignacionPlanificacion(
    prisma,
    planificacion.id,
    claseGrupo.id,
    docente.id,
    { activarClases: options.activarClases ?? [1] },
  );

  return {
    admin,
    docente,
    docentePassword,
    sector,
    grupo,
    claseGrupo,
    tutor,
    tutorPassword,
    estudiante,
    estudiantePassword,
    inscripcion,
    planificacion,
    asignacion,
    clases,
  };
}
