/**
 * API Client para Dashboard de Tutores
 */

import axios from '@/lib/axios';
import {
  DashboardResumenResponse,
  ProximasClasesResponse,
  AlertasResponse,
  MisInscripcionesResponse,
  EstadoPago,
} from '@/types/tutor-dashboard.types';

/**
 * Obtener el resumen completo del dashboard del tutor autenticado
 *
 * Incluye: métricas, alertas, pagos pendientes y clases de hoy
 */
export const getDashboardResumen = async (): Promise<DashboardResumenResponse> => {
  const response = await axios.get('/tutor/dashboard-resumen');
  return response;
};

/**
 * Obtener las próximas N clases de todos los hijos del tutor
 *
 * @param limit - Cantidad máxima de clases (default: 5, máximo: 50)
 */
export const getProximasClases = async (limit: number = 5): Promise<ProximasClasesResponse> => {
  const response = await axios.get(`/tutor/proximas-clases?limit=${limit}`);
  return response;
};

/**
 * Obtener todas las alertas activas del tutor
 *
 * Incluye: pagos vencidos, pagos por vencer, clases hoy, asistencias bajas
 */
export const getAlertas = async (): Promise<AlertasResponse> => {
  const response = await axios.get('/tutor/alertas');
  return response;
};

/**
 * Filtros para obtener inscripciones mensuales
 */
export interface GetMisInscripcionesParams {
  periodo?: string; // Formato YYYY-MM (ej: "2025-01")
  estadoPago?: EstadoPago; // Filtrar por estado
}

/**
 * Obtener mis inscripciones mensuales (pagos mensuales)
 *
 * El tutorId se obtiene automáticamente del JWT (seguro)
 *
 * @param params - Filtros opcionales (periodo, estadoPago)
 * @returns Inscripciones y resumen financiero
 */
export const getMisInscripciones = async (
  params?: GetMisInscripcionesParams
): Promise<MisInscripcionesResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.periodo) {
    queryParams.append('periodo', params.periodo);
  }

  if (params?.estadoPago) {
    queryParams.append('estadoPago', params.estadoPago);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/tutor/mis-inscripciones?${queryString}` : '/tutor/mis-inscripciones';

  const response = await axios.get(url);
  return response;
};
