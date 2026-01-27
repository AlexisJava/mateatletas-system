import { z } from 'zod';

/**
 * Schema principal de Docente
 * Coincide con el tipo Docente en lib/api/docentes.api.ts
 */
export const docenteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  telefono: z.string().nullish(),
  titulo: z.string().nullish(),
  tituloProfesional: z.string().nullish(),
  bio: z.string().nullish(),
  biografia: z.string().nullish(),
  especialidades: z.array(z.string()).nullish(),
  experienciaAnos: z.number().int().nonnegative().nullish(),
  disponibilidadHoraria: z.record(z.string(), z.array(z.string())).nullish(),
  nivelEducativo: z.array(z.string()).nullish(),
  estado: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Schema para lista de docentes
 */
export const docentesListSchema = z.array(docenteSchema);

/**
 * Schema para respuesta paginada
 */
export const docentesResponseSchema = z.object({
  data: z.array(docenteSchema),
  meta: z
    .object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    })
    .optional(),
});

/**
 * Schema para crear docente
 * Coincide con CreateDocenteData en lib/api/docentes.api.ts
 */
export const createDocenteSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(), // Se autogenera si se omite
  nombre: z.string(),
  apellido: z.string(),
  titulo: z.string().optional(),
  telefono: z.string().optional(),
  disponibilidadHoraria: z.record(z.string(), z.array(z.string())).optional(),
  estado: z.string().optional(),
});

/**
 * Schema para actualizar docente
 * Coincide con UpdateDocenteData en lib/api/docentes.api.ts
 */
export const updateDocenteSchema = z.object({
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  titulo: z.string().optional(),
  tituloProfesional: z.string().optional(),
  bio: z.string().optional(),
  biografia: z.string().optional(),
  especialidades: z.array(z.string()).optional(),
  experienciaAnos: z.number().int().nonnegative().optional(),
  disponibilidadHoraria: z.record(z.string(), z.array(z.string())).optional(),
  nivelEducativo: z.array(z.string()).optional(),
  estado: z.string().optional(),
});

/**
 * Schema para respuesta al crear docente
 */
export const createDocenteResponseSchema = z.object({
  docente: docenteSchema,
  generatedPassword: z.string().optional(),
});

// ============================================
// DASHBOARD DOCENTE - Schemas
// ============================================

/**
 * Schema para clase inminente (próxima a comenzar)
 */
export const claseInminenteSchema = z
  .object({
    id: z.string(),
    titulo: z.string(),
    grupoNombre: z.string(),
    grupoId: z.string(),
    fechaHora: z.string(),
    duracion: z.number(),
    estudiantesInscritos: z.number(),
    cupoMaximo: z.number(),
    minutosParaEmpezar: z.number(),
  })
  .nullable();

/**
 * Schema para estudiante inscrito (en clase del día)
 */
const estudianteInscritoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  avatarUrl: z.string().nullable(),
});

/**
 * Schema para clase del día
 */
const claseDelDiaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  codigo: z.string(),
  diaSemana: z.string(),
  horaInicio: z.string(),
  horaFin: z.string(),
  estudiantes: z.array(estudianteInscritoSchema),
  cupoMaximo: z.number(),
  grupoId: z.string(),
});

/**
 * Schema para grupo resumen
 */
const grupoResumenSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  codigo: z.string(),
  diaSemana: z.string(),
  horaInicio: z.string(),
  horaFin: z.string(),
  estudiantesActivos: z.number(),
  cupoMaximo: z.number(),
  nivel: z.string().nullable(),
});

/**
 * Schema para comisión resumen
 */
const comisionResumenSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  producto: z.object({
    id: z.string(),
    nombre: z.string(),
    tipo: z.string(),
  }),
  casa: z
    .object({
      id: z.string(),
      nombre: z.string(),
      emoji: z.string(),
    })
    .nullable(),
  horario: z.string().nullable(),
  fechaInicio: z.string().nullable(),
  fechaFin: z.string().nullable(),
  cupoMaximo: z.number().nullable(),
  estudiantesInscritos: z.number(),
  activo: z.boolean(),
});

/**
 * Schema para estudiante con faltas
 */
const estudianteConFaltaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  faltasConsecutivas: z.number(),
  ultimoGrupo: z.string(),
  tutorEmail: z.string().nullable(),
});

/**
 * Schema para alerta del dashboard
 */
const alertaSchema = z.object({
  id: z.string(),
  tipo: z.enum(['warning', 'info', 'urgent']),
  mensaje: z.string(),
  accion: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional(),
});

/**
 * Schema para stats resumen
 */
const statsResumenSchema = z.object({
  clasesHoy: z.number(),
  clasesEstaSemana: z.number(),
  asistenciaPromedio: z.number(),
  tendenciaAsistencia: z.enum(['up', 'down', 'stable']),
  observacionesPendientes: z.number(),
  estudiantesTotal: z.number(),
  puntosOtorgados: z.number(),
});

/**
 * Schema para respuesta del dashboard docente
 */
export const dashboardDocenteResponseSchema = z.object({
  claseInminente: claseInminenteSchema,
  clasesHoy: z.array(claseDelDiaSchema),
  misGrupos: z.array(grupoResumenSchema),
  misComisiones: z.array(comisionResumenSchema),
  estudiantesConFaltas: z.array(estudianteConFaltaSchema),
  alertas: z.array(alertaSchema),
  stats: statsResumenSchema,
});

// ============================================
// NOTIFICACIONES DOCENTE - Schemas
// ============================================

/**
 * Schema para prioridad de notificación
 */
export const prioridadNotificacionSchema = z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']);

/**
 * Schema para notificación individual
 */
export const notificacionSchema = z.object({
  id: z.string(),
  tipo: z.string(),
  titulo: z.string(),
  mensaje: z.string(),
  prioridad: prioridadNotificacionSchema,
  leida: z.boolean(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});

/**
 * Schema para respuesta paginada de notificaciones
 */
export const notificacionesListResponseSchema = z.object({
  data: z.array(notificacionSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

/**
 * Schema para contador de notificaciones
 */
export const notificacionesCountSchema = z.object({
  count: z.number(),
});

// ============================================
// TIPOS DERIVADOS
// ============================================

export type DocenteFromSchema = z.infer<typeof docenteSchema>;
export type CreateDocenteInput = z.infer<typeof createDocenteSchema>;
export type UpdateDocenteInput = z.infer<typeof updateDocenteSchema>;
export type CreateDocenteResponse = z.infer<typeof createDocenteResponseSchema>;
export type DocentesResponse = z.infer<typeof docentesResponseSchema>;
export type DashboardDocenteResponse = z.infer<typeof dashboardDocenteResponseSchema>;
export type NotificacionFromSchema = z.infer<typeof notificacionSchema>;
export type NotificacionesListResponse = z.infer<typeof notificacionesListResponseSchema>;
