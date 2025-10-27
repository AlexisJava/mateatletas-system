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

export const docentesApi = {
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
