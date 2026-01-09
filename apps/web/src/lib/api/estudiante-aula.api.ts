import apiClient from '../axios';

// ==================== TIPOS ====================

export interface SectorInfo {
  id: string;
  nombre: string;
  color: string;
  icono: string;
}

export interface DocenteInfo {
  id: string;
  nombre: string;
  apellido: string;
}

export interface PlanificacionInfo {
  id: string;
  titulo: string;
  descripcion: string | null;
  cantidad_clases: number;
  mundo_tipo: string;
  casa_tipo: string;
}

export interface GrupoInfo {
  id: string;
  nombre: string;
  codigo: string;
}

export interface ProgresoResumen {
  clases_activas: number;
  clases_completadas: number;
  tareas_total: number;
  tareas_completadas: number;
  porcentaje: number;
}

export interface PlanificacionConProgreso {
  asignacion_id: string;
  planificacion: PlanificacionInfo;
  grupo: GrupoInfo;
  docente: DocenteInfo;
  fecha_inicio: string;
  progreso: ProgresoResumen;
}

export interface SectorConPlanificaciones extends SectorInfo {
  planificaciones: PlanificacionConProgreso[];
}

export interface MiAulaResponse {
  sectores: SectorConPlanificaciones[];
  resumen: {
    total_planificaciones: number;
    total_clases_activas: number;
    total_clases_completadas: number;
    total_tareas: number;
    total_tareas_completadas: number;
  };
}

// Detalle de planificación
export interface ContenidoInfo {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  duracionMinutos: number | null;
  imagenPortada: string | null;
}

export interface TareaClaseInfo {
  id: string;
  contenido: {
    id: string;
    titulo: string;
    tipo: string;
    duracionMinutos: number | null;
  };
  orden: number;
  obligatoria: boolean;
  asignada: boolean;
  tarea_asignada_id: string | null;
  fecha_limite: string | null;
  progreso: {
    estado: string;
    iniciada_en: string | null;
    completada_en: string | null;
    calificacion: number | null;
  } | null;
}

export interface ClaseDetalle {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  teoria:
    | (ContenidoInfo & {
        completada: boolean;
        completada_en: string | null;
        tiempo_segundos: number;
      })
    | null;
  practica:
    | (ContenidoInfo & {
        completada: boolean;
        completada_en: string | null;
        tiempo_segundos: number;
      })
    | null;
  activada: boolean;
  activada_en: string | null;
  tareas: TareaClaseInfo[];
}

export interface PlanificacionDetalleResponse {
  asignacion_id: string;
  planificacion: PlanificacionInfo;
  grupo: GrupoInfo;
  docente: DocenteInfo;
  fecha_inicio: string;
  clases: ClaseDetalle[];
}

// Contenido de lección
export interface NodoContenido {
  id: string;
  tipo: string;
  contenido: string;
  orden: number;
  metadata?: Record<string, unknown>;
}

export interface ContenidoCompleto extends ContenidoInfo {
  nodos: NodoContenido[];
}

export interface ContenidoClaseResponse {
  clase: {
    id: string;
    numero: number;
    titulo: string;
  };
  tipo: 'teoria' | 'practica';
  contenido: ContenidoCompleto;
  progreso: {
    completada: boolean;
    completada_en: string | null;
    tiempo_segundos: number;
  };
}

// Completar lección
export interface CompletarLeccionRequest {
  asignacionId: string;
  claseId: string;
  tipo: 'teoria' | 'practica';
  tiempoSegundos: number;
}

export interface CompletarLeccionResponse {
  success: boolean;
  progreso: {
    teoria_completada: boolean;
    practica_completada: boolean;
  };
  xp_ganado: number;
  mensaje: string;
}

// Tareas
export type EstadoTarea = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'VENCIDA';

export interface ProgresoTarea {
  estado: EstadoTarea;
  iniciada_en: string | null;
  completada_en: string | null;
  tiempo_total_segundos: number;
  intentos: number;
  calificacion: number | null;
}

export interface TareaAsignada {
  tarea_asignada_id: string;
  contenido: ContenidoInfo;
  clase: {
    id: string;
    numero: number;
    titulo: string;
    planificacion: {
      id: string;
      titulo: string;
    };
  };
  obligatoria: boolean;
  fecha_asignacion: string;
  fecha_limite: string | null;
  vencida: boolean;
  grupo: GrupoInfo;
  docente: DocenteInfo;
  asignacion_id: string;
  progreso: ProgresoTarea;
}

