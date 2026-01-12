/**
 * Sandbox Types - Minimalist IDE for content creation
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type House = 'QUANTUM' | 'VERTEX' | 'PULSAR';
export type Subject = 'MATH' | 'CODE' | 'SCIENCE';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT TREE
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
// VIEW STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface SandboxState {
  contenido: Contenido | null;
  selectedNodoId: string | null;
  saveStatus: SaveStatus;
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS (Discriminated Union)
// ─────────────────────────────────────────────────────────────────────────────

export type SandboxAction =
  | { type: 'SET_CONTENIDO'; payload: Contenido }
  | { type: 'SELECT_NODO'; payload: string | null }
  | { type: 'UPDATE_NODO_JSON'; payload: { nodoId: string; json: string } }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NODO'; payload: { parentId: string; nodo: NodoContenido } }
  | { type: 'DELETE_NODO'; payload: string }
  | { type: 'RENAME_NODO'; payload: { nodoId: string; titulo: string } };
