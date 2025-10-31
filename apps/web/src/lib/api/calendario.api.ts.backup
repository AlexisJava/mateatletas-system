import apiClient from '../axios';
import type {
  Evento,
  CreateTareaDto,
  CreateRecordatorioDto,
  CreateNotaDto,
  VistaAgendaData,
  EstadisticasCalendario,
  FiltrosCalendario,
  TipoEvento,
} from '@/types/calendario.types';

/**
 * API Client para el Sistema de Calendario
 */

// ==================== CREAR EVENTOS ====================

export const crearTarea = async (data: CreateTareaDto): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.post<Evento>('/eventos/tareas', data);
    return response;
  } catch (error) {
    console.error('Error al crear tarea en el calendario:', error);
    throw error;
  }
};

export const crearRecordatorio = async (
  data: CreateRecordatorioDto
): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.post<Evento>(
      '/eventos/recordatorios',
      data
    );
    return response;
  } catch (error) {
    console.error('Error al crear recordatorio en el calendario:', error);
    throw error;
  }
};

export const crearNota = async (data: CreateNotaDto): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.post<Evento>('/eventos/notas', data);
    return response;
  } catch (error) {
    console.error('Error al crear nota en el calendario:', error);
    throw error;
  }
};

// ==================== LEER EVENTOS ====================

export const obtenerEventos = async (
  filtros?: FiltrosCalendario
): Promise<Evento[]> => {
  const params = new URLSearchParams();

  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);

    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.get<Evento[]>(
      `/eventos?${params.toString()}`
    );
    return response;
  } catch (error) {
    console.error('Error al obtener eventos del calendario:', error);
    throw error;
  }
};

export const obtenerEvento = async (id: string): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.get<Evento>(`/eventos/${id}`);
    return response;
  } catch (error) {
    console.error('Error al obtener el evento del calendario:', error);
    throw error;
  }
};

export const obtenerVistaAgenda = async (): Promise<VistaAgendaData> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.get<VistaAgendaData>(
      '/eventos/vista-agenda'
    );
    return response;
  } catch (error) {
    console.error('Error al obtener la vista de agenda del calendario:', error);
    throw error;
  }
};

export const obtenerVistaSemana = async (fecha?: string): Promise<Evento[]> => {
  const params = fecha ? `?fecha=${fecha}` : '';
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.get<Evento[]>(
      `/eventos/vista-semana${params}`
    );
    return response;
  } catch (error) {
    console.error('Error al obtener la vista semanal del calendario:', error);
    throw error;
  }
};

export const obtenerEstadisticas = async (): Promise<EstadisticasCalendario> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.get<EstadisticasCalendario>(
      '/eventos/estadisticas'
    );
    return response;
  } catch (error) {
    console.error('Error al obtener las estadísticas del calendario:', error);
    throw error;
  }
};

// ==================== ACTUALIZAR EVENTOS ====================

export const actualizarTarea = async (
  id: string,
  data: Partial<CreateTareaDto>
): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.patch<Evento>(
      `/eventos/tareas/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.error('Error al actualizar la tarea del calendario:', error);
    throw error;
  }
};

export const actualizarRecordatorio = async (
  id: string,
  data: Partial<CreateRecordatorioDto>
): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.patch<Evento>(
      `/eventos/recordatorios/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.error('Error al actualizar el recordatorio del calendario:', error);
    throw error;
  }
};

export const actualizarNota = async (
  id: string,
  data: Partial<CreateNotaDto>
): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.patch<Evento>(
      `/eventos/notas/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.error('Error al actualizar la nota del calendario:', error);
    throw error;
  }
};

export const actualizarFechasEvento = async (
  id: string,
  fecha_inicio: string,
  fecha_fin: string
): Promise<Evento> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.patch<Evento>(`/eventos/${id}/fechas`, {
      fecha_inicio,
      fecha_fin,
    });
    return response;
  } catch (error) {
    console.error('Error al actualizar las fechas del evento:', error);
    throw error;
  }
};

// ==================== ELIMINAR EVENTOS ====================

export const eliminarEvento = async (id: string): Promise<void> => {
    // El interceptor ya retorna response.data directamente
  try {
    await apiClient.delete(`/eventos/${id}`);
  } catch (error) {
    console.error('Error al eliminar el evento del calendario:', error);
    throw error;
  }
};

// ==================== UTILIDADES ====================

/**
 * Obtener color según tipo de evento
 */
export const getColorPorTipo = (tipo: TipoEvento): string => {
  const colores = {
    CLASE: '#3b82f6', // blue-500
    TAREA: '#f59e0b', // amber-500
    RECORDATORIO: '#6366f1', // indigo-500
    NOTA: '#8b5cf6', // violet-500
  };
  return colores[tipo] || '#6b7280';
};

/**
 * Obtener icono según tipo de evento
 */
export const getIconoPorTipo = (tipo: TipoEvento): string => {
  const iconos = {
    CLASE: '📚',
    TAREA: '✓',
    RECORDATORIO: '🔔',
    NOTA: '📝',
  };
  return iconos[tipo] || '📅';
};

/**
 * Formatear fecha para display
 */
export const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formatear hora para display
 */
export const formatearHora = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Obtener fecha ISO para el inicio del día
 */
export const getInicioDia = (fecha: Date = new Date()): string => {
  const date = new Date(fecha);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

/**
 * Obtener fecha ISO para el fin del día
 */
export const getFinDia = (fecha: Date = new Date()): string => {
  const date = new Date(fecha);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};
