/**
 * ============================================================================
 * VERANO FACTORY - Factories para Tests del Flujo de Verano
 * ============================================================================
 *
 * Factories especializadas para crear escenarios de prueba relacionados
 * con el ciclo de verano (diciembre-febrero) y suscripciones familiares.
 *
 * NOTA: Estas factories asumen que existen los campos/enums del spec de verano.
 * Si los tests fallan, es porque la implementación aún no existe (TDD).
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createTestTutor,
  createTestEstudiante,
  createTestDocente,
} from './usuario.factory';
import { createTestClaseGrupo, createTestSector } from './grupo.factory';

// ============================================================================
// CONSTANTES DE PRECIOS (según spec)
// ============================================================================

export const PRECIOS_VERANO = {
  MATRICULA_COLONIA: 40000, // Diciembre - no reembolsable
  CUOTA_COLONIA: 95000, // Enero y Febrero
  CUOTA_CONTINUIDAD: 20000, // Diciembre, Enero, Febrero
} as const;

export const PRECIOS_TIER = {
  STEAM_LIBROS: 40000,
  STEAM_ASINCRONICO: 65000,
  STEAM_SINCRONICO: 95000,
} as const;

// ============================================================================
// TIPOS
// ============================================================================

export type TierNombre =
  | 'STEAM_LIBROS'
  | 'STEAM_ASINCRONICO'
  | 'STEAM_SINCRONICO';

// Estados según spec de verano (algunos pueden no existir aún en schema)
export type EstadoSuscripcionVerano =
  | 'ACTIVA'
  | 'CONTINUIDAD'
  | 'BAJA'
  | 'PAUSADA';
export type DecisionVerano = 'COLONIA' | 'CONTINUIDAD' | 'PENDIENTE';

// ============================================================================
// FACTORY: SUSCRIPCIÓN FAMILIAR
// ============================================================================

export interface CreateSuscripcionFamiliarOptions {
  tier?: TierNombre;
  estado?: 'PENDING' | 'AUTHORIZED' | 'PAUSED' | 'CANCELLED';
  montoMensual?: number;
  preapprovalId?: string;
}

/**
 * Crea una SuscripcionFamiliar de prueba
 */
