/**
 * ============================================================================
 * DB ASSERTIONS - Helpers de Verificación para Tests de Integración
 * ============================================================================
 *
 * Funciones para verificar estado de la base de datos después de operaciones.
 * Útil para assertions complejas que requieren múltiples queries.
 *
 * Uso:
 *   await assertEstudianteExists(prisma, { username: 'test_user' });
 *   await assertXPIncreased(prisma, estudianteId, 50);
 */

import { PrismaService } from '../../src/core/database/prisma.service';
import { EstadoAccesoEstudiante, EstadoSuscripcion } from '@prisma/client';

// ============================================================================
// ASSERTIONS DE EXISTENCIA
// ============================================================================

/**
 * Verifica que un estudiante existe con los datos esperados
 */
export async function assertEstudianteExists(
  prisma: PrismaService,
  criteria: {
    id?: string;
    username?: string;
    email?: string;
  },
  expected?: {
    nombre?: string;
    apellido?: string;
    estado_acceso?: EstadoAccesoEstudiante;
    plan_id?: string | null;
    tutor_id?: string;
  },
): Promise<void> {
  const estudiante = await prisma.estudiante.findFirst({
    where: {
      id: criteria.id,
      username: criteria.username,
    },
  });

  if (!estudiante) {
    throw new Error(
      `Estudiante no encontrado con criterio: ${JSON.stringify(criteria)}`,
    );
  }

  if (expected) {
    const mismatches: string[] = [];

    if (expected.nombre && estudiante.nombre !== expected.nombre) {
      mismatches.push(
        `nombre: esperado "${expected.nombre}", actual "${estudiante.nombre}"`,
      );
    }
    if (expected.apellido && estudiante.apellido !== expected.apellido) {
      mismatches.push(
        `apellido: esperado "${expected.apellido}", actual "${estudiante.apellido}"`,
      );
    }
    if (
      expected.estado_acceso &&
      estudiante.estado_acceso !== expected.estado_acceso
    ) {
      mismatches.push(
        `estado_acceso: esperado "${expected.estado_acceso}", actual "${estudiante.estado_acceso}"`,
      );
    }
    if (
      expected.plan_id !== undefined &&
      estudiante.plan_id !== expected.plan_id
    ) {
      mismatches.push(
        `plan_id: esperado "${expected.plan_id}", actual "${estudiante.plan_id}"`,
      );
    }
    if (expected.tutor_id && estudiante.tutor_id !== expected.tutor_id) {
      mismatches.push(
        `tutor_id: esperado "${expected.tutor_id}", actual "${estudiante.tutor_id}"`,
      );
    }

    if (mismatches.length > 0) {
      throw new Error(
        `Estudiante encontrado pero con valores incorrectos:\n${mismatches.join('\n')}`,
      );
    }
  }
}

/**
 * Verifica que un estudiante NO existe
 */
export async function assertEstudianteNotExists(
  prisma: PrismaService,
  criteria: {
    id?: string;
    username?: string;
  },
): Promise<void> {
  const estudiante = await prisma.estudiante.findFirst({
    where: {
      id: criteria.id,
      username: criteria.username,
    },
  });

  if (estudiante) {
    throw new Error(
      `Se esperaba que el estudiante NO existiera, pero se encontró: ${estudiante.username}`,
    );
  }
}

/**
 * Verifica que un tutor existe
 */
export async function assertTutorExists(
  prisma: PrismaService,
  criteria: { id?: string; email?: string },
): Promise<void> {
  const tutor = await prisma.tutor.findFirst({
    where: {
      id: criteria.id,
      email: criteria.email,
    },
  });

  if (!tutor) {
    throw new Error(
      `Tutor no encontrado con criterio: ${JSON.stringify(criteria)}`,
    );
  }
}

// ============================================================================
// ASSERTIONS DE GAMIFICACIÓN
// ============================================================================

/**
 * Verifica que el XP del estudiante es el esperado
 */
