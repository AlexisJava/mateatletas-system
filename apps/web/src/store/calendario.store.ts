import { getErrorMessage } from '@/lib/utils/error-handler';
import { create } from 'zustand';
import type {
  Evento,
  CreateTareaDto,
  CreateRecordatorioDto,
  CreateNotaDto,
  VistaAgendaData,
  EstadisticasCalendario,
  FiltrosCalendario,
  TipoEvento,
} from '@/types/calendario.types';
import * as calendarioApi from '@/lib/api/calendario.api';

interface CalendarioState {
  // Estado
  eventos: Evento[];
  eventoSeleccionado: Evento | null;
  vistaAgenda: VistaAgendaData | null;
  vistaSemana: Evento[];
  estadisticas: EstadisticasCalendario | null;
  filtros: FiltrosCalendario;
  isLoading: boolean;
  error: string | null;

  // Vista activa
  vistaActiva: 'agenda' | 'semana';

  // Modal state
  modalAbierto: boolean;
  tipoModalCreacion: TipoEvento | null;

  // Acciones - Crear
  crearTarea: (data: CreateTareaDto) => Promise<void>;
  crearRecordatorio: (data: CreateRecordatorioDto) => Promise<void>;
  crearNota: (data: CreateNotaDto) => Promise<void>;

  // Acciones - Leer
  cargarEventos: (filtros?: FiltrosCalendario) => Promise<void>;
  cargarEvento: (id: string) => Promise<void>;
  cargarVistaAgenda: () => Promise<void>;
  cargarVistaSemana: (fecha?: string) => Promise<void>;
  cargarEstadisticas: () => Promise<void>;

  // Acciones - Actualizar
  actualizarTarea: (id: string, data: Partial<CreateTareaDto>) => Promise<void>;
  actualizarRecordatorio: (id: string, data: Partial<CreateRecordatorioDto>) => Promise<void>;
  actualizarNota: (id: string, data: Partial<CreateNotaDto>) => Promise<void>;
  actualizarFechas: (id: string, fecha_inicio: string, fecha_fin: string) => Promise<void>;

  // Acciones - Eliminar
  eliminarEvento: (id: string) => Promise<void>;

  // Acciones - UI
  setVistaActiva: (vista: 'agenda' | 'semana') => void;
  setFiltros: (filtros: Partial<FiltrosCalendario>) => void;
  limpiarFiltros: () => void;
  setEventoSeleccionado: (evento: Evento | null) => void;
  abrirModalCreacion: (tipo: TipoEvento) => void;
  cerrarModal: () => void;
}

