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
import {
  membresiaSchema,
  estadoMembresiaResponseSchema,
  type MembresiaFromSchema,
  type EstadoMembresiaResponse as EstadoMembresiaResponseFromSchema,
} from '@/lib/schemas/membresia.schema';
import {
  preferenciaPagoSchema,
  inscripcionesCursoListSchema,
  type PreferenciaPago as PreferenciaPagoFromSchema,
  type InscripcionCursoFromSchema,
} from '@/lib/schemas/pago.schema';

/**
 * Crear preferencia de pago para suscripción
 * POST /api/pagos/suscripcion
 */
export const crearPreferenciaSuscripcion = async (
  productoId: string
): Promise<PreferenciaPago | PreferenciaPagoFromSchema> => {
  const response = await axios.post(
    '/pagos/suscripcion',
    { producto_id: productoId } as CrearPreferenciaSuscripcionRequest
  );
  return preferenciaPagoSchema.parse(response);
};

/**
 * Crear preferencia de pago para curso
 * POST /api/pagos/curso
 */
export const crearPreferenciaCurso = async (
  productoId: string,
  estudianteId: string
): Promise<PreferenciaPago | PreferenciaPagoFromSchema> => {
  const response = await axios.post('/pagos/curso', {
    producto_id: productoId,
    estudiante_id: estudianteId,
  } as CrearPreferenciaCursoRequest);
  return preferenciaPagoSchema.parse(response);
};

/**
 * Obtener membresía activa del tutor
 * GET /api/pagos/membresia
 */
export const getMembresiaActual = async (): Promise<Membresia | MembresiaFromSchema | null> => {
  try {
    const response = await axios.get('/pagos/membresia');
    return membresiaSchema.parse(response);
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
): Promise<EstadoMembresiaResponse | EstadoMembresiaResponseFromSchema> => {
  const response = await axios.get(
    `/pagos/membresia/${membresiaId}/estado`
  );
  return estadoMembresiaResponseSchema.parse(response);
};

/**
 * Obtener inscripciones a cursos del tutor
 * GET /api/pagos/inscripciones
 */
export const getInscripciones = async (): Promise<InscripcionCurso[] | InscripcionCursoFromSchema[]> => {
  const response = await axios.get('/pagos/inscripciones');
  return inscripcionesCursoListSchema.parse(response);
};

/**
 * Activar membresía manualmente (MOCK para desarrollo)
 * POST /api/pagos/mock/activar-membresia/:id
 */
export const activarMembresiaManual = async (
  membresiaId: string
): Promise<Membresia | MembresiaFromSchema> => {
  const response = await axios.post(
    `/pagos/mock/activar-membresia/${membresiaId}`
  );
  return membresiaSchema.parse(response);
};
