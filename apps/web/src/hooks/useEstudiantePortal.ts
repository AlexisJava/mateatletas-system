'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  estudiantesApi,
  type MiProgreso,
  type ClaseEstudiante,
  type MiPlan,
  type FeedResponse,
} from '@/lib/api/estudiantes.api';
import {
  getMiAula,
  getPlanificacionDetalle,
  getContenidoClase,
  completarLeccion,
  getMisTareas,
  iniciarTarea,
  completarTarea,
  getLeaderboard,
  type MiAulaResponse,
  type PlanificacionDetalleResponse,
  type ContenidoClaseResponse,
  type CompletarLeccionRequest,
  type CompletarLeccionResponse,
  type MisTareasResponse,
  type IniciarTareaResponse,
  type CompletarTareaRequest,
  type CompletarTareaResponse,
  type LeaderboardResponse,
} from '@/lib/api/estudiante-aula.api';

// ==================== QUERY KEYS ====================

export const estudianteQueryKeys = {
  all: ['estudiante'] as const,
  progreso: () => [...estudianteQueryKeys.all, 'progreso'] as const,
  clases: () => [...estudianteQueryKeys.all, 'clases'] as const,
  proximaClase: () => [...estudianteQueryKeys.all, 'proximaClase'] as const,
  sectores: () => [...estudianteQueryKeys.all, 'sectores'] as const,
  companeros: () => [...estudianteQueryKeys.all, 'companeros'] as const,
  plan: () => [...estudianteQueryKeys.all, 'plan'] as const,
  aula: () => [...estudianteQueryKeys.all, 'aula'] as const,
  planificacion: (asignacionId: string) =>
    [...estudianteQueryKeys.all, 'planificacion', asignacionId] as const,
  contenido: (asignacionId: string, claseId: string, tipo: string) =>
    [...estudianteQueryKeys.all, 'contenido', asignacionId, claseId, tipo] as const,
  tareas: (filtro?: string) => [...estudianteQueryKeys.all, 'tareas', filtro ?? 'todas'] as const,
  leaderboard: (asignacionId: string) =>
    [...estudianteQueryKeys.all, 'leaderboard', asignacionId] as const,
  feed: (tipo?: string) => [...estudianteQueryKeys.all, 'feed', tipo ?? 'global'] as const,
};

// ==================== HOOKS DE LECTURA ====================

/**
 * Hook para obtener el progreso consolidado del estudiante
 *
 * Incluye: XP, nivel, racha, logros recientes, actividad reciente
 *
 * @example
 * const { data: progreso, isLoading } = useMiProgreso();
 * // progreso.gamificacion.xpTotal, progreso.racha.rachaActual, etc.
 */
