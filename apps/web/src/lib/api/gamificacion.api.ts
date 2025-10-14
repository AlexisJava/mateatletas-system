import apiClient from '../axios';

export interface DashboardData {
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
    equipo: {
      id: string;
      nombre: string;
      color: string;
    };
  };
  stats: {
    puntosToales: number;
    clasesAsistidas: number;
    clasesTotales: number;
    racha: number;
  };
  proximasClases: any[];
  equipoRanking: any[];
  ultimasAsistencias: any[];
}

export interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  puntos: number;
  categoria: string;
  desbloqueado: boolean;
  fecha_desbloqueo?: Date;
}

export interface Puntos {
  total: number;
  asistencia: number;
  extras: number;
  porRuta: Record<string, number>;
}

export interface Ranking {
  equipoActual: any;
  posicionEquipo: number;
  posicionGlobal: number;
  rankingEquipo: any[];
  rankingGlobal: any[];
}

export interface Progreso {
  ruta: string;
  color: string;
  clasesAsistidas: number;
  clasesTotales: number;
  porcentaje: number;
}

export interface AccionPuntuable {
  id: string;
  nombre: string;
  descripcion: string;
  puntos: number;
  activo: boolean;
}

export interface PuntoObtenido {
  id: string;
  puntos: number;
  contexto?: string;
  fecha_otorgado: string;
  accion: AccionPuntuable;
  docente: {
    nombre: string;
    apellido: string;
  };
  clase?: {
    id: string;
    fecha_hora_inicio: string;
    rutaCurricular: {
      nombre: string;
      color: string;
    };
  };
}

export interface OtorgarPuntosData {
  estudianteId: string;
  accionId: string;
  claseId?: string;
  contexto?: string;
}

export const gamificacionApi = {
  /**
   * Obtener dashboard completo del estudiante
   */
  getDashboard: async (estudianteId: string): Promise<DashboardData> => {
    return await apiClient.get(`/gamificacion/dashboard/${estudianteId}`);
  },

  /**
   * Obtener logros del estudiante
   */
  getLogros: async (estudianteId: string): Promise<Logro[]> => {
    return await apiClient.get(`/gamificacion/logros/${estudianteId}`);
  },

  /**
   * Obtener puntos del estudiante
   */
  getPuntos: async (estudianteId: string): Promise<Puntos> => {
    return await apiClient.get(`/gamificacion/puntos/${estudianteId}`);
  },

  /**
   * Obtener ranking del estudiante
   */
  getRanking: async (estudianteId: string): Promise<Ranking> => {
    return await apiClient.get(`/gamificacion/ranking/${estudianteId}`);
  },

  /**
   * Obtener progreso por rutas
   */
  getProgreso: async (estudianteId: string): Promise<Progreso[]> => {
    return await apiClient.get(`/gamificacion/progreso/${estudianteId}`);
  },

  /**
   * Desbloquear logro
   */
  desbloquearLogro: async (logroId: string): Promise<any> => {
    return await apiClient.post(`/gamificacion/logros/${logroId}/desbloquear`);
  },

  /**
   * Obtener acciones puntuables disponibles (docentes)
   */
  getAcciones: async (): Promise<AccionPuntuable[]> => {
    return await apiClient.get('/gamificacion/acciones');
  },

  /**
   * Obtener historial de puntos de un estudiante
   */
  getHistorial: async (estudianteId: string): Promise<PuntoObtenido[]> => {
    return await apiClient.get(`/gamificacion/historial/${estudianteId}`);
  },

  /**
   * Otorgar puntos a un estudiante (docentes)
   */
  otorgarPuntos: async (data: OtorgarPuntosData): Promise<any> => {
    return await apiClient.post('/gamificacion/puntos', data);
  },
};
