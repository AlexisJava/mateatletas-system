/**
 * Cliente API para Planificaciones Simples
 *
 * Sistema de planificaciones auto-detectables con Convention over Configuration
 */

import apiClient from '../axios';

// ============================================================================
// TYPES
// ============================================================================

export interface PlanificacionSimple {
  id: string;
  codigo: string;
  titulo: string;
  grupo_codigo: string;
  mes: number | null;
  anio: number;
  semanas_total: number;
  archivo_path: string;
  estado: 'DETECTADA' | 'ASIGNADA' | 'ARCHIVADA';
  auto_detectada: boolean;
  fecha_deteccion: string;
  ultima_actualizacion: string;
  asignaciones?: AsignacionPlanificacion[];
  _count?: {
    progresosEstudiantes: number;
  };
}

export interface AsignacionPlanificacion {
  id: string;
  planificacion_id: string;
  docente_id: string;
  clase_grupo_id: string;
  fecha_asignacion: string;
  activa: boolean;
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  claseGrupo?: {
    id: string;
    nombre: string;
  };
  semanasActivas?: SemanaActiva[];
}

export interface SemanaActiva {
  id: string;
  asignacion_id: string;
  semana_numero: number;
  fecha_activacion: string;
  activa: boolean;
}

export interface DetallePlanificacion extends PlanificacionSimple {
  asignaciones: AsignacionPlanificacion[];
  progresosEstudiantes: ProgresoEstudiante[];
}

export interface ProgresoEstudiante {
  id: string;
  estudiante_id: string;
  planificacion_id: string;
  semana_actual: number;
  tiempo_total_minutos: number;
  puntos_totales: number;
  estado_guardado: any;
  ultima_actividad: string;
  estudiante?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface FiltrosPlanificaciones {
  estado?: 'DETECTADA' | 'ASIGNADA' | 'ARCHIVADA';
  grupo_codigo?: string;
  mes?: number;
  anio?: number;
}

// ============================================================================
// API CLIENT METHODS
// ============================================================================

/**
 * Listar todas las planificaciones detectadas (Admin)
 */
export async function listarPlanificaciones(
  filtros?: FiltrosPlanificaciones,
): Promise<PlanificacionSimple[]> {
  const params = new URLSearchParams();

  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.grupo_codigo) params.append('grupo_codigo', filtros.grupo_codigo);
  if (filtros?.mes) params.append('mes', filtros.mes.toString());
  if (filtros?.anio) params.append('anio', filtros.anio.toString());

  const query = params.toString();
  const url = `/planificaciones${query ? `?${query}` : ''}`;

  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.get<PlanificacionSimple[]>(url)).data;
    return response;
  } catch (error) {
    console.error('Error al listar las planificaciones simples:', error);
    throw error;
  }
}

/**
 * Obtener detalle completo de una planificación (Admin)
 */
export async function obtenerDetallePlanificacion(
  codigo: string,
): Promise<DetallePlanificacion> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.get<DetallePlanificacion>(
      `/planificaciones/${codigo}/detalle`,
    )).data;
    return response;
  } catch (error) {
    console.error('Error al obtener el detalle de la planificación simple:', error);
    throw error;
  }
}

/**
 * Asignar planificación a docente y grupo (Admin)
 */
export async function asignarPlanificacion(
  codigo: string,
  docenteId: string,
  claseGrupoId: string,
): Promise<AsignacionPlanificacion> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.post<AsignacionPlanificacion>(
      `/planificaciones/${codigo}/asignar`,
      {
        docente_id: docenteId,
        clase_grupo_id: claseGrupoId,
      },
    )).data;
    return response;
  } catch (error) {
    console.error('Error al asignar la planificación simple:', error);
    throw error;
  }
}

/**
 * Obtener todas las planificaciones del estudiante (Estudiante)
 */
export async function misPlanificaciones(): Promise<Array<{
  codigo: string;
  titulo: string;
  grupo_codigo: string;
  mes: number | null;
  anio: number;
  semanas_total: number;
  progreso: {
    semana_actual: number;
    puntos_totales: number;
    tiempo_total_minutos: number;
    ultima_actividad: string;
  };
}>> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await apiClient.get('/planificaciones/mis-planificaciones');
    return response as Array<{
      codigo: string;
      titulo: string;
      grupo_codigo: string;
      mes: number | null;
      anio: number;
      semanas_total: number;
      progreso: {
        semana_actual: number;
        puntos_totales: number;
        tiempo_total_minutos: number;
        ultima_actividad: string;
      };
    }>;
  } catch (error) {
    console.error('Error al obtener planificaciones del estudiante:', error);
    throw error;
  }
}

/**
 * Obtener progreso del estudiante (Estudiante)
 */
