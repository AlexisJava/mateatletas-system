/**
 * Tests para el store de Hoja (Bento Grid)
 * TDD: Tests primero, implementación después
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useHojaStore } from '../hoja.store';
import type { BentoPosition } from '../../types/studio.types';

describe('useHojaStore', () => {
  // Reset store antes de cada test
  beforeEach(() => {
    act(() => {
      useHojaStore.getState().clear();
    });
  });

  describe('Estado inicial', () => {
    it('should_have_empty_bloques_when_initialized', () => {
      const { bloques } = useHojaStore.getState();
      expect(bloques).toEqual([]);
    });

    it('should_have_no_selected_bloque_when_initialized', () => {
      const { selectedId } = useHojaStore.getState();
      expect(selectedId).toBeNull();
    });

    it('should_have_default_theme_when_initialized', () => {
      const { themeId } = useHojaStore.getState();
      expect(themeId).toBe('terminal');
    });
  });

  describe('addBloque', () => {
    const defaultPosition: BentoPosition = {
      colStart: 1,
      colSpan: 4,
      rowStart: 1,
      rowSpan: 2,
    };

    it('should_add_bloque_when_called_with_valid_type', () => {
      const { addBloque } = useHojaStore.getState();

      act(() => {
        addBloque('Quiz', defaultPosition);
      });

      const { bloques } = useHojaStore.getState();
      expect(bloques).toHaveLength(1);
      expect(bloques[0].componentType).toBe('Quiz');
    });

    it('should_return_bloque_id_when_adding', () => {
      const { addBloque } = useHojaStore.getState();

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', defaultPosition);
      });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should_set_position_correctly_when_adding', () => {
      const { addBloque } = useHojaStore.getState();
      const position: BentoPosition = {
        colStart: 3,
        colSpan: 6,
        rowStart: 2,
        rowSpan: 4,
      };

      act(() => {
        addBloque('DragAndDrop', position);
      });

      const { bloques } = useHojaStore.getState();
      expect(bloques[0].position).toEqual(position);
    });

    it('should_select_new_bloque_when_adding', () => {
      const { addBloque } = useHojaStore.getState();

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', defaultPosition);
      });

      const { selectedId } = useHojaStore.getState();
      expect(selectedId).toBe(id);
    });
  });

  describe('removeBloque', () => {
    it('should_remove_bloque_when_called_with_valid_id', () => {
      const { addBloque, removeBloque } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', position);
      });

      expect(useHojaStore.getState().bloques).toHaveLength(1);

      act(() => {
        removeBloque(id);
      });

      expect(useHojaStore.getState().bloques).toHaveLength(0);
    });

    it('should_deselect_when_removing_selected_bloque', () => {
      const { addBloque, removeBloque } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', position);
      });

      expect(useHojaStore.getState().selectedId).toBe(id);

      act(() => {
        removeBloque(id);
      });

      expect(useHojaStore.getState().selectedId).toBeNull();
    });

    it('should_not_affect_other_bloques_when_removing_one', () => {
      const { addBloque, removeBloque } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      let id1: string = '';
      let id2: string = '';
      act(() => {
        id1 = addBloque('Quiz', position);
        id2 = addBloque('DragAndDrop', { ...position, colStart: 5 });
      });

      expect(useHojaStore.getState().bloques).toHaveLength(2);

      act(() => {
        removeBloque(id1);
      });

      const { bloques } = useHojaStore.getState();
      expect(bloques).toHaveLength(1);
      expect(bloques[0].id).toBe(id2);
    });
  });

  describe('updateBloquePosition', () => {
    it('should_update_position_when_called_with_partial_position', () => {
      const { addBloque, updateBloquePosition } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', position);
      });

      act(() => {
        updateBloquePosition(id, { colStart: 5, colSpan: 6 });
      });

      const { bloques } = useHojaStore.getState();
      expect(bloques[0].position).toEqual({
        colStart: 5,
        colSpan: 6,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    it('should_not_modify_other_position_fields_when_updating_partially', () => {
      const { addBloque, updateBloquePosition } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 3, rowSpan: 5 };

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', position);
      });

      act(() => {
        updateBloquePosition(id, { colSpan: 8 });
      });

      const { bloques } = useHojaStore.getState();
      expect(bloques[0].position.rowStart).toBe(3);
      expect(bloques[0].position.rowSpan).toBe(5);
    });
  });

  describe('updateBloqueProps', () => {
    it('should_update_props_when_called', () => {
      const { addBloque, updateBloqueProps } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', position);
      });

      act(() => {
        updateBloqueProps(id, { pregunta: '¿Cuánto es 2+2?', opciones: ['3', '4', '5'] });
      });

      const { bloques } = useHojaStore.getState();
      // Usa toMatchObject porque el registry agrega defaultProps adicionales
      expect(bloques[0].props).toMatchObject({
        pregunta: '¿Cuánto es 2+2?',
        opciones: ['3', '4', '5'],
      });
    });

    it('should_merge_props_when_updating', () => {
      const { addBloque, updateBloqueProps } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', position);
      });

      act(() => {
        updateBloqueProps(id, { pregunta: 'Pregunta 1' });
      });

      act(() => {
        updateBloqueProps(id, { opciones: ['A', 'B'] });
      });

      const { bloques } = useHojaStore.getState();
      // Usa toMatchObject porque el registry agrega defaultProps adicionales
      expect(bloques[0].props).toMatchObject({
        pregunta: 'Pregunta 1',
        opciones: ['A', 'B'],
      });
    });
  });

  describe('selectBloque', () => {
    it('should_select_bloque_when_called_with_valid_id', () => {
      const { addBloque, selectBloque, deselectBloque } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      let id: string = '';
      act(() => {
        id = addBloque('Quiz', position);
        deselectBloque(); // Reset selection
      });

      expect(useHojaStore.getState().selectedId).toBeNull();

      act(() => {
        selectBloque(id);
      });

      expect(useHojaStore.getState().selectedId).toBe(id);
    });
  });

  describe('deselectBloque', () => {
    it('should_clear_selection_when_called', () => {
      const { addBloque, deselectBloque } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      act(() => {
        addBloque('Quiz', position);
      });

      expect(useHojaStore.getState().selectedId).not.toBeNull();

      act(() => {
        deselectBloque();
      });

      expect(useHojaStore.getState().selectedId).toBeNull();
    });
  });

  describe('setTheme', () => {
    it('should_update_theme_when_called', () => {
      const { setTheme } = useHojaStore.getState();

      act(() => {
        setTheme('blueprint');
      });

      expect(useHojaStore.getState().themeId).toBe('blueprint');
    });
  });

  describe('clear', () => {
    it('should_remove_all_bloques_when_called', () => {
      const { addBloque, clear } = useHojaStore.getState();
      const position: BentoPosition = { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 2 };

      act(() => {
        addBloque('Quiz', position);
        addBloque('DragAndDrop', { ...position, colStart: 5 });
        addBloque('Slider', { ...position, rowStart: 3 });
      });

      expect(useHojaStore.getState().bloques).toHaveLength(3);

      act(() => {
        clear();
      });

      expect(useHojaStore.getState().bloques).toHaveLength(0);
      expect(useHojaStore.getState().selectedId).toBeNull();
    });
  });
});
