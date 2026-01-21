/**
 * API Client para operaciones de estudiantes
 *
 * REGLAS APLICADAS:
 * ✅ Tipos explícitos importados desde @mateatletas/contracts
 * ✅ Todas las funciones retornan Promise<TipoExplicito>
 * ✅ Todas las respuestas pasan por normalizarEstudiante()
 * ✅ PROHIBIDO: any, unknown, casts "as"
 * ✅ Validación con Zod en cada respuesta
 */

import apiClient from '../axios';
import type {
  Estudiante,
  CreateEstudianteDto,
  UpdateEstudianteDto,
  QueryEstudiantesParams,
  EstudiantesResponse,
  EstadisticasEstudiantes,
  Casa,
} from '@/types/estudiante';
import { normalizarEstudiante, normalizarEstudiantes } from '@/types/estudiante';
import {
  estudianteSchema,
  estudiantesResponseSchema,
  estadisticasEstudiantesSchema,
  equiposListSchema,
  estadoClaseEnum,
} from '@mateatletas/contracts';
import { z } from 'zod';

/**
 * Schema para respuesta de delete
 */
const deleteResponseSchema = z.object({
  message: z.string(),
});

/**
 * Schema para respuesta de count
 */
const countResponseSchema = z.object({
  count: z.number(),
});

/**
 * Schema para próxima clase
 */
const proximaClaseSchema = z.union([
  z.object({
    tipo: z.enum(['grupo', 'individual']),
    id: z.string(),
    fechaHoraInicio: z.string().datetime(),
    duracionMinutos: z.number(),
    docente: z.object({
      nombre: z.string(),
      apellido: z.string(),
    }),
    rutaCurricular: z
      .object({
        nombre: z.string(),
        descripcion: z.string().optional(),
      })
      .optional(),
    linkMeet: z.string().nullish(), // Acepta string, null, o undefined
  }),
  z.null(),
]);

/**
 * Schema para compañeros
 */
const companeroSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  puntos: z.number(),
});

const companerosList = z.array(companeroSchema);

/**
 * Schema para sectores
 */
const sectorSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  color: z.string(),
  icono: z.string(),
  grupos: z.array(
    z.object({
      id: z.string(),
      codigo: z.string(),
      nombre: z.string(),
      linkMeet: z.string().nullable(),
    }),
  ),
});

const sectoresList = z.array(sectorSchema);

/**
 * Schema para clases del estudiante
 */
const claseEstudianteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  codigo: z.string(),
  nivel: z.string().nullable(),
  diaSemana: z.string().nullable(), // Nullable para comisiones
  diaNombre: z.string(),
  horaInicio: z.string(),
  horaFin: z.string(),
  duracionMinutos: z.number(),
  fechaProxima: z.string(),
  docente: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
    titulo: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    especialidades: z.array(z.string()).nullable().optional(),
    experienciaAnos: z.number().nullable().optional(),
  }),
  grupo: z
    .object({
      id: z.string(),
      codigo: z.string(),
      nombre: z.string(),
      linkMeet: z.string().nullable(),
    })
    .nullable(),
  sector: z
    .object({
      id: z.string(),
      nombre: z.string(),
      color: z.string(),
      icono: z.string(),
    })
    .nullable(),
  linkMeet: z.string().nullable(),
  fechaInscripcion: z.string(),
  // Nuevos campos para distinguir tipo de clase
  tipo: z.enum(['clase_grupal', 'comision']).optional(),
  comisionId: z.string().optional(),
  // LiveKit: estado de clase en vivo
  estadoClase: estadoClaseEnum.optional().default('Programada'),
  iniciadaEn: z.string().datetime().nullable().optional(),
});

const clasesEstudianteList = z.array(claseEstudianteSchema);

/**
 * Schema para plan del estudiante
 * Soporta tanto plan directo del estudiante como heredado del tutor
 */
