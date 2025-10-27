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
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<DashboardResumenResponse>(
      '/tutor/dashboard-resumen'
    );
    return response;
  } catch (error) {
    console.error('Error al obtener el resumen del dashboard del tutor:', error);
    throw error;
  }
};

/**
 * Obtener las próximas N clases de todos los hijos del tutor
 *
 * @param limit - Cantidad máxima de clases (default: 5, máximo: 50)
 */
export const getProximasClases = async (limit: number = 5): Promise<ProximasClasesResponse> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<ProximasClasesResponse>(
      `/tutor/proximas-clases?limit=${limit}`
    );
    return response;
  } catch (error) {
    console.error('Error al obtener las próximas clases del tutor:', error);
    throw error;
  }
};

/**
 * Obtener todas las alertas activas del tutor
 *
 * Incluye: pagos vencidos, pagos por vencer, clases hoy, asistencias bajas
 */
export const getAlertas = async (): Promise<AlertasResponse> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<AlertasResponse>('/tutor/alertas');
    return response;
  } catch (error) {
    console.error('Error al obtener las alertas del tutor:', error);
    throw error;
  }
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

    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<MisInscripcionesResponse>(url);
    return response;
  } catch (error) {
    console.error('Error al obtener las inscripciones del tutor:', error);
    throw error;
  }
};
