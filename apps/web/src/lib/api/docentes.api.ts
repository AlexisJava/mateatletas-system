/**
 * API Client para operaciones de docentes
 *
 * REGLAS APLICADAS:
 * ✅ Tipos explícitos importados desde schemas
 * ✅ Todas las funciones retornan Promise<TipoExplicito>
 * ✅ Validación con Zod en respuestas críticas
 * ✅ PROHIBIDO: any, unknown, casts "as"
 */

import apiClient from '../axios';
import {
  docenteSchema,
  docentesListSchema,
  dashboardDocenteResponseSchema,
  notificacionSchema,
  notificacionesListResponseSchema,
  notificacionesCountSchema,
} from '@/lib/schemas/docente.schema';

export interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  titulo?: string | null;
  tituloProfesional?: string | null;
  bio?: string | null;
  biografia?: string | null;
  especialidades?: string[] | null;
  experienciaAnos?: number | null;
  disponibilidadHoraria?: Record<string, string[]> | null;
  nivelEducativo?: string[] | null;
  estado?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateDocenteData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  titulo?: string;
  tituloProfesional?: string;
  bio?: string;
  biografia?: string;
  especialidades?: string[];
  experienciaAnos?: number;
  disponibilidadHoraria?: Record<string, string[]>;
  nivelEducativo?: string[];
  estado?: string;
}

export interface CreateDocenteData {
  email: string;
  password?: string; // Opcional: se autogenera si se omite
  nombre: string;
  apellido: string;
  titulo?: string;
  telefono?: string;
  disponibilidadHoraria?: Record<string, string[]>;
  estado?: string;
}

/**
 * Respuesta al crear un docente
 * Incluye generatedPassword solo cuando el backend autogeneró la contraseña
 */
export interface CreateDocenteResponse extends Docente {
  generatedPassword?: string; // Solo presente cuando password no fue provista
}

/**
 * DTOs para Dashboard Docente - INFORMACIÓN BRUTAL Y CONCRETA
 */
export interface ClaseInminente {
  id: string;
  titulo: string;
  grupoNombre: string;
  grupoId: string;
  fechaHora: string;
  duracion: number;
  estudiantesInscritos: number;
  cupoMaximo: number;
  minutosParaEmpezar: number;
}

export interface EstudianteInscrito {
  id: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
}

export interface ClaseDelDia {
  id: string;
  nombre: string;
  codigo: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estudiantes: EstudianteInscrito[];
  cupoMaximo: number;
  grupoId: string;
}

export interface GrupoResumen {
  id: string;
  nombre: string;
  codigo: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estudiantesActivos: number;
  cupoMaximo: number;
  nivel: string | null;
}

/**
 * Resumen de una comisión asignada al docente (cursos, colonias, etc.)
 */
export interface ComisionResumen {
  id: string;
  nombre: string;
  descripcion: string | null;
  producto: {
    id: string;
    nombre: string;
    tipo: string;
  };
  casa: {
    id: string;
    nombre: string;
    emoji: string;
  } | null;
  horario: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  cupoMaximo: number | null;
  estudiantesInscritos: number;
  activo: boolean;
}

export interface EstudianteConFalta {
  id: string;
  nombre: string;
  apellido: string;
  faltasConsecutivas: number;
  ultimoGrupo: string;
  tutorEmail: string | null;
}

export type TipoAlerta = 'warning' | 'info' | 'urgent';

export interface AccionAlerta {
  label: string;
  href: string;
}

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  mensaje: string;
  accion?: AccionAlerta;
}

export type TendenciaAsistencia = 'up' | 'down' | 'stable';

export interface StatsResumen {
  clasesHoy: number;
  clasesEstaSemana: number;
  asistenciaPromedio: number;
  tendenciaAsistencia: TendenciaAsistencia;
  observacionesPendientes: number;
  estudiantesTotal: number;
  puntosOtorgados: number;
}