export function useMiProgreso() {
  return useQuery<MiProgreso>({
    queryKey: estudianteQueryKeys.progreso(),
    queryFn: () => estudiantesApi.getMiProgreso(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos en cache
  });
}

/**
 * Hook para obtener todas las clases del estudiante
 *
 * @example
 * const { data: clases } = useMisClases();
 * const clasesHoy = clases?.filter(c => esHoy(c.fechaProxima));
 */
export function useMisClases() {
  return useQuery<ClaseEstudiante[]>({
    queryKey: estudianteQueryKeys.clases(),
    queryFn: () => estudiantesApi.getMisClases(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener la próxima clase del estudiante
 *
 * @example
 * const { data: proximaClase } = useProximaClase();
 * if (proximaClase) { console.log(proximaClase.docente.nombre); }
 */
export function useProximaClase() {
  return useQuery({
    queryKey: estudianteQueryKeys.proximaClase(),
    queryFn: () => estudiantesApi.getProximaClase(),
    staleTime: 1000 * 60 * 1, // 1 minuto
  });
}

/**
 * Hook para obtener los sectores/mundos del estudiante
 *
 * @example
 * const { data: sectores } = useMisSectores();
 * // sectores contiene Matemática, Programación, Ciencias con sus grupos
 */
export function useMisSectores() {
  return useQuery({
    queryKey: estudianteQueryKeys.sectores(),
    queryFn: () => estudiantesApi.getMisSectores(),
    staleTime: 1000 * 60 * 10, // 10 minutos (datos estáticos)
  });
}

/**
 * Hook para obtener los compañeros del ClaseGrupo
 *
 * @example
 * const { data: companeros } = useMisCompaneros();
 * // Ordenados por puntos descendente
 */
export function useMisCompaneros() {
  return useQuery({
    queryKey: estudianteQueryKeys.companeros(),
    queryFn: () => estudiantesApi.getMisCompaneros(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener el plan de suscripción del estudiante
 *
 * @example
 * const { data: plan } = useMiPlan();
 * if (plan?.accesoClasesVivo) { // mostrar botón de clase en vivo }
 */
export function useMiPlan() {
  return useQuery<MiPlan>({
    queryKey: estudianteQueryKeys.plan(),
    queryFn: () => estudiantesApi.getMiPlan(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener el aula virtual con planificaciones activas
 *
 * @example
 * const { data: aula } = useMiAula();
 * // aula.sectores contiene planificaciones por sector con progreso
 */
export function useMiAula() {
  return useQuery<MiAulaResponse>({
    queryKey: estudianteQueryKeys.aula(),
    queryFn: () => getMiAula(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener el detalle de una planificación
 *
 * @param asignacionId - ID de la asignación de planificación
 *
 * @example
 * const { data: planificacion } = usePlanificacionDetalle(asignacionId);
 * // planificacion.clases contiene las clases activadas con contenido
 */
export function usePlanificacionDetalle(asignacionId: string | undefined) {
  return useQuery<PlanificacionDetalleResponse>({
    queryKey: estudianteQueryKeys.planificacion(asignacionId ?? ''),
    queryFn: () => getPlanificacionDetalle(asignacionId!),
    enabled: !!asignacionId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener el contenido de una lección (teoría/práctica)
 *
 * @param asignacionId - ID de la asignación
 * @param claseId - ID de la clase
 * @param tipo - 'teoria' o 'practica'
 *
 * @example
 * const { data: contenido } = useContenidoClase(asignacionId, claseId, 'teoria');
 * // contenido.contenido.nodos contiene los bloques de contenido
 */
export function useContenidoClase(
  asignacionId: string | undefined,
  claseId: string | undefined,
  tipo: 'teoria' | 'practica',
) {
  return useQuery<ContenidoClaseResponse>({
    queryKey: estudianteQueryKeys.contenido(asignacionId ?? '', claseId ?? '', tipo),
    queryFn: () => getContenidoClase(asignacionId!, claseId!, tipo),
    enabled: !!asignacionId && !!claseId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener las tareas asignadas al estudiante
 *
 * @param filtro - 'todas' | 'pendientes' | 'completadas'
 *
 * @example
 * const { data: tareas } = useMisTareas('pendientes');
 * // tareas.tareas es el array, tareas.resumen tiene contadores
 */
export function useMisTareas(filtro: 'todas' | 'pendientes' | 'completadas' = 'todas') {
  return useQuery<MisTareasResponse>({
    queryKey: estudianteQueryKeys.tareas(filtro),
    queryFn: () => getMisTareas(filtro),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener el leaderboard de una planificación
 *
 * @param asignacionId - ID de la asignación
 *
 * @example
 * const { data: leaderboard } = useLeaderboard(asignacionId);
 * // leaderboard.leaderboard es el ranking ordenado
 */
export function useLeaderboard(asignacionId: string | undefined) {
  return useQuery<LeaderboardResponse>({
    queryKey: estudianteQueryKeys.leaderboard(asignacionId ?? ''),
    queryFn: () => getLeaderboard(asignacionId!),
    enabled: !!asignacionId,
    staleTime: 1000 * 60 * 1, // 1 minuto
  });
}

/**
 * Hook para obtener el feed de actividades
 *
 * @param tipo - 'global' | 'casa' | 'comision' | 'mias'
 *
 * @example
 * const { data: feed } = useFeed('casa');
 * // feed.data contiene los items del feed
 */
export function useFeed(tipo: 'global' | 'casa' | 'comision' | 'mias' = 'global') {
  return useQuery<FeedResponse>({
    queryKey: estudianteQueryKeys.feed(tipo),
    queryFn: () => {
      switch (tipo) {
        case 'casa':
          return estudiantesApi.getFeedMiCasa();
        case 'comision':
          return estudiantesApi.getFeedMiComision();
        case 'mias':
          return estudiantesApi.getMisActividades();
        default:
          return estudiantesApi.getFeed();
      }
    },
    staleTime: 1000 * 30, // 30 segundos (feed es dinámico)
  });
}

// ==================== HOOKS DE MUTACIÓN ====================

/**
 * Hook para marcar una lección como completada
 *
 * @example
 * const { mutate: completar } = useCompletarLeccion();
 * completar({ asignacionId, claseId, tipo: 'teoria', tiempoSegundos: 300 });
 */
export function useCompletarLeccion() {
  const queryClient = useQueryClient();

  return useMutation<CompletarLeccionResponse, Error, CompletarLeccionRequest>({
    mutationFn: (data) => completarLeccion(data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.progreso() });
      queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.aula() });
      queryClient.invalidateQueries({
        queryKey: estudianteQueryKeys.planificacion(variables.asignacionId),
      });
      queryClient.invalidateQueries({
        queryKey: estudianteQueryKeys.contenido(
          variables.asignacionId,
          variables.claseId,
          variables.tipo,
        ),
      });
    },
  });
}

/**
 * Hook para iniciar una tarea
 *
 * @example
 * const { mutate: iniciar } = useIniciarTarea();
 * iniciar(tareaAsignadaId);
 */
export function useIniciarTarea() {
  const queryClient = useQueryClient();

  return useMutation<IniciarTareaResponse, Error, string>({
    mutationFn: (tareaAsignadaId) => iniciarTarea(tareaAsignadaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.tareas() });
    },
  });
}

/**
 * Hook para completar una tarea
 *
 * @example
 * const { mutate: completar } = useCompletarTarea();
 * completar({ tareaAsignadaId, data: { tiempoSegundos: 600 } });
 */
export function useCompletarTarea() {
  const queryClient = useQueryClient();

  return useMutation<
    CompletarTareaResponse,
    Error,
    { tareaAsignadaId: string; data: CompletarTareaRequest }
  >({
    mutationFn: ({ tareaAsignadaId, data }) => completarTarea(tareaAsignadaId, data),
    onSuccess: () => {
      // Invalidar todas las queries de tareas y progreso
      queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.tareas() });
      queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.progreso() });
      queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.aula() });
    },
  });
}

/**
 * Hook para agregar reacción a una actividad del feed
 *
 * @example
 * const { mutate: reaccionar } = useAddReaction();
 * reaccionar({ actividadId, emoji: '🎉' });
 */
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { actividadId: string; emoji: string }>({
    mutationFn: ({ actividadId, emoji }) => estudiantesApi.addReaction(actividadId, emoji),
    onSuccess: () => {
      // Invalidar todas las queries de feed
      queryClient.invalidateQueries({ queryKey: [...estudianteQueryKeys.all, 'feed'] });
    },
  });
}

/**
 * Hook para eliminar reacción de una actividad del feed
 *
 * @example
 * const { mutate: quitarReaccion } = useRemoveReaction();
 * quitarReaccion({ actividadId, emoji: '🎉' });
 */
export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { actividadId: string; emoji: string }>({
    mutationFn: ({ actividadId, emoji }) => estudiantesApi.removeReaction(actividadId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...estudianteQueryKeys.all, 'feed'] });
    },
  });
}

// ==================== HOOKS UTILITARIOS ====================

/**
 * Hook para invalidar manualmente el cache del estudiante
 *
 * @example
 * const invalidate = useInvalidateEstudianteCache();
 * invalidate.all(); // Invalida todo
 * invalidate.progreso(); // Solo progreso
 */
export function useInvalidateEstudianteCache() {
  const queryClient = useQueryClient();

  return {
    all: () => queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.all }),
    progreso: () => queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.progreso() }),
    clases: () => queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.clases() }),
    aula: () => queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.aula() }),
    tareas: () => queryClient.invalidateQueries({ queryKey: estudianteQueryKeys.tareas() }),
    feed: () => queryClient.invalidateQueries({ queryKey: [...estudianteQueryKeys.all, 'feed'] }),
  };
}

/**
 * Hook combinado para obtener datos del dashboard principal
 *
 * Combina múltiples queries en un solo hook para el Main Menu
 *
 * @example
 * const { progreso, clases, proximaClase, isLoading } = useDashboardData();
 */
export function useDashboardData() {
  const progresoQuery = useMiProgreso();
  const clasesQuery = useMisClases();
  const proximaClaseQuery = useProximaClase();

  return {
    progreso: progresoQuery.data,
    clases: clasesQuery.data,
    proximaClase: proximaClaseQuery.data,
    isLoading: progresoQuery.isLoading || clasesQuery.isLoading || proximaClaseQuery.isLoading,
    isError: progresoQuery.isError || clasesQuery.isError || proximaClaseQuery.isError,
    error: progresoQuery.error ?? clasesQuery.error ?? proximaClaseQuery.error,
  };
}
