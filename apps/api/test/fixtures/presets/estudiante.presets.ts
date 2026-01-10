/**
 * ============================================================================
 * ESTUDIANTE PRESETS - Variantes Predefinidas para Tests de Integración
 * ============================================================================
 *
 * Presets listos para usar que representan escenarios comunes del estudiante.
 * Cada preset crea un escenario completo con todos los datos necesarios.
 *
 * Uso:
 *   const { estudiante, password, tutor, plan } = await ESTUDIANTE_PRESETS.planSincronico(prisma);
 *   await loginEstudiante(app, { username: estudiante.username, password });
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createTestEstudiante,
  createTestTutor,
  createTestDocente,
  TestEstudianteWithPassword,
  TestTutorWithPassword,
  TestDocenteWithPassword,
} from '../factories/usuario.factory';
import {
  createTestPlan,
  createTestSuscripcion,
  PlanTipo,
} from '../factories/plan.factory';
import {
  createTestSector,
  createTestClaseGrupo,
  createTestInscripcionClaseGrupo,
} from '../factories/grupo.factory';
import {
  createTestProducto,
  createTestComision,
  createTestInscripcionComision,
} from '../factories/comision.factory';
import {
  createTestActividadFeed,
  createTestLogro,
} from '../factories/gamificacion.factory';
import {
  EstadoSuscripcion,
  TipoProducto,
  EstadoInscripcionComision,
} from '@prisma/client';

// ============================================================================
// TIPOS COMUNES DE RETORNO
// ============================================================================

export interface PresetNuevo extends TestEstudianteWithPassword {
  tutor: TestTutorWithPassword['tutor'];
  tutorPassword: string;
}

export interface PresetConPlan extends PresetNuevo {
  plan: Awaited<ReturnType<typeof createTestPlan>>;
  suscripcion: Awaited<ReturnType<typeof createTestSuscripcion>>;
}

export interface PresetConClaseGrupo extends PresetConPlan {
  docente: TestDocenteWithPassword['docente'];
  docentePassword: string;
  sector: Awaited<ReturnType<typeof createTestSector>>;
  claseGrupo: Awaited<ReturnType<typeof createTestClaseGrupo>>;
  inscripcion: Awaited<ReturnType<typeof createTestInscripcionClaseGrupo>>;
}

export interface PresetConComision extends PresetConPlan {
  docente: TestDocenteWithPassword['docente'];
  docentePassword: string;
  producto: Awaited<ReturnType<typeof createTestProducto>>;
  comision: Awaited<ReturnType<typeof createTestComision>>;
  inscripcion: Awaited<ReturnType<typeof createTestInscripcionComision>>;
}

export interface PresetConProgreso extends PresetConPlan {
  recursos: { xpTotal: number };
  racha: { actual: number; maxima: number };
  actividades: Awaited<ReturnType<typeof createTestActividadFeed>>[];
  logros: Awaited<ReturnType<typeof createTestLogro>>[];
}

// ============================================================================
// PRESETS PREDEFINIDOS
// ============================================================================

export const ESTUDIANTE_PRESETS = {
  /**
   * Estudiante nuevo sin plan ni comisión
   * Caso: Usuario recién registrado, solo puede ver contenido gratuito
   */
  nuevo: async (prisma: PrismaService): Promise<PresetNuevo> => {
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
    };
  },

  /**
   * Estudiante con acceso heredado del tutor (STEAM_LIBROS)
   * Caso: Tutor paga suscripción → hijo hereda acceso a libros, SIN clases en vivo
   */
  planLibros: async (prisma: PrismaService): Promise<PresetConPlan> => {
    const plan = await createTestPlan(prisma, 'STEAM_LIBROS');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
    };
  },

  /**
   * Estudiante con acceso heredado del tutor (STEAM_ASINCRONICO)
   * Caso: Tutor paga suscripción → hijo hereda acceso asincrónico, SIN clases en vivo
   */
  planAsincronico: async (prisma: PrismaService): Promise<PresetConPlan> => {
    const plan = await createTestPlan(prisma, 'STEAM_ASINCRONICO');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
    };
  },

  /**
   * Estudiante con acceso heredado del tutor (STEAM_SINCRONICO)
   * Caso: Tutor paga suscripción → hijo hereda acceso completo CON clases en vivo
   */
  planSincronico: async (
    prisma: PrismaService,
  ): Promise<PresetConClaseGrupo> => {
    const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { docente, password: docentePassword } =
      await createTestDocente(prisma);
    const sector = await createTestSector(prisma, { nombre: 'Matemática' });
    const claseGrupo = await createTestClaseGrupo(prisma, {
      docenteId: docente.id,
      sectorId: sector.id,
    });

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });

    const inscripcion = await createTestInscripcionClaseGrupo(
      prisma,
      estudiante.id,
      claseGrupo.id,
      tutor.id,
    );

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
      docente,
      docentePassword,
      sector,
      claseGrupo,
      inscripcion,
    };
  },

  /**
   * Estudiante inscrito en comisión de producto (Colonia, Taller)
   * Caso: Acceso a clase en vivo por inscripción a comisión
   */
  conComision: async (prisma: PrismaService): Promise<PresetConComision> => {
    const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { docente, password: docentePassword } =
      await createTestDocente(prisma);
    const producto = await createTestProducto(prisma, {
      tipo: TipoProducto.Curso,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    const comision = await createTestComision(prisma, {
      productoId: producto.id,
      docenteId: docente.id,
    });

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      planId: plan.id,
    });

    const inscripcion = await createTestInscripcionComision(
      prisma,
      estudiante.id,
      comision.id,
      EstadoInscripcionComision.Confirmada,
    );

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
      docente,
      docentePassword,
      producto,
      comision,
      inscripcion,
    };
  },

  /**
   * Estudiante con cuenta suspendida
   * Caso: No puede acceder a ningún contenido hasta que se reactive
   */
  suspendido: async (prisma: PrismaService): Promise<PresetConPlan> => {
    const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      planId: plan.id,
      suspendido: true,
    });

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
    };
  },

  /**
   * Estudiante con suscripción vencida (tutor no pagó)
   * Caso: Acceso limitado o bloqueado hasta renovar
   */
  suscripcionVencida: async (prisma: PrismaService): Promise<PresetConPlan> => {
    const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id, {
      estado: EstadoSuscripcion.CANCELADA,
    });

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
    };
  },

  /**
   * Estudiante con acceso override temporal
   * Caso: Admin le dio acceso especial a clases en vivo sin plan
   */
  conOverride: async (prisma: PrismaService): Promise<PresetNuevo> => {
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);

    const overrideHasta = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      override: {
        acceso_clases_vivo: true,
        hasta: overrideHasta,
        motivo: 'Prueba de acceso temporal',
      },
    });

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
    };
  },

  /**
   * Estudiante con override permanente (sin fecha límite)
   * Caso: Estudiante becado o caso especial
   */
  conOverridePermanente: async (
    prisma: PrismaService,
  ): Promise<PresetNuevo> => {
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      override: {
        acceso_clases_vivo: true,
        hasta: null,
        motivo: 'Estudiante becado',
      },
    });

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
    };
  },

  /**
   * Estudiante con progreso avanzado (XP, racha, actividades)
   * Caso: Usuario activo con historial de uso
   */
  conProgreso: async (prisma: PrismaService): Promise<PresetConProgreso> => {
    const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      planId: plan.id,
      xpInicial: 1500,
      rachaInicial: 7,
    });

    const actividades = await Promise.all([
      createTestActividadFeed(prisma, estudiante.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó "Fracciones básicas"',
        xpGanado: 50,
      }),
      createTestActividadFeed(prisma, estudiante.id, {
        tipo: 'TAREA_PERFECTA',
        mensaje: 'Obtuvo 100% en ejercicios',
        xpGanado: 100,
      }),
      createTestActividadFeed(prisma, estudiante.id, {
        tipo: 'RACHA_EXTENDIDA',
        mensaje: 'Racha de 7 días',
        xpGanado: 25,
      }),
    ]);

    const logros = await Promise.all([
      createTestLogro(prisma, {
        codigo: 'primera_leccion',
        nombre: 'Primera Lección',
        xp_recompensa: 25,
        categoria: 'PARTICIPACION',
      }),
      createTestLogro(prisma, {
        codigo: 'racha_5',
        nombre: 'Racha de 5 días',
        xp_recompensa: 50,
        categoria: 'RACHA',
      }),
    ]);

    await Promise.all(
      logros.map((logro) =>
        prisma.logroEstudiante.create({
          data: {
            estudiante_id: estudiante.id,
            logro_id: logro.id,
          },
        }),
      ),
    );

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
      recursos: { xpTotal: 1500 },
      racha: { actual: 7, maxima: 7 },
      actividades,
      logros,
    };
  },

  /**
   * Estudiante "completado" - todo el progreso posible
   * Caso: Para testing de edge cases cuando ya no hay más contenido
   */
  todoCompletado: async (prisma: PrismaService): Promise<PresetConProgreso> => {
    const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
    const { tutor, password: tutorPassword } = await createTestTutor(prisma);
    const suscripcion = await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      planId: plan.id,
      xpInicial: 50000,
      rachaInicial: 100,
    });

    const actividades = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        createTestActividadFeed(prisma, estudiante.id, {
          tipo: i % 2 === 0 ? 'LECCION_COMPLETADA' : 'TAREA_PERFECTA',
          mensaje: `Actividad ${i + 1}`,
          xpGanado: 100,
        }),
      ),
    );

    const logros = await Promise.all([
      createTestLogro(prisma, {
        codigo: 'maestro_matematicas',
        nombre: 'Maestro de Matemáticas',
        xp_recompensa: 500,
        categoria: 'MAESTRIA',
        rareza: 'EPICO',
      }),
      createTestLogro(prisma, {
        codigo: 'racha_100',
        nombre: 'Racha de 100 días',
        xp_recompensa: 1000,
        categoria: 'RACHA',
        rareza: 'LEGENDARIO',
      }),
    ]);

    await Promise.all(
      logros.map((logro) =>
        prisma.logroEstudiante.create({
          data: {
            estudiante_id: estudiante.id,
            logro_id: logro.id,
          },
        }),
      ),
    );

    return {
      estudiante,
      password,
      tutor,
      tutorPassword,
      plan,
      suscripcion,
      recursos: { xpTotal: 50000 },
      racha: { actual: 100, maxima: 100 },
      actividades,
      logros,
    };
  },
};

