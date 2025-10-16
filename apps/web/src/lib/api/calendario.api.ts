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
  const response = await apiClient.post('/eventos/tareas', data);
  return response.data;
};

export const crearRecordatorio = async (data: CreateRecordatorioDto): Promise<Evento> => {
  const response = await apiClient.post('/eventos/recordatorios', data);
  return response.data;
};

export const crearNota = async (data: CreateNotaDto): Promise<Evento> => {
  const response = await apiClient.post('/eventos/notas', data);
  return response.data;
};

// ==================== LEER EVENTOS ====================

export const obtenerEventos = async (filtros?: FiltrosCalendario): Promise<Evento[]> => {
  const params = new URLSearchParams();
  
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
  
  const response = await apiClient.get(`/eventos?${params.toString()}`);
  return response.data;
};

export const obtenerEvento = async (id: string): Promise<Evento> => {
  const response = await apiClient.get(`/eventos/${id}`);
  return response.data;
};

export const obtenerVistaAgenda = async (): Promise<VistaAgendaData> => {
  const response = await apiClient.get('/eventos/vista-agenda');
  return response.data || response;
};

export const obtenerVistaSemana = async (fecha?: string): Promise<Evento[]> => {
  const params = fecha ? `?fecha=${fecha}` : '';
  const response = await apiClient.get(`/eventos/vista-semana${params}`);
  return response.data;
};

export const obtenerEstadisticas = async (): Promise<EstadisticasCalendario> => {
  const response = await apiClient.get('/eventos/estadisticas');
  return response.data;
};

// ==================== ACTUALIZAR EVENTOS ====================

export const actualizarTarea = async (
  id: string,
  data: Partial<CreateTareaDto>
): Promise<Evento> => {
  const response = await apiClient.patch(`/eventos/tareas/${id}`, data);
  return response.data;
};

export const actualizarRecordatorio = async (
  id: string,
  data: Partial<CreateRecordatorioDto>
): Promise<Evento> => {
  const response = await apiClient.patch(`/eventos/recordatorios/${id}`, data);
  return response.data;
};

export const actualizarNota = async (
  id: string,
  data: Partial<CreateNotaDto>
): Promise<Evento> => {
  const response = await apiClient.patch(`/eventos/notas/${id}`, data);
  return response.data;
};

export const actualizarFechasEvento = async (
  id: string,
  fecha_inicio: string,
  fecha_fin: string
): Promise<Evento> => {
  const response = await apiClient.patch(`/eventos/${id}/fechas`, {
    fecha_inicio,
    fecha_fin,
  });
  return response.data;
};

// ==================== ELIMINAR EVENTOS ====================

export const eliminarEvento = async (id: string): Promise<void> => {
  await apiClient.delete(`/eventos/${id}`);
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
