/**
 * Helper para limpieza de DB y creación de fixtures en tests de integración
 *
 * Usa TRUNCATE CASCADE para limpiar tablas respetando FKs.
 * Provee factories para crear entidades completas para tests.
 */

import { PrismaService } from '../../src/core/database/prisma.service';
import {
  MundoTipo,
  CasaTipo,
  DiaSemana,
  TipoClaseGrupo,
  EstadoAccesoEstudiante,
  EstadoSuscripcion,
  TipoProducto,
  EstadoInscripcionComision,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

// ============================================================================
// TIPOS DE RETORNO CON PASSWORD PLANO
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
// FUNCIONES DE LIMPIEZA
// ============================================================================

/**
 * Limpia las tablas de gamificación en orden correcto
 * para respetar foreign keys
 */
export async function cleanGamificationTables(prisma: PrismaService) {
  // Primero tablas hijas, luego padres
  // NOTA: NO borrar prisma.logro - son datos de configuración/seed, no datos de test
  await prisma.transaccionRecurso.deleteMany({});
  await prisma.logroEstudiante.deleteMany({});
  await prisma.recursosEstudiante.deleteMany({});
  await prisma.rachaEstudiante.deleteMany({});
  await prisma.progresoContenido.deleteMany({});
  await prisma.nodoContenido.deleteMany({});
  await prisma.contenido.deleteMany({});
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
 * Limpieza completa de todas las tablas relevantes para tests
 * Orden: hijos primero, padres después
 */
export async function cleanAllTestTables(prisma: PrismaService) {
  // Seguridad - Limpiar intentos de login para evitar bloqueos entre tests
  await prisma.loginAttempt.deleteMany({});

  // Activity Feed
  await prisma.reaccionFeed.deleteMany({});
  await prisma.actividadFeed.deleteMany({});

  // Progreso y tareas
  await prisma.progresoTareaEstudiante.deleteMany({});
  await prisma.progresoClaseEstudiante.deleteMany({});

  // Inscripciones
  await prisma.inscripcionComision.deleteMany({});
  await prisma.inscripcionClaseGrupo.deleteMany({});

  // Asistencias
  await prisma.asistenciaClaseGrupo.deleteMany({});
  await prisma.asistenciaLive.deleteMany({});

  // Gamificación
  await cleanGamificationTables(prisma);

  // Suscripciones
  await prisma.pagoSuscripcion.deleteMany({});
  await prisma.historialEstadoSuscripcion.deleteMany({});
  await prisma.suscripcion.deleteMany({});

  // Comisiones y ClaseGrupos
  await prisma.comision.deleteMany({});
  await prisma.claseGrupo.deleteMany({});

  // Grupos y Sectores
  await prisma.grupo.deleteMany({});
  await prisma.sector.deleteMany({});

  // Productos y Planes
  await prisma.producto.deleteMany({});
  await prisma.planSuscripcion.deleteMany({});

  // Usuarios
  await prisma.estudiante.deleteMany({});
  await prisma.tutor.deleteMany({});
  await prisma.docente.deleteMany({});
  await prisma.admin.deleteMany({});
}

// ============================================================================
// FACTORIES - PLANES Y SUSCRIPCIONES
// ============================================================================

export type PlanTipo =
  | 'STEAM_LIBROS'
  | 'STEAM_ASINCRONICO'
  | 'STEAM_SINCRONICO';

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

/**
 * Crea una suscripción activa para un tutor
 */
export async function createTestSuscripcion(
  prisma: PrismaService,
  tutorId: string,
  planId: string,
  options?: {
    estado?: EstadoSuscripcion;
    fechaInicio?: Date;
    precioFinal?: number;
  },
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

// ============================================================================
// FACTORIES - USUARIOS
// ============================================================================

const DEFAULT_PASSWORD = 'TestPassword123!';
const BCRYPT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Crea un tutor de prueba con password hasheado
 * Retorna el tutor y el password plano para usar en login
 */
export async function createTestTutor(
  prisma: PrismaService,
  options?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
  },
): Promise<TestTutorWithPassword> {
  const password = options?.password ?? DEFAULT_PASSWORD;
  const passwordHash = await hashPassword(password);
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

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

/**
 * Crea un docente de prueba con password hasheado
 */
export async function createTestDocente(
  prisma: PrismaService,
  options?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
  },
): Promise<TestDocenteWithPassword> {
  const password = options?.password ?? DEFAULT_PASSWORD;
  const passwordHash = await hashPassword(password);
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

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

/**
 * Crea un admin de prueba
 */
export async function createTestAdmin(
  prisma: PrismaService,
  options?: {
    nombre?: string;
    apellido?: string;
    email?: string;
  },
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return prisma.admin.create({
    data: {
      nombre: options?.nombre ?? 'Admin',
      apellido: options?.apellido ?? 'Test',
      email: options?.email ?? `admin_${uniqueSuffix}@test.com`,
      password_hash: await hashPassword(DEFAULT_PASSWORD),
    },
  });
}

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
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

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

// ============================================================================
// FACTORIES - GRUPOS Y CLASES
// ============================================================================

/**
 * Crea un sector (Matemática, Programación)
 */
export async function createTestSector(
  prisma: PrismaService,
  options?: {
    nombre?: string;
    color?: string;
    icono?: string;
  },
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return prisma.sector.create({
    data: {
      nombre: options?.nombre ?? `Sector_${uniqueSuffix}`,
      color: options?.color ?? '#6366F1',
      icono: options?.icono ?? '📚',
      activo: true,
    },
  });
}

/**
 * Crea un grupo pedagógico (B1, B2, etc.)
 */
export async function createTestGrupo(
  prisma: PrismaService,
  options?: {
    codigo?: string;
    nombre?: string;
    sectorId?: string;
  },
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return prisma.grupo.create({
    data: {
      codigo: options?.codigo ?? `GP_${uniqueSuffix}`,
      nombre: options?.nombre ?? `Grupo Test ${uniqueSuffix}`,
      sector_id: options?.sectorId,
      activo: true,
    },
  });
}

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
}

/**
 * Crea un ClaseGrupo (comisión operativa con horario)
 */
export async function createTestClaseGrupo(
  prisma: PrismaService,
  options: CreateClaseGrupoOptions,
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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
      dia_semana: options.diaSemana ?? DiaSemana.LUNES,
      hora_inicio: options.horaInicio ?? '19:30',
      hora_fin: options.horaFin ?? '21:00',
      fecha_inicio: options.fechaInicio ?? now,
      fecha_fin: options.fechaFin ?? yearEnd,
      anio_lectivo: now.getFullYear(),
      cupo_maximo: options.cupoMaximo ?? 15,
      grupo_id: grupoId,
      docente_id: options.docenteId,
      sector_id: options.sectorId,
      activo: true,
    },
  });
}

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
      clase_grupo_id: claseGrupoId,
      estudiante_id: estudianteId,
      tutor_id: tutorId,
    },
  });
}

