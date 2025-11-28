/**
 * API Client para Clases y Reservas
 */

import axios from '@/lib/axios';
import {
  ClaseConRelaciones,
  InscripcionClase,
  RutaCurricular,
  CrearReservaDto,
  FiltroClases,
} from '@/types/clases.types';

/**
 * Obtener todas las clases disponibles
 */
export const getClases = async (filtros?: FiltroClases): Promise<ClaseConRelaciones[]> => {
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

  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<ClaseConRelaciones[]>(`/clases?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error al obtener la lista de clases:', error);
    throw error;
  }
};

/**
 * Obtener una clase por ID
 */
export const getClaseById = async (claseId: string): Promise<ClaseConRelaciones> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<ClaseConRelaciones>(`/clases/${claseId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener la clase por ID:', error);
    throw error;
  }
};

/**
 * Reservar una clase (crear inscripción)
 */
export const reservarClase = async (
  claseId: string,
  data: CrearReservaDto,
): Promise<InscripcionClase> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.post<InscripcionClase>(`/clases/${claseId}/reservar`, data);
    return response;
  } catch (error) {
    console.error('Error al reservar la clase:', error);
    throw error;
  }
};

/**
 * Cancelar una reserva
 */
export const cancelarReserva = async (inscripcionId: string): Promise<void> => {
  // El interceptor ya retorna response.data directamente
  try {
    await axios.delete(`/clases/reservas/${inscripcionId}`);
  } catch (error) {
    console.error('Error al cancelar la reserva:', error);
    throw error;
  }
};

/**
 * Obtener mis reservas (como tutor)
 */
export const getMisReservas = async (): Promise<InscripcionClase[]> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<InscripcionClase[]>('/clases/mis-reservas');
    return response;
  } catch (error) {
    console.error('Error al obtener las reservas del tutor:', error);
    throw error;
  }
};

/**
 * Obtener todas las rutas curriculares
 */
export const getRutasCurriculares = async (): Promise<RutaCurricular[]> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<RutaCurricular[]>('/clases/metadata/rutas-curriculares');
    return response;
  } catch (error) {
    console.error('Error al obtener las rutas curriculares:', error);
    throw error;
  }
};

/**
 * Obtener una ruta curricular por ID
 */
export const getRutaCurricularById = async (rutaId: string): Promise<RutaCurricular> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<RutaCurricular>(
      `/clases/metadata/rutas-curriculares/${rutaId}`,
    );
    return response;
  } catch (error) {
    console.error('Error al obtener la ruta curricular por ID:', error);
    throw error;
  }
};

// ==================== ENDPOINTS DOCENTE ====================

/**
 * Obtener las clases del docente autenticado
 * @param incluirPasadas Incluir clases finalizadas/canceladas
 */
export const getMisClasesDocente = async (
  incluirPasadas: boolean = false,
): Promise<ClaseConRelaciones[]> => {
  const params = new URLSearchParams();
  if (incluirPasadas) {
    params.append('incluirPasadas', 'true');
  }

  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<ClaseConRelaciones[]>(
      `/clases/docente/mis-clases?${params.toString()}`,
    );
    return response;
  } catch (error) {
    console.error('Error al obtener las clases del docente:', error);
    throw error;
  }
};

/**
 * Cancelar una clase (solo docente)
 * @param claseId ID de la clase
 */
export const cancelarClase = async (claseId: string): Promise<void> => {
  // El interceptor ya retorna response.data directamente
  try {
    await axios.patch(`/clases/${claseId}/cancelar`, {});
  } catch (error) {
    console.error('Error al cancelar la clase:', error);
    throw error;
  }
};
