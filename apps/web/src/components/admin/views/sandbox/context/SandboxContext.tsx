'use client';

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { SandboxState, SandboxAction, SaveStatus } from '../types/sandbox.types';
import { updateNodoInTree, addNodoToParent, removeNodoFromTree } from '../utils/tree.utils';

// Re-export SaveStatus for components that import from context
export type { SaveStatus };

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialState: SandboxState = {
  contentType: 'microleccion',
  contenido: null,
  planificacion: null,
  selectedItemId: null,
  saveStatus: 'idle',
  isLoading: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────────────────────

function sandboxReducer(state: SandboxState, action: SandboxAction): SandboxState {
  switch (action.type) {
    // Content type - clear opposite state to avoid stale data
    case 'SET_CONTENT_TYPE':
      if (action.payload === 'microleccion') {
        return { ...state, contentType: action.payload, planificacion: null, selectedItemId: null };
      }
      return { ...state, contentType: action.payload, contenido: null, selectedItemId: null };

    // Microlección
    case 'SET_CONTENIDO':
      return { ...state, contenido: action.payload, selectedItemId: null };
    case 'UPDATE_NODO_JSON':
      if (!state.contenido) return state;
      return {
        ...state,
        contenido: {
          ...state.contenido,
          nodos: updateNodoInTree(state.contenido.nodos, action.payload.nodoId, {
            contenidoJson: action.payload.json,
          }),
        },
      };
    case 'ADD_NODO':
      if (!state.contenido) return state;
      return {
        ...state,
        contenido: {
          ...state.contenido,
          nodos: addNodoToParent(
            state.contenido.nodos,
            action.payload.parentId,
            action.payload.nodo,
          ),
        },
      };
    case 'ADD_ROOT_NODO':
      if (!state.contenido) return state;
      return {
        ...state,
        contenido: {
          ...state.contenido,
          nodos: [...state.contenido.nodos, action.payload],
        },
      };
    case 'DELETE_NODO':
      if (!state.contenido) return state;
      return {
        ...state,
        contenido: {
          ...state.contenido,
          nodos: removeNodoFromTree(state.contenido.nodos, action.payload),
        },
        selectedItemId: state.selectedItemId === action.payload ? null : state.selectedItemId,
      };
    case 'RENAME_NODO':
      if (!state.contenido) return state;
      return {
        ...state,
        contenido: {
          ...state.contenido,
          nodos: updateNodoInTree(state.contenido.nodos, action.payload.nodoId, {
            titulo: action.payload.titulo,
          }),
        },
      };

    // Planificación
    case 'SET_PLANIFICACION':
      return { ...state, planificacion: action.payload, selectedItemId: null };
    case 'UPDATE_CLASE':
      if (!state.planificacion) return state;
      return {
        ...state,
        planificacion: {
          ...state.planificacion,
          clases: state.planificacion.clases.map((c) =>
            c.id === action.payload.claseId ? { ...c, ...action.payload.data } : c,
          ),
        },
      };

    // Shared
    case 'SELECT_ITEM':
      return { ...state, selectedItemId: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXTS (Separated to avoid re-renders)
// ─────────────────────────────────────────────────────────────────────────────

const SandboxStateContext = createContext<SandboxState | null>(null);
const SandboxDispatchContext = createContext<Dispatch<SandboxAction> | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sandboxReducer, initialState);

  return (
    <SandboxStateContext.Provider value={state}>
      <SandboxDispatchContext.Provider value={dispatch}>{children}</SandboxDispatchContext.Provider>
    </SandboxStateContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useSandboxState(): SandboxState {
  const ctx = useContext(SandboxStateContext);
  if (!ctx) throw new Error('useSandboxState must be used within SandboxProvider');
  return ctx;
}

export function useSandboxDispatch(): Dispatch<SandboxAction> {
  const ctx = useContext(SandboxDispatchContext);
  if (!ctx) throw new Error('useSandboxDispatch must be used within SandboxProvider');
  return ctx;
}
