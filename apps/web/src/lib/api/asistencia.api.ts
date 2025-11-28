/**
 * API Client para Asistencia
 */

import axios from '@/lib/axios';
import {
  Asistencia,
  MarcarAsistenciaDto,
  ListaAsistencia,
  EstadisticasClase,
  HistorialAsistencia,
  ResumenDocenteAsistencia,
} from '@/types/asistencia.types';

/**
 * Marcar asistencia de un estudiante en una clase
 * POST /api/asistencia/clases/:claseId/estudiantes/:estudianteId
 */
export const marcarAsistencia = async (
  claseId: string,
  estudianteId: string,
  data: MarcarAsistenciaDto,
): Promise<Asistencia> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.post<Asistencia>(
      `/asistencia/clases/${claseId}/estudiantes/${estudianteId}`,
      data,
    );
    return response;
  } catch (error) {
    console.error('Error al marcar asistencia:', error);
    throw error;
  }
};

/**
 * Obtener lista de asistencia de una clase (roster completo)
 * GET /api/asistencia/clases/:claseId
 */
export const getAsistenciaClase = async (claseId: string): Promise<ListaAsistencia> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<ListaAsistencia>(`/asistencia/clases/${claseId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener la asistencia de la clase:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de asistencia de una clase
 * GET /api/asistencia/clases/:claseId/estadisticas
 */
export const getEstadisticasClase = async (claseId: string): Promise<EstadisticasClase> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<EstadisticasClase>(
      `/asistencia/clases/${claseId}/estadisticas`,
    );
    return response;
  } catch (error) {
    console.error('Error al obtener las estadísticas de la clase:', error);
    throw error;
  }
};

/**
 * Obtener historial de asistencia de un estudiante
 * GET /api/asistencia/estudiantes/:estudianteId
 */
export const getHistorialEstudiante = async (
  estudianteId: string,
  filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    rutaCurricularId?: string;
  },
): Promise<HistorialAsistencia> => {
  const params = new URLSearchParams();

  if (filtros?.fechaDesde) {
    params.append('fechaDesde', filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    params.append('fechaHasta', filtros.fechaHasta);
  }
  if (filtros?.rutaCurricularId) {
    params.append('rutaCurricularId', filtros.rutaCurricularId);
  }

  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<HistorialAsistencia>(
      `/asistencia/estudiantes/${estudianteId}?${params.toString()}`,
    );
    return response;
  } catch (error) {
    console.error('Error al obtener el historial de asistencia del estudiante:', error);
    throw error;
  }
};

/**
 * Obtener resumen de asistencia del docente actual
 * GET /api/asistencia/docente/resumen
 */
export const getResumenDocente = async (): Promise<ResumenDocenteAsistencia> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<ResumenDocenteAsistencia>('/asistencia/docente/resumen');
    return response;
  } catch (error) {
    console.error('Error al obtener el resumen de asistencia del docente:', error);
    throw error;
  }
};

/**
 * Obtener todas las observaciones del docente
 * GET /api/asistencia/docente/observaciones
 */
export interface Observacion {
  id: string;
  estudiante_id: string;
  clase_id: string;
  estado: string;
  observaciones: string | null;
  createdAt: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    foto_url?: string;
  };
  clase: {
    id: string;
    fecha_hora_inicio: string;
    rutaCurricular: {
      nombre: string;
      color: string;
    };
  };
}

export const getObservacionesDocente = async (filtros?: {
  estudianteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  limit?: number;
}): Promise<Observacion[]> => {
  const params = new URLSearchParams();

  if (filtros?.estudianteId) {
    params.append('estudianteId', filtros.estudianteId);
  }
  if (filtros?.fechaDesde) {
    params.append('fechaDesde', filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    params.append('fechaHasta', filtros.fechaHasta);
  }
  if (filtros?.limit) {
    params.append('limit', filtros.limit.toString());
  }

  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<Observacion[]>(
      `/asistencia/docente/observaciones?${params.toString()}`,
    );
    return response;
  } catch (error) {
    console.error('Error al obtener las observaciones del docente:', error);
    throw error;
  }
};

/**
 * Obtener reportes y gráficos del docente
 * GET /api/asistencia/docente/reportes
 */
export interface ReportesDocente {
  estadisticas_globales: {
    total_registros: number;
    total_presentes: number;
    total_ausentes: number;
    total_justificados: number;
    porcentaje_asistencia: number;
  };
  asistencia_semanal: Record<string, { presentes: number; ausentes: number; total: number }>;
  top_estudiantes: Array<{
    nombre: string;
    foto_url: string | null;
    asistencias: number;
  }>;
  por_ruta_curricular: Array<{
    ruta: string;
    color: string;
    presentes: number;
    total: number;
    porcentaje: string;
  }>;
}

export const getReportesDocente = async (): Promise<ReportesDocente> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<ReportesDocente>('/asistencia/docente/reportes');
    return response;
  } catch (error) {
    console.error('Error al obtener los reportes de asistencia del docente:', error);
    throw error;
  }
};

/**
 * =============================================================================
 * ASISTENCIA BATCH - Para tomar asistencia de múltiples estudiantes
 * =============================================================================
 */

export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Justificado';

export interface AsistenciaEstudianteItem {
  estudiante_id: string;
  estado: EstadoAsistencia;
  observaciones?: string;
}

export interface TomarAsistenciaBatchDto {
  clase_grupo_id: string;
  fecha: string; // YYYY-MM-DD
  asistencias: AsistenciaEstudianteItem[];
}

export interface AsistenciaBatchResponse {
  success: boolean;
  registrosCreados: number;
  registrosActualizados: number;
  estudiantes: Array<{
    estudiante_id: string;
    nombre: string;
    apellido: string;
    estado: EstadoAsistencia;
    observaciones: string | null;
  }>;
  mensaje: string;
}

/**
 * Tomar asistencia de múltiples estudiantes en un solo request
 * POST /api/asistencia/clase-grupo/batch
 */
export const tomarAsistenciaBatch = async (
  data: TomarAsistenciaBatchDto,
): Promise<AsistenciaBatchResponse> => {
  try {
    const response = await axios.post<AsistenciaBatchResponse>(
      '/asistencia/clase-grupo/batch',
      data,
    );
    return response;
  } catch (error) {
    console.error('Error al tomar asistencia batch:', error);
    throw error;
  }
};
