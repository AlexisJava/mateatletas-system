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

/** Find parent of a node by its ID */
export function findParentId(nodos: NodoContenido[], childId: string): string | null {
  for (const nodo of nodos) {
    if (nodo.hijos.some((h) => h.id === childId)) {
      return nodo.id;
    }
    const foundInChildren = findParentId(nodo.hijos, childId);
    if (foundInChildren) return foundInChildren;
  }
  return null;
}

/** Reorder siblings within the same parent (immutable) */
export function reorderNodosInTree(
  nodos: NodoContenido[],
  parentId: string | null,
  newOrder: Array<{ nodoId: string; orden: number }>,
): NodoContenido[] {
  // If parentId is null, reorder root level
  if (parentId === null) {
    const orderMap = new Map(newOrder.map(({ nodoId, orden }) => [nodoId, orden]));
    return nodos
      .map((nodo) => ({
        ...nodo,
        orden: orderMap.get(nodo.id) ?? nodo.orden,
      }))
      .sort((a, b) => a.orden - b.orden);
  }

  // Find parent and reorder its children
  return nodos.map((nodo) => {
    if (nodo.id === parentId) {
      const orderMap = new Map(newOrder.map(({ nodoId, orden }) => [nodoId, orden]));
      const reorderedHijos = nodo.hijos
        .map((hijo) => ({
          ...hijo,
          orden: orderMap.get(hijo.id) ?? hijo.orden,
        }))
        .sort((a, b) => a.orden - b.orden);
      return { ...nodo, hijos: reorderedHijos };
    }
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: reorderNodosInTree(nodo.hijos, parentId, newOrder) };
    }
    return nodo;
  });
}

/** Move a node to a new parent (immutable) */
export function moveNodoInTree(
  nodos: NodoContenido[],
  nodoId: string,
  newParentId: string | null,
): NodoContenido[] {
  // 1. Find and extract the node
  const nodoToMove = findNodoById(nodos, nodoId);
  if (!nodoToMove) return nodos;

  // 2. Remove from current location
  const withoutNodo = removeNodoFromTree(nodos, nodoId);

  // 3. Add to new parent
  const updatedNodo = { ...nodoToMove, parentId: newParentId };

  if (newParentId === null) {
    // Move to root level
    return [...withoutNodo, updatedNodo];
  }

  // Move to specific parent
  return addNodoToParent(withoutNodo, newParentId, updatedNodo);
}

/** Flatten tree to array with depth info (for drag & drop) */
export interface FlattenedNodo {
  id: string;
  nodo: NodoContenido;
  parentId: string | null;
  depth: number;
}

export function flattenTree(
  nodos: NodoContenido[],
  parentId: string | null = null,
  depth = 0,
): FlattenedNodo[] {
  const result: FlattenedNodo[] = [];
  for (const nodo of nodos) {
    result.push({ id: nodo.id, nodo, parentId, depth });
    if (nodo.hijos.length > 0) {
      result.push(...flattenTree(nodo.hijos, nodo.id, depth + 1));
    }
  }
  return result;
}