const miPlanSchema = z.object({
  tienePlan: z.boolean(),
  plan: z
    .object({
      id: z.string(),
      nombre: z.string(),
      descripcion: z.string().nullable(),
      precioBase: z.union([z.string(), z.number()]),
    })
    .nullable(),
  estadoSuscripcion: z.string().optional(),
  estadoAcceso: z.string().optional(), // ACTIVO, SUSPENDIDO, VENCIDO, BECA
  accesoClasesVivo: z.boolean(),
  esPlanDirecto: z.boolean().optional(), // true si el plan es asignado directamente al estudiante
  notasPlan: z.string().nullable().optional(), // Notas admin (ej: "Beca olimpiada")
  fechaVencimiento: z.string().nullable().optional(), // Fecha de vencimiento del plan
  mensaje: z.string(),
});

// Tipos inferidos de los schemas
type DeleteResponse = z.infer<typeof deleteResponseSchema>;
type CountResponse = z.infer<typeof countResponseSchema>;
type ProximaClase = z.infer<typeof proximaClaseSchema>;
type Companero = z.infer<typeof companeroSchema>;
type Sector = z.infer<typeof sectorSchema>;
export type ClaseEstudiante = z.infer<typeof claseEstudianteSchema>;
export type MiPlan = z.infer<typeof miPlanSchema>;

/**
 * Schema para verificar acceso del estudiante
 */
const accesoEstudianteSchema = z.object({
  puedeAcceder: z.boolean(),
  motivo: z.enum([
    'PLAN_DIRECTO',
    'SUSCRIPCION_TUTOR',
    'COMISION_ACTIVA',
    'OVERRIDE',
    'SIN_ACCESO',
  ]),
  permisos: z.object({
    accesoLibros: z.boolean(),
    accesoPlanificaciones: z.boolean(),
    accesoClasesVivo: z.boolean(),
  }),
  detalles: z.object({
    planDirecto: z
      .object({
        id: z.string(),
        nombre: z.string(),
      })
      .optional(),
    suscripcionTutor: z
      .object({
        suscripcionId: z.string(),
        planNombre: z.string(),
        estado: z.string(),
      })
      .optional(),
    comisionesActivas: z.array(
      z.object({
        comisionId: z.string(),
        nombre: z.string(),
        fechaInicio: z.string().nullable(),
        fechaFin: z.string().nullable(),
      }),
    ),
    override: z
      .object({
        motivo: z.string().nullable(),
        hasta: z.string().nullable(),
      })
      .optional(),
  }),
  mensaje: z.string(),
});

/**
 * Schema para verificar si puede entrar a una clase
 */
const puedeEntrarClaseSchema = z.object({
  puedeEntrar: z.boolean(),
  motivo: z.enum([
    'COMISION_INSCRIPTO',
    'PLAN_SINCRONICO',
    'SUSCRIPCION_TUTOR_SINCRONICO',
    'SIN_INSCRIPCION',
    'SIN_PERMISO',
    'COMISION_VENCIDA',
  ]),
  mensaje: z.string(),
});

export type AccesoEstudiante = z.infer<typeof accesoEstudianteSchema>;
export type PuedeEntrarClase = z.infer<typeof puedeEntrarClaseSchema>;

/**
 * Schema para respuesta de mi-progreso (endpoint consolidado)
 */
const logroRecienteSchema = z.object({
  nombre: z.string(),
  icono: z.string(),
  rareza: z.string(),
  fechaDesbloqueo: z.coerce.date(),
});

const actividadRecienteSchema = z.object({
  tipo: z.string(),
  mensaje: z.string(),
  xpGanado: z.number(),
  creadoEn: z.coerce.date(),
});

const miProgresoSchema = z.object({
  estudiante: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
    avatarUrl: z.string().nullable(),
    casa: z.string().nullable(),
  }),
  gamificacion: z.object({
    xpTotal: z.number(),
    nivel: z.number(),
    xpProgreso: z.number(),
    xpNecesario: z.number(),
    porcentajeNivel: z.number(),
  }),
  racha: z.object({
    rachaActual: z.number(),
    rachaMaxima: z.number(),
    totalDiasActivos: z.number(),
    ultimaActividad: z.coerce.date().nullable(),
  }),
  logros: z.object({
    desbloqueados: z.number(),
    totales: z.number(),
    recientes: z.array(logroRecienteSchema),
  }),
  actividadReciente: z.array(actividadRecienteSchema),
});

