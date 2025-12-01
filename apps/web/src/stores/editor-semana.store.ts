import { create } from 'zustand';
import { BloqueJson, SemanaMetadata } from '@/components/studio/blocks/types';

interface EditorSemanaState {
  // Data
  cursoId: string | null;
  semanaNum: number | null;
  metadata: SemanaMetadata;
  bloques: BloqueJson[];
  componentesDisponibles: string[];

  // UI State
  modoEdicion: 'visual' | 'json';
  bloqueSeleccionadoId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones - Data
  setDatos: (
    cursoId: string,
    semanaNum: number,
    metadata: SemanaMetadata,
    bloques: BloqueJson[],
    componentes: string[],
  ) => void;
  setMetadata: (metadata: Partial<SemanaMetadata>) => void;

  // Acciones - Bloques
  agregarBloque: (componente: string, posicion?: number) => void;
  eliminarBloque: (id: string) => void;
  moverBloque: (id: string, nuevaPosicion: number) => void;
  actualizarBloqueConfig: (id: string, contenido: Record<string, unknown>) => void;
  actualizarBloqueTitulo: (id: string, titulo: string) => void;
  duplicarBloque: (id: string) => void;

  // Acciones - Selección
  seleccionarBloque: (id: string | null) => void;

  // Acciones - Modo
  setModoEdicion: (modo: 'visual' | 'json') => void;

  // Acciones - JSON
  importarJSON: (json: string) => { exito: boolean; error?: string };
  exportarJSON: () => string;

  // Acciones - Estado
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  marcarDirty: () => void;
  marcarLimpio: () => void;
  resetear: () => void;
}

const generarId = (): string => `bloque-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const estadoInicial = {
  cursoId: null,
  semanaNum: null,
  metadata: { titulo: '', descripcion: '', objetivos: [] },
  bloques: [],
  componentesDisponibles: [],
  modoEdicion: 'visual' as const,
  bloqueSeleccionadoId: null,
  isDirty: false,
  isSaving: false,
  isLoading: false,
  error: null,
};

export const useEditorSemanaStore = create<EditorSemanaState>((set, get) => ({
  ...estadoInicial,

  setDatos: (cursoId, semanaNum, metadata, bloques, componentes): void => {
    set({
      cursoId,
      semanaNum,
      metadata,
      bloques,
      componentesDisponibles: componentes,
      isDirty: false,
      error: null,
    });
  },

  setMetadata: (metadata): void => {
    set((state) => ({
      metadata: { ...state.metadata, ...metadata },
      isDirty: true,
    }));
  },

  agregarBloque: (componente, posicion): void => {
    const { bloques } = get();
    const nuevaPosicion = posicion ?? bloques.length;

    const nuevoBloque: BloqueJson = {
      id: generarId(),
      orden: nuevaPosicion,
      componente,
      titulo: `Nuevo ${componente}`,
      contenido: {},
    };

    const bloquesActualizados = bloques.map((b) =>
      b.orden >= nuevaPosicion ? { ...b, orden: b.orden + 1 } : b,
    );

    set({
      bloques: [...bloquesActualizados, nuevoBloque].sort((a, b) => a.orden - b.orden),
      bloqueSeleccionadoId: nuevoBloque.id,
      isDirty: true,
    });
  },

  eliminarBloque: (id): void => {
    const { bloques, bloqueSeleccionadoId } = get();
    const bloqueEliminado = bloques.find((b) => b.id === id);

    if (!bloqueEliminado) return;

    const bloquesRestantes = bloques
      .filter((b) => b.id !== id)
      .map((b) => (b.orden > bloqueEliminado.orden ? { ...b, orden: b.orden - 1 } : b));

    set({
      bloques: bloquesRestantes,
      bloqueSeleccionadoId: bloqueSeleccionadoId === id ? null : bloqueSeleccionadoId,
      isDirty: true,
    });
  },

  moverBloque: (id, nuevaPosicion): void => {
    const { bloques } = get();
    const bloque = bloques.find((b) => b.id === id);

    if (!bloque) return;

    const ordenAnterior = bloque.orden;

    const bloquesActualizados = bloques.map((b) => {
      if (b.id === id) {
        return { ...b, orden: nuevaPosicion };
      }
      if (ordenAnterior < nuevaPosicion) {
        if (b.orden > ordenAnterior && b.orden <= nuevaPosicion) {
          return { ...b, orden: b.orden - 1 };
        }
      } else {
        if (b.orden >= nuevaPosicion && b.orden < ordenAnterior) {
          return { ...b, orden: b.orden + 1 };
        }
      }
      return b;
    });

    set({
      bloques: bloquesActualizados.sort((a, b) => a.orden - b.orden),
      isDirty: true,
    });
  },

  actualizarBloqueConfig: (id, contenido): void => {
    set((state) => ({
      bloques: state.bloques.map((b) => (b.id === id ? { ...b, contenido } : b)),
      isDirty: true,
    }));
  },

  actualizarBloqueTitulo: (id, titulo): void => {
    set((state) => ({
      bloques: state.bloques.map((b) => (b.id === id ? { ...b, titulo } : b)),
      isDirty: true,
    }));
  },

  duplicarBloque: (id): void => {
    const { bloques } = get();
    const bloque = bloques.find((b) => b.id === id);

    if (!bloque) return;

    const nuevoBloque: BloqueJson = {
      ...bloque,
      id: generarId(),
      orden: bloque.orden + 1,
      titulo: `${bloque.titulo} (copia)`,
    };

    const bloquesActualizados = bloques.map((b) =>
      b.orden > bloque.orden ? { ...b, orden: b.orden + 1 } : b,
    );

    set({
      bloques: [...bloquesActualizados, nuevoBloque].sort((a, b) => a.orden - b.orden),
      bloqueSeleccionadoId: nuevoBloque.id,
      isDirty: true,
    });
  },

  seleccionarBloque: (id): void => {
    set({ bloqueSeleccionadoId: id });
  },

  setModoEdicion: (modo): void => {
    set({ modoEdicion: modo });
  },

  importarJSON: (json): { exito: boolean; error?: string } => {
    try {
      const data = JSON.parse(json) as { metadata?: SemanaMetadata; bloques?: BloqueJson[] };

      if (!data.bloques || !Array.isArray(data.bloques)) {
        return { exito: false, error: 'JSON inválido: falta array "bloques"' };
      }

      set({
        metadata: data.metadata ?? get().metadata,
        bloques: data.bloques,
        isDirty: true,
      });

      return { exito: true };
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'Error desconocido';
      return { exito: false, error: `Error parseando JSON: ${mensaje}` };
    }
  },

  exportarJSON: (): string => {
    const { metadata, bloques } = get();
    return JSON.stringify({ metadata, bloques }, null, 2);
  },

  setLoading: (loading): void => set({ isLoading: loading }),
  setSaving: (saving): void => set({ isSaving: saving }),
  setError: (error): void => set({ error }),
  marcarDirty: (): void => set({ isDirty: true }),
  marcarLimpio: (): void => set({ isDirty: false }),

  resetear: (): void => set(estadoInicial),
}));
