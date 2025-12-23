/**
 * Store de Hoja - Gestión del estado del editor Bento Grid
 *
 * Usa Zustand con Immer para manejo inmutable del estado.
 * Diseñado para ser simple y sin efectos secundarios.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { HojaStore, BentoPosition, BloqueHoja } from '../types/studio.types';
import { getBlockDefinition } from '@/components/blocks/registry';

/**
 * Estado inicial del store
 */
const createInitialState = () => ({
  bloques: [] as BloqueHoja[],
  selectedId: null as string | null,
  themeId: 'terminal',
});

/**
 * Store de Hoja usando Zustand + Immer
 */
export const useHojaStore = create<HojaStore>()(
  immer((set) => ({
    ...createInitialState(),

    addBloque: (type: string, position: BentoPosition): string => {
      const id = crypto.randomUUID();

      // Obtener props por defecto del registry
      const blockDef = getBlockDefinition(type);
      const defaultProps = blockDef?.defaultProps ?? {};

      const newBloque: BloqueHoja = {
        id,
        componentType: type,
        position,
        props: { ...defaultProps },
      };

      set((state) => {
        state.bloques.push(newBloque);
        state.selectedId = id;
      });

      return id;
    },

    removeBloque: (id: string) => {
      set((state) => {
        state.bloques = state.bloques.filter((b) => b.id !== id);
        if (state.selectedId === id) {
          state.selectedId = null;
        }
      });
    },

    updateBloquePosition: (id: string, position: Partial<BentoPosition>) => {
      set((state) => {
        const bloque = state.bloques.find((b) => b.id === id);
        if (bloque) {
          bloque.position = { ...bloque.position, ...position };
        }
      });
    },

    updateBloqueProps: (id: string, props: Record<string, unknown>) => {
      set((state) => {
        const bloque = state.bloques.find((b) => b.id === id);
        if (bloque) {
          bloque.props = { ...bloque.props, ...props };
        }
      });
    },

    selectBloque: (id: string) => {
      set((state) => {
        state.selectedId = id;
      });
    },

    deselectBloque: () => {
      set((state) => {
        state.selectedId = null;
      });
    },

    setTheme: (themeId: string) => {
      set((state) => {
        state.themeId = themeId;
      });
    },

    clear: () => {
      set((state) => {
        state.bloques = [];
        state.selectedId = null;
      });
    },
  })),
);
