/**
 * Tree Utils - Pure functions for NodoContenido tree manipulation
 */

import type { NodoContenido } from '../types/sandbox.types';

/** Find a node by ID in the tree (recursive) */
export function findNodoById(nodos: NodoContenido[], id: string): NodoContenido | null {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo;
    const found = findNodoById(nodo.hijos, id);
    if (found) return found;
  }
  return null;
}

/** Update a node in the tree (immutable) */
export function updateNodoInTree(
  nodos: NodoContenido[],
  id: string,
  updates: Partial<NodoContenido>,
): NodoContenido[] {
  return nodos.map((nodo) => {
    if (nodo.id === id) {
      return { ...nodo, ...updates };
    }
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: updateNodoInTree(nodo.hijos, id, updates) };
    }
    return nodo;
  });
}

/** Add a child node to a parent (immutable) */
export function addNodoToParent(
  nodos: NodoContenido[],
  parentId: string,
  newNodo: NodoContenido,
): NodoContenido[] {
  return nodos.map((nodo) => {
    if (nodo.id === parentId) {
      return { ...nodo, hijos: [...nodo.hijos, newNodo] };
    }
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: addNodoToParent(nodo.hijos, parentId, newNodo) };
    }
    return nodo;
  });
}

/** Remove a node from the tree (immutable) */
export function removeNodoFromTree(nodos: NodoContenido[], id: string): NodoContenido[] {
  return nodos
    .filter((nodo) => nodo.id !== id)
    .map((nodo) => ({
      ...nodo,
      hijos: removeNodoFromTree(nodo.hijos, id),
    }));
}
