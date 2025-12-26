/**
 * Contenidos API Client
 *
 * Cliente para el sistema de contenido educativo (Sandbox).
 * Endpoints para CRUD de contenidos, slides y publicación.
 */

import axios from '@/lib/axios';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES - Backend DTOs
// ─────────────────────────────────────────────────────────────────────────────

export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';
export type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
export type EstadoContenido = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';

export interface SlideBackend {
  id: string;
  titulo: string;
  contenidoJson: string;
  orden: number;
  contenidoId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContenidoBackend {
  id: string;
  titulo: string;
  descripcion: string | null;
  casaTipo: CasaTipo;
  mundoTipo: MundoTipo;
  estado: EstadoContenido;
  imagenPortada: string | null;
  duracionMinutos: number | null;
  orden: number;
  fechaPublicacion: string | null;
  creadorId: string;
  createdAt: string;
  updatedAt: string;
  slides: SlideBackend[];
  creador?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface CreateContenidoDto {
  titulo: string;
  casaTipo: CasaTipo;
  mundoTipo: MundoTipo;
  descripcion?: string;
  slides?: CreateSlideDto[];
}

export interface UpdateContenidoDto {
  titulo?: string;
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
  descripcion?: string;
  imagenPortada?: string;
  duracionMinutos?: number;
  orden?: number;
}

export interface CreateSlideDto {
  titulo: string;
  contenidoJson: string;
  orden?: number;
}

export interface UpdateSlideDto {
  titulo?: string;
  contenidoJson?: string;
  orden?: number;
}

export interface QueryContenidosParams {
  estado?: EstadoContenido;
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
  page?: number;
  limit?: number;
}

export interface ContenidosListResponse {
  data: ContenidoBackend[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crear nuevo contenido como BORRADOR
 */
export const createContenido = async (dto: CreateContenidoDto): Promise<ContenidoBackend> => {
  return axios.post<ContenidoBackend>('/contenidos', dto);
};

/**
 * Obtener lista de contenidos con filtros
 */
export const getContenidos = async (
  params?: QueryContenidosParams,
): Promise<ContenidosListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.estado) searchParams.append('estado', params.estado);
  if (params?.casaTipo) searchParams.append('casaTipo', params.casaTipo);
  if (params?.mundoTipo) searchParams.append('mundoTipo', params.mundoTipo);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const query = searchParams.toString();
  return axios.get<ContenidosListResponse>(`/contenidos${query ? `?${query}` : ''}`);
};

/**
 * Obtener contenido por ID con slides
 */
export const getContenidoById = async (id: string): Promise<ContenidoBackend> => {
  return axios.get<ContenidoBackend>(`/contenidos/${id}`);
};

/**
 * Actualizar metadata del contenido (solo BORRADOR)
 */
export const updateContenido = async (
  id: string,
  dto: UpdateContenidoDto,
): Promise<ContenidoBackend> => {
  return axios.patch<ContenidoBackend>(`/contenidos/${id}`, dto);
};

/**
 * Eliminar contenido (solo BORRADOR)
 */
export const deleteContenido = async (
  id: string,
): Promise<{ success: boolean; mensaje: string }> => {
  return axios.delete(`/contenidos/${id}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLICACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Publicar contenido (BORRADOR → PUBLICADO)
 */
export const publicarContenido = async (id: string): Promise<ContenidoBackend> => {
  return axios.post<ContenidoBackend>(`/contenidos/${id}/publicar`);
};

/**
 * Archivar contenido (PUBLICADO → ARCHIVADO)
 */
export const archivarContenido = async (id: string): Promise<ContenidoBackend> => {
  return axios.post<ContenidoBackend>(`/contenidos/${id}/archivar`);
};

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agregar slide a un contenido
 */
export const addSlide = async (contenidoId: string, dto: CreateSlideDto): Promise<SlideBackend> => {
  return axios.post<SlideBackend>(`/contenidos/${contenidoId}/slides`, dto);
};

/**
 * Actualizar un slide existente
 */
export const updateSlide = async (
  contenidoId: string,
  slideId: string,
  dto: UpdateSlideDto,
): Promise<SlideBackend> => {
  return axios.patch<SlideBackend>(`/contenidos/${contenidoId}/slides/${slideId}`, dto);
};

/**
 * Eliminar un slide
 */
export const deleteSlide = async (
  contenidoId: string,
  slideId: string,
): Promise<{ success: boolean; mensaje: string }> => {
  return axios.delete(`/contenidos/${contenidoId}/slides/${slideId}`);
};

/**
 * Reordenar slides
 */
export const reordenarSlides = async (
  contenidoId: string,
  orden: { slideId: string; orden: number }[],
): Promise<SlideBackend[]> => {
  return axios.patch<SlideBackend[]>(`/contenidos/${contenidoId}/slides/reordenar`, { orden });
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS - Mapeo Frontend ↔ Backend
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapea Subject del frontend a MundoTipo del backend
 */
export const subjectToMundoTipo = (subject: 'MATH' | 'CODE' | 'SCIENCE'): MundoTipo => {
  const map: Record<'MATH' | 'CODE' | 'SCIENCE', MundoTipo> = {
    MATH: 'MATEMATICA',
    CODE: 'PROGRAMACION',
    SCIENCE: 'CIENCIAS',
  };
  return map[subject];
};

/**
 * Mapea MundoTipo del backend a Subject del frontend
 */
export const mundoTipoToSubject = (mundo: MundoTipo): 'MATH' | 'CODE' | 'SCIENCE' => {
  const map: Record<MundoTipo, 'MATH' | 'CODE' | 'SCIENCE'> = {
    MATEMATICA: 'MATH',
    PROGRAMACION: 'CODE',
    CIENCIAS: 'SCIENCE',
  };
  return map[mundo];
};