export interface DashboardDocenteResponse {
  claseInminente: ClaseInminente | null;
  clasesHoy: ClaseDelDia[];
  misGrupos: GrupoResumen[];
  misComisiones: ComisionResumen[];
  estudiantesConFaltas: EstudianteConFalta[];
  alertas: Alerta[];
  stats: StatsResumen;
}

/**
 * Estadísticas completas para la página de Observaciones
 */
export interface EstudianteTopPuntos {
  id: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
  xpTotal: number;
  porcentajeAsistencia: number;
}

export interface EstudianteAsistenciaPerfecta {
  estudianteId: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
  totalAsistencias: number;
  presentes: number;
  porcentajeAsistencia: number;
  grupos: { id: string; nombre: string; codigo: string }[];
}

export interface EstudianteSinTareas {
  id: string;
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
}

export interface GrupoRanking {
  grupoId: string;
  nombre: string;
  codigo: string;
  estudiantesActivos: number;
  cupoMaximo: number;
  puntosTotales: number;
  asistenciaPromedio: number;
}

export interface EstadisticasCompletasResponse {
  topEstudiantesPorPuntos: EstudianteTopPuntos[];
  estudiantesAsistenciaPerfecta: EstudianteAsistenciaPerfecta[];
  estudiantesSinTareas: EstudianteSinTareas[];
  rankingGruposPorPuntos: GrupoRanking[];
}

/**
 * Clase del calendario del mes
 */
export interface ClaseCalendario {
  id: string;
  fecha: string;
  nombre: string;
  codigo: string;
  horaInicio: string;
  horaFin: string;
  estudiantesCount: number;
  cupoMaximo: number;
  grupoId: string;
}

/**
 * Respuesta del endpoint clases del mes
 */
export interface ClasesDelMesResponse {
  clases: ClaseCalendario[];
  stats: {
    totalClases: number;
    totalGrupos: number;
    totalEstudiantes: number;
  };
}

// ============================================================================
// COMISIÓN - Tipos para detalle y estudiantes
// ============================================================================

/**
 * Estudiante inscrito en una comisión con sus stats completos
 */
export interface EstudianteComision {
  id: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
  edad: number;
  casa: {
    id: string;
    tipo: string;
    nombre: string;
    colorPrimary: string;
  } | null;
  stats: {
    xpTotal: number;
    nivel: number;
    rachaActual: number;
    asistenciaPorcentaje: number;
    ultimaAsistencia: {
      fecha: string;
      estado: string;
    } | null;
  };
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
  } | null;
  estadoInscripcion: string;
  inscripcionFecha: string;
}

/**
 * Detalle completo de una comisión
 */
export interface ComisionDetalleResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  producto: {
    id: string;
    nombre: string;
    tipo: string;
  };
  casa: {
    id: string;
    nombre: string;
    emoji: string;
  } | null;
  horario: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  cupoMaximo: number | null;
  activo: boolean;
  estudiantes: Array<{
    id: string;
    nombre: string;
    apellido: string;
    email: string | null;
    estado: string;
  }>;
}

/**
 * Asistencia de un estudiante en una fecha
 */
export interface AsistenciaEstudianteFecha {
  estudianteId: string;
  nombre: string;
  estado: 'Presente' | 'Ausente' | 'Justificado';
  observacion: string | null;
}

/**
 * Asistencias agrupadas por fecha
 */
export interface AsistenciaFecha {
  fecha: string;
  asistencias: AsistenciaEstudianteFecha[];
}

/**
 * Respuesta del historial de asistencia
 */
export interface HistorialAsistenciaResponse {
  fechas: AsistenciaFecha[];
}

/**
 * Punto otorgado en una comisión
 */
export interface PuntoOtorgado {
  id: string;
  estudianteId: string;
  estudianteNombre: string;
  tipoAccion: string;
  puntos: number;
  contexto: string | null;
  fechaOtorgado: string;
}

/**
 * Respuesta del historial de puntos de una comisión
 */
export interface HistorialPuntosComisionResponse {
  puntos: PuntoOtorgado[];
  totalPuntos: number;
  totalRegistros: number;
}

