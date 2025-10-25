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

  const payload = await axios.get(`/clases?${params.toString()}`);
  return payload;
};

/**
 * Obtener una clase por ID
 */
export const getClaseById = async (claseId: string): Promise<Clase> => {
  const payload = await axios.get(`/clases/${claseId}`);
  return payload;
};

/**
 * Reservar una clase (crear inscripción)
 */
export const reservarClase = async (
  claseId: string,
  data: CrearReservaDto
): Promise<InscripcionClase> => {
  const payload = await axios.post(`/clases/${claseId}/reservar`, data);
  return payload;
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
  const payload = await axios.get('/clases/mis-reservas');
  return payload;
};

/**
 * Obtener todas las rutas curriculares
 */
export const getRutasCurriculares = async (): Promise<RutaCurricular[]> => {
  const payload = await axios.get('/clases/metadata/rutas-curriculares');
  return payload;
};

/**
 * Obtener una ruta curricular por ID
 */
export const getRutaCurricularById = async (
  rutaId: string
): Promise<RutaCurricular> => {
  const payload = await axios.get(`/clases/metadata/rutas-curriculares/${rutaId}`);
  return payload;
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

  const payload = await axios.get(`/clases/docente/mis-clases?${params.toString()}`);
  return payload;
};

/**
 * Cancelar una clase (solo docente)
 * @param claseId ID de la clase
 */
export const cancelarClase = async (claseId: string): Promise<void> => {
  await axios.delete(`/clases/${claseId}`);
};
