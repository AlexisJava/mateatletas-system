'use client';

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { SandboxState, SandboxAction } from '../types/sandbox.types';
import { updateNodoInTree, addNodoToParent, removeNodoFromTree } from '../utils/tree.utils';

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialState: SandboxState = {
  contenido: null,
  selectedNodoId: null,
  saveStatus: 'idle',
  isLoading: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────────────────────

function sandboxReducer(state: SandboxState, action: SandboxAction): SandboxState {
  switch (action.type) {
    case 'SET_CONTENIDO':
      return { ...state, contenido: action.payload, selectedNodoId: null };
    case 'SELECT_NODO':
      return { ...state, selectedNodoId: action.payload };
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
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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
    case 'DELETE_NODO':
      if (!state.contenido) return state;
      return {
        ...state,
        contenido: {
          ...state.contenido,
          nodos: removeNodoFromTree(state.contenido.nodos, action.payload),
        },
        selectedNodoId: state.selectedNodoId === action.payload ? null : state.selectedNodoId,
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
