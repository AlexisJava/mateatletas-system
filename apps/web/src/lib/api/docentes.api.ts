import apiClient from '../axios';

export interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  titulo?: string;
  titulo_profesional?: string;
  bio?: string;
  biografia?: string;
  especialidades?: string[];
  experiencia_anos?: number;
  disponibilidad_horaria?: Record<string, string[]>;
  nivel_educativo?: string[];
  estado?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDocenteData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  titulo?: string;
  titulo_profesional?: string;
  bio?: string;
  biografia?: string;
  especialidades?: string[];
  experiencia_anos?: number;
  disponibilidad_horaria?: Record<string, string[]>;
  nivel_educativo?: string[];
  estado?: string;
}

export interface CreateDocenteData {
  email: string;
  password?: string; // Opcional: se autogenera si se omite
  nombre: string;
  apellido: string;
  titulo?: string;
  telefono?: string;
  disponibilidad_horaria?: Record<string, string[]>;
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
  fecha_hora: string;
  duracion: number;
  estudiantesInscritos: number;
  cupo_maximo: number;
  minutosParaEmpezar: number;
}

export interface EstudianteInscrito {
  id: string;
  nombre: string;
  apellido: string;
  avatar_url: string | null;
}

export interface ClaseDelDia {
  id: string;
  nombre: string;
  codigo: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estudiantes: EstudianteInscrito[];
  cupo_maximo: number;
  grupo_id: string;
}

export interface GrupoResumen {
  id: string;
  nombre: string;
  codigo: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estudiantesActivos: number;
  cupo_maximo: number;
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
  fecha_inicio: string | null;
  fecha_fin: string | null;
  cupo_maximo: number | null;
  estudiantesInscritos: number;
  activo: boolean;
}

export interface EstudianteConFalta {
  id: string;
  nombre: string;
  apellido: string;
  faltas_consecutivas: number;
  ultimo_grupo: string;
  tutor_email: string | null;
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
  foto_url: string | null;
  puntos_totales: number;
  porcentaje_asistencia: number;
}

export interface EstudianteAsistenciaPerfecta {
  estudiante_id: string;
  nombre: string;
  apellido: string;
  foto_url: string | null;
  total_asistencias: number;
  presentes: number;
  porcentaje_asistencia: number;
  grupos: { id: string; nombre: string; codigo: string }[];
}

export interface EstudianteSinTareas {
  id: string;
  nombre: string;
  apellido: string;
  foto_url: string | null;
}

export interface GrupoRanking {
  grupo_id: string;
  nombre: string;
  codigo: string;
  estudiantes_activos: number;
  cupo_maximo: number;
  puntos_totales: number;
  asistencia_promedio: number;
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
  hora_inicio: string;
  hora_fin: string;
  estudiantesCount: number;
  cupo_maximo: number;
  grupo_id: string;
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
  avatar_url: string | null;
  edad: number;
  casa: {
    id: string;
    tipo: string;
    nombre: string;
    colorPrimario: string;
  } | null;
  stats: {
    xp_total: number;
    nivel: number;
    racha_actual: number;
    asistencia_porcentaje: number;
    ultima_asistencia: {
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
  estado_inscripcion: string;
  inscripcion_fecha: string;
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
  fecha_inicio: string | null;
  fecha_fin: string | null;
  cupo_maximo: number | null;
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
  estudiante_id: string;
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

export const docentesApi = {
  /**
   * Obtener dashboard del docente autenticado
   * Incluye clase inminente, alertas y estadísticas resumen
   */
  getDashboard: async (): Promise<DashboardDocenteResponse> => {
    try {
      return await apiClient.get<DashboardDocenteResponse>('/docentes/me/dashboard');
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
      return await apiClient.get<Docente>('/docentes/me');
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
      return await apiClient.get<Docente[]>('/docentes');
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
      return await apiClient.get<Docente>(`/docentes/${id}`);
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
};

// Exportar getDashboard como función standalone para facilitar imports
export const getDashboardDocente = docentesApi.getDashboard;

// ============================================================================
// PLANIFICACIONES DOCENTE - v2 (Modelo de Clases)
// ============================================================================

export interface PlanificacionSimple {
  id: string;
  titulo: string;
  cantidad_clases: number;
}

export interface ClaseInfo {
  id: string;
  numero: number;
  titulo: string;
}

export interface EstadoClase {
  clase: ClaseInfo;
  teoria_activa: boolean;
  practica_activa: boolean;
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
  estados_clases: EstadoClase[];
}

export interface ProgresoEstudianteClase {
  id: string;
  estudiante: { nombre: string; apellido: string } | null;
  clase_numero: number;
  clase_titulo: string;
  teoria_completada: boolean;
  practica_completada: boolean;
  tiempo_teoria_segundos: number;
  tiempo_practica_segundos: number;
}

export interface TareaClaseInfo {
  id: string;
  contenido_id: string;
  contenido_titulo: string;
  orden: number;
  obligatoria: boolean;
  asignada: boolean;
  tarea_asignada_id: string | null;
  fecha_limite: string | null;
}

export interface ProgresoTareaEstudiante {
  estudiante_id: string;
  estudiante_nombre: string;
  tarea_titulo: string;
  completada: boolean;
  fecha_completado: string | null;
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
  ): Promise<{ success: boolean; tarea_asignada_id: string }> => {
    return apiClient.post<{ success: boolean; tarea_asignada_id: string }>(
      `/docentes/asignaciones/${asignacionId}/tareas/${tareaClaseId}/asignar`,
      { fecha_limite: fechaLimite },
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
