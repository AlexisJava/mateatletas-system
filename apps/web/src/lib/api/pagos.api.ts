/**
 * API Client para Pagos y MercadoPago
 */

import axios from '../axios';
import { isAxiosError } from '@/lib/utils/error-handler';
import {
  PreferenciaPago,
  CrearPreferenciaSuscripcionRequest,
  CrearPreferenciaCursoRequest,
  Membresia,
  InscripcionCurso,
  EstadoMembresiaResponse,
  MetricasDashboardResponse,
  ConfiguracionPrecios,
  HistorialCambioPrecios,
  InscripcionMensualConRelaciones,
  EstudianteConDescuento,
  ActualizarConfiguracionRequest,
} from '@/types/pago.types';
import { membresiaSchema, estadoMembresiaResponseSchema } from '@/lib/schemas/membresia.schema';
import { preferenciaPagoSchema, inscripcionesCursoListSchema } from '@/lib/schemas/pago.schema';

/**
 * Crear preferencia de pago para suscripción
 * POST /api/pagos/suscripcion
 */
export const crearPreferenciaSuscripcion = async (
  productoId: string,
): Promise<PreferenciaPago> => {
  const response = await axios.post(
    '/pagos/suscripcion',
    { producto_id: productoId } as CrearPreferenciaSuscripcionRequest,
  );
  return preferenciaPagoSchema.parse(response) as PreferenciaPago;
};

/**
 * Crear preferencia de pago para curso
 * POST /api/pagos/curso
 */
export const crearPreferenciaCurso = async (
  productoId: string,
  estudianteId: string,
): Promise<PreferenciaPago> => {
  const response = await axios.post('/pagos/curso', {
    producto_id: productoId,
    estudiante_id: estudianteId,
  } as CrearPreferenciaCursoRequest);
  return preferenciaPagoSchema.parse(response) as PreferenciaPago;
};

/**
 * Obtener membresía activa del tutor
 * GET /api/pagos/membresia
 */
export const getMembresiaActual = async (): Promise<Membresia | null> => {
  try {
    const response = await axios.get('/pagos/membresia');
    return membresiaSchema.parse(response) as Membresia;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null; // No tiene membresía
    }
    throw error;
  }
};

/**
 * Obtener estado de una membresía específica
 * GET /api/pagos/membresia/:id/estado
 */
export const getEstadoMembresia = async (
  membresiaId: string,
): Promise<EstadoMembresiaResponse> => {
  const response = await axios.get(
    `/pagos/membresia/${membresiaId}/estado`,
  );
  return estadoMembresiaResponseSchema.parse(
    response,
  ) as EstadoMembresiaResponse;
};

/**
 * Obtener inscripciones a cursos del tutor
 * GET /api/pagos/inscripciones
 */
export const getInscripciones = async (): Promise<InscripcionCurso[]> => {
  const response = await axios.get('/pagos/inscripciones');
  return inscripcionesCursoListSchema.parse(response) as InscripcionCurso[];
};

/**
 * Activar membresía manualmente (MOCK para desarrollo)
 * POST /api/pagos/mock/activar-membresia/:id
 */
export const activarMembresiaManual = async (
  membresiaId: string,
): Promise<Membresia> => {
  const response = await axios.post(
    `/pagos/mock/activar-membresia/${membresiaId}`,
  );
  return membresiaSchema.parse(response) as Membresia;
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

  const response = await axios.get(url);
  return response as MetricasDashboardResponse;
};

/**
 * Obtener configuración de precios actual
 * GET /api/pagos/configuracion
 *
 * @returns Configuración de precios del sistema
 */
export const getConfiguracionPrecios = async (): Promise<ConfiguracionPrecios> => {
  const response = await axios.get('/pagos/configuracion');
  return response as ConfiguracionPrecios;
};

/**
 * Obtener historial de cambios de precios
 * GET /api/pagos/historial-cambios
 *
 * @returns Lista de cambios históricos en precios (últimos 50)
 */
export const getHistorialCambios = async (): Promise<HistorialCambioPrecios[]> => {
  const response = await axios.get('/pagos/historial-cambios');
  return response as HistorialCambioPrecios[];
};

/**
 * Obtener inscripciones pendientes
 * GET /api/pagos/inscripciones/pendientes
 *
 * @returns Lista de inscripciones con estado Pendiente del período actual
 */
export const getInscripcionesPendientes = async (): Promise<InscripcionMensualConRelaciones[]> => {
  const response = await axios.get('/pagos/inscripciones/pendientes');
  return response as InscripcionMensualConRelaciones[];
};

/**
 * Obtener estudiantes con descuentos aplicados
 * GET /api/pagos/estudiantes-descuentos
 *
 * @returns Lista de estudiantes agrupados con sus descuentos del período actual
 */
export const getEstudiantesConDescuentos = async (): Promise<EstudianteConDescuento[]> => {
  const response = await axios.get('/pagos/estudiantes-descuentos');
  return response as EstudianteConDescuento[];
};

/**
 * Actualizar configuración de precios
 * POST /api/pagos/configuracion/actualizar
 *
 * @param data - Datos de la configuración a actualizar
 * @returns Configuración actualizada
 */
export const updateConfiguracionPrecios = async (
  data: ActualizarConfiguracionRequest
): Promise<ConfiguracionPrecios> => {
  const response = await axios.post('/pagos/configuracion/actualizar', data);
  return response as ConfiguracionPrecios;
};
