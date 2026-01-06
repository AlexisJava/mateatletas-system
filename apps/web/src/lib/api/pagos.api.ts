// @ts-nocheck - TODO: Fix type mismatches between schemas and API responses
/**
 * API Client para Pagos y MercadoPago
 */

import axios from '../axios';
import { isAxiosError } from '@/lib/utils/error-handler';
import {
  PreferenciaPago,
  CrearPreferenciaSuscripcionRequest,
  Membresia,
  EstadoMembresiaResponse,
  MetricasDashboardResponse,
  ConfiguracionPrecios,
  HistorialCambioPrecios,
  InscripcionMensualConRelaciones,
  EstudianteConDescuento,
  ActualizarConfiguracionRequest,
  membresiaSchemaClient as membresiaSchema,
  estadoMembresiaResponseSchemaClient as estadoMembresiaResponseSchema,
  preferenciaPagoSchemaClient as preferenciaPagoSchema,
} from '@/types/pago.types';

/**
 * Crear preferencia de pago para suscripción
 * POST /api/pagos/suscripcion
 */
export const crearPreferenciaSuscripcion = async (productoId: string): Promise<PreferenciaPago> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.post('/pagos/suscripcion', {
      producto_id: productoId,
    } as CrearPreferenciaSuscripcionRequest);
    return preferenciaPagoSchema.parse(response) as PreferenciaPago;
  } catch (error) {
    console.error('Error al crear la preferencia de suscripción:', error);
    throw error;
  }
};

/**
 * Obtener membresía activa del tutor
 * GET /api/pagos/membresia
 * NOTA: Sistema legacy - el nuevo sistema usa Suscripciones PreApproval
 */
export const getMembresiaActual = async (): Promise<Membresia | null> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get('/pagos/membresia');
    return membresiaSchema.parse(response) as Membresia;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null; // No tiene membresía
    }
    throw error;
  }
};

/**
 * Obtener estado de una membresía específica
 * GET /api/pagos/membresia/:id/estado
 * NOTA: Sistema legacy - el nuevo sistema usa Suscripciones PreApproval
 */
export const getEstadoMembresia = async (membresiaId: string): Promise<EstadoMembresiaResponse> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get(`/pagos/membresia/${membresiaId}/estado`);
    return estadoMembresiaResponseSchema.parse(response) as EstadoMembresiaResponse;
  } catch (error) {
    console.error('Error al obtener el estado de la membresía:', error);
    throw error;
  }
};

/**
 * Activar membresía manualmente (MOCK para desarrollo)
 * POST /api/pagos/mock/activar-membresia/:id
 * NOTA: Sistema legacy - el nuevo sistema usa Suscripciones PreApproval
 */
export const activarMembresiaManual = async (membresiaId: string): Promise<Membresia> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.post(`/pagos/mock/activar-membresia/${membresiaId}`);
    return membresiaSchema.parse(response) as Membresia;
  } catch (error) {
    console.error('Error al activar manualmente la membresía:', error);
    throw error;
  }
};

/**
 * =====================================================
 * MÉTODOS PARA DASHBOARD DE MÉTRICAS
 * =====================================================
 */

/**
 * Obtener métricas del dashboard de pagos
 * GET /api/pagos/dashboard/metricas
 *
 * @param params - Parámetros opcionales para filtrar las métricas
 * @param params.anio - Año para consultar (opcional, default: año actual)
 * @param params.mes - Mes para consultar (opcional, default: mes actual)
 * @param params.tutorId - ID del tutor para filtrar (opcional, si no se envía muestra todas)
 * @returns Métricas completas del dashboard
 */
export const getMetricasDashboard = async (params?: {
  anio?: number;
  mes?: number;
  tutorId?: string;
}): Promise<MetricasDashboardResponse> => {
  // Construir query string
  const queryParams = new URLSearchParams();
  if (params?.anio) queryParams.append('anio', params.anio.toString());
  if (params?.mes) queryParams.append('mes', params.mes.toString());
  if (params?.tutorId) queryParams.append('tutorId', params.tutorId);

  const queryString = queryParams.toString();
  const url = `/pagos/dashboard/metricas${queryString ? `?${queryString}` : ''}`;

  try {
    // El interceptor ya extrae .data automáticamente
    const response = await axios.get<MetricasDashboardResponse>(url);
    return response;
  } catch (error) {
    console.error('Error al obtener las métricas del dashboard de pagos:', error);
    throw error;
  }
};

/**
 * Obtener configuración de precios actual
 * GET /api/pagos/configuracion
 *
 * @returns Configuración de precios del sistema
 */
export const getConfiguracionPrecios = async (): Promise<ConfiguracionPrecios> => {
  try {
    // El interceptor ya extrae .data automáticamente
    const response = await axios.get<ConfiguracionPrecios>('/pagos/configuracion');
    return response;
  } catch (error) {
    console.error('Error al obtener la configuración de precios:', error);
    throw error;
  }
};

/**
 * Obtener historial de cambios de precios
 * GET /api/pagos/historial-cambios
 *
 * @returns Lista de cambios históricos en precios (últimos 50)
 */
export const getHistorialCambios = async (): Promise<HistorialCambioPrecios[]> => {
  try {
    // El interceptor ya extrae .data automáticamente
    const response = await axios.get<HistorialCambioPrecios[]>('/pagos/historial-cambios');
    return response ?? [];
  } catch (error) {
    console.error('Error al obtener el historial de cambios de precios:', error);
    throw error;
  }
};

/**
 * Obtener inscripciones pendientes
 * GET /api/pagos/inscripciones/pendientes
 *
 * @returns Lista de inscripciones con estado Pendiente del período actual
 */
export const getInscripcionesPendientes = async (): Promise<InscripcionMensualConRelaciones[]> => {
  try {
    // El interceptor ya extrae .data automáticamente
    const response = await axios.get<InscripcionMensualConRelaciones[]>(
      '/pagos/inscripciones/pendientes',
    );
    return response ?? [];
  } catch (error) {
    console.error('Error al obtener las inscripciones pendientes:', error);
    throw error;
  }
};

/**
 * Obtener estudiantes con descuentos aplicados
 * GET /api/pagos/estudiantes-descuentos
 *
 * @returns Lista de estudiantes agrupados con sus descuentos del período actual
 */
export const getEstudiantesConDescuentos = async (): Promise<EstudianteConDescuento[]> => {
  try {
    // El interceptor ya extrae .data automáticamente
    const response = await axios.get<EstudianteConDescuento[]>('/pagos/estudiantes-descuentos');
    return response ?? [];
  } catch (error) {
    console.error('Error al obtener los estudiantes con descuentos:', error);
    throw error;
  }
};

/**
 * Actualizar configuración de precios
 * POST /api/pagos/configuracion/actualizar
 *
 * @param data - Datos de la configuración a actualizar
 * @returns Configuración actualizada
 */
export const updateConfiguracionPrecios = async (
  data: ActualizarConfiguracionRequest,
): Promise<ConfiguracionPrecios> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.post<ConfiguracionPrecios>(
      '/pagos/configuracion/actualizar',
      data,
    );
    return response;
  } catch (error) {
    console.error('Error al actualizar la configuración de precios:', error);
    throw error;
  }
};
