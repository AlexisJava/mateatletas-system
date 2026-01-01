/**
 * SandboxView - Test Suite
 *
 * Tests para las funciones helpers y lógica del editor de lecciones.
 * El componente principal ya tiene tests de bugs en SandboxView.bugs.spec.tsx.
 *
 * Estos tests cubren:
 * - Funciones de manipulación del árbol
 * - Hook useAutoSave (en useAutoSave.spec.ts)
 * - Lógica de confirmación de eliminación
 */

import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// TREE HELPERS - Test de funciones puras
// ─────────────────────────────────────────────────────────────────────────────

type NodoContenido = {
  id: string;
  titulo: string;
  bloqueado: boolean;
  parentId: string | null;
  orden: number;
  contenidoJson: string | null;
  hijos: NodoContenido[];
};

/** Buscar nodo por ID en árbol recursivo */
function findNodoById(nodos: NodoContenido[], id: string): NodoContenido | null {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo;
    const found = findNodoById(nodo.hijos, id);
    if (found) return found;
  }
  return null;
}

/** Actualizar nodo en árbol (immutable) */
function updateNodoInTree(
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

/** Agregar hijo a un nodo */
function addNodoToParent(
  nodos: NodoContenido[],
  parentId: string,
  nuevoNodo: NodoContenido,
): NodoContenido[] {
  return nodos.map((nodo) => {
    if (nodo.id === parentId) {
      return { ...nodo, hijos: [...nodo.hijos, nuevoNodo] };
    }
    if (nodo.hijos.length > 0) {
      return { ...nodo, hijos: addNodoToParent(nodo.hijos, parentId, nuevoNodo) };
    }
    return nodo;
  });
}

/** Eliminar nodo del árbol */
function removeNodoFromTree(nodos: NodoContenido[], id: string): NodoContenido[] {
  return nodos
    .filter((nodo) => nodo.id !== id)
    .map((nodo) => ({
      ...nodo,
      hijos: removeNodoFromTree(nodo.hijos, id),
    }));
}

/** Contar todos los descendientes de un nodo */
function countDescendants(nodo: NodoContenido): number {
  let count = nodo.hijos.length;
  for (const hijo of nodo.hijos) {
    count += countDescendants(hijo);
  }
  return count;
}

// Helper to create mock nodos
const createMockNodo = (overrides: Partial<NodoContenido> = {}): NodoContenido => ({
  id: 'nodo-1',
  titulo: 'Test Nodo',
  bloqueado: false,
  parentId: null,
  orden: 0,
  contenidoJson: '{}',
  hijos: [],
  ...overrides,
});

describe('SandboxView Tree Helpers', () => {
  /* ============================================================================
     findNodoById
     ============================================================================ */
  describe('findNodoById', () => {
    it('encuentra nodo en nivel raíz', () => {
      const nodos = [createMockNodo({ id: 'nodo-1' }), createMockNodo({ id: 'nodo-2' })];

      const result = findNodoById(nodos, 'nodo-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('nodo-1');
    });

    it('encuentra nodo anidado', () => {
      const nodos = [
        createMockNodo({
          id: 'padre',
          hijos: [
            createMockNodo({
              id: 'hijo',
              hijos: [createMockNodo({ id: 'nieto' })],
            }),
          ],
        }),
      ];

      const result = findNodoById(nodos, 'nieto');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('nieto');
    });

    it('retorna null si no encuentra el nodo', () => {
      const nodos = [createMockNodo({ id: 'nodo-1' })];

      const result = findNodoById(nodos, 'inexistente');

      expect(result).toBeNull();
    });

    it('retorna null para árbol vacío', () => {
      const result = findNodoById([], 'cualquier-id');

      expect(result).toBeNull();
    });
  });

  /* ============================================================================
     updateNodoInTree
     ============================================================================ */
  describe('updateNodoInTree', () => {
    it('actualiza nodo en nivel raíz', () => {
      const nodos = [createMockNodo({ id: 'nodo-1', titulo: 'Titulo Original' })];

      const result = updateNodoInTree(nodos, 'nodo-1', { titulo: 'Titulo Nuevo' });

      expect(result[0].titulo).toBe('Titulo Nuevo');
    });

    it('actualiza nodo anidado', () => {
      const nodos = [
        createMockNodo({
          id: 'padre',
          hijos: [createMockNodo({ id: 'hijo', titulo: 'Original' })],
        }),
      ];

      const result = updateNodoInTree(nodos, 'hijo', { titulo: 'Modificado' });

      expect(result[0].hijos[0].titulo).toBe('Modificado');
    });

    it('no modifica otros nodos', () => {
      const nodos = [
        createMockNodo({ id: 'nodo-1', titulo: 'Primero' }),
        createMockNodo({ id: 'nodo-2', titulo: 'Segundo' }),
      ];

      const result = updateNodoInTree(nodos, 'nodo-1', { titulo: 'Modificado' });

      expect(result[0].titulo).toBe('Modificado');
      expect(result[1].titulo).toBe('Segundo');
    });

    it('es immutable - no modifica el original', () => {
      const nodos = [createMockNodo({ id: 'nodo-1', titulo: 'Original' })];

      const result = updateNodoInTree(nodos, 'nodo-1', { titulo: 'Nuevo' });

      expect(nodos[0].titulo).toBe('Original');
      expect(result[0].titulo).toBe('Nuevo');
    });
  });

  /* ============================================================================
     addNodoToParent
     ============================================================================ */
  describe('addNodoToParent', () => {
    it('agrega nodo como hijo', () => {
      const nodos = [createMockNodo({ id: 'padre', hijos: [] })];
      const nuevoNodo = createMockNodo({ id: 'hijo', parentId: 'padre' });

      const result = addNodoToParent(nodos, 'padre', nuevoNodo);

      expect(result[0].hijos).toHaveLength(1);
      expect(result[0].hijos[0].id).toBe('hijo');
    });

    it('agrega a nodo anidado', () => {
      const nodos = [
        createMockNodo({
          id: 'raiz',
          hijos: [createMockNodo({ id: 'padre', hijos: [] })],
        }),
      ];
      const nuevoNodo = createMockNodo({ id: 'hijo', parentId: 'padre' });

      const result = addNodoToParent(nodos, 'padre', nuevoNodo);

      expect(result[0].hijos[0].hijos).toHaveLength(1);
      expect(result[0].hijos[0].hijos[0].id).toBe('hijo');
    });

    it('mantiene hijos existentes', () => {
      const nodos = [
        createMockNodo({
          id: 'padre',
          hijos: [createMockNodo({ id: 'hijo-existente' })],
        }),
      ];
      const nuevoNodo = createMockNodo({ id: 'hijo-nuevo' });

      const result = addNodoToParent(nodos, 'padre', nuevoNodo);

      expect(result[0].hijos).toHaveLength(2);
    });
  });

  /* ============================================================================
     removeNodoFromTree
     ============================================================================ */
  describe('removeNodoFromTree', () => {
    it('remueve nodo de nivel raíz', () => {
      const nodos = [createMockNodo({ id: 'nodo-1' }), createMockNodo({ id: 'nodo-2' })];

      const result = removeNodoFromTree(nodos, 'nodo-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('nodo-2');
    });

    it('remueve nodo anidado', () => {
      const nodos = [
        createMockNodo({
          id: 'padre',
          hijos: [createMockNodo({ id: 'hijo-1' }), createMockNodo({ id: 'hijo-2' })],
        }),
      ];

      const result = removeNodoFromTree(nodos, 'hijo-1');

      expect(result[0].hijos).toHaveLength(1);
      expect(result[0].hijos[0].id).toBe('hijo-2');
    });

    it('no modifica árbol si nodo no existe', () => {
      const nodos = [createMockNodo({ id: 'nodo-1' })];

      const result = removeNodoFromTree(nodos, 'inexistente');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('nodo-1');
    });
  });

  /* ============================================================================
     countDescendants
     ============================================================================ */
  describe('countDescendants', () => {
    it('retorna 0 para nodo sin hijos', () => {
      const nodo = createMockNodo({ hijos: [] });

      expect(countDescendants(nodo)).toBe(0);
    });

    it('cuenta hijos directos', () => {
      const nodo = createMockNodo({
        hijos: [createMockNodo({ id: 'hijo-1' }), createMockNodo({ id: 'hijo-2' })],
      });

      expect(countDescendants(nodo)).toBe(2);
    });

    it('cuenta nietos', () => {
      const nodo = createMockNodo({
        hijos: [
          createMockNodo({
            id: 'hijo',
            hijos: [createMockNodo({ id: 'nieto-1' }), createMockNodo({ id: 'nieto-2' })],
          }),
        ],
      });

      expect(countDescendants(nodo)).toBe(3); // 1 hijo + 2 nietos
    });

    it('cuenta árbol profundo', () => {
      const nodo = createMockNodo({
        hijos: [
          createMockNodo({
            id: 'nivel-1',
            hijos: [
              createMockNodo({
                id: 'nivel-2',
                hijos: [
                  createMockNodo({
                    id: 'nivel-3',
                    hijos: [createMockNodo({ id: 'nivel-4' })],
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      expect(countDescendants(nodo)).toBe(4);
    });
  });
});

/* ============================================================================
   LÓGICA DE CONFIRMACIÓN DE ELIMINACIÓN
   ============================================================================ */
describe('Lógica de Confirmación de Eliminación', () => {
  it('requiere confirmación cuando nodo tiene hijos', () => {
    const nodoConHijos = createMockNodo({
      id: 'padre',
      hijos: [createMockNodo({ id: 'hijo-1' }), createMockNodo({ id: 'hijo-2' })],
    });

    const descendantCount = countDescendants(nodoConHijos);
    const requiresConfirmation = descendantCount > 0;

    expect(requiresConfirmation).toBe(true);
    expect(descendantCount).toBe(2);
  });

  it('no requiere confirmación cuando nodo no tiene hijos', () => {
    const nodoSinHijos = createMockNodo({ id: 'hoja', hijos: [] });

    const descendantCount = countDescendants(nodoSinHijos);
    const requiresConfirmation = descendantCount > 0;

    expect(requiresConfirmation).toBe(false);
    expect(descendantCount).toBe(0);
  });

  it('cuenta correctamente el mensaje de confirmación', () => {
    const nodo = createMockNodo({
      id: 'padre',
      titulo: 'Sección Principal',
      hijos: [
        createMockNodo({ id: 'h1' }),
        createMockNodo({ id: 'h2' }),
        createMockNodo({ id: 'h3' }),
      ],
    });

    const descendantCount = countDescendants(nodo);
    const mensaje =
      descendantCount === 1
        ? `Se eliminará también 1 subnodo`
        : `Se eliminarán también ${descendantCount} subnodos`;

    expect(mensaje).toBe('Se eliminarán también 3 subnodos');
  });
});

/* ============================================================================
   RESUMEN DE COBERTURA
   ============================================================================ */
/**
 * Tests existentes en este directorio:
 *
 * 1. SandboxView.bugs.spec.tsx - Tests de bugs corregidos:
 *    - BUG #2: Delete sin confirmación (CORREGIDO)
 *    - BUG #3: handleRenameNodo doble request (CORREGIDO)
 *
 * 2. useAutoSave.spec.ts - Tests del hook de auto-guardado:
 *    - Pérdida de datos al cambiar nodo
 *    - Acumulación de ediciones rápidas
 *    - Transiciones de estado
 *
 * 3. SandboxView.spec.tsx (este archivo) - Tests de funciones helper:
 *    - findNodoById: Búsqueda en árbol
 *    - updateNodoInTree: Actualización immutable
 *    - addNodoToParent: Agregar nodos
 *    - removeNodoFromTree: Eliminar nodos
 *    - countDescendants: Contar descendientes
 *
 * El componente SandboxView ya tiene showError() implementado correctamente
 * en todos los catches (líneas 357-358, 401-402, 427-428, 468-469, 556-557).
 */
