/**
 * Studio Wizard Store
 * Maneja el estado del wizard de creación de cursos en 6 pasos
 */

import { create } from 'zustand';
import { apiClient } from '@/lib/axios';
import { AxiosError } from 'axios';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS (alineados con Prisma pero definidos localmente para el frontend)
// ═══════════════════════════════════════════════════════════════════════════════

export type CategoriaStudio = 'EXPERIENCIA' | 'CURRICULAR';

export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';

export type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';

export type TipoExperienciaStudio =
  | 'NARRATIVO'
  | 'EXPEDICION'
  | 'LABORATORIO'
  | 'SIMULACION'
  | 'PROYECTO'
  | 'DESAFIO';

export type MateriaStudio = 'MATEMATICA_ESCOLAR' | 'FISICA' | 'QUIMICA' | 'PROGRAMACION';

export type TierNombre = 'ARCADE' | 'ARCADE_PLUS' | 'PRO';

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WizardDatos {
  // Paso 1
  categoria: CategoriaStudio | null;

  // Paso 2
  casa: CasaTipo | null;
  mundo: MundoTipo | null;

  // Paso 3
  tipoExperiencia: TipoExperienciaStudio | null;
  materia: MateriaStudio | null;

  // Paso 4
  nombre: string;
  descripcion: string;
  esteticaBase: string;
  esteticaVariante: string;

  // Paso 5
  cantidadSemanas: number;
  actividadesPorSemana: number;
  tierMinimo: TierNombre | null;
}

export interface WizardState {
  pasoActual: 1 | 2 | 3 | 4 | 5 | 6;
  pasoMaximoAlcanzado: number;
  datos: WizardDatos;
  errores: Record<string, string>;
  isSubmitting: boolean;
  submitError: string | null;
}

export interface WizardActions {
  // Navegación
  siguientePaso: () => boolean;
  pasoAnterior: () => void;
  irAPaso: (_paso: number) => void;

  // Setters
  setCategoria: (_categoria: CategoriaStudio) => void;
  setCasa: (_casa: CasaTipo) => void;
  setMundo: (_mundo: MundoTipo) => void;
  setTipoExperiencia: (_tipo: TipoExperienciaStudio) => void;
  setMateria: (_materia: MateriaStudio) => void;
  setNombre: (_nombre: string) => void;
  setDescripcion: (_descripcion: string) => void;
  setEsteticaBase: (_estetica: string) => void;
  setEsteticaVariante: (_variante: string) => void;
  setCantidadSemanas: (_semanas: number) => void;
  setActividadesPorSemana: (_actividades: number) => void;
  setTierMinimo: (_tier: TierNombre) => void;

  // Validación
  validarPaso: (_paso: number) => boolean;
  validarTodo: () => boolean;
  limpiarError: (_campo: string) => void;

  // Submit
  crearCurso: () => Promise<string | null>;

  // Reset
  resetWizard: () => void;
}

export type WizardStore = WizardState & WizardActions;

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════════════════════

const INITIAL_DATOS: WizardDatos = {
  categoria: null,
  casa: null,
  mundo: null,
  tipoExperiencia: null,
  materia: null,
  nombre: '',
  descripcion: '',
  esteticaBase: '',
  esteticaVariante: '',
  cantidadSemanas: 4,
  actividadesPorSemana: 3,
  tierMinimo: null,
};