export async function assertXPEquals(
  prisma: PrismaService,
  estudianteId: string,
  expectedXP: number,
): Promise<void> {
  const recursos = await prisma.recursosEstudiante.findUnique({
    where: { estudiante_id: estudianteId },
  });

  if (!recursos) {
    throw new Error(`RecursosEstudiante no encontrado para ${estudianteId}`);
  }

  if (recursos.xp_total !== expectedXP) {
    throw new Error(
      `XP incorrecto: esperado ${expectedXP}, actual ${recursos.xp_total}`,
    );
  }
}

/**
 * Verifica que el XP aumentó en al menos la cantidad especificada
 */
export async function assertXPIncreased(
  prisma: PrismaService,
  estudianteId: string,
  minIncrease: number,
  previousXP: number,
): Promise<void> {
  const recursos = await prisma.recursosEstudiante.findUnique({
    where: { estudiante_id: estudianteId },
  });

  if (!recursos) {
    throw new Error(`RecursosEstudiante no encontrado para ${estudianteId}`);
  }

  const actualIncrease = recursos.xp_total - previousXP;
  if (actualIncrease < minIncrease) {
    throw new Error(
      `XP no aumentó suficiente: esperado al menos +${minIncrease}, actual +${actualIncrease}`,
    );
  }
}

/**
 * Verifica la racha actual del estudiante
 */
export async function assertRachaEquals(
  prisma: PrismaService,
  estudianteId: string,
  expectedRacha: number,
): Promise<void> {
  const racha = await prisma.rachaEstudiante.findUnique({
    where: { estudiante_id: estudianteId },
  });

  if (!racha) {
    throw new Error(`RachaEstudiante no encontrada para ${estudianteId}`);
  }

  if (racha.racha_actual !== expectedRacha) {
    throw new Error(
      `Racha incorrecta: esperado ${expectedRacha}, actual ${racha.racha_actual}`,
    );
  }
}

/**
 * Verifica que el estudiante tiene un logro específico
 */
export async function assertHasLogro(
  prisma: PrismaService,
  estudianteId: string,
  logroCodigo: string,
): Promise<void> {
  const logroEstudiante = await prisma.logroEstudiante.findFirst({
    where: {
      estudiante_id: estudianteId,
      logro: {
        codigo: logroCodigo,
      },
    },
    include: {
      logro: true,
    },
  });

  if (!logroEstudiante) {
    throw new Error(
      `Estudiante ${estudianteId} no tiene el logro "${logroCodigo}"`,
    );
  }
}

/**
 * Verifica que el estudiante NO tiene un logro específico
 */
export async function assertNotHasLogro(
  prisma: PrismaService,
  estudianteId: string,
  logroCodigo: string,
): Promise<void> {
  const logroEstudiante = await prisma.logroEstudiante.findFirst({
    where: {
      estudiante_id: estudianteId,
      logro: {
        codigo: logroCodigo,
      },
    },
  });

  if (logroEstudiante) {
    throw new Error(
      `Se esperaba que el estudiante NO tuviera el logro "${logroCodigo}", pero lo tiene`,
    );
  }
}

/**
 * Verifica cantidad de logros del estudiante
 */
export async function assertLogrosCount(
  prisma: PrismaService,
  estudianteId: string,
  expectedCount: number,
): Promise<void> {
  const count = await prisma.logroEstudiante.count({
    where: { estudiante_id: estudianteId },
  });

  if (count !== expectedCount) {
    throw new Error(
      `Cantidad de logros incorrecta: esperado ${expectedCount}, actual ${count}`,
    );
  }
}

// ============================================================================
// ASSERTIONS DE SUSCRIPCIONES
// ============================================================================

/**
 * Verifica el estado de una suscripción
 */
export async function assertSuscripcionEstado(
  prisma: PrismaService,
  tutorId: string,
  expectedEstado: EstadoSuscripcion,
): Promise<void> {
  const suscripcion = await prisma.suscripcion.findFirst({
    where: { tutor_id: tutorId },
    orderBy: { fecha_inicio: 'desc' },
  });

  if (!suscripcion) {
    throw new Error(`Suscripción no encontrada para tutor ${tutorId}`);
  }

  if (suscripcion.estado !== expectedEstado) {
    throw new Error(
      `Estado de suscripción incorrecto: esperado "${expectedEstado}", actual "${suscripcion.estado}"`,
    );
  }
}