export async function obtenerProgreso(codigo: string): Promise<{
  progreso: ProgresoEstudiante | null;
  semanasActivas: number[];
}> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.get<{
      progreso: ProgresoEstudiante | null;
      semanasActivas: number[];
    }>(`/planificaciones/${codigo}/progreso`)).data;
    return response;
  } catch (error) {
    console.error('Error al obtener el progreso de la planificación simple:', error);
    throw error;
  }
}

/**
 * Guardar estado del juego (Estudiante)
 */
export async function guardarEstado(
  codigo: string,
  estadoGuardado: any,
): Promise<{ success: boolean }> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.put<{ success: boolean }>(
      `/planificaciones/${codigo}/progreso`,
      { estado_guardado: estadoGuardado },
    )).data;
    return response;
  } catch (error) {
    console.error('Error al guardar el estado de la planificación simple:', error);
    throw error;
  }
}

/**
 * Avanzar a la siguiente semana (Estudiante)
 */
export async function avanzarSemana(
  codigo: string,
): Promise<{ success: boolean; nueva_semana: number }> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.post<{ success: boolean; nueva_semana: number }>(
      `/planificaciones/${codigo}/progreso/avanzar`,
    )).data;
    return response;
  } catch (error) {
    console.error('Error al avanzar la semana en la planificación simple:', error);
    throw error;
  }
}

/**
 * Completar semana con puntos (Estudiante)
 */
export async function completarSemana(
  codigo: string,
  semana: number,
  puntos: number,
): Promise<{ success: boolean }> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.post<{ success: boolean }>(
      `/planificaciones/${codigo}/progreso/completar-semana`,
      { semana, puntos },
    )).data;
    return response;
  } catch (error) {
    console.error('Error al completar la semana en la planificación simple:', error);
    throw error;
  }
}

/**
 * Registrar tiempo jugado (Estudiante)
 */
export async function registrarTiempo(
  codigo: string,
  minutos: number,
): Promise<{ success: boolean; tiempo_total: number }> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.post<{ success: boolean; tiempo_total: number }>(
      `/planificaciones/${codigo}/progreso/tiempo`,
      { minutos },
    )).data;
    return response;
  } catch (error) {
    console.error('Error al registrar el tiempo en la planificación simple:', error);
    throw error;
  }
}

// ============================================================================
// MÉTODOS DOCENTE
// ============================================================================

/**
 * Listar asignaciones del docente autenticado (Docente)
 */
export async function misAsignaciones(): Promise<
  Array<{
    id: string;
    planificacion: PlanificacionSimple;
    claseGrupo: { id: string; nombre: string };
    semanas_activas: SemanaActiva[];
  }>
> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await apiClient.get('/planificaciones/mis-asignaciones');
    return response as Array<{
      id: string;
      planificacion: PlanificacionSimple;
      claseGrupo: { id: string; nombre: string };
      semanas_activas: SemanaActiva[];
    }>;
  } catch (error) {
    console.error('Error al obtener las asignaciones del docente:', error);
    throw error;
  }
}

/**
 * Activar una semana específica (Docente)
 */
export async function activarSemana(
  asignacionId: string,
  semanaNumero: number,
): Promise<SemanaActiva> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.post<SemanaActiva>(
      `/planificaciones/asignacion/${asignacionId}/semana/${semanaNumero}/activar`,
    )).data;
    return response;
  } catch (error) {
    console.error('Error al activar la semana en la planificación simple:', error);
    throw error;
  }
}

/**
 * Desactivar una semana específica (Docente)
 */
export async function desactivarSemana(
  asignacionId: string,
  semanaNumero: number,
): Promise<{ success: boolean; message: string }> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await apiClient.post<{ success: boolean; message: string }>(
      `/planificaciones/asignacion/${asignacionId}/semana/${semanaNumero}/desactivar`,
    )).data;
    return response;
  } catch (error) {
    console.error('Error al desactivar la semana en la planificación simple:', error);
    throw error;
  }
}

/**
 * Ver progreso de estudiantes en una asignación (Docente)
 */
export async function verProgresoEstudiantes(asignacionId: string): Promise<{
  asignacion: { id: string; grupo: { id: string; nombre: string } };
  planificacion: { codigo: string; titulo: string; semanas_total: number };
  progresos: ProgresoEstudiante[];
}> {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await apiClient.get(
      `/planificaciones/asignacion/${asignacionId}/progreso`,
    );
    return response as {
      asignacion: { id: string; grupo: { id: string; nombre: string } };
      planificacion: { codigo: string; titulo: string; semanas_total: number };
      progresos: ProgresoEstudiante[];
    };
  } catch (error) {
    console.error('Error al ver el progreso de estudiantes en la planificación simple:', error);
    throw error;
  }
}
