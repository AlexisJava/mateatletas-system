/**
 * API Client para Sectores y Rutas de Especialidad
 */

import axios from '../axios';
import type {
  Sector,
  RutaEspecialidad,
  DocenteRuta,
  CreateSectorDto,
  UpdateSectorDto,
  CreateRutaEspecialidadDto,
  UpdateRutaEspecialidadDto,
  AsignarRutasDocenteDto,
} from '@/types/sectores.types';

// ============================================================================
// SECTORES
// ============================================================================

export const listarSectores = async (): Promise<Sector[]> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<Sector[]>('/admin/sectores');
    return response;
  } catch (error) {
    console.error('Error al listar los sectores:', error);
    throw error;
  }
};

export const obtenerSector = async (id: string): Promise<Sector> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<Sector>(`/admin/sectores/${id}`);
    return response;
  } catch (error) {
    console.error('Error al obtener el sector:', error);
    throw error;
  }
};

export const crearSector = async (data: CreateSectorDto): Promise<Sector> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.post<Sector>('/admin/sectores', data);
    return response;
  } catch (error) {
    console.error('Error al crear el sector:', error);
    throw error;
  }
};

export const actualizarSector = async (id: string, data: UpdateSectorDto): Promise<Sector> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.put<Sector>(`/admin/sectores/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error al actualizar el sector:', error);
    throw error;
  }
};

export const eliminarSector = async (id: string): Promise<void> => {
  // El interceptor ya retorna response.data directamente
  try {
    await axios.delete(`/admin/sectores/${id}`);
  } catch (error) {
    console.error('Error al eliminar el sector:', error);
    throw error;
  }
};

// ============================================================================
// RUTAS DE ESPECIALIDAD
// ============================================================================

export const listarRutasEspecialidad = async (sectorId?: string): Promise<RutaEspecialidad[]> => {
  const params = sectorId ? `?sectorId=${sectorId}` : '';
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<RutaEspecialidad[]>(`/admin/rutas-especialidad${params}`);
    return response;
  } catch (error) {
    console.error('Error al listar las rutas de especialidad:', error);
    throw error;
  }
};

export const obtenerRutaEspecialidad = async (id: string): Promise<RutaEspecialidad> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<RutaEspecialidad>(`/admin/rutas-especialidad/${id}`);
    return response;
  } catch (error) {
    console.error('Error al obtener la ruta de especialidad:', error);
    throw error;
  }
};

export const crearRutaEspecialidad = async (
  data: CreateRutaEspecialidadDto,
): Promise<RutaEspecialidad> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.post<RutaEspecialidad>('/admin/rutas-especialidad', data);
    return response;
  } catch (error) {
    console.error('Error al crear la ruta de especialidad:', error);
    throw error;
  }
};

export const actualizarRutaEspecialidad = async (
  id: string,
  data: UpdateRutaEspecialidadDto,
): Promise<RutaEspecialidad> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.put<RutaEspecialidad>(`/admin/rutas-especialidad/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error al actualizar la ruta de especialidad:', error);
    throw error;
  }
};

export const eliminarRutaEspecialidad = async (id: string): Promise<void> => {
  // El interceptor ya retorna response.data directamente
  try {
    await axios.delete(`/admin/rutas-especialidad/${id}`);
  } catch (error) {
    console.error('Error al eliminar la ruta de especialidad:', error);
    throw error;
  }
};

// ============================================================================
// ASIGNACIÓN DE RUTAS A DOCENTES
// ============================================================================

export const obtenerRutasDocente = async (docenteId: string): Promise<DocenteRuta[]> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<DocenteRuta[]>(`/admin/docentes/${docenteId}/rutas`);
    return response;
  } catch (error) {
    console.error('Error al obtener las rutas del docente:', error);
    throw error;
  }
};

export const asignarRutasDocente = async (
  docenteId: string,
  data: AsignarRutasDocenteDto,
): Promise<DocenteRuta[]> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.put<DocenteRuta[]>(`/admin/docentes/${docenteId}/rutas`, data);
    return response;
  } catch (error) {
    console.error('Error al asignar las rutas al docente:', error);
    throw error;
  }
};

export const agregarRutaDocente = async (
  docenteId: string,
  rutaId: string,
): Promise<DocenteRuta> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.post<DocenteRuta>(`/admin/docentes/${docenteId}/rutas/${rutaId}`);
    return response;
  } catch (error) {
    console.error('Error al agregar la ruta al docente:', error);
    throw error;
  }
};

export const eliminarRutaDocente = async (
  docenteId: string,
  rutaId: string,
): Promise<{ message: string }> => {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.delete<{ message: string }>(
      `/admin/docentes/${docenteId}/rutas/${rutaId}`,
    );
    return response;
  } catch (error) {
    console.error('Error al eliminar la ruta del docente:', error);
    throw error;
  }
};
