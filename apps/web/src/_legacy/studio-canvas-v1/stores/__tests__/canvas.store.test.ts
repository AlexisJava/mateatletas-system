import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '../canvas.store';

describe('canvas.store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCanvasStore.setState({
      elements: [],
      selectedId: null,
      zoom: 1,
      gridSize: 20,
      snapToGrid: true,
      themeId: 'terminal',
      history: [],
      historyIndex: -1,
    });
  });

  describe('addElement', () => {
    it('should create element with default position', () => {
      const { addElement, elements } = useCanvasStore.getState();
      addElement('Quiz');

      const updated = useCanvasStore.getState().elements;
      expect(updated).toHaveLength(1);
      expect(updated[0].componentType).toBe('Quiz');
      expect(updated[0].position).toEqual({ x: 100, y: 100 });
      expect(updated[0].locked).toBe(false);
    });

    it('should snap position when snapToGrid is active', () => {
      useCanvasStore.setState({ snapToGrid: true, gridSize: 20 });
      const { addElement } = useCanvasStore.getState();

      addElement('Quiz', { x: 105, y: 117 });

      const updated = useCanvasStore.getState().elements;
      expect(updated[0].position).toEqual({ x: 100, y: 120 });
    });

    it('should not snap when snapToGrid is disabled', () => {
      useCanvasStore.setState({ snapToGrid: false, gridSize: 20 });
      const { addElement } = useCanvasStore.getState();

      addElement('Quiz', { x: 105, y: 117 });

      const updated = useCanvasStore.getState().elements;
      expect(updated[0].position).toEqual({ x: 105, y: 117 });
    });

    it('should select the newly added element', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      const { elements, selectedId } = useCanvasStore.getState();
      expect(selectedId).toBe(elements[0].id);
    });
  });

  describe('removeElement', () => {
    it('should remove element correctly', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');
      addElement('Slider');

      const elements = useCanvasStore.getState().elements;
      expect(elements).toHaveLength(2);

      const idToRemove = elements[0].id;
      useCanvasStore.getState().removeElement(idToRemove);

      const updated = useCanvasStore.getState().elements;
      expect(updated).toHaveLength(1);
      expect(updated.find((el) => el.id === idToRemove)).toBeUndefined();
    });

    it('should clear selection if removed element was selected', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      const { elements, selectedId } = useCanvasStore.getState();
      expect(selectedId).toBe(elements[0].id);

      useCanvasStore.getState().removeElement(elements[0].id);

      expect(useCanvasStore.getState().selectedId).toBeNull();
    });
  });

  describe('duplicateElement', () => {
    it('should create copy with new id and offset', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz', { x: 100, y: 100 });

      const original = useCanvasStore.getState().elements[0];
      useCanvasStore.getState().duplicateElement(original.id);

      const elements = useCanvasStore.getState().elements;
      expect(elements).toHaveLength(2);

      const duplicate = elements[1];
      expect(duplicate.id).not.toBe(original.id);
      expect(duplicate.componentType).toBe(original.componentType);
      // With snap to grid (gridSize=20), offset of 20 snaps to 120
      expect(duplicate.position.x).toBeGreaterThan(original.position.x);
      expect(duplicate.position.y).toBeGreaterThan(original.position.y);
    });

    it('should select the duplicated element', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      const original = useCanvasStore.getState().elements[0];
      useCanvasStore.getState().duplicateElement(original.id);

      const { elements, selectedId } = useCanvasStore.getState();
      expect(selectedId).toBe(elements[1].id);
    });
  });

  describe('updatePosition', () => {
    it('should respect snapToGrid when updating position', () => {
      useCanvasStore.setState({ snapToGrid: true, gridSize: 20 });
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      const element = useCanvasStore.getState().elements[0];
      useCanvasStore.getState().updatePosition(element.id, { x: 153, y: 167 });

      const updated = useCanvasStore.getState().elements[0];
      expect(updated.position).toEqual({ x: 160, y: 160 });
    });

    it('should not snap when snapToGrid is disabled', () => {
      useCanvasStore.setState({ snapToGrid: false });
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      const element = useCanvasStore.getState().elements[0];
      useCanvasStore.getState().updatePosition(element.id, { x: 153, y: 167 });

      const updated = useCanvasStore.getState().elements[0];
      expect(updated.position).toEqual({ x: 153, y: 167 });
    });
  });

  describe('updateSize', () => {
    it('should update size correctly', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      const element = useCanvasStore.getState().elements[0];
      useCanvasStore.getState().updateSize(element.id, { width: 300, height: 250 });

      const updated = useCanvasStore.getState().elements[0];
      expect(updated.size).toEqual({ width: 300, height: 250 });
    });
  });

  describe('bringToFront / sendToBack', () => {
    it('should modify zIndex when bringing to front', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');
      addElement('Slider');
      addElement('TextInput');

      const elements = useCanvasStore.getState().elements;
      const firstElement = elements[0];
      const maxZBefore = Math.max(...elements.map((el) => el.zIndex));

      useCanvasStore.getState().bringToFront(firstElement.id);

      const updated = useCanvasStore.getState().elements.find((el) => el.id === firstElement.id);
      expect(updated?.zIndex).toBeGreaterThan(maxZBefore);
    });

    it('should modify zIndex when sending to back', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');
      addElement('Slider');
      addElement('TextInput');

      const elements = useCanvasStore.getState().elements;
      const lastElement = elements[2];
      const minZBefore = Math.min(...elements.map((el) => el.zIndex));

      useCanvasStore.getState().sendToBack(lastElement.id);

      const updated = useCanvasStore.getState().elements.find((el) => el.id === lastElement.id);
      expect(updated?.zIndex).toBeLessThan(minZBefore);
    });
  });

  describe('undo / redo', () => {
    it('should undo and redo multiple operations', () => {
      const { addElement } = useCanvasStore.getState();

      // Operation 1: Add first element
      addElement('Quiz');
      expect(useCanvasStore.getState().elements).toHaveLength(1);

      // Operation 2: Add second element
      addElement('Slider');
      expect(useCanvasStore.getState().elements).toHaveLength(2);

      // Operation 3: Add third element
      addElement('TextInput');
      expect(useCanvasStore.getState().elements).toHaveLength(3);

      // Undo operation 3
      useCanvasStore.getState().undo();
      expect(useCanvasStore.getState().elements).toHaveLength(2);

      // Undo operation 2
      useCanvasStore.getState().undo();
      expect(useCanvasStore.getState().elements).toHaveLength(1);

      // Redo operation 2
      useCanvasStore.getState().redo();
      expect(useCanvasStore.getState().elements).toHaveLength(2);

      // Redo operation 3
      useCanvasStore.getState().redo();
      expect(useCanvasStore.getState().elements).toHaveLength(3);
    });

    it('should not undo past initial state', () => {
      useCanvasStore.getState().undo();
      useCanvasStore.getState().undo();
      expect(useCanvasStore.getState().elements).toHaveLength(0);
    });

    it('should not redo past latest state', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      useCanvasStore.getState().redo();
      useCanvasStore.getState().redo();
      expect(useCanvasStore.getState().elements).toHaveLength(1);
    });
  });

  describe('exportToJson / importFromJson', () => {
    it('should roundtrip correctly', () => {
      const { addElement, updateProps } = useCanvasStore.getState();
      addElement('Quiz', { x: 200, y: 150 });

      const element = useCanvasStore.getState().elements[0];
      updateProps(element.id, { title: 'Test Quiz', questions: 5 });

      const json = useCanvasStore.getState().exportToJson();
      expect(json).toContain('Quiz');
      expect(json).toContain('Test Quiz');

      // Clear and import
      useCanvasStore.getState().clear();
      expect(useCanvasStore.getState().elements).toHaveLength(0);

      useCanvasStore.getState().importFromJson(json);
      const imported = useCanvasStore.getState().elements;

      expect(imported).toHaveLength(1);
      expect(imported[0].componentType).toBe('Quiz');
      expect(imported[0].props).toEqual({ title: 'Test Quiz', questions: 5 });
    });

    it('should handle invalid JSON gracefully', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');

      useCanvasStore.getState().importFromJson('invalid json');

      // Should not crash, elements remain unchanged
      expect(useCanvasStore.getState().elements).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should empty elements array', () => {
      const { addElement } = useCanvasStore.getState();
      addElement('Quiz');
      addElement('Slider');
      addElement('TextInput');

      expect(useCanvasStore.getState().elements).toHaveLength(3);

      useCanvasStore.getState().clear();

      expect(useCanvasStore.getState().elements).toHaveLength(0);
      expect(useCanvasStore.getState().selectedId).toBeNull();
    });
  });

  describe('zoom', () => {
    it('should clamp zoom between 0.1 and 3', () => {
      useCanvasStore.getState().setZoom(5);
      expect(useCanvasStore.getState().zoom).toBe(3);

      useCanvasStore.getState().setZoom(0.01);
      expect(useCanvasStore.getState().zoom).toBe(0.1);

      useCanvasStore.getState().setZoom(1.5);
      expect(useCanvasStore.getState().zoom).toBe(1.5);
    });
  });

  describe('gridSize', () => {
    it('should not allow gridSize below 1', () => {
      useCanvasStore.getState().setGridSize(0);
      expect(useCanvasStore.getState().gridSize).toBe(1);

      useCanvasStore.getState().setGridSize(-10);
      expect(useCanvasStore.getState().gridSize).toBe(1);

      useCanvasStore.getState().setGridSize(50);
      expect(useCanvasStore.getState().gridSize).toBe(50);
    });
  });

  describe('toggleSnapToGrid', () => {
    it('should toggle snap state', () => {
      expect(useCanvasStore.getState().snapToGrid).toBe(true);

      useCanvasStore.getState().toggleSnapToGrid();
      expect(useCanvasStore.getState().snapToGrid).toBe(false);

      useCanvasStore.getState().toggleSnapToGrid();
      expect(useCanvasStore.getState().snapToGrid).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should update theme', () => {
      expect(useCanvasStore.getState().themeId).toBe('terminal');

      useCanvasStore.getState().setTheme('blueprint');
      expect(useCanvasStore.getState().themeId).toBe('blueprint');
    });
  });
});
