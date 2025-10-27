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
    try {
      const response = await apiClient.post<Estudiante>(
        '/estudiantes',
        data,
      );
      return estudianteSchema.parse(response.data);
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
  getAll: async (
    params?: QueryEstudiantesParams,
  ): Promise<EstudiantesResponse> => {
    try {
      const response = await apiClient.get('/estudiantes', { params });
      return estudiantesResponseSchema.parse(response.data);
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
      const response = await apiClient.get(`/estudiantes/${id}`);
      return estudianteSchema.parse(response.data);
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
  update: async (
    id: string,
    data: UpdateEstudianteData,
  ): Promise<Estudiante> => {
    try {
      const response = await apiClient.patch(`/estudiantes/${id}`, data);
      return estudianteSchema.parse(response.data);
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
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete(`/estudiantes/${id}`);
      return response.data as { message: string };
    } catch (error) {
      console.error('Error al eliminar el estudiante:', error);
      throw error;
    }
  },

  /**
   * Contar estudiantes del tutor
   * @returns Total de estudiantes
   */
  count: async (): Promise<{ count: number }> => {
    try {
      const response = await apiClient.get('/estudiantes/count');
      return response.data as { count: number };
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
      const response = await apiClient.get('/estudiantes/estadisticas');
      return estadisticasEstudiantesSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener las estadísticas de estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los equipos disponibles
   * @returns Lista de equipos
   */
  getEquipos: async (): Promise<Equipo[]> => {
    try {
      const response = await apiClient.get('/equipos');
      return equiposListSchema.parse(response.data);
    } catch (error) {
      console.error('Error al obtener los equipos de estudiantes:', error);
      throw error;
    }
  },
};
