/**
 * Helper para limpieza de DB en tests de integración
 *
 * Usa TRUNCATE CASCADE para limpiar tablas respetando FKs.
 * Específico para tests de gamificación.
 */

import { PrismaService } from '../../src/core/database/prisma.service';
import { MundoTipo, CasaTipo } from '@prisma/client';

/**
 * Limpia las tablas de gamificación en orden correcto
 * para respetar foreign keys
 */
export async function cleanGamificationTables(prisma: PrismaService) {
  // Primero tablas hijas, luego padres
  await prisma.transaccionRecurso.deleteMany({});
  await prisma.logroEstudiante.deleteMany({});
  await prisma.recursosEstudiante.deleteMany({});
  await prisma.rachaEstudiante.deleteMany({});
  await prisma.progresoContenido.deleteMany({});
  await prisma.nodoContenido.deleteMany({});
  await prisma.contenido.deleteMany({});
  await prisma.logro.deleteMany({});
  await prisma.admin.deleteMany({});
}

/**
 * Limpia estudiantes, tutores y sus datos relacionados
 */
export async function cleanEstudiantes(prisma: PrismaService) {
  await cleanGamificationTables(prisma);
  await prisma.estudiante.deleteMany({});
  await prisma.tutor.deleteMany({});
}

/**
 * Crea un tutor de prueba para usar como FK en estudiantes
 */
export async function createTestTutor(prisma: PrismaService) {
  return prisma.tutor.create({
    data: {
      nombre: 'Tutor',
      apellido: 'Test',
      email: `tutor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`,
      password_hash: 'test-hash',
    },
  });
}

/**
 * Crea un estudiante de prueba con recursos y racha inicializados
 */
export async function createTestEstudiante(
  prisma: PrismaService,
  data?: {
    nombre?: string;
    apellido?: string;
    username?: string;
    xpInicial?: number;
    rachaInicial?: number;
    tutorId?: string;
  },
) {
  const nombre = data?.nombre ?? 'Test';
  const apellido = data?.apellido ?? 'Student';
  const username =
    data?.username ??
    `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Crear tutor si no se proporciona
  let tutorId = data?.tutorId;
  if (!tutorId) {
    const tutor = await createTestTutor(prisma);
    tutorId = tutor.id;
  }

  const estudiante = await prisma.estudiante.create({
    data: {
      nombre,
      apellido,
      username,
      password_hash: 'test-hash',
      estado_acceso: 'ACTIVO',
      nivelEscolar: '1ro Primaria',
      edad: 10,
      tutor_id: tutorId,
    },
  });

  // Crear recursos
  await prisma.recursosEstudiante.create({
    data: {
      estudiante_id: estudiante.id,
      xp_total: data?.xpInicial ?? 0,
    },
  });

  // Crear racha
  await prisma.rachaEstudiante.create({
    data: {
      estudiante_id: estudiante.id,
      racha_actual: data?.rachaInicial ?? 0,
      racha_maxima: data?.rachaInicial ?? 0,
      total_dias_activos: 0,
    },
  });

  return estudiante;
}

/**
 * Crea un logro de prueba
 */
export async function createTestLogro(
  prisma: PrismaService,
  data?: {
    codigo?: string;
    nombre?: string;
    xp_recompensa?: number;
    categoria?: string;
    rareza?: string;
  },
) {
  const codigo = data?.codigo ?? `test_logro_${Date.now()}`;

  return prisma.logro.create({
    data: {
      codigo,
      nombre: data?.nombre ?? 'Test Logro',
      descripcion: 'Logro de prueba',
      categoria: data?.categoria ?? 'PARTICIPACION',
      rareza: data?.rareza ?? 'COMUN',
      xp_recompensa: data?.xp_recompensa ?? 50,
      icono: '🎯',
      criterio_tipo: 'manual',
      criterio_valor: '{}',
    },
  });
}

/**
 * Crea un admin de prueba para usar como FK en contenidos
 */
export async function createTestAdmin(prisma: PrismaService) {
  return prisma.admin.create({
    data: {
      nombre: 'Admin',
      apellido: 'Test',
      email: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`,
      password_hash: 'test-hash',
    },
  });
}

/**
 * Crea un contenido de prueba
 */
export async function createTestContenido(
  prisma: PrismaService,
  data?: {
    titulo?: string;
    mundoTipo?: MundoTipo;
    casaTipo?: CasaTipo;
    creadorId?: string;
  },
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