/**
 * Verifica que existe una suscripción activa
 */
export async function assertTieneSuscripcionActiva(
  prisma: PrismaService,
  tutorId: string,
): Promise<void> {
  const suscripcion = await prisma.suscripcion.findFirst({
    where: {
      tutor_id: tutorId,
      estado: EstadoSuscripcion.ACTIVA,
    },
  });

  if (!suscripcion) {
    throw new Error(`Tutor ${tutorId} no tiene suscripción activa`);
  }
}

// ============================================================================
// ASSERTIONS DE INSCRIPCIONES
// ============================================================================

/**
 * Verifica que un estudiante está inscrito en un ClaseGrupo
 */
export async function assertInscritoEnClaseGrupo(
  prisma: PrismaService,
  estudianteId: string,
  claseGrupoId: string,
): Promise<void> {
  const inscripcion = await prisma.inscripcionClaseGrupo.findFirst({
    where: {
      estudiante_id: estudianteId,
      clase_grupo_id: claseGrupoId,
    },
  });

  if (!inscripcion) {
    throw new Error(
      `Estudiante ${estudianteId} no está inscrito en ClaseGrupo ${claseGrupoId}`,
    );
  }
}

/**
 * Verifica que un estudiante está inscrito en una comisión
 */
export async function assertInscritoEnComision(
  prisma: PrismaService,
  estudianteId: string,
  comisionId: string,
): Promise<void> {
  const inscripcion = await prisma.inscripcionComision.findFirst({
    where: {
      estudiante_id: estudianteId,
      comision_id: comisionId,
    },
  });

  if (!inscripcion) {
    throw new Error(
      `Estudiante ${estudianteId} no está inscrito en comisión ${comisionId}`,
    );
  }
}

/**
 * Cuenta inscripciones de un estudiante
 */
export async function assertInscripcionesCount(
  prisma: PrismaService,
  estudianteId: string,
  expected: { claseGrupos?: number; comisiones?: number },
): Promise<void> {
  if (expected.claseGrupos !== undefined) {
    const countCG = await prisma.inscripcionClaseGrupo.count({
      where: { estudiante_id: estudianteId },
    });
    if (countCG !== expected.claseGrupos) {
      throw new Error(
        `Inscripciones en ClaseGrupos: esperado ${expected.claseGrupos}, actual ${countCG}`,
      );
    }
  }

  if (expected.comisiones !== undefined) {
    const countC = await prisma.inscripcionComision.count({
      where: { estudiante_id: estudianteId },
    });
    if (countC !== expected.comisiones) {
      throw new Error(
        `Inscripciones en comisiones: esperado ${expected.comisiones}, actual ${countC}`,
      );
    }
  }
}

// ============================================================================
// ASSERTIONS DE ACTIVITY FEED
// ============================================================================

/**
 * Verifica que existe una actividad en el feed
 */
export async function assertActividadFeedExists(
  prisma: PrismaService,
  estudianteId: string,
  tipo: string,
): Promise<void> {
  const actividad = await prisma.actividadFeed.findFirst({
    where: {
      estudiante_id: estudianteId,
      tipo,
    },
  });

  if (!actividad) {
    throw new Error(
      `No se encontró actividad de tipo "${tipo}" para estudiante ${estudianteId}`,
    );
  }
}

/**
 * Cuenta actividades en el feed de un estudiante
 */
export async function assertActividadesFeedCount(
  prisma: PrismaService,
  estudianteId: string,
  expectedCount: number,
): Promise<void> {
  const count = await prisma.actividadFeed.count({
    where: { estudiante_id: estudianteId },
  });

  if (count !== expectedCount) {
    throw new Error(
      `Cantidad de actividades incorrecta: esperado ${expectedCount}, actual ${count}`,
    );
  }
}

