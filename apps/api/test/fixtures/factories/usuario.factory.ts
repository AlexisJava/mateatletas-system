/**
 * ============================================================================
 * USUARIO FACTORY - Factories para Usuarios de Test
 * ============================================================================
 *
 * Factories para crear tutores, estudiantes, docentes y admins en tests.
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import { EstadoAccesoEstudiante } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// ============================================================================
// TIPOS DE RETORNO
// ============================================================================

export interface TestTutorWithPassword {
  tutor: Awaited<ReturnType<PrismaService['tutor']['create']>>;
  password: string;
}

export interface TestEstudianteWithPassword {
  estudiante: Awaited<ReturnType<PrismaService['estudiante']['create']>>;
  password: string;
}

export interface TestDocenteWithPassword {
  docente: Awaited<ReturnType<PrismaService['docente']['create']>>;
  password: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const DEFAULT_PASSWORD = 'TestPassword123!';
const BCRYPT_ROUNDS = 10;

// ============================================================================
// HELPERS INTERNOS
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function generateUniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// FACTORY: TUTOR
// ============================================================================

export interface CreateTestTutorOptions {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
}

/**
 * Crea un tutor de prueba con password hasheado
 * Retorna el tutor y el password plano para usar en login
 */
export async function createTestTutor(
  prisma: PrismaService,
  options?: CreateTestTutorOptions,
): Promise<TestTutorWithPassword> {
  const password = options?.password ?? DEFAULT_PASSWORD;
  const passwordHash = await hashPassword(password);
  const uniqueSuffix = generateUniqueSuffix();

  const tutor = await prisma.tutor.create({
    data: {
      nombre: options?.nombre ?? 'Tutor',
      apellido: options?.apellido ?? 'Test',
      email: options?.email ?? `tutor_${uniqueSuffix}@test.com`,
      password_hash: passwordHash,
    },
  });

  return { tutor, password };
}

// ============================================================================
// FACTORY: DOCENTE
// ============================================================================

export interface CreateTestDocenteOptions {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
}

/**
 * Crea un docente de prueba con password hasheado
 */
export async function createTestDocente(
  prisma: PrismaService,
  options?: CreateTestDocenteOptions,
): Promise<TestDocenteWithPassword> {
  const password = options?.password ?? DEFAULT_PASSWORD;
  const passwordHash = await hashPassword(password);
  const uniqueSuffix = generateUniqueSuffix();

  const docente = await prisma.docente.create({
    data: {
      nombre: options?.nombre ?? 'Docente',
      apellido: options?.apellido ?? 'Test',
      email: options?.email ?? `docente_${uniqueSuffix}@test.com`,
      password_hash: passwordHash,
      must_change_password: false,
    },
  });

  return { docente, password };
}

// ============================================================================
// FACTORY: ADMIN
// ============================================================================

export interface CreateTestAdminOptions {
  nombre?: string;
  apellido?: string;
  email?: string;
}

/**
 * Crea un admin de prueba
 */
export async function createTestAdmin(
  prisma: PrismaService,
  options?: CreateTestAdminOptions,
) {
  const uniqueSuffix = generateUniqueSuffix();

  return prisma.admin.create({
    data: {
      nombre: options?.nombre ?? 'Admin',
      apellido: options?.apellido ?? 'Test',
      email: options?.email ?? `admin_${uniqueSuffix}@test.com`,
      password_hash: await hashPassword(DEFAULT_PASSWORD),
    },
  });
}

// ============================================================================
// FACTORY: ESTUDIANTE
// ============================================================================

export interface CreateEstudianteOptions {
  nombre?: string;
  apellido?: string;
  username?: string;
  password?: string;
  edad?: number;
  nivelEscolar?: string;
  tutorId?: string;
  planId?: string;
  casaId?: string;
  xpInicial?: number;
  rachaInicial?: number;
  suspendido?: boolean;
  override?: {
    acceso_clases_vivo?: boolean;
    hasta?: Date | null;
    motivo?: string;
  };
}

/**
 * Crea un estudiante de prueba completo con:
 * - Password hasheado (bcrypt)
 * - Tutor (creado si no se provee)
 * - RecursosEstudiante inicializados
 * - RachaEstudiante inicializada
 *
 * Retorna el estudiante y el password plano para login
 */
export async function createTestEstudiante(
  prisma: PrismaService,
  options?: CreateEstudianteOptions,
): Promise<TestEstudianteWithPassword> {
  const password = options?.password ?? DEFAULT_PASSWORD;
  const passwordHash = await hashPassword(password);
  const uniqueSuffix = generateUniqueSuffix();

  // Crear tutor si no se proporciona
  let tutorId = options?.tutorId;
  if (!tutorId) {
    const { tutor } = await createTestTutor(prisma);
    tutorId = tutor.id;
  }

  const estudiante = await prisma.estudiante.create({
    data: {
      nombre: options?.nombre ?? 'Test',
      apellido: options?.apellido ?? 'Student',
      username: options?.username ?? `test_${uniqueSuffix}`,
      password_hash: passwordHash,
      estado_acceso: options?.suspendido
        ? EstadoAccesoEstudiante.SUSPENDIDO
        : EstadoAccesoEstudiante.ACTIVO,
      nivelEscolar: options?.nivelEscolar ?? '1ro Primaria',
      edad: options?.edad ?? 10,
      tutor_id: tutorId,
      plan_id: options?.planId,
      casaId: options?.casaId,
      // Override de acceso
      acceso_override: options?.override?.acceso_clases_vivo ?? false,
      acceso_override_hasta: options?.override?.hasta,
      acceso_override_motivo: options?.override?.motivo,
    },
  });

  // Crear recursos
  await prisma.recursosEstudiante.create({
    data: {
      estudiante_id: estudiante.id,
      xp_total: options?.xpInicial ?? 0,
    },
  });

  // Crear racha
  await prisma.rachaEstudiante.create({
    data: {
      estudiante_id: estudiante.id,
      racha_actual: options?.rachaInicial ?? 0,
      racha_maxima: options?.rachaInicial ?? 0,
      total_dias_activos: 0,
    },
  });

  return { estudiante, password };
}
