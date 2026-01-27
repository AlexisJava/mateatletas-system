/**
 * Tree Utils - Integration Tests
 *
 * Tests for FASE 9.3: Drag & Drop nodos
 * Validates tree manipulation functions work correctly
 */

import { describe, it, expect } from 'vitest';
import type { NodoContenido } from '../types/sandbox.types';

// Import functions to test (will fail if implementation is broken)
import {
  findNodoById,
  updateNodoInTree,
  addNodoToParent,
  removeNodoFromTree,
  findParentId,
  reorderNodosInTree,
  moveNodoInTree,
  flattenTree,
  type FlattenedNodo,
} from './tree.utils';

// ─────────────────────────────────────────────────────────────────────────────
// TEST FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

function createTestTree(): NodoContenido[] {
  return [
    {
      id: 'teoria',
      titulo: 'Teoría',
      bloqueado: true,
      parentId: null,
      orden: 0,
      contenidoJson: null,
      hijos: [
        {
          id: 'teoria-1',
          titulo: 'Introducción',
          bloqueado: false,
          parentId: 'teoria',
          orden: 0,
          contenidoJson: '{"intent":"hero"}',
          hijos: [],
        },
        {
          id: 'teoria-2',
          titulo: 'Conceptos',
          bloqueado: false,
          parentId: 'teoria',
          orden: 1,
          contenidoJson: '{"intent":"define"}',
          hijos: [],
        },
      ],
    },
    {
      id: 'practica',
      titulo: 'Práctica',
      bloqueado: true,
      parentId: null,
      orden: 1,
      contenidoJson: null,
      hijos: [
        {
          id: 'practica-1',
          titulo: 'Ejercicio 1',
          bloqueado: false,
          parentId: 'practica',
          orden: 0,
          contenidoJson: '{"intent":"quiz-mc"}',
          hijos: [],
        },
      ],
    },
    {
      id: 'evaluacion',
      titulo: 'Evaluación',
      bloqueado: true,
      parentId: null,
      orden: 2,
      contenidoJson: null,
      hijos: [],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// findNodoById TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('findNodoById', () => {
  it('should find root level node', () => {
    const tree = createTestTree();
    const result = findNodoById(tree, 'teoria');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('teoria');
    expect(result?.titulo).toBe('Teoría');
  });

  it('should find nested node', () => {
    const tree = createTestTree();
    const result = findNodoById(tree, 'teoria-1');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('teoria-1');
    expect(result?.titulo).toBe('Introducción');
  });

  it('should return null for non-existent node', () => {
    const tree = createTestTree();
    const result = findNodoById(tree, 'non-existent');

    expect(result).toBeNull();
  });

  it('should find deeply nested node', () => {
    const tree = createTestTree();
    const result = findNodoById(tree, 'practica-1');

    expect(result).not.toBeNull();
    expect(result?.parentId).toBe('practica');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// findParentId TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('findParentId', () => {
  it('should find parent of nested node', () => {
    const tree = createTestTree();
    const result = findParentId(tree, 'teoria-1');

    expect(result).toBe('teoria');
  });

  it('should return null for root level node', () => {
    const tree = createTestTree();
    const result = findParentId(tree, 'teoria');

    expect(result).toBeNull();
  });

  it('should return null for non-existent node', () => {
    const tree = createTestTree();
    const result = findParentId(tree, 'non-existent');

    expect(result).toBeNull();
  });

  it('should find correct parent when multiple siblings exist', () => {
    const tree = createTestTree();
    const result = findParentId(tree, 'teoria-2');

    expect(result).toBe('teoria');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateNodoInTree TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('updateNodoInTree', () => {
  it('should update root level node', () => {
    const tree = createTestTree();
    const result = updateNodoInTree(tree, 'teoria', { titulo: 'Teoría Actualizada' });

    expect(result[0].titulo).toBe('Teoría Actualizada');
    // Original should not be mutated
    expect(tree[0].titulo).toBe('Teoría');
  });

  it('should update nested node', () => {
    const tree = createTestTree();
    const result = updateNodoInTree(tree, 'teoria-1', {
      titulo: 'Intro Actualizada',
      contenidoJson: '{"intent":"explain"}',
    });

    const updated = findNodoById(result, 'teoria-1');
    expect(updated?.titulo).toBe('Intro Actualizada');
    expect(updated?.contenidoJson).toBe('{"intent":"explain"}');
  });

  it('should not modify tree if node not found', () => {
    const tree = createTestTree();
    const result = updateNodoInTree(tree, 'non-existent', { titulo: 'Test' });

    expect(result).toEqual(tree);
  });

  it('should be immutable - not modify original tree', () => {
    const tree = createTestTree();
    const originalTitle = tree[0].hijos[0].titulo;
    updateNodoInTree(tree, 'teoria-1', { titulo: 'Changed' });

    expect(tree[0].hijos[0].titulo).toBe(originalTitle);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// addNodoToParent TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('addNodoToParent', () => {
  it('should add child to existing parent', () => {
    const tree = createTestTree();
    const newNodo: NodoContenido = {
      id: 'teoria-3',
      titulo: 'Nuevo Tema',
      bloqueado: false,
      parentId: 'teoria',
      orden: 2,
      contenidoJson: null,
      hijos: [],
    };

    const result = addNodoToParent(tree, 'teoria', newNodo);
    const parent = findNodoById(result, 'teoria');

    expect(parent?.hijos).toHaveLength(3);
    expect(parent?.hijos[2].id).toBe('teoria-3');
  });

  it('should add to empty parent', () => {
    const tree = createTestTree();
    const newNodo: NodoContenido = {
      id: 'eval-1',
      titulo: 'Examen Final',
      bloqueado: false,
      parentId: 'evaluacion',
      orden: 0,
      contenidoJson: null,
      hijos: [],
    };

    const result = addNodoToParent(tree, 'evaluacion', newNodo);
    const parent = findNodoById(result, 'evaluacion');

    expect(parent?.hijos).toHaveLength(1);
    expect(parent?.hijos[0].id).toBe('eval-1');
  });

  it('should not mutate original tree', () => {
    const tree = createTestTree();
    const originalLength = tree[0].hijos.length;
    const newNodo: NodoContenido = {
      id: 'new',
      titulo: 'New',
      bloqueado: false,
      parentId: 'teoria',
      orden: 99,
      contenidoJson: null,
      hijos: [],
    };

    addNodoToParent(tree, 'teoria', newNodo);

    expect(tree[0].hijos).toHaveLength(originalLength);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// removeNodoFromTree TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('removeNodoFromTree', () => {
  it('should remove root level node', () => {
    const tree = createTestTree();
    const result = removeNodoFromTree(tree, 'evaluacion');

    expect(result).toHaveLength(2);
    expect(findNodoById(result, 'evaluacion')).toBeNull();
  });

  it('should remove nested node', () => {
    const tree = createTestTree();
    const result = removeNodoFromTree(tree, 'teoria-1');

    const parent = findNodoById(result, 'teoria');
    expect(parent?.hijos).toHaveLength(1);
    expect(findNodoById(result, 'teoria-1')).toBeNull();
  });

  it('should not mutate original tree', () => {
    const tree = createTestTree();
    removeNodoFromTree(tree, 'teoria-1');

    expect(tree[0].hijos).toHaveLength(2);
  });

  it('should handle removing non-existent node', () => {
    const tree = createTestTree();
    const result = removeNodoFromTree(tree, 'non-existent');

    expect(result).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// reorderNodosInTree TESTS (FASE 9.3 - Core functionality)
// ─────────────────────────────────────────────────────────────────────────────

describe('reorderNodosInTree', () => {
  it('should reorder root level nodes', () => {
    const tree = createTestTree();
    const newOrder = [
      { nodoId: 'evaluacion', orden: 0 },
      { nodoId: 'practica', orden: 1 },
      { nodoId: 'teoria', orden: 2 },
    ];

    const result = reorderNodosInTree(tree, null, newOrder);

    expect(result[0].id).toBe('evaluacion');
    expect(result[1].id).toBe('practica');
    expect(result[2].id).toBe('teoria');
  });

  it('should reorder children within parent', () => {
    const tree = createTestTree();
    const newOrder = [
      { nodoId: 'teoria-2', orden: 0 },
      { nodoId: 'teoria-1', orden: 1 },
    ];

    const result = reorderNodosInTree(tree, 'teoria', newOrder);
    const parent = findNodoById(result, 'teoria');

    expect(parent?.hijos[0].id).toBe('teoria-2');
    expect(parent?.hijos[1].id).toBe('teoria-1');
  });

  it('should update orden property correctly', () => {
    const tree = createTestTree();
    const newOrder = [
      { nodoId: 'teoria-2', orden: 0 },
      { nodoId: 'teoria-1', orden: 1 },
    ];

    const result = reorderNodosInTree(tree, 'teoria', newOrder);
    const parent = findNodoById(result, 'teoria');

    expect(parent?.hijos[0].orden).toBe(0);
    expect(parent?.hijos[1].orden).toBe(1);
  });

  it('should not mutate original tree', () => {
    const tree = createTestTree();
    const originalFirstChildId = tree[0].hijos[0].id;

    reorderNodosInTree(tree, 'teoria', [
      { nodoId: 'teoria-2', orden: 0 },
      { nodoId: 'teoria-1', orden: 1 },
    ]);

    expect(tree[0].hijos[0].id).toBe(originalFirstChildId);
  });

  it('should handle partial order (only some nodes specified)', () => {
    const tree = createTestTree();
    // Set teoria-2 to orden -1 to ensure it comes before teoria-1 (orden 0)
    const newOrder = [{ nodoId: 'teoria-2', orden: -1 }];

    const result = reorderNodosInTree(tree, 'teoria', newOrder);
    const parent = findNodoById(result, 'teoria');

    // teoria-2 should be first (orden -1 < orden 0)
    expect(parent?.hijos[0].id).toBe('teoria-2');
    expect(parent?.hijos[0].orden).toBe(-1);
    // teoria-1 keeps original orden
    expect(parent?.hijos[1].id).toBe('teoria-1');
    expect(parent?.hijos[1].orden).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// moveNodoInTree TESTS (FASE 9.3 - Core functionality)
// ─────────────────────────────────────────────────────────────────────────────

describe('moveNodoInTree', () => {
  it('should move node to different parent', () => {
    const tree = createTestTree();

    // Move teoria-1 to practica
    const result = moveNodoInTree(tree, 'teoria-1', 'practica');

    // teoria-1 should no longer be in teoria
    const teoria = findNodoById(result, 'teoria');
    expect(teoria?.hijos).toHaveLength(1);
    expect(teoria?.hijos[0].id).toBe('teoria-2');

    // teoria-1 should now be in practica
    const practica = findNodoById(result, 'practica');
    expect(practica?.hijos).toHaveLength(2);
    expect(practica?.hijos.some((h) => h.id === 'teoria-1')).toBe(true);
  });

  it('should move node to root level', () => {
    const tree = createTestTree();

    // Move teoria-1 to root
    const result = moveNodoInTree(tree, 'teoria-1', null);

    // Should be at root level now
    expect(result.some((n) => n.id === 'teoria-1')).toBe(true);

    // teoria should have one less child
    const teoria = findNodoById(result, 'teoria');
    expect(teoria?.hijos).toHaveLength(1);
  });

  it('should update parentId of moved node', () => {
    const tree = createTestTree();
    const result = moveNodoInTree(tree, 'teoria-1', 'practica');

    const movedNode = findNodoById(result, 'teoria-1');
    expect(movedNode?.parentId).toBe('practica');
  });

  it('should not mutate original tree', () => {
    const tree = createTestTree();
    const originalTeoriaChildren = tree[0].hijos.length;

    moveNodoInTree(tree, 'teoria-1', 'practica');

    expect(tree[0].hijos).toHaveLength(originalTeoriaChildren);
  });

  it('should handle moving non-existent node', () => {
    const tree = createTestTree();
    const result = moveNodoInTree(tree, 'non-existent', 'practica');

    expect(result).toEqual(tree);
  });

  it('should move node with children intact', () => {
    // Create a tree with nested children
    const tree: NodoContenido[] = [
      {
        id: 'parent-a',
        titulo: 'Parent A',
        bloqueado: false,
        parentId: null,
        orden: 0,
        contenidoJson: null,
        hijos: [
          {
            id: 'child-with-grandchildren',
            titulo: 'Child with grandchildren',
            bloqueado: false,
            parentId: 'parent-a',
            orden: 0,
            contenidoJson: null,
            hijos: [
              {
                id: 'grandchild',
                titulo: 'Grandchild',
                bloqueado: false,
                parentId: 'child-with-grandchildren',
                orden: 0,
                contenidoJson: null,
                hijos: [],
              },
            ],
          },
        ],
      },
      {
        id: 'parent-b',
        titulo: 'Parent B',
        bloqueado: false,
        parentId: null,
        orden: 1,
        contenidoJson: null,
        hijos: [],
      },
    ];

    const result = moveNodoInTree(tree, 'child-with-grandchildren', 'parent-b');

    const parentB = findNodoById(result, 'parent-b');
    expect(parentB?.hijos).toHaveLength(1);
    expect(parentB?.hijos[0].hijos).toHaveLength(1);
    expect(parentB?.hijos[0].hijos[0].id).toBe('grandchild');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// flattenTree TESTS (FASE 9.3 - For drag & drop)
// ─────────────────────────────────────────────────────────────────────────────

describe('flattenTree', () => {
  it('should flatten tree to array', () => {
    const tree = createTestTree();
    const result = flattenTree(tree);

    // Total nodes: 3 root + 2 teoria children + 1 practica child = 6
    expect(result).toHaveLength(6);
  });

  it('should include depth information', () => {
    const tree = createTestTree();
    const result = flattenTree(tree);

    // Root nodes have depth 0
    const teoria = result.find((n) => n.id === 'teoria');
    expect(teoria?.depth).toBe(0);

    // Children have depth 1
    const teoria1 = result.find((n) => n.id === 'teoria-1');
    expect(teoria1?.depth).toBe(1);
  });

  it('should include parentId information', () => {
    const tree = createTestTree();
    const result = flattenTree(tree);

    const teoria = result.find((n) => n.id === 'teoria');
    expect(teoria?.parentId).toBeNull();

    const teoria1 = result.find((n) => n.id === 'teoria-1');
    expect(teoria1?.parentId).toBe('teoria');
  });

  it('should preserve node reference', () => {
    const tree = createTestTree();
    const result = flattenTree(tree);

    const teoria1 = result.find((n) => n.id === 'teoria-1');
    expect(teoria1?.nodo.titulo).toBe('Introducción');
    expect(teoria1?.nodo.contenidoJson).toBe('{"intent":"hero"}');
  });

  it('should maintain tree order in flattened array', () => {
    const tree = createTestTree();
    const result = flattenTree(tree);
    const ids = result.map((n) => n.id);

    // Order should be: teoria, teoria-1, teoria-2, practica, practica-1, evaluacion
    expect(ids.indexOf('teoria')).toBeLessThan(ids.indexOf('teoria-1'));
    expect(ids.indexOf('teoria-1')).toBeLessThan(ids.indexOf('practica'));
    expect(ids.indexOf('practica')).toBeLessThan(ids.indexOf('evaluacion'));
  });

  it('should handle empty tree', () => {
    const result = flattenTree([]);
    expect(result).toEqual([]);
  });

  it('should handle deeply nested trees', () => {
    const deepTree: NodoContenido[] = [
      {
        id: 'level-0',
        titulo: 'Level 0',
        bloqueado: false,
        parentId: null,
        orden: 0,
        contenidoJson: null,
        hijos: [
          {
            id: 'level-1',
            titulo: 'Level 1',
            bloqueado: false,
            parentId: 'level-0',
            orden: 0,
            contenidoJson: null,
            hijos: [
              {
                id: 'level-2',
                titulo: 'Level 2',
                bloqueado: false,
                parentId: 'level-1',
                orden: 0,
                contenidoJson: null,
                hijos: [
                  {
                    id: 'level-3',
                    titulo: 'Level 3',
                    bloqueado: false,
                    parentId: 'level-2',
                    orden: 0,
                    contenidoJson: null,
                    hijos: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const result = flattenTree(deepTree);

    expect(result).toHaveLength(4);
    expect(result[3].depth).toBe(3);
    expect(result[3].id).toBe('level-3');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION SCENARIOS
// ─────────────────────────────────────────────────────────────────────────────

describe('Integration Scenarios', () => {
  it('should handle complete drag & drop workflow: reorder then flatten', () => {
    const tree = createTestTree();

    // 1. Reorder children in teoria
    const reordered = reorderNodosInTree(tree, 'teoria', [
      { nodoId: 'teoria-2', orden: 0 },
      { nodoId: 'teoria-1', orden: 1 },
    ]);

    // 2. Flatten for rendering
    const flattened = flattenTree(reordered);

    // Verify order is correct in flattened result
    const teoriaIndex = flattened.findIndex((n) => n.id === 'teoria');
    const teoria2Index = flattened.findIndex((n) => n.id === 'teoria-2');
    const teoria1Index = flattened.findIndex((n) => n.id === 'teoria-1');

    expect(teoria2Index).toBe(teoriaIndex + 1);
    expect(teoria1Index).toBe(teoriaIndex + 2);
  });

  it('should handle complete drag & drop workflow: move then flatten', () => {
    const tree = createTestTree();

    // 1. Move teoria-1 to practica
    const moved = moveNodoInTree(tree, 'teoria-1', 'practica');

    // 2. Flatten for rendering
    const flattened = flattenTree(moved);

    // Verify teoria-1 is now under practica
    const teoria1 = flattened.find((n) => n.id === 'teoria-1');
    expect(teoria1?.parentId).toBe('practica');

    // And has correct depth
    expect(teoria1?.depth).toBe(1);
  });

  it('should handle multiple operations in sequence', () => {
    const tree = createTestTree();

    // 1. Add a new node
    const newNodo: NodoContenido = {
      id: 'teoria-3',
      titulo: 'Nuevo',
      bloqueado: false,
      parentId: 'teoria',
      orden: 2,
      contenidoJson: null,
      hijos: [],
    };
    const withNew = addNodoToParent(tree, 'teoria', newNodo);

    // 2. Reorder
    const reordered = reorderNodosInTree(withNew, 'teoria', [
      { nodoId: 'teoria-3', orden: 0 },
      { nodoId: 'teoria-1', orden: 1 },
      { nodoId: 'teoria-2', orden: 2 },
    ]);

    // 3. Move one to practica
    const moved = moveNodoInTree(reordered, 'teoria-2', 'practica');

    // 4. Flatten and verify
    const flattened = flattenTree(moved);

    // teoria should have 2 children now
    const teoria = findNodoById(moved, 'teoria');
    expect(teoria?.hijos).toHaveLength(2);

    // practica should have 2 children
    const practica = findNodoById(moved, 'practica');
    expect(practica?.hijos).toHaveLength(2);

    // teoria-2 should be in practica
    const teoria2 = flattened.find((n) => n.id === 'teoria-2');
    expect(teoria2?.parentId).toBe('practica');
  });
});
