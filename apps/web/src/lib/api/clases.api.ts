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

  if (filtros?.ruta_curricular_id) {
    params.append('rutaCurricularId', filtros.ruta_curricular_id);
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

  return axios.get<Clase[]>(`/clases?${params.toString()}`);
};

/**
 * Obtener una clase por ID
 */
export const getClaseById = async (claseId: string): Promise<Clase> => {
  return axios.get<Clase>(`/clases/${claseId}`);
};

/**
 * Reservar una clase (crear inscripción)
 */
export const reservarClase = async (
  claseId: string,
  data: CrearReservaDto
): Promise<InscripcionClase> => {
  return axios.post<InscripcionClase>(`/clases/${claseId}/reservar`, data);
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
  return axios.get<InscripcionClase[]>('/clases/mis-reservas');
};

/**
 * Obtener todas las rutas curriculares
 */
export const getRutasCurriculares = async (): Promise<RutaCurricular[]> => {
  return axios.get<RutaCurricular[]>('/clases/metadata/rutas-curriculares');
};

/**
 * Obtener una ruta curricular por ID
 */
export const getRutaCurricularById = async (
  rutaId: string
): Promise<RutaCurricular> => {
  return axios.get<RutaCurricular>(`/clases/metadata/rutas-curriculares/${rutaId}`);
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

  return axios.get<Clase[]>(`/clases/docente/mis-clases?${params.toString()}`);
};

/**
 * Cancelar una clase (solo docente)
 * @param claseId ID de la clase
 */
export const cancelarClase = async (claseId: string): Promise<void> => {
  await axios.patch(`/clases/${claseId}/cancelar`, {});
};