const INITIAL_STATE: WizardState = {
  pasoActual: 1,
  pasoMaximoAlcanzado: 1,
  datos: { ...INITIAL_DATOS },
  errores: {},
  isSubmitting: false,
  submitError: null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════════

export const useStudioWizardStore = create<WizardStore>((set, get) => ({
  ...INITIAL_STATE,

  // ─────────────────────────────────────────────────────────────────────────────
  // SETTERS
  // ─────────────────────────────────────────────────────────────────────────────

  setCategoria: (categoria: CategoriaStudio) => {
    const { datos } = get();
    const categoriaAnterior = datos.categoria;

    set((state) => {
      const newDatos = { ...state.datos, categoria };

      // Limpiar tipoExperiencia/materia si cambia la categoría
      if (categoriaAnterior !== categoria) {
        if (categoria === 'CURRICULAR') {
          newDatos.tipoExperiencia = null;
        } else {
          newDatos.materia = null;
        }
      }

      // Limpiar error de categoria
      const newErrores = { ...state.errores };
      delete newErrores.categoria;

      return { datos: newDatos, errores: newErrores };
    });
  },

  setCasa: (casa: CasaTipo) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.casa;
      return {
        datos: { ...state.datos, casa },
        errores: newErrores,
      };
    });
  },

  setMundo: (mundo: MundoTipo) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.mundo;
      return {
        datos: { ...state.datos, mundo },
        errores: newErrores,
      };
    });
  },

  setTipoExperiencia: (tipoExperiencia: TipoExperienciaStudio) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.tipoExperiencia;
      return {
        datos: { ...state.datos, tipoExperiencia },
        errores: newErrores,
      };
    });
  },

  setMateria: (materia: MateriaStudio) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.materia;
      return {
        datos: { ...state.datos, materia },
        errores: newErrores,
      };
    });
  },

  setNombre: (nombre: string) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.nombre;
      return {
        datos: { ...state.datos, nombre },
        errores: newErrores,
      };
    });
  },

  setDescripcion: (descripcion: string) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.descripcion;
      return {
        datos: { ...state.datos, descripcion },
        errores: newErrores,
      };
    });
  },

  setEsteticaBase: (esteticaBase: string) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.esteticaBase;
      return {
        datos: { ...state.datos, esteticaBase },
        errores: newErrores,
      };
    });
  },

  setEsteticaVariante: (esteticaVariante: string) => {
    set((state) => ({
      datos: { ...state.datos, esteticaVariante },
    }));
  },

  setCantidadSemanas: (cantidadSemanas: number) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.cantidadSemanas;
      return {
        datos: { ...state.datos, cantidadSemanas },
        errores: newErrores,
      };
    });
  },

  setActividadesPorSemana: (actividadesPorSemana: number) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.actividadesPorSemana;
      return {
        datos: { ...state.datos, actividadesPorSemana },
        errores: newErrores,
      };
    });
  },

  setTierMinimo: (tierMinimo: TierNombre) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores.tierMinimo;
      return {
        datos: { ...state.datos, tierMinimo },
        errores: newErrores,
      };
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  validarPaso: (paso: number): boolean => {
    const { datos } = get();
    const errores: Record<string, string> = {};

    switch (paso) {
      case 1:
        if (!datos.categoria) {
          errores.categoria = 'Seleccioná una categoría';
        }
        break;

      case 2:
        if (!datos.casa) {
          errores.casa = 'Seleccioná una casa';
        }
        if (!datos.mundo) {
          errores.mundo = 'Seleccioná un mundo';
        }
        break;

      case 3:
        if (datos.categoria === 'EXPERIENCIA') {
          if (!datos.tipoExperiencia) {
            errores.tipoExperiencia = 'Seleccioná un tipo de experiencia';
          }
        } else if (datos.categoria === 'CURRICULAR') {
          if (!datos.materia) {
            errores.materia = 'Seleccioná una materia';
          }
        }
        break;

      case 4:
        if (!datos.nombre || datos.nombre.length < 3) {
          errores.nombre = 'El nombre debe tener al menos 3 caracteres';
        }
        if (!datos.descripcion || datos.descripcion.length < 10) {
          errores.descripcion = 'La descripción debe tener al menos 10 caracteres';
        }
        if (!datos.esteticaBase) {
          errores.esteticaBase = 'La estética base es requerida';
        }
        break;

      case 5:
        if (datos.cantidadSemanas < 1 || datos.cantidadSemanas > 12) {
          errores.cantidadSemanas = 'La cantidad de semanas debe estar entre 1 y 12';
        }
        if (datos.actividadesPorSemana < 1 || datos.actividadesPorSemana > 5) {
          errores.actividadesPorSemana = 'Las actividades por semana deben estar entre 1 y 5';
        }
        if (!datos.tierMinimo) {
          errores.tierMinimo = 'Seleccioná un tier mínimo';
        }
        break;

      case 6:
        // Paso de confirmación, siempre válido
        break;
    }

    // Actualizar errores en el state
    set((state) => ({
      errores: { ...state.errores, ...errores },
    }));

    return Object.keys(errores).length === 0;
  },

  validarTodo: (): boolean => {
    const { validarPaso } = get();
    let todosValidos = true;

    for (let paso = 1; paso <= 5; paso++) {
      if (!validarPaso(paso)) {
        todosValidos = false;
      }
    }

    return todosValidos;
  },

  limpiarError: (campo: string) => {
    set((state) => {
      const newErrores = { ...state.errores };
      delete newErrores[campo];
      return { errores: newErrores };
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVEGACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  siguientePaso: (): boolean => {
    const { pasoActual, validarPaso, pasoMaximoAlcanzado } = get();

    // Validar paso actual antes de avanzar
    if (!validarPaso(pasoActual)) {
      return false;
    }

    // Avanzar al siguiente paso
    if (pasoActual < 6) {
      const nuevoPaso = (pasoActual + 1) as 1 | 2 | 3 | 4 | 5 | 6;
      set({
        pasoActual: nuevoPaso,
        pasoMaximoAlcanzado: Math.max(pasoMaximoAlcanzado, nuevoPaso),
      });
      return true;
    }

    return false;
  },

  pasoAnterior: () => {
    const { pasoActual } = get();

    if (pasoActual > 1) {
      set({ pasoActual: (pasoActual - 1) as 1 | 2 | 3 | 4 | 5 | 6 });
    }
  },

  irAPaso: (paso: number) => {
    const { pasoMaximoAlcanzado } = get();

    // Solo permitir ir a pasos ya alcanzados
    if (paso >= 1 && paso <= 6 && paso <= pasoMaximoAlcanzado) {
      set({ pasoActual: paso as 1 | 2 | 3 | 4 | 5 | 6 });
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────────────────────────

  crearCurso: async (): Promise<string | null> => {
    const { validarTodo, datos } = get();

    // Validar todo antes de enviar
    if (!validarTodo()) {
      return null;
    }

    set({ isSubmitting: true, submitError: null });

    try {
      console.log('[Studio Wizard] Iniciando creación de curso...');

      // Preparar el body según el DTO del backend
      const body = {
        categoria: datos.categoria,
        casa: datos.casa,
        mundo: datos.mundo,
        // tipoExperiencia solo si es EXPERIENCIA
        ...(datos.categoria === 'EXPERIENCIA' && datos.tipoExperiencia
          ? { tipoExperiencia: datos.tipoExperiencia }
          : {}),
        // materia solo si es CURRICULAR
        ...(datos.categoria === 'CURRICULAR' && datos.materia ? { materia: datos.materia } : {}),
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        esteticaBase: datos.esteticaBase,
        // esteticaVariante solo si tiene valor
        ...(datos.esteticaVariante ? { esteticaVariante: datos.esteticaVariante } : {}),
        cantidadSemanas: datos.cantidadSemanas,
        actividadesPorSemana: datos.actividadesPorSemana,
        tierMinimo: datos.tierMinimo,
      };

      // Llamada real al API - la cookie httpOnly se envía automáticamente
      const response = await apiClient.post<{ id: string }>('/studio/cursos', body);

      console.log('[Studio Wizard] Respuesta del servidor:', response);

      set({ isSubmitting: false });

      // Verificar que tenemos el id
      if (!response || !response.id) {
        console.error('[Studio Wizard] Respuesta sin ID:', response);
        set({ submitError: 'El servidor no devolvió un ID válido' });
        return null;
      }

      console.log('[Studio Wizard] Curso creado con ID:', response.id);
      return response.id;
    } catch (error) {
      // Extraer mensaje de error del backend
      let errorMessage = 'Error al crear el curso';

      if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data as { message?: string | string[] };
        if (Array.isArray(data.message)) {
          errorMessage = data.message.join(', ');
        } else if (typeof data.message === 'string') {
          errorMessage = data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({ isSubmitting: false, submitError: errorMessage });
      return null;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────────

  resetWizard: () => {
    set({
      ...INITIAL_STATE,
      datos: { ...INITIAL_DATOS },
    });
  },
}));