export type MiProgreso = z.infer<typeof miProgresoSchema>;
export type LogroReciente = z.infer<typeof logroRecienteSchema>;
export type ActividadReciente = z.infer<typeof actividadRecienteSchema>;

/**
 * API Client para operaciones de estudiantes
 * Todas las peticiones requieren autenticación JWT
 */
export const estudiantesApi = {
  /**
   * Crear un nuevo estudiante
   * @param data - Datos del estudiante
   * @returns Estudiante creado y validado
   */
  create: async (data: CreateEstudianteDto): Promise<Estudiante> => {
    try {
      const response = await apiClient.post<Estudiante>('/estudiantes', data);
      // El interceptor ya retorna response.data, validar con schema
      const validado = estudianteSchema.parse(response);
      return normalizarEstudiante(validado);
    } catch (error) {
      console.error('Error al crear el estudiante:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los estudiantes del tutor autenticado
   * @param params - Filtros y paginación
   * @returns Lista de estudiantes con metadata
   */
  getAll: async (params?: QueryEstudiantesParams): Promise<EstudiantesResponse> => {
    try {
      const response = await apiClient.get<EstudiantesResponse>('/estudiantes', { params });
      // Validar estructura de respuesta paginada
      const validado = estudiantesResponseSchema.parse(response);
      // Normalizar cada estudiante del array data
      return {
        ...validado,
        data: normalizarEstudiantes(validado.data),
      };
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtener un estudiante por ID
   * @param id - ID del estudiante
   * @returns Estudiante con sus relaciones
   */
  getById: async (id: string): Promise<Estudiante> => {
    try {
      const response = await apiClient.get<Estudiante>(`/estudiantes/${id}`);
      const validado = estudianteSchema.parse(response);
      return normalizarEstudiante(validado);
    } catch (error) {
      console.error('Error al obtener el estudiante:', error);
      throw error;
    }
  },

  /**
   * Actualizar un estudiante
   * @param id - ID del estudiante
   * @param data - Datos a actualizar
   * @returns Estudiante actualizado
   */
  update: async (id: string, data: UpdateEstudianteDto): Promise<Estudiante> => {
    try {
      const response = await apiClient.patch<Estudiante>(`/estudiantes/${id}`, data);
      const validado = estudianteSchema.parse(response);
      return normalizarEstudiante(validado);
    } catch (error) {
      console.error('Error al actualizar el estudiante:', error);
      throw error;
    }
  },

  /**
   * Eliminar un estudiante
   * @param id - ID del estudiante
   * @returns Mensaje de confirmación
   */
  delete: async (id: string): Promise<DeleteResponse> => {
    try {
      const response = await apiClient.delete<DeleteResponse>(`/estudiantes/${id}`);
      return deleteResponseSchema.parse(response);
    } catch (error) {
      console.error('Error al eliminar el estudiante:', error);
      throw error;
    }
  },

  /**
   * Contar estudiantes del tutor
   * @returns Total de estudiantes
   */
  count: async (): Promise<CountResponse> => {
    try {
      const response = await apiClient.get<CountResponse>('/estudiantes/count');
      return countResponseSchema.parse(response);
    } catch (error) {
      console.error('Error al contar los estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de estudiantes
   * @returns Estadísticas agregadas
   */
  getEstadisticas: async (): Promise<EstadisticasEstudiantes> => {
    try {
      const response = await apiClient.get<EstadisticasEstudiantes>('/estudiantes/estadisticas');
      return estadisticasEstudiantesSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener las estadísticas de estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las casas disponibles
   * @returns Lista de casas
   */
  getCasas: async (): Promise<Casa[]> => {
    try {
      // El backend usa /equipos pero el frontend lo expone como casas
      const response = await apiClient.get<Casa[]>('/equipos');
      return equiposListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener las casas:', error);
      throw error;
    }
  },

  /**
   * Actualizar la animación idle del estudiante autenticado
   * @param animacionIdleUrl - URL de la animación .glb
   * @returns Estudiante actualizado
   */
  updateAnimacion: async (animacionIdleUrl: string): Promise<Estudiante> => {
    try {
      const response = await apiClient.patch<Estudiante>('/estudiantes/animacion', {
        animacionIdleUrl,
      });
      const validado = estudianteSchema.parse(response);
      return normalizarEstudiante(validado);
    } catch (error) {
      console.error('Error al actualizar la animación:', error);
      throw error;
    }
  },

  /**
   * Obtener la próxima clase del estudiante autenticado
   * @returns Información de la próxima clase o null si no hay ninguna
   */
  getProximaClase: async (): Promise<ProximaClase> => {
    try {
      const response = await apiClient.get<ProximaClase>('/estudiantes/mi-proxima-clase');
      return proximaClaseSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener la próxima clase:', error);
      throw error;
    }
  },

  /**
   * Obtener compañeros del ClaseGrupo del estudiante autenticado
   * @returns Lista de compañeros ordenados por puntos (descendente)
   */
  getMisCompaneros: async (): Promise<Companero[]> => {
    try {
      const response = await apiClient.get<Companero[]>('/estudiantes/mis-companeros');
      return companerosList.parse(response);
    } catch (error) {
      console.error('Error al obtener compañeros:', error);
      throw error;
    }
  },

  /**
   * Obtener sectores del estudiante autenticado (Matemática, Programación, Ciencias)
   * @returns Array de sectores con grupos agrupados
   */
  getMisSectores: async (): Promise<Sector[]> => {
    try {
      const response = await apiClient.get<Sector[]>('/estudiantes/mis-sectores');
      return sectoresList.parse(response);
    } catch (error) {
      console.error('Error al obtener sectores:', error);
      throw error;
    }
  },

  /**
   * Obtener TODAS las clases del estudiante autenticado
   * @returns Array de clases ordenadas por próxima fecha
   */
  getMisClases: async (): Promise<ClaseEstudiante[]> => {
    try {
      const response = await apiClient.get<ClaseEstudiante[]>('/estudiantes/mis-clases');
      return clasesEstudianteList.parse(response);
    } catch (error) {
      console.error('Error al obtener clases:', error);
      throw error;
    }
  },

  /**
   * Obtener el plan de suscripción del estudiante autenticado
   * Usado para validar acceso a clases en vivo (solo STEAM_SINCRONICO)
   * @returns Plan con información de acceso a clases en vivo
   */
  getMiPlan: async (): Promise<MiPlan> => {
    try {
      const response = await apiClient.get<MiPlan>('/estudiantes/mi-plan');
      return miPlanSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener plan:', error);
      throw error;
    }
  },

  /**
   * Verificar acceso del estudiante autenticado a la plataforma
   * Determina permisos basado en: plan directo, suscripción tutor, comisión, override
   * @returns Resultado con permisos y detalles de acceso
   */
  verificarAcceso: async (): Promise<AccesoEstudiante> => {
    try {
      const response = await apiClient.get<AccesoEstudiante>('/estudiantes/verificar-acceso');
      return accesoEstudianteSchema.parse(response);
    } catch (error) {
      console.error('Error al verificar acceso:', error);
      throw error;
    }
  },

  /**
   * Verificar si el estudiante puede entrar a una clase específica
   * @param claseGrupoId - ID de la clase de grupo (opcional)
   * @param comisionId - ID de la comisión (opcional)
   * @returns Resultado con permiso y motivo
   */
  puedeEntrarClase: async (
    claseGrupoId?: string,
    comisionId?: string,
  ): Promise<PuedeEntrarClase> => {
    try {
      const params: Record<string, string> = {};
      if (claseGrupoId) params.claseGrupoId = claseGrupoId;
      if (comisionId) params.comisionId = comisionId;

      const response = await apiClient.get<PuedeEntrarClase>('/estudiantes/puede-entrar-clase', {
        params,
      });
      return puedeEntrarClaseSchema.parse(response);
    } catch (error) {
      console.error('Error al verificar entrada a clase:', error);
      throw error;
    }
  },

  // ==================== ACTIVITY FEED ====================

  /**
   * Obtener el feed de actividades
   * @param params - Parámetros de filtrado
   * @returns Feed con actividades y metadata
   */
  getFeed: async (params?: {
    casaId?: string;
    tipo?: string;
    page?: number;
    limit?: number;
  }): Promise<FeedResponse> => {
    const response = await apiClient.get<FeedResponse>('/estudiantes/feed', { params });
    return response;
  },

  /**
   * Obtener feed de la casa del estudiante
   * @param limit - Cantidad de items (default: 10)
   * @returns Feed de la casa
   */
  getFeedMiCasa: async (limit?: number): Promise<FeedResponse> => {
    const response = await apiClient.get<FeedResponse>('/estudiantes/feed/mi-casa', {
      params: { limit },
    });
    return response;
  },

  /**
   * Obtener feed de compañeros de comisión (ClaseGrupo)
   * Muestra actividades de estudiantes inscriptos en las mismas clases grupales
   * @param limit - Cantidad de items (default: 10)
   * @returns Feed de actividades de compañeros de comisión
   */
  getFeedMiComision: async (limit?: number): Promise<FeedResponse> => {
    const response = await apiClient.get<FeedResponse>('/estudiantes/feed/mi-comision', {
      params: { limit },
    });
    return response;
  },

  /**
   * Obtener actividades propias del estudiante
   * @param limit - Cantidad de items (default: 10)
   * @returns Feed de actividades propias
   */
  getMisActividades: async (limit?: number): Promise<FeedResponse> => {
    const response = await apiClient.get<FeedResponse>('/estudiantes/feed/mis-actividades', {
      params: { limit },
    });
    return response;
  },

  /**
   * Agregar reacción a una actividad del feed
   * @param actividadId - ID de la actividad
   * @param emoji - Emoji de reacción
   */
  addReaction: async (actividadId: string, emoji: string): Promise<void> => {
    await apiClient.post(`/estudiantes/feed/${actividadId}/reaccion`, { emoji });
  },

  /**
   * Eliminar reacción de una actividad del feed
   * @param actividadId - ID de la actividad
   * @param emoji - Emoji a eliminar
   */
  removeReaction: async (actividadId: string, emoji: string): Promise<void> => {
    await apiClient.delete(`/estudiantes/feed/${actividadId}/reaccion`, {
      params: { emoji },
    });
  },

  /**
   * Obtener contador de reacciones del día del estudiante
   * @returns { usadas: number, limite: number, restantes: number }
   */
  getReaccionesHoy: async (): Promise<ReaccionesHoyResponse> => {
    return apiClient.get<ReaccionesHoyResponse>('/estudiantes/feed/mis-reacciones-hoy');
  },

  // ==================== MI PROGRESO ====================

  /**
   * Obtener datos consolidados de progreso del estudiante
   * Endpoint facade que agrega: XP, nivel, racha, logros, actividades
   * @returns Datos completos de gamificación del estudiante
   */
  getMiProgreso: async (): Promise<MiProgreso> => {
    try {
      const response = await apiClient.get<MiProgreso>('/estudiantes/mi-progreso');
      return miProgresoSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener mi progreso:', error);
      throw error;
    }
  },
};

// ==================== TYPES PARA ACTIVITY FEED ====================

export interface ReaccionesHoyResponse {
  usadas: number;
  limite: number;
  restantes: number;
}

export interface FeedItem {
  id: string;
  tipo: string;
  mensaje: string;
  xpGanado: number;
  metadata: Record<string, unknown>;
  creadoEn: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
  };
  reacciones: Array<{
    emoji: string;
    count: number;
    estudiantesIds: string[];
  }>;
  totalReacciones: number;
}

export interface FeedResponse {
  data: FeedItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
