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
  data: MarcarAsistenciaDto
): Promise<Asistencia> => {
  const payload = await axios.post(
    `/asistencia/clases/${claseId}/estudiantes/${estudianteId}`,
    data
  );
  return payload;
};

/**
 * Obtener lista de asistencia de una clase (roster completo)
 * GET /api/asistencia/clases/:claseId
 */
export const getAsistenciaClase = async (
  claseId: string
): Promise<ListaAsistencia> => {
  const payload = await axios.get(`/asistencia/clases/${claseId}`);
  return payload;
};

/**
 * Obtener estadísticas de asistencia de una clase
 * GET /api/asistencia/clases/:claseId/estadisticas
 */
export const getEstadisticasClase = async (
  claseId: string
): Promise<EstadisticasClase> => {
  const payload = await axios.get(`/asistencia/clases/${claseId}/estadisticas`);
  return payload;
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
  }
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

  const payload = await axios.get(
    `/asistencia/estudiantes/${estudianteId}?${params.toString()}`
  );
  return payload;
};

/**
 * Obtener resumen de asistencia del docente actual
 * GET /api/asistencia/docente/resumen
 */
export const getResumenDocente = async (): Promise<ResumenDocenteAsistencia> => {
  const payload = await axios.get('/asistencia/docente/resumen');
  return payload;
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

  const payload = await axios.get(
    `/asistencia/docente/observaciones?${params.toString()}`
  );
  return payload;
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
  const payload = await axios.get("/asistencia/docente/reportes");
  return payload;
};