export async function createTestSuscripcionFamiliar(
  prisma: PrismaService,
  tutorId: string,
  options?: CreateSuscripcionFamiliarOptions,
) {
  const tier = options?.tier ?? 'STEAM_SINCRONICO';
  const montoMensual = options?.montoMensual ?? PRECIOS_TIER[tier];

  return prisma.suscripcionFamiliar.create({
    data: {
      tutorId,
      tier,
      estado: options?.estado ?? 'AUTHORIZED',
      montoMensual,
      preapprovalId:
        options?.preapprovalId ??
        `test_preapproval_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      fechaProximoCobro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
    },
  });
}

// ============================================================================
// FACTORY: INSCRIPCIÓN ACTIVIDAD
// ============================================================================

export interface CreateInscripcionActividadOptions {
  tier?: TierNombre;
  estado?: 'ACTIVA' | 'PAUSADA' | 'CANCELADA';
  claseGrupoId?: string;
  productoId?: string;
}

/**
 * Crea una InscripcionActividad de prueba
 */
export async function createTestInscripcionActividad(
  prisma: PrismaService,
  suscripcionFamiliarId: string,
  estudianteId: string,
  productoId: string,
  options?: CreateInscripcionActividadOptions,
) {
  return prisma.inscripcionActividad.create({
    data: {
      suscripcionFamiliarId,
      estudianteId,
      productoId,
      tier: options?.tier,
      estado: options?.estado ?? 'ACTIVA',
      claseGrupoId: options?.claseGrupoId,
      fechaInicio: new Date(),
    },
  });
}

// ============================================================================
// ESCENARIO: TUTOR CON SUSCRIPCIÓN FAMILIAR ACTIVA
// ============================================================================

export interface CreateTutorConSuscripcionFamiliarOptions {
  tier?: TierNombre;
  cantidadHijos?: number;
}

/**
 * Crea un escenario completo: Tutor + SuscripcionFamiliar + Estudiantes + Inscripciones
 */
export async function createTutorConSuscripcionFamiliar(
  prisma: PrismaService,
  options?: CreateTutorConSuscripcionFamiliarOptions,
) {
  const tier = options?.tier ?? 'STEAM_SINCRONICO';
  const cantidadHijos = options?.cantidadHijos ?? 1;

  // Crear tutor
  const { tutor, password: tutorPassword } = await createTestTutor(prisma);

  // Crear suscripción familiar
  const suscripcionFamiliar = await createTestSuscripcionFamiliar(
    prisma,
    tutor.id,
    {
      tier,
      estado: 'AUTHORIZED',
    },
  );

  // Crear docente y claseGrupo para inscripciones
  const { docente } = await createTestDocente(prisma);
  const sector = await createTestSector(prisma);
  const claseGrupo = await createTestClaseGrupo(prisma, {
    docenteId: docente.id,
    sectorId: sector.id,
  });

  // Crear producto
  const producto = await prisma.producto.create({
    data: {
      nombre: `Club Test ${Date.now()}`,
      tipo: 'Club',
      precio: PRECIOS_TIER[tier],
      activo: true,
    },
  });

  // Crear estudiantes e inscripciones
  const estudiantes = [];
  const inscripciones = [];
  const estudiantesPasswords = [];

  for (let i = 0; i < cantidadHijos; i++) {
    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      nombre: `Hijo${i + 1}`,
      apellido: 'Test',
    });
    estudiantes.push(estudiante);
    estudiantesPasswords.push(password);

    const inscripcion = await createTestInscripcionActividad(
      prisma,
      suscripcionFamiliar.id,
      estudiante.id,
      producto.id,
      { tier, claseGrupoId: claseGrupo.id },
    );
    inscripciones.push(inscripcion);
  }

  return {
    tutor,
    tutorPassword,
    suscripcionFamiliar,
    docente,
    sector,
    claseGrupo,
    producto,
    estudiantes,
    estudiantesPasswords,
    inscripciones,
  };
}

// ============================================================================
// ESCENARIO: TUTOR CON MÚLTIPLES HIJOS (para tests de decisión individual)
// ============================================================================

/**
 * Crea un tutor con 2 hijos para testear decisiones independientes de verano
 */
export async function createTutorConDosHijos(prisma: PrismaService) {
  return createTutorConSuscripcionFamiliar(prisma, {
    tier: 'STEAM_SINCRONICO',
    cantidadHijos: 2,
  });
}

// ============================================================================
// ESCENARIO: GRUPO COLONIA CON CUPOS LIMITADOS
// ============================================================================

export interface CreateGrupoColoniaOptions {
  cupoMaximo?: number;
  cupoOcupado?: number;
}

/**
 * Crea un ClaseGrupo de Colonia de Verano con cupos limitados
 *
 * IMPORTANTE: Si cupoOcupado > 0, crea estudiantes ficticios con
 * DecisionVeranoEstudiante para que el conteo de cupos sea real.
 *
 * @param anio - Año para las decisiones de verano (default: año actual)
 */
export async function createGrupoColoniaConCupos(
  prisma: PrismaService,
  options?: CreateGrupoColoniaOptions & { anio?: number },
) {
  const cupoMaximo = options?.cupoMaximo ?? 10;
  const cupoOcupado = options?.cupoOcupado ?? 0;
  const anio = options?.anio ?? new Date().getFullYear();

  const { docente } = await createTestDocente(prisma);
  const sector = await createTestSector(prisma);

  const claseGrupo = await createTestClaseGrupo(prisma, {
    docenteId: docente.id,
    sectorId: sector.id,
  });

  // Actualizar cupoMaximo
  await prisma.claseGrupo.update({
    where: { id: claseGrupo.id },
    data: { cupoMaximo },
  });

  // Si hay cupos ocupados, crear DecisionVeranoEstudiante reales
  // El service cuenta asignacionesColoniaVerano para determinar ocupación
  const estudiantesOcupantes = [];
  for (let i = 0; i < cupoOcupado; i++) {
    // Crear tutor para este estudiante ocupante
    const { tutor } = await createTestTutor(prisma);

    // Crear suscripción familiar
    const suscripcion = await createTestSuscripcionFamiliar(prisma, tutor.id, {
      tier: 'STEAM_SINCRONICO',
      estado: 'AUTHORIZED',
    });

    // Crear estudiante ocupante
    const { estudiante } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      nombre: `Ocupante${i + 1}`,
      apellido: 'CupoTest',
    });

    // Crear DecisionVeranoEstudiante con COLONIA asignada a este grupo
    await prisma.decisionVeranoEstudiante.create({
      data: {
        estudianteId: estudiante.id,
        suscripcionFamiliarId: suscripcion.id,
        anio,
        decision: 'COLONIA',
        claseGrupoColoniaId: claseGrupo.id,
        fechaDecision: new Date(),
        matriculaColoniaPagada: true,
      },
    });

    estudiantesOcupantes.push({ tutor, suscripcion, estudiante });
  }

  return {
    claseGrupo,
    docente,
    sector,
    cupoMaximo,
    cupoOcupado,
    cupoDisponible: cupoMaximo - cupoOcupado,
    estudiantesOcupantes,
  };
}
