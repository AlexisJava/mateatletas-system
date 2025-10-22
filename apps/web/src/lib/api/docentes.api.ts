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
    return await apiClient.get('/docentes/me');
  },

  /**
   * Actualizar perfil del docente autenticado
   */
  updateMe: async (data: UpdateDocenteData): Promise<Docente> => {
    return await apiClient.patch('/docentes/me', data);
  },

  /**
   * Obtener todos los docentes (admin only)
   */
  getAll: async (): Promise<Docente[]> => {
    return await apiClient.get('/docentes');
  },

  /**
   * Obtener un docente por ID (admin only)
   */
  getById: async (id: string): Promise<Docente> => {
    return await apiClient.get(`/docentes/${id}`);
  },

  /**
   * Crear un nuevo docente (admin only)
   * Si password se omite, el backend autogenera una contraseña segura
   * y la retorna en generatedPassword para que el admin la comparta con el docente
   */
  create: async (data: CreateDocenteData): Promise<CreateDocenteResponse> => {
    return await apiClient.post('/docentes', data);
  },

  /**
   * Actualizar un docente por ID (admin only)
   */
  update: async (id: string, data: UpdateDocenteData): Promise<Docente> => {
    return await apiClient.patch(`/docentes/${id}`, data);
  },

  /**
   * Eliminar un docente por ID (admin only)
   */
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/docentes/${id}`);
  },

  /**
   * Reasignar todas las clases de un docente a otro (admin only)
   */
  reassignClasses: async (
    fromDocenteId: string,
    toDocenteId: string
  ): Promise<{ clasesReasignadas: number }> => {
    return await apiClient.post(`/docentes/${fromDocenteId}/reasignar-clases`, {
      toDocenteId,
    });
  },
};