export const useCalendarioStore = create<CalendarioState>((set, get) => ({
  // Estado inicial
  eventos: [],
  eventoSeleccionado: null,
  vistaAgenda: null,
  vistaSemana: [],
  estadisticas: null,
  filtros: {},
  isLoading: false,
  error: null,
  vistaActiva: 'agenda',
  modalAbierto: false,
  tipoModalCreacion: null,

  // ==================== CREAR EVENTOS ====================

  crearTarea: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const nuevoEvento = await calendarioApi.crearTarea(data);
      set((state) => ({
        eventos: [nuevoEvento, ...state.eventos],
        isLoading: false,
        modalAbierto: false,
      }));

      // Recargar vista activa
      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }

      // Recargar estadísticas
      await get().cargarEstadisticas();
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  crearRecordatorio: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const nuevoEvento = await calendarioApi.crearRecordatorio(data);
      set((state) => ({
        eventos: [nuevoEvento, ...state.eventos],
        isLoading: false,
        modalAbierto: false,
      }));

      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }

      await get().cargarEstadisticas();
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  crearNota: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const nuevoEvento = await calendarioApi.crearNota(data);
      set((state) => ({
        eventos: [nuevoEvento, ...state.eventos],
        isLoading: false,
        modalAbierto: false,
      }));

      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }

      await get().cargarEstadisticas();
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  // ==================== LEER EVENTOS ====================

  cargarEventos: async (filtros) => {
    set({ isLoading: true, error: null });
    try {
      const eventos = await calendarioApi.obtenerEventos(filtros || get().filtros);
      set({ eventos, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  cargarEvento: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const evento = await calendarioApi.obtenerEvento(id);
      set({ eventoSeleccionado: evento, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  cargarVistaAgenda: async () => {
    set({ isLoading: true, error: null });
    try {
      const vistaAgenda = await calendarioApi.obtenerVistaAgenda();
      set({ vistaAgenda, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  cargarVistaSemana: async (fecha) => {
    set({ isLoading: true, error: null });
    try {
      const vistaSemana = await calendarioApi.obtenerVistaSemana(fecha);
      set({ vistaSemana, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  cargarEstadisticas: async () => {
    try {
      const estadisticas = await calendarioApi.obtenerEstadisticas();
      set({ estadisticas });
    } catch (error: unknown) {
      console.error('Error cargando estadísticas:', error);
    }
  },

  // ==================== ACTUALIZAR EVENTOS ====================

  actualizarTarea: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const eventoActualizado = await calendarioApi.actualizarTarea(id, data);
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id === id ? eventoActualizado : e)),
        eventoSeleccionado:
          state.eventoSeleccionado?.id === id ? eventoActualizado : state.eventoSeleccionado,
        isLoading: false,
      }));

      // Recargar vista activa
      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }

      await get().cargarEstadisticas();
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  actualizarRecordatorio: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const eventoActualizado = await calendarioApi.actualizarRecordatorio(id, data);
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id === id ? eventoActualizado : e)),
        eventoSeleccionado:
          state.eventoSeleccionado?.id === id ? eventoActualizado : state.eventoSeleccionado,
        isLoading: false,
      }));

      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  actualizarNota: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const eventoActualizado = await calendarioApi.actualizarNota(id, data);
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id === id ? eventoActualizado : e)),
        eventoSeleccionado:
          state.eventoSeleccionado?.id === id ? eventoActualizado : state.eventoSeleccionado,
        isLoading: false,
      }));

      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  actualizarFechas: async (id, fecha_inicio, fecha_fin) => {
    try {
      const eventoActualizado = await calendarioApi.actualizarFechasEvento(
        id,
        fecha_inicio,
        fecha_fin,
      );
      set((state) => ({
        eventos: state.eventos.map((e) => (e.id === id ? eventoActualizado : e)),
      }));

      // Recargar vista activa
      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }
    } catch (error: unknown) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  // ==================== ELIMINAR EVENTOS ====================

  eliminarEvento: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await calendarioApi.eliminarEvento(id);
      set((state) => ({
        eventos: state.eventos.filter((e) => e.id !== id),
        eventoSeleccionado: state.eventoSeleccionado?.id === id ? null : state.eventoSeleccionado,
        isLoading: false,
      }));

      // Recargar vista activa
      const { vistaActiva } = get();
      if (vistaActiva === 'agenda') {
        await get().cargarVistaAgenda();
      } else {
        await get().cargarVistaSemana();
      }

      await get().cargarEstadisticas();
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  // ==================== ACCIONES UI ====================

  setVistaActiva: (vista) => {
    set({ vistaActiva: vista });

    // Cargar datos de la vista seleccionada
    if (vista === 'agenda') {
      get().cargarVistaAgenda();
    } else {
      get().cargarVistaSemana();
    }
  },

  setFiltros: (filtros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...filtros },
    }));

    // Recargar eventos con nuevos filtros
    get().cargarEventos();
  },

  limpiarFiltros: () => {
    set({ filtros: {} });
    get().cargarEventos();
  },

  setEventoSeleccionado: (evento) => {
    set({ eventoSeleccionado: evento });
  },

  abrirModalCreacion: (tipo) => {
    set({ modalAbierto: true, tipoModalCreacion: tipo });
  },

  cerrarModal: () => {
    set({ modalAbierto: false, tipoModalCreacion: null, eventoSeleccionado: null });
  },
}));
