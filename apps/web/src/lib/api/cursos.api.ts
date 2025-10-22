/**
 * Cursos API Client
 * SLICE #16: Estructura de Cursos con Módulos y Lecciones
 */

import axios from '@/lib/axios';
import {
  leccionSchema,
  leccionesListSchema,
  tipoContenidoEnum,
  type TipoContenido as TipoContenidoSchema,
  type LeccionFromSchema,
} from '@/lib/schemas/leccion.schema';

// ============================================================================
// TYPES
// ============================================================================

export const TipoContenido = tipoContenidoEnum.enum;
export type TipoContenido = TipoContenidoSchema;

// Tipos específicos de contenido por tipo de lección
export interface ContenidoVideo {
  url?: string;
  videoUrl?: string;
  duracion?: number;
}

export interface ContenidoTexto {
  texto?: string;
  contenido?: string;
}

export interface ContenidoQuiz {
  preguntas: Array<{
    id: string;
    pregunta: string;
    opciones: string[];
    respuesta_correcta: number;
  }>;
}

export interface ContenidoTarea {
  descripcion: string;
  instrucciones?: string;
}

// Union type para contenido tipado (usar cuando se conoce el tipo)
export type ContenidoLeccion =
  | ContenidoVideo
  | ContenidoTexto
  | ContenidoQuiz
  | ContenidoTarea
  | Record<string, unknown>; // Fallback para tipos no mapeados

export interface Modulo {
  id: string;
  producto_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  duracion_estimada_minutos: number;
  puntos_totales: number;
  publicado: boolean;
  lecciones?: Leccion[];
  createdAt: string;
  updatedAt: string;
}

export type Leccion = LeccionFromSchema;

export interface ProgresoLeccion {
  id: string;
  estudiante_id: string;
  leccion_id: string;
  progreso_porcentaje: number;
  tiempo_invertido_minutos: number;
  completado: boolean;
  calificacion: number | null;
  intentos: number;
  notas_estudiante: string | null;
  ultima_respuesta: Record<string, unknown> | null;
  fecha_completado: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgresoCurso {
  producto_id: string;
  total_modulos: number;
  total_lecciones: number;
  lecciones_completadas: number;
  porcentaje_completado: number;
  puntos_ganados: number;
  tiempo_total_minutos: number;
  siguiente_leccion: Leccion | null;
}

// DTOs
export interface CreateModuloDto {
  titulo: string;
  descripcion?: string;
  orden?: number;
  publicado?: boolean;
}

export interface UpdateModuloDto {
  titulo?: string;
  descripcion?: string;
  orden?: number;
  publicado?: boolean;
}

export interface CreateLeccionDto {
  titulo: string;
  descripcion?: string;
  tipo_contenido: TipoContenido;
  contenido: Record<string, unknown>;
  orden?: number;
  duracion_estimada_minutos: number;
  puntos?: number;
  publicado?: boolean;
  leccion_prerequisito_id?: string;
  logro_desbloqueado_id?: string;
}

export interface UpdateLeccionDto {
  titulo?: string;
  descripcion?: string;
  tipo_contenido?: TipoContenido;
  contenido?: Record<string, unknown>;
  orden?: number;
  duracion_estimada_minutos?: number;
  puntos?: number;
  publicado?: boolean;
  leccion_prerequisito_id?: string;
  logro_desbloqueado_id?: string;
}

export interface CompletarLeccionDto {
  progreso_porcentaje?: number;
  tiempo_invertido_minutos?: number;
  calificacion?: number;
  notas_estudiante?: string;
  ultima_respuesta?: Record<string, unknown>;
}

// ============================================================================
// MÓDULOS - Admin
// ============================================================================

/**
 * Crear un nuevo módulo en un curso
 * POST /cursos/productos/:productoId/modulos
 * Requiere: Admin
 */
export const createModulo = async (productoId: string, data: CreateModuloDto): Promise<Modulo> => {
  return axios.post(`/cursos/productos/${productoId}/modulos`, data);
};

/**
 * Obtener todos los módulos de un curso
 * GET /cursos/productos/:productoId/modulos
 * Público
 */
export const getModulosByProducto = async (productoId: string): Promise<Modulo[]> => {
  return axios.get(`/cursos/productos/${productoId}/modulos`);
};

/**
 * Obtener un módulo específico con sus lecciones
 * GET /cursos/modulos/:id
 */
export const getModulo = async (id: string): Promise<Modulo> => {
  return axios.get(`/cursos/modulos/${id}`);
};

/**
 * Actualizar un módulo
 * PATCH /cursos/modulos/:id
 * Requiere: Admin
 */
export const updateModulo = async (id: string, data: UpdateModuloDto): Promise<Modulo> => {
  return axios.patch(`/cursos/modulos/${id}`, data);
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
  const response = await axios.post(`/cursos/modulos/${moduloId}/lecciones`, data);
  return leccionSchema.parse(response);
};

/**
 * Obtener todas las lecciones de un módulo
 * GET /cursos/modulos/:moduloId/lecciones
 * Público
 */
export const getLeccionesByModulo = async (moduloId: string): Promise<Leccion[]> => {
  const response = await axios.get(`/cursos/modulos/${moduloId}/lecciones`);
  return leccionesListSchema.parse(response);
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
  const response = await axios.patch(`/cursos/lecciones/${id}`, data);
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
): Promise<{
  progreso: ProgresoLeccion;
  puntos_ganados: number;
  logro_desbloqueado: Record<string, unknown> | null;
}> => {
  return axios.post(`/cursos/lecciones/${leccionId}/completar`, data);
};

/**
 * Obtener progreso del estudiante en un curso
 * GET /cursos/productos/:productoId/progreso
 * Learning Analytics: porcentajes, lecciones completadas, etc.
 */
export const getProgresoCurso = async (productoId: string): Promise<ProgresoCurso> => {
  return axios.get(`/cursos/productos/${productoId}/progreso`);
};

/**
 * Obtener la siguiente lección disponible
 * GET /cursos/productos/:productoId/siguiente-leccion
 * Implementa Progressive Disclosure
 */
export const getSiguienteLeccion = async (productoId: string): Promise<Leccion | null> => {
  return axios.get(`/cursos/productos/${productoId}/siguiente-leccion`);
};