// ============================================================================
// FACTORIES - COMISIONES (PRODUCTOS)
// ============================================================================

/**
 * Crea un producto (Colonia, Taller, etc.)
 */
export async function createTestProducto(
  prisma: PrismaService,
  options?: {
    nombre?: string;
    tipo?: TipoProducto;
    precio?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
    cupoMaximo?: number;
  },
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return prisma.producto.create({
    data: {
      nombre: options?.nombre ?? `Producto_${uniqueSuffix}`,
      tipo: options?.tipo ?? TipoProducto.Curso,
      precio: options?.precio ?? 10000,
      fecha_inicio: options?.fechaInicio,
      fecha_fin: options?.fechaFin,
      cupo_maximo: options?.cupoMaximo,
      activo: true,
    },
  });
}

export interface CreateComisionOptions {
  productoId: string;
  docenteId?: string;
  casaId?: string;
  nombre?: string;
  horario?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  cupoMaximo?: number;
}

/**
 * Crea una comisión de producto
 */
export async function createTestComision(
  prisma: PrismaService,
  options: CreateComisionOptions,
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return prisma.comision.create({
    data: {
      nombre: options.nombre ?? `Comision_${uniqueSuffix}`,
      producto_id: options.productoId,
      docente_id: options.docenteId,
      casa_id: options.casaId,
      horario: options.horario ?? 'Lun-Vie 9:00-12:00',
      fecha_inicio: options.fechaInicio,
      fecha_fin: options.fechaFin,
      cupo_maximo: options.cupoMaximo,
      activo: true,
    },
  });
}

/**
 * Inscribe un estudiante en una comisión
 */
