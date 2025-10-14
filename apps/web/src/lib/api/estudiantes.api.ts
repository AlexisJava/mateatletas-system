import apiClient from '../axios';
import type {
  Estudiante,
  CreateEstudianteData,
  UpdateEstudianteData,
  QueryEstudiantesParams,
  EstudiantesResponse,
  EstadisticasEstudiantes,
  Equipo,
} from '@/types/estudiante';

/**
 * API Client para operaciones de estudiantes
 * Todas las peticiones requieren autenticación JWT
 */
export const estudiantesApi = {
  /**
   * Crear un nuevo estudiante
   * @param data - Datos del estudiante
   * @returns Estudiante creado
   */
  create: async (data: CreateEstudianteData): Promise<Estudiante> => {
    // NOTE: apiClient interceptor ya extrae response.data, así que response ES la data
    const response = await apiClient.post<Estudiante>('/estudiantes', data);
    return response as unknown as Estudiante;
  },

  /**
   * Obtener todos los estudiantes del tutor autenticado
   * @param params - Filtros y paginación
   * @returns Lista de estudiantes con metadata
   */
  getAll: async (
    params?: QueryEstudiantesParams,
  ): Promise<EstudiantesResponse> => {
    // NOTE: apiClient interceptor ya extrae response.data
    return apiClient.get('/estudiantes', { params }) as Promise<EstudiantesResponse>;
  },

  /**
   * Obtener un estudiante por ID
   * @param id - ID del estudiante
   * @returns Estudiante con sus relaciones
   */
  getById: async (id: string): Promise<Estudiante> => {
    // NOTE: apiClient interceptor ya extrae response.data
    return apiClient.get(`/estudiantes/${id}`) as Promise<Estudiante>;
  },

  /**
   * Actualizar un estudiante
   * @param id - ID del estudiante
   * @param data - Datos a actualizar
   * @returns Estudiante actualizado
   */
  update: async (
    id: string,
    data: UpdateEstudianteData,
  ): Promise<Estudiante> => {
    // NOTE: apiClient interceptor ya extrae response.data
    return apiClient.patch(`/estudiantes/${id}`, data) as Promise<Estudiante>;
  },

  /**
   * Eliminar un estudiante
   * @param id - ID del estudiante
   * @returns Mensaje de confirmación
   */
  delete: async (id: string): Promise<{ message: string }> => {
    // NOTE: apiClient interceptor ya extrae response.data
    return apiClient.delete(`/estudiantes/${id}`) as Promise<{ message: string }>;
  },

  /**
   * Contar estudiantes del tutor
   * @returns Total de estudiantes
   */
  count: async (): Promise<{ count: number }> => {
    // NOTE: apiClient interceptor ya extrae response.data
    return apiClient.get('/estudiantes/count') as Promise<{ count: number }>;
  },

  /**
   * Obtener estadísticas de estudiantes
   * @returns Estadísticas agregadas
   */
  getEstadisticas: async (): Promise<EstadisticasEstudiantes> => {
    // NOTE: apiClient interceptor ya extrae response.data
    return apiClient.get('/estudiantes/estadisticas') as Promise<EstadisticasEstudiantes>;
  },

  /**
   * Obtener todos los equipos disponibles
   * @returns Lista de equipos
   */
  getEquipos: async (): Promise<Equipo[]> => {
    // NOTE: apiClient interceptor ya extrae response.data
    return apiClient.get('/equipos') as Promise<Equipo[]>;
  },
};
