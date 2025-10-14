/**
 * API Client para Clases y Reservas
 */

import axios from '@/lib/axios';
import {
  Clase,
  InscripcionClase,
  RutaCurricular,
  CrearReservaDto,
  FiltroClases,
} from '@/types/clases.types';

/**
 * Obtener todas las clases disponibles
 */
export const getClases = async (filtros?: FiltroClases): Promise<Clase[]> => {
  const params = new URLSearchParams();

  if (filtros?.rutaCurricularId) {
    params.append('rutaCurricularId', filtros.rutaCurricularId);
  }
  if (filtros?.fechaDesde) {
    params.append('fechaDesde', filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    params.append('fechaHasta', filtros.fechaHasta);
  }
  if (filtros?.soloDisponibles !== undefined) {
    params.append('soloDisponibles', String(filtros.soloDisponibles));
  }

  const response = await axios.get(`/clases?${params.toString()}`);
  return response.data;
};

/**
 * Obtener una clase por ID
 */
export const getClaseById = async (claseId: string): Promise<Clase> => {
  const response = await axios.get(`/clases/${claseId}`);
  return response.data;
};

/**
 * Reservar una clase (crear inscripción)
 */
export const reservarClase = async (
  claseId: string,
  data: CrearReservaDto
): Promise<InscripcionClase> => {
  const response = await axios.post(`/clases/${claseId}/reservar`, data);
  return response.data;
};

/**
 * Cancelar una reserva
 */
export const cancelarReserva = async (
  inscripcionId: string
): Promise<void> => {
  await axios.delete(`/clases/reservas/${inscripcionId}`);
};

/**
 * Obtener mis reservas (como tutor)
 */
export const getMisReservas = async (): Promise<InscripcionClase[]> => {
  const response = await axios.get('/clases/mis-reservas');
  return response.data;
};

/**
 * Obtener todas las rutas curriculares
 */
export const getRutasCurriculares = async (): Promise<RutaCurricular[]> => {
  const response = await axios.get('/clases/metadata/rutas-curriculares');
  return response.data;
};

/**
 * Obtener una ruta curricular por ID
 */
export const getRutaCurricularById = async (
  rutaId: string
): Promise<RutaCurricular> => {
  const response = await axios.get(`/clases/metadata/rutas-curriculares/${rutaId}`);
  return response.data;
};

// ==================== ENDPOINTS DOCENTE ====================

/**
 * Obtener las clases del docente autenticado
 * @param incluirPasadas Incluir clases finalizadas/canceladas
 */
export const getMisClasesDocente = async (
  incluirPasadas: boolean = false
): Promise<Clase[]> => {
  const params = new URLSearchParams();
  if (incluirPasadas) {
    params.append('incluirPasadas', 'true');
  }

  const response = await axios.get(`/clases/docente/mis-clases?${params.toString()}`);
  return response.data;
};

/**
 * Cancelar una clase (solo docente)
 * @param claseId ID de la clase
 */
export const cancelarClase = async (claseId: string): Promise<void> => {
  await axios.delete(`/clases/${claseId}`);
};
