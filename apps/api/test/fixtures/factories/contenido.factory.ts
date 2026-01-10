/**
 * ============================================================================
 * CONTENIDO FACTORY - Factories para Contenido Educativo
 * ============================================================================
 *
 * Factories para crear contenido, planificaciones y clases en tests.
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import { MundoTipo, CasaTipo } from '@prisma/client';
import { createTestAdmin } from './usuario.factory';

// ============================================================================
// HELPERS
// ============================================================================

function generateUniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// FACTORY: CONTENIDO
// ============================================================================

export interface CreateTestContenidoOptions {
  titulo?: string;
  mundoTipo?: MundoTipo;
  casaTipo?: CasaTipo;
  creadorId?: string;
}

/**
 * Crea un contenido de prueba
 */
export async function createTestContenido(
  prisma: PrismaService,
  data?: CreateTestContenidoOptions,
) {
  // Crear admin si no se proporciona creadorId
  let creadorId = data?.creadorId;
  if (!creadorId) {
    const admin = await createTestAdmin(prisma);
    creadorId = admin.id;
  }

  return prisma.contenido.create({
    data: {
      titulo: data?.titulo ?? 'Test Contenido',
      mundoTipo: data?.mundoTipo ?? MundoTipo.MATEMATICA,
      casaTipo: data?.casaTipo ?? CasaTipo.QUANTUM,
      creadorId,
    },
  });
}

// ============================================================================
// FACTORY: CONTENIDO PLANIFICACIÓN
// ============================================================================

export interface CreateTestContenidoPlanificacionOptions {
  titulo?: string;
  tipo?: string;
}

/**
 * Crea contenido de test (teoría o práctica) para planificaciones
 */
export async function createTestContenidoPlanificacion(
  prisma: PrismaService,
  adminId: string,
  options: CreateTestContenidoPlanificacionOptions = {},
) {
  const uniqueSuffix = generateUniqueSuffix();
  const contenido = await prisma.contenido.create({
    data: {
      titulo:
        options.titulo ?? `Contenido ${options.tipo ?? 'test'} ${uniqueSuffix}`,
      casaTipo: 'QUANTUM',
      mundoTipo: 'MATEMATICA',
      estado: 'PUBLICADO',
      tipo: 'LECCION',
      creadorId: adminId,
      descripcion: `Contenido de ${options.tipo ?? 'test'}`,
    },
  });
  return contenido;
}

// ============================================================================
// FACTORY: PLANIFICACIÓN
// ============================================================================

export interface CreateTestPlanificacionOptions {
  cantidadClases?: number;
  titulo?: string;
}

/**
 * Crea una planificación completa con clases, teoría y práctica
 */
export async function createTestPlanificacion(
  prisma: PrismaService,
  adminId: string,
  options: CreateTestPlanificacionOptions = {},
) {
  const uniqueSuffix = generateUniqueSuffix();
  const cantidadClases = options.cantidadClases ?? 2;

  // Crear contenidos para cada clase
  const clasesData = [];
  for (let i = 1; i <= cantidadClases; i++) {
    const teoria = await createTestContenidoPlanificacion(prisma, adminId, {
      tipo: 'teoria',
      titulo: `Teoría Clase ${i}`,
    });
    const practica = await createTestContenidoPlanificacion(prisma, adminId, {
      tipo: 'practica',
      titulo: `Práctica Clase ${i}`,
    });
    clasesData.push({
      numero: i,
      titulo: `Clase ${i}`,
      descripcion: `Descripción de clase ${i}`,
      teoria_id: teoria.id,
      practica_id: practica.id,
    });
  }

  const planificacion = await prisma.planificacion.create({
    data: {
      titulo: options.titulo ?? `Planificación Test ${uniqueSuffix}`,
      descripcion: 'Planificación para tests de integración',
      cantidad_clases: cantidadClases,
      duracion_clase_dias: 7,
      casa_tipo: 'QUANTUM',
      mundo_tipo: 'MATEMATICA',
      estado: 'PUBLICADO',
      clases: {
        create: clasesData,
      },
    },
    include: {
      clases: {
        orderBy: { numero: 'asc' },
        include: { teoria: true, practica: true },
      },
    },
  });

  return planificacion;
}

// ============================================================================
// FACTORY: ASIGNACIÓN PLANIFICACIÓN
// ============================================================================

export interface CreateTestAsignacionPlanificacionOptions {
  activarClases?: number[];
}

/**
 * Asigna una planificación a un ClaseGrupo y activa clases específicas
 */
export async function createTestAsignacionPlanificacion(
  prisma: PrismaService,
  planificacionId: string,
  claseGrupoId: string,
  docenteId: string,
  options: CreateTestAsignacionPlanificacionOptions = {},
) {
  const asignacion = await prisma.asignacionPlanificacion.create({
    data: {
      planificacion_id: planificacionId,
      clase_grupo_id: claseGrupoId,
      docente_id: docenteId,
      activa: true,
    },
  });

  // Obtener clases de la planificación
  const clases = await prisma.clasePlanificacion.findMany({
    where: { planificacion_id: planificacionId },
    orderBy: { numero: 'asc' },
  });

  // Activar las clases indicadas
  const activarClases = options.activarClases ?? [];
  for (const numero of activarClases) {
    const clase = clases.find((c) => c.numero === numero);
    if (clase) {
      await prisma.estadoClaseGrupo.create({
        data: {
          asignacion_id: asignacion.id,
          clase_id: clase.id,
          teoria_activa: true,
          practica_activa: true,
          activada_en: new Date(),
        },
      });
    }
  }

  return { asignacion, clases };
}
