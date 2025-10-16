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
} from '@/types/pago.types';

/**
 * Crear preferencia de pago para suscripción
 * POST /api/pagos/suscripcion
 */
export const crearPreferenciaSuscripcion = async (
  productoId: string
): Promise<PreferenciaPago> => {
  const response = await axios.post<PreferenciaPago>(
    '/pagos/suscripcion',
    { producto_id: productoId } as CrearPreferenciaSuscripcionRequest
  );
  return response.data;
};

/**
 * Crear preferencia de pago para curso
 * POST /api/pagos/curso
 */
export const crearPreferenciaCurso = async (
  productoId: string,
  estudianteId: string
): Promise<PreferenciaPago> => {
  const response = await axios.post<PreferenciaPago>('/pagos/curso', {
    producto_id: productoId,
    estudiante_id: estudianteId,
  } as CrearPreferenciaCursoRequest);
  return response.data;
};

/**
 * Obtener membresía activa del tutor
 * GET /api/pagos/membresia
 */
export const getMembresiaActual = async (): Promise<Membresia | null> => {
  try {
    const response = await axios.get<Membresia>('/pagos/membresia');
    return response.data;
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
  membresiaId: string
): Promise<EstadoMembresiaResponse> => {
  const response = await axios.get<EstadoMembresiaResponse>(
    `/pagos/membresia/${membresiaId}/estado`
  );
  return response.data;
};

/**
 * Obtener inscripciones a cursos del tutor
 * GET /api/pagos/inscripciones
 */
export const getInscripciones = async (): Promise<InscripcionCurso[]> => {
  const response = await axios.get<InscripcionCurso[]>('/pagos/inscripciones');
  return response.data;
};

/**
 * Activar membresía manualmente (MOCK para desarrollo)
 * POST /api/pagos/mock/activar-membresia/:id
 */
export const activarMembresiaManual = async (
  membresiaId: string
): Promise<Membresia> => {
  const response = await axios.post<Membresia>(
    `/pagos/mock/activar-membresia/${membresiaId}`
  );
  return response.data;
};
