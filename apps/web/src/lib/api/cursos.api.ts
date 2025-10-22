/**
 * Cursos API Client
 * SLICE #16: Estructura de Cursos con Módulos y Lecciones
 */

import axios from '@/lib/axios';
import { z } from 'zod';
import {
  modulosListSchema,
  leccionesListSchema,
  moduloSchema,
  leccionSchema,
  progresoCursoSchema,
  progresoLeccionSchema,
  createModuloSchema,
  updateModuloSchema,
  createLeccionSchema,
  updateLeccionSchema,
  completarLeccionSchema,
  tipoContenidoEnum,
  type Modulo,
  type Leccion,
  type ProgresoCurso,
  type ProgresoLeccion,
  type CreateModuloInput,
  type UpdateModuloInput,
  type CreateLeccionInput,
  type UpdateLeccionInput,
  type CompletarLeccionInput,
  type ContenidoLeccion,
  type ContenidoVideo,
  type ContenidoTexto,
  type ContenidoQuiz,
  type ContenidoTarea,
  type CursoDetalle,
} from '@mateatletas/contracts';

// ============================================================================
// TYPES
// ============================================================================

export const TipoContenido = tipoContenidoEnum.enum;
export type TipoContenido = (typeof TipoContenido)[keyof typeof TipoContenido];

export type {
  ContenidoVideo,
  ContenidoTexto,
  ContenidoQuiz,
  ContenidoTarea,
  ContenidoLeccion,
  Modulo,
  Leccion,
  ProgresoCurso,
  ProgresoLeccion,
  CursoDetalle,
};

export type CreateModuloDto = CreateModuloInput;
export type UpdateModuloDto = UpdateModuloInput;
export type CreateLeccionDto = CreateLeccionInput;
export type UpdateLeccionDto = UpdateLeccionInput;
export type CompletarLeccionDto = CompletarLeccionInput;

const modulosResponseSchema = z
  .object({
    data: modulosListSchema,
  })
  .passthrough();

const leccionesResponseSchema = z
  .object({
    data: leccionesListSchema,
  })
  .passthrough();

const completarLeccionResponseSchema = z.object({
  progreso: progresoLeccionSchema,
  puntos_ganados: z.number().int().nonnegative(),
  logro_desbloqueado: z.unknown().nullable(),
});

export type CompletarLeccionResponse = z.infer<typeof completarLeccionResponseSchema>;

const parseModulosResponse = (response: unknown): Modulo[] => {
  const direct = modulosListSchema.safeParse(response);
  if (direct.success) return direct.data;

  const wrapped = modulosResponseSchema.safeParse(response);
  if (wrapped.success) return wrapped.data.data;

  throw new Error('Respuesta de módulos inválida');
};

const parseLeccionesResponse = (response: unknown): Leccion[] => {
  const direct = leccionesListSchema.safeParse(response);
  if (direct.success) return direct.data;

  const wrapped = leccionesResponseSchema.safeParse(response);
  if (wrapped.success) return wrapped.data.data;

  throw new Error('Respuesta de lecciones inválida');
};

// ============================================================================
// MÓDULOS - Admin
// ============================================================================

/**
 * Crear un nuevo módulo en un curso
 * POST /cursos/productos/:productoId/modulos
 * Requiere: Admin
 */
export const createModulo = async (productoId: string, data: CreateModuloDto): Promise<Modulo> => {
  const payload = createModuloSchema.parse(data);
  const response = await axios.post(`/cursos/productos/${productoId}/modulos`, payload);
  return moduloSchema.parse(response);
};

/**
 * Obtener todos los módulos de un curso
 * GET /cursos/productos/:productoId/modulos
 * Público
 */
export const getModulosByProducto = async (productoId: string): Promise<Modulo[]> => {
  const response = await axios.get(`/cursos/productos/${productoId}/modulos`);
  return parseModulosResponse(response);
};

/**
 * Obtener un módulo específico con sus lecciones
 * GET /cursos/modulos/:id
 */
export const getModulo = async (id: string): Promise<Modulo> => {
  const response = await axios.get(`/cursos/modulos/${id}`);
  return moduloSchema.parse(response);
};

/**
 * Actualizar un módulo
 * PATCH /cursos/modulos/:id
 * Requiere: Admin
 */
export const updateModulo = async (id: string, data: UpdateModuloDto): Promise<Modulo> => {
  const payload = updateModuloSchema.parse(data);
  const response = await axios.patch(`/cursos/modulos/${id}`, payload);
  return moduloSchema.parse(response);
};

