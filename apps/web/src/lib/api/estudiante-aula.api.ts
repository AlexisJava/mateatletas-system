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
  cantidadClases: number;
  mundoTipo: string;
  casaTipo: string;
}

export interface GrupoInfo {
  id: string;
  nombre: string;
  codigo: string;
}

export interface ProgresoResumen {
  clasesActivas: number;
  clasesCompletadas: number;
  tareasTotal: number;
  tareasCompletadas: number;
  porcentaje: number;
}

export interface PlanificacionConProgreso {
  asignacionId: string;
  planificacion: PlanificacionInfo;
  grupo: GrupoInfo;
  docente: DocenteInfo;
  fechaInicio: string;
  progreso: ProgresoResumen;
}

export interface SectorConPlanificaciones extends SectorInfo {
  planificaciones: PlanificacionConProgreso[];
}

export interface MiAulaResponse {
  sectores: SectorConPlanificaciones[];
  resumen: {
    totalPlanificaciones: number;
    totalClasesActivas: number;
    totalClasesCompletadas: number;
    totalTareas: number;
    totalTareasCompletadas: number;
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
  tareaAsignadaId: string | null;
  fechaLimite: string | null;
  progreso: {
    estado: string;
    iniciadaEn: string | null;
    completadaEn: string | null;
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
        completadaEn: string | null;
        tiempoSegundos: number;
      })
    | null;
  practica:
    | (ContenidoInfo & {
        completada: boolean;
        completadaEn: string | null;
        tiempoSegundos: number;
      })
    | null;
  activada: boolean;
  activadaEn: string | null;
  tareas: TareaClaseInfo[];
}

export interface PlanificacionDetalleResponse {
  asignacionId: string;
  planificacion: PlanificacionInfo;
  grupo: GrupoInfo;
  docente: DocenteInfo;
  fechaInicio: string;
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
    completadaEn: string | null;
    tiempoSegundos: number;
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
    teoriaCompletada: boolean;
    practicaCompletada: boolean;
  };
  xpGanado: number;
  mensaje: string;
}

// Tareas
export type EstadoTarea = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'VENCIDA';

export interface ProgresoTarea {
  estado: EstadoTarea;
  iniciadaEn: string | null;
  completadaEn: string | null;
  tiempoTotalSegundos: number;
  intentos: number;
  calificacion: number | null;
}

export interface TareaAsignada {
  tareaAsignadaId: string;
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
  fechaAsignacion: string;
  fechaLimite: string | null;
  vencida: boolean;
  grupo: GrupoInfo;
  docente: DocenteInfo;
  asignacionId: string;
  progreso: ProgresoTarea;
}

export interface MisTareasResponse {
  tareas: TareaAsignada[];
  resumen: {
    total: number;
    pendientes: number;
    enProgreso: number;
    completadas: number;
    vencidas: number;
  };
}

export interface IniciarTareaResponse {
  success: boolean;
  progreso: {
    id: string;
    estado: EstadoTarea;
    iniciadaEn: string;
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
    completadaEn: string;
    calificacion: number | null;
  };
  xpGanado: number;
  mensaje: string;
  desgloseXp: {
    base: number;
    bonusCalificacion: number;
    bonusTiempo: number;
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
    xpTotal: number;
  };
  progreso: {
    clasesCompletadas: number;
    clasesTotales: number;
    tareasCompletadas: number;
    tareasTotales: number;
    porcentaje: number;
  };
  puntosPlanificacion: number;
  esYo: boolean;
}

export interface LeaderboardResponse {
  planificacion: {
    id: string;
    titulo: string;
    cantidadClases: number;
  };
  grupo: {
    id: string;
    nombre: string;
  };
  miPosicion: number;
  totalParticipantes: number;
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
