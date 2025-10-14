import apiClient from '../axios';

export interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  titulo_profesional?: string;
  biografia?: string;
  especialidades?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDocenteData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  titulo_profesional?: string;
  biografia?: string;
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
};
