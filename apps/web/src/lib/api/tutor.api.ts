/**
 * API Client para Dashboard de Tutores
 */

import axios from '@/lib/axios';
import {
  DashboardResumenResponse,
  ProximasClasesResponse,
  AlertasResponse,
} from '@/types/tutor-dashboard.types';

/**
 * Obtener el resumen completo del dashboard del tutor autenticado
 *
 * Incluye: métricas, alertas, pagos pendientes y clases de hoy
 */
export const getDashboardResumen = async (): Promise<DashboardResumenResponse> => {
  const response = await axios.get('/tutor/dashboard-resumen');
  return response.data;
};

/**
 * Obtener las próximas N clases de todos los hijos del tutor
 *
 * @param limit - Cantidad máxima de clases (default: 5, máximo: 50)
 */
export const getProximasClases = async (limit: number = 5): Promise<ProximasClasesResponse> => {
  const response = await axios.get(`/tutor/proximas-clases?limit=${limit}`);
  return response.data;
};

/**
 * Obtener todas las alertas activas del tutor
 *
 * Incluye: pagos vencidos, pagos por vencer, clases hoy, asistencias bajas
 */
export const getAlertas = async (): Promise<AlertasResponse> => {
  const response = await axios.get('/tutor/alertas');
  return response.data;
};