export async function createTestInscripcionComision(
  prisma: PrismaService,
  estudianteId: string,
  comisionId: string,
  estado: EstadoInscripcionComision = EstadoInscripcionComision.Confirmada,
) {
  return prisma.inscripcionComision.create({
    data: {
      comision_id: comisionId,
      estudiante_id: estudianteId,
      estado,
    },
  });
}

// ============================================================================
// FACTORIES - CONTENIDO Y PROGRESO
// ============================================================================

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
  const codigo =
    data?.codigo ??
    `test_logro_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Usar upsert para evitar constraint violation si el logro ya existe (ej: seeded)
  return prisma.logro.upsert({
    where: { codigo },
    update: {},
    create: {
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

// ============================================================================
// FACTORIES - ACTIVITY FEED
// ============================================================================

export type TipoActividadFeed =
  | 'LECCION_COMPLETADA'
  | 'CLASE_COMPLETADA'
  | 'TAREA_COMPLETADA'
  | 'TAREA_PERFECTA'
  | 'PLANIFICACION_COMPLETADA'
  | 'LOGRO_DESBLOQUEADO'
  | 'NIVEL_SUBIDO'
  | 'RACHA_EXTENDIDA';

/**
 * Crea una actividad en el feed
 */
export async function createTestActividadFeed(
  prisma: PrismaService,
  estudianteId: string,
  options?: {
    tipo?: TipoActividadFeed;
    mensaje?: string;
    xpGanado?: number;
    casaId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  return prisma.actividadFeed.create({
    data: {
      estudiante_id: estudianteId,
      tipo: options?.tipo ?? 'LECCION_COMPLETADA',
      mensaje: options?.mensaje ?? 'Completó una lección',
      xp_ganado: options?.xpGanado ?? 10,
      casa_id: options?.casaId,
      metadata: options?.metadata ?? {},
    },
  });
}

/**
 * Crea una reacción a una actividad
 */
export async function createTestReaccionFeed(
  prisma: PrismaService,
  actividadId: string,
  estudianteId: string,
  emoji: string = '👏',
) {
  return prisma.reaccionFeed.create({
    data: {
      actividad_id: actividadId,
      estudiante_id: estudianteId,
      emoji,
    },
  });
}

// ============================================================================
// HELPERS PARA ESCENARIOS COMPLETOS
// ============================================================================

/**
 * Crea un escenario completo con estudiante inscrito en comisión
 * Útil para tests de clases en vivo
 */
export async function createEstudianteConComision(
  prisma: PrismaService,
  options?: {
    planTipo?: PlanTipo;
    conProgreso?: boolean;
  },
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

/**
 * Crea un escenario completo con estudiante inscrito en ClaseGrupo
 * Útil para tests de aula virtual
 */
export async function createEstudianteConClaseGrupo(
  prisma: PrismaService,
  options?: {
    planTipo?: PlanTipo;
  },
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

  // Crear sector y ClaseGrupo
  const sector = await createTestSector(prisma, { nombre: 'Matemática' });
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
// FACTORIES - PLANIFICACIONES Y AULA VIRTUAL
// ============================================================================

/**
 * Crea contenido de test (teoría o práctica)
 */
export async function createTestContenidoPlanificacion(
  prisma: PrismaService,
  adminId: string,
  options: { titulo?: string; tipo?: string } = {},
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

/**
 * Crea una planificación completa con clases, teoría y práctica
 */
export async function createTestPlanificacion(
  prisma: PrismaService,
  adminId: string,
  options: { cantidadClases?: number; titulo?: string } = {},
) {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

/**
 * Asigna una planificación a un ClaseGrupo y activa clases específicas
 */
export async function createTestAsignacionPlanificacion(
  prisma: PrismaService,
  planificacionId: string,
  claseGrupoId: string,
  docenteId: string,
  options: { activarClases?: number[] } = {},
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

/**
 * Setup completo para tests de Aula Virtual
 * Crea: admin, docente, sector, grupo, claseGrupo, estudiante, planificación, asignación
 */
export async function createFullAulaSetup(
  prisma: PrismaService,
  options: { cantidadClases?: number; activarClases?: number[] } = {},
) {
  // Crear admin para contenido
  const admin = await createTestAdmin(prisma);

  // Crear docente
  const { docente, password: docentePassword } =
    await createTestDocente(prisma);

  // Crear sector
  const sector = await createTestSector(prisma);

  // Crear grupo
  const grupo = await prisma.grupo.create({
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
