/**
 * ============================================================================
 * GRUPO FACTORY - Factories para Sectores, Grupos y ClaseGrupos
 * ============================================================================
 *
 * Factories para crear sectores, grupos pedagógicos y clase grupos en tests.
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import { DiaSemana, TipoClaseGrupo } from '@prisma/client';

// ============================================================================
// HELPERS
// ============================================================================

function generateUniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// FACTORY: SECTOR
// ============================================================================

export interface CreateTestSectorOptions {
  nombre?: string;
  color?: string;
  icono?: string;
}

/**
 * Crea un sector (Matemática, Programación)
 */
export async function createTestSector(
  prisma: PrismaService,
  options?: CreateTestSectorOptions,
) {
  const uniqueSuffix = generateUniqueSuffix();

  return prisma.sector.create({
    data: {
      nombre: options?.nombre ?? `Sector_${uniqueSuffix}`,
      color: options?.color ?? '#6366F1',
      icono: options?.icono ?? '📚',
      activo: true,
    },
  });
}

// ============================================================================
// FACTORY: GRUPO
// ============================================================================

export interface CreateTestGrupoOptions {
  codigo?: string;
  nombre?: string;
  sectorId?: string;
}

/**
 * Crea un grupo pedagógico (B1, B2, etc.)
 * Nota: El modelo se llama GrupoPedagogico desde el refactor Casa/Mundo 2026
 */
export async function createTestGrupo(
  prisma: PrismaService,
  options?: CreateTestGrupoOptions,
) {
  const uniqueSuffix = generateUniqueSuffix();

  return prisma.grupoPedagogico.create({
    data: {
      codigo: options?.codigo ?? `GP_${uniqueSuffix}`,
      nombre: options?.nombre ?? `Grupo Test ${uniqueSuffix}`,
      sectorId: options?.sectorId,
      activo: true,
    },
  });
}

// ============================================================================
// FACTORY: CLASE GRUPO
// ============================================================================

export interface CreateClaseGrupoOptions {
  docenteId: string;
  grupoId?: string;
  sectorId?: string;
  nombre?: string;
  codigo?: string;
  diaSemana?: DiaSemana;
  horaInicio?: string;
  horaFin?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  cupoMaximo?: number;
  activo?: boolean;
}

/**
 * Crea un ClaseGrupo (comisión operativa con horario)
 */
export async function createTestClaseGrupo(
  prisma: PrismaService,
  options: CreateClaseGrupoOptions,
) {
  const uniqueSuffix = generateUniqueSuffix();
  const now = new Date();
  const yearEnd = new Date(now.getFullYear(), 11, 15); // 15 de diciembre

  // Crear grupo si no se provee
  let grupoId = options.grupoId;
  if (!grupoId) {
    const grupo = await createTestGrupo(prisma, { sectorId: options.sectorId });
    grupoId = grupo.id;
  }

  return prisma.claseGrupo.create({
    data: {
      codigo: options.codigo ?? `CG_${uniqueSuffix}`,
      nombre: options.nombre ?? `ClaseGrupo_${uniqueSuffix}`,
      tipo: TipoClaseGrupo.GRUPO_REGULAR,
      diaSemana: options.diaSemana ?? DiaSemana.LUNES,
      horaInicio: options.horaInicio ?? '19:30',
      horaFin: options.horaFin ?? '21:00',
      fechaInicio: options.fechaInicio ?? now,
      fechaFin: options.fechaFin ?? yearEnd,
      anioLectivo: now.getFullYear(),
      cupoMaximo: options.cupoMaximo ?? 15,
      grupoId: grupoId,
      docenteId: options.docenteId,
      sectorId: options.sectorId,
      activo: options.activo ?? true,
    },
  });
}

// ============================================================================
// FACTORY: INSCRIPCIÓN CLASE GRUPO
// ============================================================================

/**
 * Inscribe un estudiante en un ClaseGrupo
 */
export async function createTestInscripcionClaseGrupo(
  prisma: PrismaService,
  estudianteId: string,
  claseGrupoId: string,
  tutorId: string,
) {
  return prisma.inscripcionClaseGrupo.create({
    data: {
      claseGrupoId: claseGrupoId,
      estudianteId: estudianteId,
      tutorId: tutorId,
    },
  });
}

// ============================================================================
// FACTORY: CLASE (individual con reservas)
// ============================================================================

export interface CreateTestClaseOptions {
  docenteId: string;
  nombre?: string;
  descripcion?: string;
  fechaHoraInicio?: Date;
  duracionMinutos?: number;
  cuposMaximo?: number;
  sectorId?: string;
}

/**
 * Crea una Clase individual (para sistema de reservas/cupos)
 * Diferente de ClaseGrupo que es para comisiones recurrentes
 */
export async function createTestClase(
  prisma: PrismaService,
  options: CreateTestClaseOptions,
) {
  const uniqueSuffix = generateUniqueSuffix();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.clase.create({
    data: {
      nombre: options.nombre ?? `Clase_${uniqueSuffix}`,
      descripcion: options.descripcion ?? 'Clase de test',
      docenteId: options.docenteId,
      fechaHoraInicio: options.fechaHoraInicio ?? tomorrow,
      duracionMinutos: options.duracionMinutos ?? 60,
      cuposMaximo: options.cuposMaximo ?? 10,
      sectorId: options.sectorId,
    },
  });
}