/**
 * Eliminar un módulo (y sus lecciones)
 * DELETE /cursos/modulos/:id
 * Requiere: Admin
 */
export const deleteModulo = async (id: string): Promise<void> => {
  await axios.delete(`/cursos/modulos/${id}`);
};

/**
 * Reordenar módulos
 * POST /cursos/productos/:productoId/modulos/reordenar
 * Body: { orden: ['id1', 'id2', 'id3'] }
 * Requiere: Admin
 */
export const reordenarModulos = async (productoId: string, ordenIds: string[]): Promise<void> => {
  await axios.post(`/cursos/productos/${productoId}/modulos/reordenar`, { orden: ordenIds });
};

// ============================================================================
// LECCIONES - Admin
// ============================================================================

/**
 * Crear una nueva lección en un módulo
 * POST /cursos/modulos/:moduloId/lecciones
 * Requiere: Admin
 */
export const createLeccion = async (moduloId: string, data: CreateLeccionDto): Promise<Leccion> => {
  const payload = createLeccionSchema.parse(data);
  const response = await axios.post(`/cursos/modulos/${moduloId}/lecciones`, payload);
  return leccionSchema.parse(response);
};

/**
 * Obtener todas las lecciones de un módulo
 * GET /cursos/modulos/:moduloId/lecciones
 * Público
 */
export const getLeccionesByModulo = async (moduloId: string): Promise<Leccion[]> => {
  const response = await axios.get(`/cursos/modulos/${moduloId}/lecciones`);
  return parseLeccionesResponse(response);
};

/**
 * Obtener una lección específica con todo su contenido
 * GET /cursos/lecciones/:id
 * Requiere: Autenticación (estudiante inscrito)
 */
export const getLeccion = async (id: string): Promise<Leccion> => {
  const response = await axios.get(`/cursos/lecciones/${id}`);
  return leccionSchema.parse(response);
};

/**
 * Actualizar una lección
 * PATCH /cursos/lecciones/:id
 * Requiere: Admin
 */
export const updateLeccion = async (id: string, data: UpdateLeccionDto): Promise<Leccion> => {
  const payload = updateLeccionSchema.parse(data);
  const response = await axios.patch(`/cursos/lecciones/${id}`, payload);
  return leccionSchema.parse(response);
};

/**
 * Eliminar una lección
 * DELETE /cursos/lecciones/:id
 * Requiere: Admin
 */
export const deleteLeccion = async (id: string): Promise<void> => {
  await axios.delete(`/cursos/lecciones/${id}`);
};

/**
 * Reordenar lecciones de un módulo
 * POST /cursos/modulos/:moduloId/lecciones/reordenar
 * Body: { orden: ['id1', 'id2', 'id3'] }
 * Requiere: Admin
 */
export const reordenarLecciones = async (moduloId: string, ordenIds: string[]): Promise<void> => {
  await axios.post(`/cursos/modulos/${moduloId}/lecciones/reordenar`, { orden: ordenIds });
};

// ============================================================================
// PROGRESO - Estudiante
// ============================================================================

/**
 * Completar una lección (estudiante)
 * POST /cursos/lecciones/:id/completar
 * Implementa gamificación: otorga puntos y desbloquea logros
 */
export const completarLeccion = async (
  leccionId: string,
  data: CompletarLeccionDto = {},
): Promise<CompletarLeccionResponse> => {
  const payload = completarLeccionSchema.parse(data);
  const response = await axios.post(`/cursos/lecciones/${leccionId}/completar`, payload);
  return completarLeccionResponseSchema.parse(response);
};

/**
 * Obtener progreso del estudiante en un curso
 * GET /cursos/productos/:productoId/progreso
 * Learning Analytics: porcentajes, lecciones completadas, etc.
 */
export const getProgresoCurso = async (productoId: string): Promise<ProgresoCurso> => {
  const response = await axios.get(`/cursos/productos/${productoId}/progreso`);
  return progresoCursoSchema.parse(response);
};

/**
 * Obtener la siguiente lección disponible
 * GET /cursos/productos/:productoId/siguiente-leccion
 * Implementa Progressive Disclosure
 */
export const getSiguienteLeccion = async (productoId: string): Promise<Leccion | null> => {
  const response = await axios.get(`/cursos/productos/${productoId}/siguiente-leccion`);
  if (response === null) return null;
  return leccionSchema.parse(response);
};