// ============================================================================
// NOTIFICACIONES DOCENTE - Endpoints para gestión de notificaciones
// ============================================================================

export type PrioridadNotificacion = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type TipoNotificacionDocente =
  | 'DOCENTE_CLASE_PROXIMA'
  | 'DOCENTE_CLASE_ASIGNADA'
  | 'DOCENTE_ASISTENCIA_PENDIENTE'
  | 'DOCENTE_ESTUDIANTE_ALERTA'
  | 'DOCENTE_CLASE_CANCELADA'
  | 'DOCENTE_LOGRO_ESTUDIANTE'
  | 'DOCENTE_NUEVO_ESTUDIANTE'
  | 'DOCENTE_ESTUDIANTE_BAJA'
  | 'DOCENTE_MENSAJE_TUTOR'
  | 'DOCENTE_TAREAS_PENDIENTES'
  | 'DOCENTE_EVALUACION_PENDIENTE'
  | 'DOCENTE_MATERIAL_ASIGNADO'
  | 'DOCENTE_CLASE_REPROGRAMADA'
  | 'DOCENTE_REPORTE_MENSUAL'
  | 'DOCENTE_RECORDATORIO_PLANIFICACION';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacionDocente | string;
  titulo: string;
  mensaje: string;
  prioridad: PrioridadNotificacion;
  leida: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificacionesListResponse {
  data: Notificacion[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificacionesParams {
  soloNoLeidas?: boolean;
  tipo?: TipoNotificacionDocente | string;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export const notificacionesApi = {
  /**
   * Obtener notificaciones del docente con paginación y filtros
   */
  getAll: async (params: NotificacionesParams = {}): Promise<NotificacionesListResponse> => {
    const searchParams = new URLSearchParams();
    if (params.soloNoLeidas) searchParams.append('soloNoLeidas', 'true');
    if (params.tipo) searchParams.append('tipo', params.tipo);
    if (params.busqueda) searchParams.append('busqueda', params.busqueda);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const queryString = searchParams.toString();
    const url = `/notificaciones${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<NotificacionesListResponse>(url);
    return notificacionesListResponseSchema.parse(response);
  },

  /**
   * Obtener contador de notificaciones no leídas
   */
  getCountNoLeidas: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/notificaciones/count');
    return notificacionesCountSchema.parse(response);
  },

  /**
   * Marcar una notificación como leída
   */
  marcarComoLeida: async (id: string): Promise<Notificacion> => {
    const response = await apiClient.patch<Notificacion>(`/notificaciones/${id}/leer`);
    return notificacionSchema.parse(response);
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  marcarTodasComoLeidas: async (): Promise<{ message: string; count: number }> => {
    return apiClient.patch<{ message: string; count: number }>('/notificaciones/leer-todas');
  },
};

export const docentesApi = {
  /**
   * Obtener dashboard del docente autenticado
   * Incluye clase inminente, alertas y estadísticas resumen
   */
  getDashboard: async (): Promise<DashboardDocenteResponse> => {
    try {
      const response = await apiClient.get<DashboardDocenteResponse>('/docentes/me/dashboard');
      return dashboardDocenteResponseSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener el dashboard del docente:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas completas para la página de Observaciones
   * Incluye: top estudiantes por puntos, asistencia perfecta, sin tareas, ranking de grupos
   */
  getEstadisticasCompletas: async (): Promise<EstadisticasCompletasResponse> => {
    try {
      return await apiClient.get<EstadisticasCompletasResponse>(
        '/docentes/me/estadisticas-completas',
      );
    } catch (error) {
      console.error('Error al obtener las estadísticas completas:', error);
      throw error;
    }
  },

  /**
   * Obtener clases del mes para el calendario del docente
   * @param mes - Mes (1-12), opcional, por defecto mes actual
   * @param anio - Año (ej: 2025), opcional, por defecto año actual
   */
  getClasesDelMes: async (mes?: number, anio?: number): Promise<ClasesDelMesResponse> => {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes.toString());
      if (anio) params.append('anio', anio.toString());
      const queryString = params.toString();
      const url = `/docentes/me/clases-del-mes${queryString ? `?${queryString}` : ''}`;
      return await apiClient.get<ClasesDelMesResponse>(url);
    } catch (error) {
      console.error('Error al obtener las clases del mes:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil del docente autenticado
   */
  getMe: async (): Promise<Docente> => {
    try {
      const response = await apiClient.get<Docente>('/docentes/me');
      return docenteSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener el perfil del docente:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil del docente autenticado
   */
  updateMe: async (data: UpdateDocenteData): Promise<Docente> => {
    try {
      return await apiClient.patch<Docente>('/docentes/me', data);
    } catch (error) {
      console.error('Error al actualizar el perfil del docente:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los docentes (admin only)
   */
  getAll: async (): Promise<Docente[]> => {
    try {
      const response = await apiClient.get<Docente[]>('/docentes');
      return docentesListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener la lista de docentes:', error);
      throw error;
    }
  },

  /**
   * Obtener un docente por ID (admin only)
   */
  getById: async (id: string): Promise<Docente> => {
    try {
      const response = await apiClient.get<Docente>(`/docentes/${id}`);
      return docenteSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener el docente por ID:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo docente (admin only)
   * Si password se omite, el backend autogenera una contraseña segura
   * y la retorna en generatedPassword para que el admin la comparta con el docente
   */
  create: async (data: CreateDocenteData): Promise<CreateDocenteResponse> => {
    try {
      return await apiClient.post<CreateDocenteResponse>('/docentes', data);
    } catch (error) {
      console.error('Error al crear el docente:', error);
      throw error;
    }
  },

  /**
   * Actualizar un docente por ID (admin only)
   */
  update: async (id: string, data: UpdateDocenteData): Promise<Docente> => {
    try {
      return await apiClient.patch<Docente>(`/docentes/${id}`, data);
    } catch (error) {
      console.error('Error al actualizar el docente:', error);
      throw error;
    }
  },

  /**
   * Eliminar un docente por ID (admin only)
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/docentes/${id}`);
    } catch (error) {
      console.error('Error al eliminar el docente:', error);
      throw error;
    }
  },

  /**
   * Reasignar todas las clases de un docente a otro (admin only)
   */
  reassignClasses: async (
    fromDocenteId: string,
    toDocenteId: string,
  ): Promise<{ clasesReasignadas: number }> => {
    try {
      return await apiClient.post<{ clasesReasignadas: number }>(
        `/docentes/${fromDocenteId}/reasignar-clases`,
        { toDocenteId },
      );
    } catch (error) {
      console.error('Error al reasignar las clases del docente:', error);
      throw error;
    }
  },

  // ============================================================================
  // DASHBOARD GRAPHS - Endpoints para gráficos del dashboard
  // ============================================================================

  /**
   * Obtener carga horaria semanal del docente
   * @returns Distribución de clases por día de la semana
   */
  getCargaHorariaSemanal: async (): Promise<{
    data: { day: string; classes: number }[];
  }> => {
    try {
      return await apiClient.get<{ data: { day: string; classes: number }[] }>(
        '/docentes/me/carga-horaria-semanal',
      );
    } catch (error) {
      console.error('Error al obtener carga horaria semanal:', error);
      throw error;
    }
  },

  /**
   * Obtener tendencia de asistencia de las últimas 5 semanas
   * @returns Promedio de asistencia por semana
   */
  getTendenciaAsistencia: async (): Promise<{
    data: { week: string; avg: number }[];
  }> => {
    try {
      return await apiClient.get<{ data: { week: string; avg: number }[] }>(
        '/docentes/me/tendencia-asistencia',
      );
    } catch (error) {
      console.error('Error al obtener tendencia asistencia:', error);
      throw error;
    }
  },

  /**
   * Obtener distribución de estudiantes por comisión
   * @returns Cantidad de estudiantes por comisión y total
   */
  getDistribucionEstudiantes: async (): Promise<{
    data: { name: string; value: number }[];
    total: number;
  }> => {
    try {
      return await apiClient.get<{
        data: { name: string; value: number }[];
        total: number;
      }>('/docentes/me/distribucion-estudiantes');
    } catch (error) {
      console.error('Error al obtener distribución estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtener progreso de sesiones de una comisión
   * @param comisionId - ID de la comisión
   * @returns Sesión actual, total de sesiones y porcentaje completado
   */
  getProgresoComision: async (
    comisionId: string,
  ): Promise<{
    sesionActual: number;
    totalSesiones: number;
    porcentajeCompletado: number;
  }> => {
    try {
      return await apiClient.get<{
        sesionActual: number;
        totalSesiones: number;
        porcentajeCompletado: number;
      }>(`/docentes/me/comisiones/${comisionId}/progreso`);
    } catch (error) {
      console.error('Error al obtener progreso comisión:', error);
      throw error;
    }
  },

  /**
   * Obtener métricas de una comisión
   * @param comisionId - ID de la comisión
   * @returns Métricas: asistencia promedio, total estudiantes, clases, puntos
   */
  getMetricasComision: async (
    comisionId: string,
  ): Promise<{
    asistenciaPromedio: number;
    totalEstudiantes: number;
    totalClases: number;
    totalPuntos: number;
  }> => {
    try {
      return await apiClient.get<{
        asistenciaPromedio: number;
        totalEstudiantes: number;
        totalClases: number;
        totalPuntos: number;
      }>(`/docentes/me/comisiones/${comisionId}/metricas`);
    } catch (error) {
      console.error('Error al obtener métricas comisión:', error);
      throw error;
    }
  },

  // ============================================================================
  // COMISIÓN - Detalle y Estudiantes
  // ============================================================================

  /**
   * Obtener detalle de una comisión específica
   * @param comisionId - ID de la comisión
   * @returns Detalle de la comisión con lista de estudiantes
   */
  getComisionDetalle: async (comisionId: string): Promise<ComisionDetalleResponse> => {
    try {
      return await apiClient.get<ComisionDetalleResponse>(`/docentes/me/comisiones/${comisionId}`);
    } catch (error) {
      console.error('Error al obtener detalle de comisión:', error);
      throw error;
    }
  },

  /**
   * Obtener estudiantes de una comisión con sus stats
   * @param comisionId - ID de la comisión
   * @returns Lista de estudiantes con stats, tutor, casa
   */
  getEstudiantesComision: async (
    comisionId: string,
  ): Promise<{ estudiantes: EstudianteComision[] }> => {
    try {
      return await apiClient.get<{ estudiantes: EstudianteComision[] }>(
        `/docentes/me/comisiones/${comisionId}/estudiantes`,
      );
    } catch (error) {
      console.error('Error al obtener estudiantes de comisión:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de asistencia de una comisión
   * @param comisionId - ID de la comisión
   * @param desde - Fecha desde (opcional, formato YYYY-MM-DD)
   * @param hasta - Fecha hasta (opcional, formato YYYY-MM-DD)
   * @returns Historial de asistencia agrupado por fecha
   */
  getHistorialAsistencia: async (
    comisionId: string,
    desde?: string,
    hasta?: string,
  ): Promise<HistorialAsistenciaResponse> => {
    try {
      const params = new URLSearchParams();
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);
      const queryString = params.toString();
      const url = `/docentes/me/comisiones/${comisionId}/historial-asistencia${queryString ? `?${queryString}` : ''}`;
      return await apiClient.get<HistorialAsistenciaResponse>(url);
    } catch (error) {
      console.error('Error al obtener historial de asistencia:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de puntos otorgados en una comisión
   * @param comisionId - ID de la comisión
   * @param desde - Fecha desde (opcional, formato YYYY-MM-DD)
   * @param hasta - Fecha hasta (opcional, formato YYYY-MM-DD)
   * @returns Historial de puntos con total
   */
  getHistorialPuntosComision: async (
    comisionId: string,
    desde?: string,
    hasta?: string,
  ): Promise<HistorialPuntosComisionResponse> => {
    try {
      const params = new URLSearchParams();
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);
      const queryString = params.toString();
      const url = `/docentes/me/comisiones/${comisionId}/historial-puntos${queryString ? `?${queryString}` : ''}`;
      return await apiClient.get<HistorialPuntosComisionResponse>(url);
    } catch (error) {
      console.error('Error al obtener historial de puntos:', error);
      throw error;
    }
  },
};

// Exportar getDashboard como función standalone para facilitar imports
export const getDashboardDocente = docentesApi.getDashboard;

// ============================================================================
// PLANIFICACIONES DOCENTE - v2 (Modelo de Clases)
// ============================================================================

export interface PlanificacionSimple {
  id: string;
  titulo: string;
  cantidadClases: number;
}

export interface ClaseInfo {
  id: string;
  numero: number;
  titulo: string;
}

export interface EstadoClase {
  clase: ClaseInfo;
  teoriaActiva: boolean;
  practicaActiva: boolean;
}

export interface ClaseGrupoSimple {
  id: string;
  nombre: string;
}

export interface Asignacion {
  id: string;
  planificacion: PlanificacionSimple;
  claseGrupo: ClaseGrupoSimple;
  clases: ClaseInfo[];
  estadosClases: EstadoClase[];
}

export interface ProgresoEstudianteClase {
  id: string;
  estudiante: { nombre: string; apellido: string } | null;
  claseNumero: number;
  claseTitulo: string;
  teoriaCompletada: boolean;
  practicaCompletada: boolean;
  tiempoTeoriaSegundos: number;
  tiempoPracticaSegundos: number;
}

export interface TareaClaseInfo {
  id: string;
  contenidoId: string;
  contenidoTitulo: string;
  orden: number;
  obligatoria: boolean;
  asignada: boolean;
  tareaAsignadaId: string | null;
  fechaLimite: string | null;
}

export interface ProgresoTareaEstudiante {
  estudianteId: string;
  estudianteNombre: string;
  tareaTitulo: string;
  completada: boolean;
  fechaCompletado: string | null;
  calificacion: number | null;
}

// ============================================================================
// ASISTENCIA COMISION - Tomar asistencia batch
// ============================================================================

export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Justificado';

export interface AsistenciaComisionItem {
  estudianteId: string;
  estado: EstadoAsistencia;
  observacion?: string;
}

export interface TomarAsistenciaComisionDto {
  comisionId: string;
  fecha: string;
  asistencias: AsistenciaComisionItem[];
}

export interface AsistenciaComisionBatchResponse {
  success: boolean;
  registrosCreados: number;
  registrosActualizados: number;
  estudiantes: Array<{
    estudianteId: string;
    nombre: string;
    apellido: string;
    estado: EstadoAsistencia;
    observacion: string | null;
  }>;
  mensaje: string;
}

export const asistenciaApi = {
  /**
   * Tomar asistencia de múltiples estudiantes en una comisión
   * @param dto - Datos de asistencia
   * @returns Resultado del batch
   */
  tomarAsistenciaComision: async (
    dto: TomarAsistenciaComisionDto,
  ): Promise<AsistenciaComisionBatchResponse> => {
    return apiClient.post<AsistenciaComisionBatchResponse>('/asistencia/comision/batch', dto);
  },
};

export const planificacionesApi = {
  /**
   * Obtener todas las asignaciones de planificaciones del docente autenticado
   * @returns Lista de asignaciones con planificación, grupo, clases y estados
   */
  getMisAsignaciones: async (): Promise<Asignacion[]> => {
    return apiClient.get<Asignacion[]>('/docentes/me/asignaciones');
  },

  /**
   * Activar una clase (teoría + práctica) de una asignación
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase a activar
   */
  activarClase: async (
    asignacionId: string,
    claseId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/docentes/asignaciones/${asignacionId}/clases/${claseId}/activar`,
    );
  },

  /**
   * Desactivar una clase de una asignación
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase a desactivar
   */
  desactivarClase: async (
    asignacionId: string,
    claseId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/docentes/asignaciones/${asignacionId}/clases/${claseId}/desactivar`,
    );
  },

  /**
   * Activar solo la teoría de una clase
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   */
  activarTeoria: async (
    asignacionId: string,
    claseId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/docentes/asignaciones/${asignacionId}/clases/${claseId}/teoria/activar`,
    );
  },

  /**
   * Desactivar solo la teoría de una clase
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   */
  desactivarTeoria: async (
    asignacionId: string,
    claseId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/docentes/asignaciones/${asignacionId}/clases/${claseId}/teoria/desactivar`,
    );
  },

  /**
   * Activar solo la práctica de una clase
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   */
  activarPractica: async (
    asignacionId: string,
    claseId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/docentes/asignaciones/${asignacionId}/clases/${claseId}/practica/activar`,
    );
  },

  /**
   * Desactivar solo la práctica de una clase
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   */
  desactivarPractica: async (
    asignacionId: string,
    claseId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/docentes/asignaciones/${asignacionId}/clases/${claseId}/practica/desactivar`,
    );
  },

  /**
   * Obtener el progreso de estudiantes en una asignación
   * @param asignacionId - ID de la asignación
   * @returns Lista de progresos de estudiantes por clase
   */
  getProgresoEstudiantes: async (
    asignacionId: string,
  ): Promise<{ progresos: ProgresoEstudianteClase[] }> => {
    return apiClient.get<{ progresos: ProgresoEstudianteClase[] }>(
      `/docentes/asignaciones/${asignacionId}/progreso`,
    );
  },

  // ============================================================================
  // TAREAS - Gestión de tareas por clase
  // ============================================================================

  /**
   * Obtener tareas disponibles de una clase
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   * @returns Lista de tareas con estado de asignación
   */
  getTareasClase: async (
    asignacionId: string,
    claseId: string,
  ): Promise<{ tareas: TareaClaseInfo[] }> => {
    return apiClient.get<{ tareas: TareaClaseInfo[] }>(
      `/docentes/asignaciones/${asignacionId}/clases/${claseId}/tareas`,
    );
  },

  /**
   * Asignar una tarea al grupo (hacerla visible para estudiantes)
   * @param asignacionId - ID de la asignación
   * @param tareaClaseId - ID de la tarea de clase
   * @param fechaLimite - Fecha límite opcional (ISO string)
   */
  asignarTarea: async (
    asignacionId: string,
    tareaClaseId: string,
    fechaLimite?: string,
  ): Promise<{ success: boolean; tareaAsignadaId: string }> => {
    return apiClient.post<{ success: boolean; tareaAsignadaId: string }>(
      `/docentes/asignaciones/${asignacionId}/tareas/${tareaClaseId}/asignar`,
      { fechaLimite },
    );
  },

  /**
   * Desasignar una tarea (ocultarla de estudiantes)
   * @param asignacionId - ID de la asignación
   * @param tareaClaseId - ID de la tarea de clase
   */
  desasignarTarea: async (
    asignacionId: string,
    tareaClaseId: string,
  ): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(
      `/docentes/asignaciones/${asignacionId}/tareas/${tareaClaseId}/desasignar`,
    );
  },

  /**
   * Obtener progreso de tareas de los estudiantes
   * @param asignacionId - ID de la asignación
   * @returns Progreso de tareas por estudiante
   */
  getProgresoTareas: async (
    asignacionId: string,
  ): Promise<{ progresos: ProgresoTareaEstudiante[] }> => {
    return apiClient.get<{ progresos: ProgresoTareaEstudiante[] }>(
      `/docentes/asignaciones/${asignacionId}/tareas/progreso`,
    );
  },
};