export interface MisTareasResponse {
  tareas: TareaAsignada[];
  resumen: {
    total: number;
    pendientes: number;
    en_progreso: number;
    completadas: number;
    vencidas: number;
  };
}

export interface IniciarTareaResponse {
  success: boolean;
  progreso: {
    id: string;
    estado: EstadoTarea;
    iniciada_en: string;
    intentos: number;
  };
  contenido: ContenidoCompleto;
}

export interface CompletarTareaRequest {
  tiempoSegundos: number;
  calificacion?: number;
}

export interface CompletarTareaResponse {
  success: boolean;
  progreso: {
    id: string;
    estado: EstadoTarea;
    completada_en: string;
    calificacion: number | null;
  };
  xp_ganado: number;
  mensaje: string;
  desglose_xp: {
    base: number;
    bonus_calificacion: number;
    bonus_tiempo: number;
  };
}

// Leaderboard
export interface LeaderboardEntry {
  posicion: number;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    avatar: string | null;
    xp_total: number;
  };
  progreso: {
    clases_completadas: number;
    clases_totales: number;
    tareas_completadas: number;
    tareas_totales: number;
    porcentaje: number;
  };
  puntos_planificacion: number;
  es_yo: boolean;
}

export interface LeaderboardResponse {
  planificacion: {
    id: string;
    titulo: string;
    cantidad_clases: number;
  };
  grupo: {
    id: string;
    nombre: string;
  };
  mi_posicion: number;
  total_participantes: number;
  leaderboard: LeaderboardEntry[];
}

// ==================== API FUNCTIONS ====================

/**
 * Obtener resumen del aula virtual del estudiante
 * Incluye planificaciones activas de todos sus grupos con progreso
 */
export async function getMiAula(): Promise<MiAulaResponse> {
  return apiClient.get<MiAulaResponse>('/estudiantes/mi-aula');
}

/**
 * Obtener detalle de una planificación específica
 * Solo muestra clases y contenido que el docente ha activado
 */
export async function getPlanificacionDetalle(
  asignacionId: string,
): Promise<PlanificacionDetalleResponse> {
  return apiClient.get<PlanificacionDetalleResponse>(
    `/estudiantes/aula/planificacion/${asignacionId}`,
  );
}

/**
 * Obtener contenido de una lección (teoría o práctica)
 */
export async function getContenidoClase(
  asignacionId: string,
  claseId: string,
  tipo: 'teoria' | 'practica',
): Promise<ContenidoClaseResponse> {
  return apiClient.get<ContenidoClaseResponse>(
    `/estudiantes/aula/contenido/${asignacionId}/${claseId}/${tipo}`,
  );
}

/**
 * Marcar una lección como completada y obtener XP
 */
export async function completarLeccion(
  data: CompletarLeccionRequest,
): Promise<CompletarLeccionResponse> {
  return apiClient.post<CompletarLeccionResponse>('/estudiantes/aula/completar-leccion', data);
}

/**
 * Obtener tareas asignadas al estudiante
 * @param filtro - 'todas', 'pendientes', 'completadas'
 */
export async function getMisTareas(
  filtro: 'todas' | 'pendientes' | 'completadas' = 'todas',
): Promise<MisTareasResponse> {
  return apiClient.get<MisTareasResponse>(`/estudiantes/mis-tareas`, {
    params: { filtro },
  });
}

/**
 * Iniciar una tarea (marca como EN_PROGRESO)
 */
export async function iniciarTarea(tareaAsignadaId: string): Promise<IniciarTareaResponse> {
  return apiClient.post<IniciarTareaResponse>(`/estudiantes/tareas/${tareaAsignadaId}/iniciar`);
}

/**
 * Completar una tarea y obtener XP
 */
export async function completarTarea(
  tareaAsignadaId: string,
  data: CompletarTareaRequest,
): Promise<CompletarTareaResponse> {
  return apiClient.post<CompletarTareaResponse>(
    `/estudiantes/tareas/${tareaAsignadaId}/completar`,
    data,
  );
}

/**
 * Obtener leaderboard de una planificación
 * Muestra ranking de compañeros del mismo grupo ordenado por progreso
 */
export async function getLeaderboard(asignacionId: string): Promise<LeaderboardResponse> {
  return apiClient.get<LeaderboardResponse>(`/estudiantes/aula/leaderboard/${asignacionId}`);
}
