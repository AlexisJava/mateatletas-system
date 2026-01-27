/**
 * Sandbox Types - Minimalist IDE for content creation
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type House = 'QUANTUM' | 'VERTEX' | 'PULSAR';
export type Subject = 'MATH' | 'CODE' | 'SCIENCE';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type ContentType = 'microleccion' | 'planificacion';

// ─────────────────────────────────────────────────────────────────────────────
// MICROLECCIÓN (CONTENIDO)
// ─────────────────────────────────────────────────────────────────────────────

export interface NodoContenido {
  id: string;
  titulo: string;
  bloqueado: boolean;
  parentId: string | null;
  orden: number;
  contenidoJson: string | null;
  hijos: NodoContenido[];
}

export interface Contenido {
  id: string;
  titulo: string;
  house: House;
  subject: Subject;
  nodos: NodoContenido[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANIFICACIÓN
// ─────────────────────────────────────────────────────────────────────────────

export interface ClasePlanificacion {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  teoriaId: string;
  practicaId: string;
}

export interface Planificacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  cantidadClases: number;
  house: House;
  subject: Subject;
  clases: ClasePlanificacion[];
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface SandboxState {
  contentType: ContentType;
  contenido: Contenido | null;
  planificacion: Planificacion | null;
  selectedItemId: string | null; // nodoId or claseId
  saveStatus: SaveStatus;
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS (Discriminated Union)
// ─────────────────────────────────────────────────────────────────────────────

export type SandboxAction =
  // Content type
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  // Microlección
  | { type: 'SET_CONTENIDO'; payload: Contenido | null }
  | { type: 'UPDATE_NODO_JSON'; payload: { nodoId: string; json: string } }
  | { type: 'ADD_NODO'; payload: { parentId: string; nodo: NodoContenido } }
  | { type: 'ADD_ROOT_NODO'; payload: NodoContenido }
  | { type: 'DELETE_NODO'; payload: string }
  | { type: 'RENAME_NODO'; payload: { nodoId: string; titulo: string } }
  // Planificación
  | { type: 'SET_PLANIFICACION'; payload: Planificacion | null }
  | { type: 'UPDATE_CLASE'; payload: { claseId: string; data: Partial<ClasePlanificacion> } }
  // Shared
  | { type: 'SELECT_ITEM'; payload: string | null }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'SET_LOADING'; payload: boolean };
