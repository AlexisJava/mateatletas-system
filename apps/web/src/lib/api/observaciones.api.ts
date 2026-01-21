import apiClient from '../axios';

/**
 * Tipos de observación docente
 */
export type TipoObservacion = 'Academica' | 'Conductual' | 'Asistencia' | 'Logro' | 'Incidente';

export type PrioridadObservacion = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export type EstadoObservacion = 'Abierta' | 'EnSeguimiento' | 'Resuelta' | 'Cerrada';

/**
 * Estudiante básico en observación
 */
export interface EstudianteObservacion {
  id: string;
  nombre: string;
  apellido: string;
}

/**
 * Seguimiento de una observación
 */
export interface SeguimientoObservacion {
  id: string;
  contenido: string;
  autorId: string;
  autorTipo: 'Docente' | 'Admin';
  createdAt: string;
}

/**
 * Observación completa
 */
export interface Observacion {
  id: string;
  contenido: string;
  fechaEvento: string;
  tipo: TipoObservacion;
  prioridad: PrioridadObservacion;
  estado: EstadoObservacion;
  requiereSeguimiento: boolean;
  notificarAdmin: boolean;
  notificarPedagogia: boolean;
  docenteId: string;
  comisionId: string | null;
  createdAt: string;
  updatedAt: string;
  fechaResolucion: string | null;
  estudiantes: Array<{
    estudiante: EstudianteObservacion;
  }>;
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  seguimientos?: SeguimientoObservacion[];
  comision?: {
    id: string;
    nombre: string;
  };
  _count?: {
    seguimientos: number;
  };
}

/**
 * DTO para crear observación
 */
export interface CreateObservacionDto {
  estudianteIds: string[];
  comisionId?: string;
  contenido: string;
  fechaEvento: string; // ISO date string YYYY-MM-DD
  tipo: TipoObservacion;
  prioridad?: PrioridadObservacion;
  requiereSeguimiento?: boolean;
  notificarAdmin?: boolean;
  notificarPedagogia?: boolean;
}

/**
 * DTO para agregar seguimiento
 */
export interface CreateSeguimientoDto {
  contenido: string;
}

/**
 * DTO para cambiar estado
 */
export interface UpdateEstadoDto {
  estado: EstadoObservacion;
}

/**
 * Filtros para listar observaciones
 */
export interface FiltrarObservacionesDto {
  tipo?: TipoObservacion;
  prioridad?: PrioridadObservacion;
  estado?: EstadoObservacion;
  estudianteId?: string;
  comisionId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  requiereSeguimiento?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Respuesta paginada de observaciones
 */
export interface ListarObservacionesResponse {
  data: Observacion[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Respuesta de observaciones pendientes
 */
export interface ObservacionesPendientesResponse {
  data: Observacion[];
  total: number;
}

/**
 * API Client para Observaciones Docente
 *
 * NOTA: El apiClient ya extrae response.data automáticamente
 * a través del interceptor de respuesta en axios.ts
 */
export const observacionesApi = {
  /**
   * Crear nueva observación
   */
  crear: async (dto: CreateObservacionDto): Promise<Observacion> => {
    return apiClient.post<Observacion>('/observaciones', dto);
  },

  /**
   * Listar observaciones con filtros
   */
  listar: async (filtros?: FiltrarObservacionesDto): Promise<ListarObservacionesResponse> => {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<ListarObservacionesResponse>(`/observaciones?${params.toString()}`);
  },

  /**
   * Obtener observación por ID
   */
  obtenerPorId: async (id: string): Promise<Observacion> => {
    return apiClient.get<Observacion>(`/observaciones/${id}`);
  },

  /**
   * Obtener observaciones pendientes de seguimiento
   */
  obtenerPendientes: async (): Promise<ObservacionesPendientesResponse> => {
    return apiClient.get<ObservacionesPendientesResponse>('/observaciones/pendientes');
  },

  /**
   * Obtener observaciones de un estudiante específico
   */
  obtenerPorEstudiante: async (estudianteId: string): Promise<ObservacionesPendientesResponse> => {
    return apiClient.get<ObservacionesPendientesResponse>(
      `/observaciones/estudiante/${estudianteId}`,
    );
  },

  /**
   * Agregar seguimiento a una observación
   */
  agregarSeguimiento: async (
    observacionId: string,
    dto: CreateSeguimientoDto,
  ): Promise<Observacion> => {
    return apiClient.post<Observacion>(`/observaciones/${observacionId}/seguimientos`, dto);
  },

  /**
   * Cambiar estado de una observación
   */
  cambiarEstado: async (observacionId: string, dto: UpdateEstadoDto): Promise<Observacion> => {
    return apiClient.patch<Observacion>(`/observaciones/${observacionId}/estado`, dto);
  },
};
