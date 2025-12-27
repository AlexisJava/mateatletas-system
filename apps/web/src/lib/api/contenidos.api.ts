/**
 * Contenidos API Client
 *
 * Cliente para el sistema de contenido educativo (Sandbox).
 * Endpoints para CRUD de contenidos, nodos jerárquicos y publicación.
 */

import axios from '@/lib/axios';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES - Backend DTOs
// ─────────────────────────────────────────────────────────────────────────────

export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';
export type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
export type EstadoContenido = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';

/**
 * NodoContenido - Estructura jerárquica del contenido educativo
 *
 * Estructura de árbol con profundidad infinita:
 * - Nodos raíz: Teoría, Práctica, Evaluación (bloqueado=true)
 * - Nodos con hijos: Contenedores (contenidoJson=null)
 * - Nodos sin hijos: Hojas editables (contenidoJson=string)
 */
export interface NodoBackend {
  id: string;
  titulo: string;
  bloqueado: boolean;
  parentId: string | null;
  orden: number;
  contenidoJson: string | null;
  contenidoId: string;
  createdAt: string;
  updatedAt: string;
  hijos: NodoBackend[];
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
  /** Árbol jerárquico de nodos (3 raíces: Teoría, Práctica, Evaluación) */
  nodos: NodoBackend[];
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

// ─────────────────────────────────────────────────────────────────────────────
// NODOS DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateNodoDto {
  titulo: string;
  parentId?: string;
  contenidoJson?: string;
  orden?: number;
}

export interface UpdateNodoDto {
  titulo?: string;
  contenidoJson?: string;
  orden?: number;
}

export interface MoverNodoDto {
  nuevoParentId: string | null;
}

export interface ReordenarNodosDto {
  orden: Array<{ nodoId: string; orden: number }>;
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
 * Obtener contenido por ID con árbol de nodos
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
// NODOS JERÁRQUICOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtener árbol completo de nodos de un contenido
 */
export const getArbol = async (contenidoId: string): Promise<NodoBackend[]> => {
  return axios.get<NodoBackend[]>(`/contenidos/${contenidoId}/arbol`);
};

/**
 * Crear nuevo nodo dentro de un contenido
 */
export const createNodo = async (contenidoId: string, dto: CreateNodoDto): Promise<NodoBackend> => {
  return axios.post<NodoBackend>(`/contenidos/${contenidoId}/nodos`, dto);
};

/**
 * Actualizar un nodo existente
 */
export const updateNodo = async (nodoId: string, dto: UpdateNodoDto): Promise<NodoBackend> => {
  return axios.patch<NodoBackend>(`/contenidos/nodos/${nodoId}`, dto);
};

/**
 * Eliminar un nodo (no aplica a nodos bloqueados)
 */
export const deleteNodo = async (
  nodoId: string,
): Promise<{ success: boolean; mensaje: string }> => {
  return axios.delete(`/contenidos/nodos/${nodoId}`);
};

/**
 * Mover nodo a otro padre
 */
export const moverNodo = async (nodoId: string, dto: MoverNodoDto): Promise<NodoBackend> => {
  return axios.patch<NodoBackend>(`/contenidos/nodos/${nodoId}/mover`, dto);
};

/**
 * Reordenar nodos de un contenido
 */
export const reordenarNodos = async (
  contenidoId: string,
  dto: ReordenarNodosDto,
): Promise<NodoBackend[]> => {
  return axios.patch<NodoBackend[]>(`/contenidos/${contenidoId}/nodos/reordenar`, dto);
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
