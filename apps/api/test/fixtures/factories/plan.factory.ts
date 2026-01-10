/**
 * ============================================================================
 * PLAN FACTORY - Factories para Planes y Suscripciones
 * ============================================================================
 *
 * Factories para crear planes de suscripción y suscripciones en tests.
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import { EstadoSuscripcion } from '@prisma/client';

// ============================================================================
// TIPOS
// ============================================================================

export type PlanTipo =
  | 'STEAM_LIBROS'
  | 'STEAM_ASINCRONICO'
  | 'STEAM_SINCRONICO';

// ============================================================================
// CONFIGURACIÓN DE PLANES
// ============================================================================

const PLANES_CONFIG: Record<PlanTipo, { precio: number; descripcion: string }> =
  {
    STEAM_LIBROS: {
      precio: 5000,
      descripcion: 'Acceso a libros y contenido asincrónico',
    },
    STEAM_ASINCRONICO: {
      precio: 8000,
      descripcion: 'Acceso completo asincrónico sin clases en vivo',
    },
    STEAM_SINCRONICO: {
      precio: 15000,
      descripcion: 'Acceso completo con clases en vivo',
    },
  };

// ============================================================================
// FACTORY: PLAN
// ============================================================================

/**
 * Crea un plan de suscripción
 */
export async function createTestPlan(
  prisma: PrismaService,
  tipo: PlanTipo = 'STEAM_SINCRONICO',
) {
  const config = PLANES_CONFIG[tipo];

  return prisma.planSuscripcion.create({
    data: {
      nombre: tipo,
      descripcion: config.descripcion,
      precio_base: config.precio,
      moneda: 'ARS',
      activo: true,
    },
  });
}

// ============================================================================
// FACTORY: SUSCRIPCIÓN
// ============================================================================

export interface CreateTestSuscripcionOptions {
  estado?: EstadoSuscripcion;
  fechaInicio?: Date;
  precioFinal?: number;
}

/**
 * Crea una suscripción activa para un tutor
 */
export async function createTestSuscripcion(
  prisma: PrismaService,
  tutorId: string,
  planId: string,
  options?: CreateTestSuscripcionOptions,
) {
  const plan = await prisma.planSuscripcion.findUnique({
    where: { id: planId },
  });

  return prisma.suscripcion.create({
    data: {
      tutor_id: tutorId,
      plan_id: planId,
      estado: options?.estado ?? EstadoSuscripcion.ACTIVA,
      fecha_inicio: options?.fechaInicio ?? new Date(),
      precio_final: options?.precioFinal ?? plan?.precio_base ?? 15000,
    },
  });
}
