/**
 * Tests para editor-semana.store.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorSemanaStore } from '../editor-semana.store';
import { BloqueJson, SemanaMetadata } from '@/components/studio/blocks/types';

const resetStore = (): void => useEditorSemanaStore.getState().resetear();

const crearMetadataMock = (): SemanaMetadata => ({
  titulo: 'Semana 1',
  descripcion: 'Descripción',
  objetivos: ['Obj 1'],
});

const crearBloqueMock = (override: Partial<BloqueJson> = {}): BloqueJson => ({
  id: `bloque-${Date.now()}`,
  orden: 0,
  componente: 'Texto',
  titulo: 'Bloque',
  contenido: {},
  ...override,
});

describe('EditorSemanaStore', () => {
  beforeEach(resetStore);

  describe('Estado Inicial', () => {
    it('should_have_correct_initial_state', () => {
      const state = useEditorSemanaStore.getState();
      expect(state.cursoId).toBeNull();
      expect(state.semanaNum).toBeNull();
      expect(state.bloques).toEqual([]);
      expect(state.modoEdicion).toBe('visual');
      expect(state.isDirty).toBe(false);
    });
  });

  describe('setDatos', () => {
    it('should_load_data_and_clear_dirty', () => {
      const store = useEditorSemanaStore.getState();
      store.marcarDirty();

      store.setDatos('curso-1', 1, crearMetadataMock(), [crearBloqueMock()], ['Texto']);

      const state = useEditorSemanaStore.getState();
      expect(state.cursoId).toBe('curso-1');
      expect(state.bloques).toHaveLength(1);
      expect(state.isDirty).toBe(false);
    });
  });

  describe('agregarBloque', () => {
    it('should_add_block_and_mark_dirty', () => {
      useEditorSemanaStore.getState().agregarBloque('Texto');

      const state = useEditorSemanaStore.getState();
      expect(state.bloques).toHaveLength(1);
      expect(state.isDirty).toBe(true);
      expect(state.bloqueSeleccionadoId).toBe(state.bloques[0].id);
    });
  });

  describe('eliminarBloque', () => {
    it('should_remove_and_reorder', () => {
      const store = useEditorSemanaStore.getState();
      store.setDatos(
        'c',
        1,
        crearMetadataMock(),
        [
          crearBloqueMock({ id: 'b0', orden: 0 }),
          crearBloqueMock({ id: 'b1', orden: 1 }),
          crearBloqueMock({ id: 'b2', orden: 2 }),
        ],
        [],
      );

      store.eliminarBloque('b1');

      const state = useEditorSemanaStore.getState();
      expect(state.bloques).toHaveLength(2);
      expect(state.bloques[1].orden).toBe(1);
    });
  });

  describe('moverBloque', () => {
    it('should_reorder_correctly', () => {
      const store = useEditorSemanaStore.getState();
      store.setDatos(
        'c',
        1,
        crearMetadataMock(),
        [
          crearBloqueMock({ id: 'b0', orden: 0 }),
          crearBloqueMock({ id: 'b1', orden: 1 }),
          crearBloqueMock({ id: 'b2', orden: 2 }),
        ],
        [],
      );

      store.moverBloque('b0', 2);

      const state = useEditorSemanaStore.getState();
      expect(state.bloques[2].id).toBe('b0');
      expect(state.isDirty).toBe(true);
    });
  });

  describe('duplicarBloque', () => {
    it('should_create_copy', () => {
      const store = useEditorSemanaStore.getState();
      store.setDatos('c', 1, crearMetadataMock(), [crearBloqueMock({ id: 'original' })], []);

      store.duplicarBloque('original');

      const state = useEditorSemanaStore.getState();
      expect(state.bloques).toHaveLength(2);
      expect(state.bloques[1].titulo).toContain('(copia)');
    });
  });

  describe('importarJSON', () => {
    it('should_parse_valid_JSON', () => {
      const json = JSON.stringify({
        metadata: { titulo: 'Imp' },
        bloques: [{ id: 'b1', orden: 0, componente: 'T', titulo: 'T', contenido: {} }],
      });

      const result = useEditorSemanaStore.getState().importarJSON(json);

      expect(result.exito).toBe(true);
    });

    it('should_handle_invalid_JSON', () => {
      const result = useEditorSemanaStore.getState().importarJSON('{ bad }');
      expect(result.exito).toBe(false);
    });
  });

  describe('exportarJSON', () => {
    it('should_generate_valid_JSON', () => {
      const store = useEditorSemanaStore.getState();
      store.setDatos('c', 1, crearMetadataMock(), [crearBloqueMock()], []);

      const json = store.exportarJSON();
      const parsed = JSON.parse(json) as { bloques: BloqueJson[] };

      expect(parsed.bloques).toHaveLength(1);
    });
  });

  describe('resetear', () => {
    it('should_return_to_initial_state', () => {
      const store = useEditorSemanaStore.getState();
      store.setDatos('c', 1, crearMetadataMock(), [crearBloqueMock()], []);

      store.resetear();

      expect(useEditorSemanaStore.getState().cursoId).toBeNull();
      expect(useEditorSemanaStore.getState().bloques).toEqual([]);
    });
  });
});
