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
import {
  estudianteSchema,
  estudiantesResponseSchema,
  estadisticasEstudiantesSchema,
  equiposListSchema,
} from '@mateatletas/contracts';

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
    const response = await apiClient.post<Estudiante>('/estudiantes', data);
    return estudianteSchema.parse(response);
  },

  /**
   * Obtener todos los estudiantes del tutor autenticado
   * @param params - Filtros y paginación
   * @returns Lista de estudiantes con metadata
   */
  getAll: async (
    params?: QueryEstudiantesParams,
  ): Promise<EstudiantesResponse> => {
    const response = await apiClient.get('/estudiantes', { params });
    return estudiantesResponseSchema.parse(response);
  },

  /**
   * Obtener un estudiante por ID
   * @param id - ID del estudiante
   * @returns Estudiante con sus relaciones
   */
  getById: async (id: string): Promise<Estudiante> => {
    const response = await apiClient.get(`/estudiantes/${id}`);
    return estudianteSchema.parse(response);
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
    const response = await apiClient.patch(`/estudiantes/${id}`, data);
    return estudianteSchema.parse(response);
  },

  /**
   * Eliminar un estudiante
   * @param id - ID del estudiante
   * @returns Mensaje de confirmación
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/estudiantes/${id}`);
    return response as { message: string };
  },

  /**
   * Contar estudiantes del tutor
   * @returns Total de estudiantes
   */
  count: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/estudiantes/count');
    return response as { count: number };
  },

  /**
   * Obtener estadísticas de estudiantes
   * @returns Estadísticas agregadas
   */
  getEstadisticas: async (): Promise<EstadisticasEstudiantes> => {
    const response = await apiClient.get('/estudiantes/estadisticas');
    return estadisticasEstudiantesSchema.parse(response);
  },

  /**
   * Obtener todos los equipos disponibles
   * @returns Lista de equipos
   */
  getEquipos: async (): Promise<Equipo[]> => {
    const response = await apiClient.get('/equipos');
    return equiposListSchema.parse(response);
  },
};