/**
 * Verifica que una actividad tiene el número esperado de reacciones
 */
export async function assertReaccionesCount(
  prisma: PrismaService,
  actividadId: string,
  expectedCount: number,
): Promise<void> {
  const count = await prisma.reaccionFeed.count({
    where: { actividad_id: actividadId },
  });

  if (count !== expectedCount) {
    throw new Error(
      `Cantidad de reacciones incorrecta: esperado ${expectedCount}, actual ${count}`,
    );
  }
}

// ============================================================================
// ASSERTIONS DE PROGRESO
// ============================================================================

/**
 * Verifica el progreso de una clase
 */
export async function assertProgresoClase(
  prisma: PrismaService,
  estudianteId: string,
  claseGrupoId: string,
  expectedPorcentaje: number,
): Promise<void> {
  const progreso = await prisma.progresoClaseEstudiante.findFirst({
    where: {
      estudiante_id: estudianteId,
      clase_grupo_id: claseGrupoId,
    },
  });

  if (!progreso) {
    throw new Error(
      `Progreso no encontrado para estudiante ${estudianteId} en ClaseGrupo ${claseGrupoId}`,
    );
  }

  if (progreso.porcentaje_completado !== expectedPorcentaje) {
    throw new Error(
      `Porcentaje de progreso incorrecto: esperado ${expectedPorcentaje}, actual ${progreso.porcentaje_completado}`,
    );
  }
}

// ============================================================================
// HELPERS GENÉRICOS
// ============================================================================

/**
 * Obtiene el XP actual de un estudiante (para comparaciones antes/después)
 */
export async function getXPActual(
  prisma: PrismaService,
  estudianteId: string,
): Promise<number> {
  const recursos = await prisma.recursosEstudiante.findUnique({
    where: { estudiante_id: estudianteId },
  });

  return recursos?.xp_total ?? 0;
}

/**
 * Obtiene la racha actual de un estudiante
 */
export async function getRachaActual(
  prisma: PrismaService,
  estudianteId: string,
): Promise<number> {
  const racha = await prisma.rachaEstudiante.findUnique({
    where: { estudiante_id: estudianteId },
  });

  return racha?.racha_actual ?? 0;
}

/**
 * Obtiene todos los logros de un estudiante
 */
export async function getLogrosEstudiante(
  prisma: PrismaService,
  estudianteId: string,
): Promise<string[]> {
  const logros = await prisma.logroEstudiante.findMany({
    where: { estudiante_id: estudianteId },
    include: { logro: true },
  });

  return logros.map((le) => le.logro.codigo);
}

/**
 * Verifica múltiples condiciones en una sola llamada
 */
export async function assertEstudianteState(
  prisma: PrismaService,
  estudianteId: string,
  expected: {
    xp?: number;
    racha?: number;
    logrosCount?: number;
    actividadesCount?: number;
    inscripcionesClaseGrupo?: number;
    inscripcionesComision?: number;
  },
): Promise<void> {
  const errors: string[] = [];

  if (expected.xp !== undefined) {
    try {
      await assertXPEquals(prisma, estudianteId, expected.xp);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (expected.racha !== undefined) {
    try {
      await assertRachaEquals(prisma, estudianteId, expected.racha);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (expected.logrosCount !== undefined) {
    try {
      await assertLogrosCount(prisma, estudianteId, expected.logrosCount);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (expected.actividadesCount !== undefined) {
    try {
      await assertActividadesFeedCount(
        prisma,
        estudianteId,
        expected.actividadesCount,
      );
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (
    expected.inscripcionesClaseGrupo !== undefined ||
    expected.inscripcionesComision !== undefined
  ) {
    try {
      await assertInscripcionesCount(prisma, estudianteId, {
        claseGrupos: expected.inscripcionesClaseGrupo,
        comisiones: expected.inscripcionesComision,
      });
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Estado del estudiante incorrecto:\n${errors.join('\n')}`);
  }
}