// Alias para compatibilidad con código existente que usa ESTUDIANTE_FIXTURES
export const ESTUDIANTE_FIXTURES = ESTUDIANTE_PRESETS;

// ============================================================================
// HELPERS ADICIONALES
// ============================================================================

/**
 * Crea múltiples estudiantes del mismo tipo para tests de listados/paginación
 */
export async function createMultipleEstudiantes(
  prisma: PrismaService,
  count: number,
  presetType: keyof typeof ESTUDIANTE_PRESETS = 'nuevo',
): Promise<
  Array<Awaited<ReturnType<(typeof ESTUDIANTE_PRESETS)[typeof presetType]>>>
> {
  const presets: Array<
    Awaited<ReturnType<(typeof ESTUDIANTE_PRESETS)[typeof presetType]>>
  > = [];

  for (let i = 0; i < count; i++) {
    const preset = await ESTUDIANTE_PRESETS[presetType](prisma);
    presets.push(preset);
  }

  return presets;
}

/**
 * Crea un grupo de estudiantes para testing de features sociales
 * (Activity feed, reacciones, rankings)
 */
export async function createClaseConEstudiantes(
  prisma: PrismaService,
  numEstudiantes: number = 5,
): Promise<{
  docente: TestDocenteWithPassword['docente'];
  docentePassword: string;
  claseGrupo: Awaited<ReturnType<typeof createTestClaseGrupo>>;
  estudiantes: Array<{
    estudiante: TestEstudianteWithPassword['estudiante'];
    password: string;
    tutor: TestTutorWithPassword['tutor'];
  }>;
}> {
  const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
  const { docente, password: docentePassword } =
    await createTestDocente(prisma);
  const sector = await createTestSector(prisma, { nombre: 'Matemática' });
  const claseGrupo = await createTestClaseGrupo(prisma, {
    docenteId: docente.id,
    sectorId: sector.id,
    cupoMaximo: numEstudiantes + 5,
  });

  const estudiantes: Array<{
    estudiante: TestEstudianteWithPassword['estudiante'];
    password: string;
    tutor: TestTutorWithPassword['tutor'];
  }> = [];

  for (let i = 0; i < numEstudiantes; i++) {
    const { tutor } = await createTestTutor(prisma, {
      nombre: `Tutor${i + 1}`,
    });
    await createTestSuscripcion(prisma, tutor.id, plan.id);

    const { estudiante, password } = await createTestEstudiante(prisma, {
      nombre: `Estudiante${i + 1}`,
      tutorId: tutor.id,
      planId: plan.id,
    });

    await createTestInscripcionClaseGrupo(
      prisma,
      estudiante.id,
      claseGrupo.id,
      tutor.id,
    );

    estudiantes.push({ estudiante, password, tutor });
  }

  return {
    docente,
    docentePassword,
    claseGrupo,
    estudiantes,
  };
}
