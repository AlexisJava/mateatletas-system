import apiClient from '../axios';

/**
 * Cursos Tienda API - Cliente para endpoints de tienda de cursos
 *
 * Endpoints disponibles:
 * - Catálogo de cursos
 * - Solicitar canje
 * - Mis cursos canjeados
 * - Mis solicitudes
 * - Actualizar progreso
 */

export interface CursoCatalogo {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  imagen_url: string;
  duracion_clases: number;
  nivel_requerido: number;
  precio_usd: number;
  precio_monedas: number;
  destacado: boolean;
  nuevo: boolean;
  activo: boolean;
  orden: number;
}

export interface CursoEstudiante {
  id: string;
  estudiante_id: string;
  curso_id: string;
  fecha_canje: Date;
  progreso: number;
  completado: boolean;
  fecha_completado?: Date;
  curso: CursoCatalogo;
}

export interface SolicitudCanje {
  id: string;
  estudiante_id: string;
  curso_id: string;
  fecha_solicitud: Date;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  monedas_usadas: number;
  opcion_pago?: 'padre_paga_todo' | 'hijo_paga_mitad' | 'hijo_paga_todo';
  monto_padre_usd?: number;
  mensaje_padre?: string;
  fecha_respuesta?: Date;
  fecha_expiracion: Date;
  curso: CursoCatalogo;
  estudiante?: {
    id: string;
    username: string;
  };
}

export interface FiltrosCatalogo {
  categoria?: string;
  destacados?: boolean;
  nuevos?: boolean;
  nivelMaximo?: number;
}

export const cursosTiendaApi = {
  /**
   * Obtener catálogo completo de cursos con filtros opcionales
   */
  obtenerCatalogo: async (filtros?: FiltrosCatalogo): Promise<CursoCatalogo[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.categoria) params.append('categoria', filtros.categoria);
      if (filtros?.destacados) params.append('destacados', 'true');
      if (filtros?.nuevos) params.append('nuevos', 'true');
      if (filtros?.nivelMaximo) params.append('nivelMaximo', filtros.nivelMaximo.toString());

      const queryString = params.toString();
      const url = `/gamificacion/tienda/catalogo${queryString ? `?${queryString}` : ''}`;

      return await apiClient.get<CursoCatalogo[]>(url); // Interceptor ya retorna response.data
    } catch (error) {
      console.error('Error al obtener catálogo de cursos:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un curso específico
   */
  obtenerCurso: async (cursoId: string): Promise<CursoCatalogo> => {
    try {
      return await apiClient.get<CursoCatalogo>(`/gamificacion/tienda/catalogo/${cursoId}`);
    } catch (error) {
      console.error('Error al obtener curso:', error);
      throw error;
    }
  },

  /**
   * Solicitar canje de un curso (estudiante)
   */
  solicitarCanje: async (cursoId: string): Promise<SolicitudCanje> => {
    try {
      return await apiClient.post<SolicitudCanje>('/gamificacion/tienda/canjear', { cursoId });
    } catch (error) {
      console.error('Error al solicitar canje:', error);
      throw error;
    }
  },

  /**
   * Obtener mis cursos canjeados (estudiante)
   */
  obtenerMisCursos: async (): Promise<CursoEstudiante[]> => {
    try {
      return await apiClient.get<CursoEstudiante[]>('/gamificacion/tienda/mis-cursos');
    } catch (error) {
      console.error('Error al obtener mis cursos:', error);
      throw error;
    }
  },

  /**
   * Obtener mis solicitudes de canje (estudiante)
   */
  obtenerMisSolicitudes: async (): Promise<SolicitudCanje[]> => {
    try {
      return await apiClient.get<SolicitudCanje[]>('/gamificacion/tienda/mis-solicitudes');
    } catch (error) {
      console.error('Error al obtener mis solicitudes:', error);
      throw error;
    }
  },

  /**
   * Actualizar progreso de un curso (estudiante)
   */
  actualizarProgreso: async (
    cursoId: string,
    progreso: number,
    completado?: boolean,
  ): Promise<CursoEstudiante> => {
    try {
      return await apiClient.patch<CursoEstudiante>(
        `/gamificacion/tienda/mis-cursos/${cursoId}/progreso`,
        { progreso, completado },
      );
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitudes pendientes (tutor)
   */
  obtenerSolicitudesPendientes: async (): Promise<SolicitudCanje[]> => {
    try {
      return await apiClient.get<SolicitudCanje[]>('/gamificacion/tienda/solicitudes-pendientes');
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de solicitudes (tutor)
   */
  obtenerHistorialSolicitudes: async (): Promise<SolicitudCanje[]> => {
    try {
      return await apiClient.get<SolicitudCanje[]>('/gamificacion/tienda/solicitudes/historial');
    } catch (error) {
      console.error('Error al obtener historial de solicitudes:', error);
      throw error;
    }
  },

  /**
   * Aprobar solicitud de canje (tutor)
   */
  aprobarSolicitud: async (
    solicitudId: string,
    opcionPago: 'padre_paga_todo' | 'hijo_paga_mitad' | 'hijo_paga_todo',
    mensajePadre?: string,
  ): Promise<SolicitudCanje> => {
    try {
      return await apiClient.post<SolicitudCanje>(
        `/gamificacion/tienda/solicitudes/${solicitudId}/aprobar`,
        { opcionPago, mensajePadre },
      );
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      throw error;
    }
  },

  /**
   * Rechazar solicitud de canje (tutor)
   */
  rechazarSolicitud: async (
    solicitudId: string,
    mensajePadre?: string,
  ): Promise<SolicitudCanje> => {
    try {
      return await apiClient.post<SolicitudCanje>(
        `/gamificacion/tienda/solicitudes/${solicitudId}/rechazar`,
        { mensajePadre },
      );
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw error;
    }
  },
};

export default cursosTiendaApi;
