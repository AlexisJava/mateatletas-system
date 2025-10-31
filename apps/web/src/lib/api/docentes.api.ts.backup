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
}

export interface DashboardDocenteResponse {
  claseInminente: ClaseInminente | null;
  clasesHoy: ClaseDelDia[];
  misGrupos: GrupoResumen[];
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

export const docentesApi = {
  /**
   * Obtener dashboard del docente autenticado
   * Incluye clase inminente, alertas y estadísticas resumen
   */
  getDashboard: async (): Promise<DashboardDocenteResponse> => {
    try {
      const response = await apiClient.get<DashboardDocenteResponse>('/docentes/me/dashboard');
      return response;
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
      const response = await apiClient.get<EstadisticasCompletasResponse>('/docentes/me/estadisticas-completas');
      return response;
    } catch (error) {
      console.error('Error al obtener las estadísticas completas:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil del docente autenticado
   */
  getMe: async (): Promise<Docente> => {
    try {
      const response = await apiClient.get<Docente>('/docentes/me');
      return response;
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
      const response = await apiClient.patch<Docente>('/docentes/me', data);
      return response;
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
      return response;
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
      return response;
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
      const response = await apiClient.post<CreateDocenteResponse>(
        '/docentes',
        data
      );
      return response;
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
      const response = await apiClient.patch<Docente>(
        `/docentes/${id}`,
        data
      );
      return response;
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
    toDocenteId: string
  ): Promise<{ clasesReasignadas: number }> => {
    try {
      const response = await apiClient.post<{ clasesReasignadas: number }>(
        `/docentes/${fromDocenteId}/reasignar-clases`,
        {
          toDocenteId,
        }
      );
      return response;
    } catch (error) {
      console.error('Error al reasignar las clases del docente:', error);
      throw error;
    }
  },
};

// Exportar getDashboard como función standalone para facilitar imports
export const getDashboardDocente = docentesApi.getDashboard;
