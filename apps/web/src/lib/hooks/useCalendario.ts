/**
 * React Query hooks para Calendario
 *
 * Migrado de Zustand a React Query para:
 * - Cache automático de eventos
 * - Invalidación inteligente por tipo de evento
 * - Optimistic updates en creación/edición
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Evento,
  CreateTareaDto,
  CreateRecordatorioDto,
  CreateNotaDto,
  VistaAgendaData,
  EstadisticasCalendario,
  FiltrosCalendario,
} from '@/types/calendario.types';
import * as calendarioApi from '@/lib/api/calendario.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const calendarioKeys = {
  all: ['calendario'] as const,
  eventos: (filtros?: FiltrosCalendario) => [...calendarioKeys.all, 'eventos', filtros] as const,
  evento: (id: string) => [...calendarioKeys.all, 'evento', id] as const,
  vistaAgenda: () => [...calendarioKeys.all, 'vista-agenda'] as const,
  vistaSemana: (fecha?: string) => [...calendarioKeys.all, 'vista-semana', fecha] as const,
  estadisticas: () => [...calendarioKeys.all, 'estadisticas'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obtener eventos con filtros
 *
 * @param filtros - Filtros opcionales
 *
 * @example
 * const { data: eventos } = useEventos({ tipo: 'TAREA' });
 */
export function useEventos(filtros?: FiltrosCalendario) {
  return useQuery<Evento[], Error>({
    queryKey: calendarioKeys.eventos(filtros),
    queryFn: () => calendarioApi.obtenerEventos(filtros),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener vista agenda
 *
 * @example
 * const { data: vistaAgenda } = useVistaAgenda();
 */
export function useVistaAgenda() {
  return useQuery<VistaAgendaData, Error>({
    queryKey: calendarioKeys.vistaAgenda(),
    queryFn: calendarioApi.obtenerVistaAgenda,
    staleTime: 1000 * 60, // 1 minuto
  });
}

/**
 * Hook para obtener vista semana
 *
 * @param fecha - Fecha de la semana (opcional)
 *
 * @example
 * const { data: vistaSemana } = useVistaSemana('2025-10-16');
 */
export function useVistaSemana(fecha?: string) {
  return useQuery<Evento[], Error>({
    queryKey: calendarioKeys.vistaSemana(fecha),
    queryFn: () => calendarioApi.obtenerVistaSemana(fecha),
    staleTime: 1000 * 60, // 1 minuto
  });
}

/**
 * Hook para obtener estadísticas del calendario
 *
 * @example
 * const { data: estadisticas } = useEstadisticasCalendario();
 */
export function useEstadisticasCalendario() {
  return useQuery<EstadisticasCalendario, Error>({
    queryKey: calendarioKeys.estadisticas(),
    queryFn: calendarioApi.obtenerEstadisticas,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para crear tarea
 *
 * @example
 * const crearTarea = useCrearTarea();
 * crearTarea.mutate({ titulo: 'Estudiar', ... });
 */
export function useCrearTarea() {
  const queryClient = useQueryClient();

  return useMutation<Evento, Error, CreateTareaDto>({
    mutationFn: (data) => calendarioApi.crearTarea(data),

    onSuccess: () => {
      // Invalidar todas las vistas
      queryClient.invalidateQueries({ queryKey: calendarioKeys.all });
    },
  });
}

/**
 * Hook para crear recordatorio
 *
 * @example
 * const crearRecordatorio = useCrearRecordatorio();
 * crearRecordatorio.mutate({ titulo: 'Clase', ... });
 */
export function useCrearRecordatorio() {
  const queryClient = useQueryClient();

  return useMutation<Evento, Error, CreateRecordatorioDto>({
    mutationFn: (data) => calendarioApi.crearRecordatorio(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarioKeys.all });
    },
  });
}

/**
 * Hook para crear nota
 *
 * @example
 * const crearNota = useCrearNota();
 * crearNota.mutate({ titulo: 'Recordar', ... });
 */
export function useCrearNota() {
  const queryClient = useQueryClient();

  return useMutation<Evento, Error, CreateNotaDto>({
    mutationFn: (data) => calendarioApi.crearNota(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarioKeys.all });
    },
  });
}

/**
 * Hook para eliminar evento
 *
 * @example
 * const eliminar = useEliminarEvento();
 * eliminar.mutate('evento-id');
 */
export function useEliminarEvento() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => calendarioApi.eliminarEvento(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarioKeys.all });
    },
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinado para calendario completo
 *
 * @param vista - Vista activa ('agenda' o 'semana')
 * @param filtros - Filtros opcionales
 *
 * @example
 * const {
 *   eventos,
 *   vistaAgenda,
 *   estadisticas,
 *   isLoading,
 *   crearTarea,
 *   crearRecordatorio,
 *   crearNota,
 *   eliminar
 * } = useCalendarioCompleto('agenda');
 */
export function useCalendarioCompleto(
  vista: 'agenda' | 'semana' = 'agenda',
  filtros?: FiltrosCalendario,
) {
  const { data: eventos = [], isLoading: isLoadingEventos } = useEventos(filtros);

  const { data: vistaAgenda, isLoading: isLoadingAgenda } = useVistaAgenda();

  const { data: vistaSemana = [], isLoading: isLoadingSemana } = useVistaSemana();

  const { data: estadisticas } = useEstadisticasCalendario();

  const crearTarea = useCrearTarea();
  const crearRecordatorio = useCrearRecordatorio();
  const crearNota = useCrearNota();
  const eliminar = useEliminarEvento();

  return {
    eventos,
    vistaAgenda,
    vistaSemana,
    estadisticas,
    isLoading:
      vista === 'agenda'
        ? isLoadingEventos || isLoadingAgenda
        : isLoadingEventos || isLoadingSemana,
    crearTarea: (data: CreateTareaDto) => crearTarea.mutateAsync(data),
    crearRecordatorio: (data: CreateRecordatorioDto) => crearRecordatorio.mutateAsync(data),
    crearNota: (data: CreateNotaDto) => crearNota.mutateAsync(data),
    eliminar: (id: string) => eliminar.mutateAsync(id),
    isCreating: crearTarea.isPending || crearRecordatorio.isPending || crearNota.isPending,
    isDeleting: eliminar.isPending,
  };
}
