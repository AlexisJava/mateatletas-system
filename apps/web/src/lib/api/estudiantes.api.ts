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
  Equipo,
} from '@/types/estudiante';
import { normalizarEstudiante, normalizarEstudiantes } from '@/types/estudiante';
import {
  estudianteSchema,
  estudiantesResponseSchema,
  estadisticasEstudiantesSchema,
  equiposListSchema,
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
    fecha_hora_inicio: z.string().datetime(),
    duracion_minutos: z.number(),
    docente: z.object({
      nombre: z.string(),
      apellido: z.string(),
    }),
    ruta_curricular: z.object({
      nombre: z.string(),
      descripcion: z.string().optional(),
    }).optional(),
    link_meet: z.string().optional(),
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
      link_meet: z.string().nullable(),
    })
  ),
});

const sectoresList = z.array(sectorSchema);

// Tipos inferidos de los schemas
type DeleteResponse = z.infer<typeof deleteResponseSchema>;
type CountResponse = z.infer<typeof countResponseSchema>;
type ProximaClase = z.infer<typeof proximaClaseSchema>;
type Companero = z.infer<typeof companeroSchema>;
type Sector = z.infer<typeof sectorSchema>;

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
  getAll: async (
    params?: QueryEstudiantesParams,
  ): Promise<EstudiantesResponse> => {
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
  update: async (
    id: string,
    data: UpdateEstudianteDto,
  ): Promise<Estudiante> => {
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
   * Obtener todos los equipos disponibles
   * @returns Lista de equipos
   */
  getEquipos: async (): Promise<Equipo[]> => {
    try {
      const response = await apiClient.get<Equipo[]>('/equipos');
      return equiposListSchema.parse(response);
    } catch (error) {
      console.error('Error al obtener los equipos de estudiantes:', error);
      throw error;
    }
  },

  /**
   * Actualizar la animación idle del estudiante autenticado
   * @param animacion_idle_url - URL de la animación .glb
   * @returns Estudiante actualizado
   */
  updateAnimacion: async (animacion_idle_url: string): Promise<Estudiante> => {
    try {
      const response = await apiClient.patch<Estudiante>('/estudiantes/animacion', {
        animacion_idle_url,
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
};
