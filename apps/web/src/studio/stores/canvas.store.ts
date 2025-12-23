import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CanvasElement, CanvasStore } from '../types/canvas.types';
import { snapPosition } from '../utils/snap.utils';

const MAX_HISTORY = 50;
const DEFAULT_ELEMENT_SIZE = { width: 200, height: 150 };
const DEFAULT_POSITION = { x: 100, y: 100 };
const DUPLICATE_OFFSET = 20;

const createInitialState = () => ({
  elements: [] as CanvasElement[],
  selectedId: null as string | null,
  zoom: 1,
  gridSize: 20,
  snapToGrid: true,
  themeId: 'terminal',
  history: [] as CanvasElement[][],
  historyIndex: -1,
});

const getMaxZIndex = (elements: CanvasElement[]): number => {
  if (elements.length === 0) return 0;
  return Math.max(...elements.map((el) => el.zIndex));
};

const getMinZIndex = (elements: CanvasElement[]): number => {
  if (elements.length === 0) return 0;
  return Math.min(...elements.map((el) => el.zIndex));
};

export const useCanvasStore = create<CanvasStore>()(
  immer((set, get) => {
    // Push current state to history. Called AFTER making changes.
    const pushToHistory = (elementsSnapshot: CanvasElement[]) => {
      const { history, historyIndex } = get();
      // Truncate any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(elementsSnapshot)));

      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }

      set((state) => {
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      });
    };

    return {
      ...createInitialState(),

      addElement: (type: string, position?: { x: number; y: number }) => {
        const { snapToGrid: snap, gridSize, elements } = get();
        const basePosition = position ?? DEFAULT_POSITION;
        const finalPosition = snap ? snapPosition(basePosition, gridSize) : basePosition;

        const newElement: CanvasElement = {
          id: crypto.randomUUID(),
          componentType: type,
          position: finalPosition,
          size: { ...DEFAULT_ELEMENT_SIZE },
          props: {},
          zIndex: getMaxZIndex(elements) + 1,
          locked: false,
        };

        set((state) => {
          state.elements.push(newElement);
          state.selectedId = newElement.id;
        });

        pushToHistory(get().elements);
      },

      removeElement: (id: string) => {
        set((state) => {
          state.elements = state.elements.filter((el) => el.id !== id);
          if (state.selectedId === id) {
            state.selectedId = null;
          }
        });

        pushToHistory(get().elements);
      },

      duplicateElement: (id: string) => {
        const element = get().elements.find((el) => el.id === id);
        if (!element) return;

        const { snapToGrid: snap, gridSize, elements } = get();
        const newPosition = {
          x: element.position.x + DUPLICATE_OFFSET,
          y: element.position.y + DUPLICATE_OFFSET,
        };
        const finalPosition = snap ? snapPosition(newPosition, gridSize) : newPosition;

        const newElement: CanvasElement = {
          ...JSON.parse(JSON.stringify(element)),
          id: crypto.randomUUID(),
          position: finalPosition,
          zIndex: getMaxZIndex(elements) + 1,
        };

        set((state) => {
          state.elements.push(newElement);
          state.selectedId = newElement.id;
        });

        pushToHistory(get().elements);
      },

      selectElement: (id: string | null) => {
        set((state) => {
          state.selectedId = id;
        });
      },

      updatePosition: (id: string, position: { x: number; y: number }) => {
        const element = get().elements.find((el) => el.id === id);
        if (!element || element.locked) return;

        const { snapToGrid: snap, gridSize } = get();
        const finalPosition = snap ? snapPosition(position, gridSize) : position;

        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (el) {
            el.position = finalPosition;
          }
        });

        pushToHistory(get().elements);
      },

      updateSize: (id: string, size: { width: number; height: number }) => {
        const element = get().elements.find((el) => el.id === id);
        if (!element || element.locked) return;

        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (el) {
            el.size = size;
          }
        });

        pushToHistory(get().elements);
      },

      updateProps: (id: string, props: Record<string, unknown>) => {
        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (el) {
            el.props = { ...el.props, ...props };
          }
        });

        pushToHistory(get().elements);
      },

      bringToFront: (id: string) => {
        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (el) {
            el.zIndex = getMaxZIndex(state.elements) + 1;
          }
        });

        pushToHistory(get().elements);
      },

      sendToBack: (id: string) => {
        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (el) {
            el.zIndex = getMinZIndex(state.elements) - 1;
          }
        });

        pushToHistory(get().elements);
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const previousIndex = historyIndex - 1;
        const previousState = history[previousIndex];

        set((state) => {
          state.elements = JSON.parse(JSON.stringify(previousState));
          state.historyIndex = previousIndex;
          state.selectedId = null;
        });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const nextIndex = historyIndex + 1;
        const nextState = history[nextIndex];
        if (!nextState) return;

        set((state) => {
          state.elements = JSON.parse(JSON.stringify(nextState));
          state.historyIndex = nextIndex;
          state.selectedId = null;
        });
      },

      setZoom: (zoom: number) => {
        set((state) => {
          state.zoom = Math.max(0.1, Math.min(3, zoom));
        });
      },

      setGridSize: (size: number) => {
        set((state) => {
          state.gridSize = Math.max(1, size);
        });
      },

      toggleSnapToGrid: () => {
        set((state) => {
          state.snapToGrid = !state.snapToGrid;
        });
      },

      setTheme: (themeId: string) => {
        set((state) => {
          state.themeId = themeId;
        });
      },

      exportToJson: () => {
        const { elements, themeId, gridSize, snapToGrid } = get();
        return JSON.stringify(
          {
            version: '1.0.0',
            themeId,
            gridSize,
            snapToGrid,
            elements,
          },
          null,
          2,
        );
      },

      importFromJson: (json: string) => {
        try {
          const data = JSON.parse(json);
          if (!data.elements || !Array.isArray(data.elements)) {
            throw new Error('Invalid JSON format');
          }

          set((state) => {
            state.elements = data.elements;
            state.themeId = data.themeId ?? state.themeId;
            state.gridSize = data.gridSize ?? state.gridSize;
            state.snapToGrid = data.snapToGrid ?? state.snapToGrid;
            state.selectedId = null;
          });

          pushToHistory(get().elements);
        } catch {
          console.error('Failed to import JSON');
        }
      },

      clear: () => {
        set((state) => {
          state.elements = [];
          state.selectedId = null;
        });

        pushToHistory(get().elements);
      },
    };
  }),
);
