/**
 * useSandboxApi - Hook for API interactions
 * Uses existing contenidos.api functions
 */

import { useCallback } from 'react';
import { useSandboxDispatch } from '../context/SandboxContext';
import {
  getContenidoById,
  updateNodo,
  createNodo,
  deleteNodo,
  type ContenidoBackend,
  type NodoBackend,
  type CreateNodoDto,
} from '@/lib/api/contenidos.api';
import type { Contenido, NodoContenido, House, Subject } from '../types/sandbox.types';

// ─────────────────────────────────────────────────────────────────────────────
// MAPPERS: Backend → Frontend
// ─────────────────────────────────────────────────────────────────────────────

function mapNodoBackendToFrontend(nodo: NodoBackend): NodoContenido {
  return {
    id: nodo.id,
    titulo: nodo.titulo,
    bloqueado: nodo.bloqueado,
    parentId: nodo.parentId,
    orden: nodo.orden,
    contenidoJson: nodo.contenidoJson,
    hijos: (nodo.hijos ?? []).map(mapNodoBackendToFrontend),
  };
}

function mapContenidoBackendToFrontend(backend: ContenidoBackend): Contenido {
  const houseMap: Record<string, House> = {
    QUANTUM: 'QUANTUM',
    VERTEX: 'VERTEX',
    PULSAR: 'PULSAR',
  };
  const subjectMap: Record<string, Subject> = {
    MATEMATICA: 'MATH',
    PROGRAMACION: 'CODE',
    CIENCIAS: 'SCIENCE',
  };

  return {
    id: backend.id,
    titulo: backend.titulo,
    house: houseMap[backend.casaTipo] || 'QUANTUM',
    subject: subjectMap[backend.mundoTipo] || 'MATH',
    nodos: (backend.nodos ?? []).map(mapNodoBackendToFrontend),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useSandboxApi() {
  const dispatch = useSandboxDispatch();

  const loadContenido = useCallback(
    async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const backend = await getContenidoById(id);
        const contenido = mapContenidoBackendToFrontend(backend);
        dispatch({ type: 'SET_CONTENIDO', payload: contenido });
      } catch (error) {
        console.error('Error loading contenido:', error);
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [dispatch],
  );

  const saveNodoJson = useCallback(
    async (nodoId: string, contenidoJson: string) => {
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });
      try {
        await updateNodo(nodoId, { contenidoJson });
        dispatch({ type: 'UPDATE_NODO_JSON', payload: { nodoId, json: contenidoJson } });
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });
      } catch (error) {
        console.error('Error saving nodo:', error);
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
      }
    },
    [dispatch],
  );

  const addNodo = useCallback(
    async (contenidoId: string, dto: CreateNodoDto) => {
      try {
        const nodoBackend = await createNodo(contenidoId, dto);
        const nodo = mapNodoBackendToFrontend(nodoBackend);
        if (dto.parentId) {
          dispatch({ type: 'ADD_NODO', payload: { parentId: dto.parentId, nodo } });
        }
        return nodo;
      } catch (error) {
        console.error('Error adding nodo:', error);
        return null;
      }
    },
    [dispatch],
  );

  const removeNodo = useCallback(
    async (nodoId: string) => {
      try {
        await deleteNodo(nodoId);
        dispatch({ type: 'DELETE_NODO', payload: nodoId });
      } catch (error) {
        console.error('Error deleting nodo:', error);
      }
    },
    [dispatch],
  );

  const renameNodo = useCallback(
    async (nodoId: string, titulo: string) => {
      try {
        await updateNodo(nodoId, { titulo });
        dispatch({ type: 'RENAME_NODO', payload: { nodoId, titulo } });
      } catch (error) {
        console.error('Error renaming nodo:', error);
      }
    },
    [dispatch],
  );

  return { loadContenido, saveNodoJson, addNodo, removeNodo, renameNodo };
}
