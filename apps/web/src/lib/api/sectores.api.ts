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
  return axios.get('/admin/sectores');
};

export const obtenerSector = async (id: string): Promise<Sector> => {
  return axios.get(`/admin/sectores/${id}`);
};

export const crearSector = async (data: CreateSectorDto): Promise<Sector> => {
  return axios.post('/admin/sectores', data);
};

export const actualizarSector = async (
  id: string,
  data: UpdateSectorDto
): Promise<Sector> => {
  return axios.put(`/admin/sectores/${id}`, data);
};

export const eliminarSector = async (id: string): Promise<void> => {
  return axios.delete(`/admin/sectores/${id}`);
};

// ============================================================================
// RUTAS DE ESPECIALIDAD
// ============================================================================

export const listarRutasEspecialidad = async (
  sectorId?: string
): Promise<RutaEspecialidad[]> => {
  const params = sectorId ? `?sectorId=${sectorId}` : '';
  return axios.get(`/admin/rutas-especialidad${params}`);
};

export const obtenerRutaEspecialidad = async (
  id: string
): Promise<RutaEspecialidad> => {
  return axios.get(`/admin/rutas-especialidad/${id}`);
};

export const crearRutaEspecialidad = async (
  data: CreateRutaEspecialidadDto
): Promise<RutaEspecialidad> => {
  return axios.post('/admin/rutas-especialidad', data);
};

export const actualizarRutaEspecialidad = async (
  id: string,
  data: UpdateRutaEspecialidadDto
): Promise<RutaEspecialidad> => {
  return axios.put(`/admin/rutas-especialidad/${id}`, data);
};

export const eliminarRutaEspecialidad = async (id: string): Promise<void> => {
  return axios.delete(`/admin/rutas-especialidad/${id}`);
};

// ============================================================================
// ASIGNACIÓN DE RUTAS A DOCENTES
// ============================================================================

export const obtenerRutasDocente = async (
  docenteId: string
): Promise<DocenteRuta[]> => {
  return axios.get(`/admin/docentes/${docenteId}/rutas`);
};

export const asignarRutasDocente = async (
  docenteId: string,
  data: AsignarRutasDocenteDto
): Promise<DocenteRuta[]> => {
  return axios.put(`/admin/docentes/${docenteId}/rutas`, data);
};

export const agregarRutaDocente = async (
  docenteId: string,
  rutaId: string
): Promise<DocenteRuta> => {
  return axios.post(`/admin/docentes/${docenteId}/rutas/${rutaId}`);
};

export const eliminarRutaDocente = async (
  docenteId: string,
  rutaId: string
): Promise<{ message: string }> => {
  return axios.delete(`/admin/docentes/${docenteId}/rutas/${rutaId}`);
};
