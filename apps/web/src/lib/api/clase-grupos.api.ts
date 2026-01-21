/**
 * API client para ClaseGrupos (grupos de clases recurrentes)
 */

import axios from '@/lib/axios';
import type { ClaseGrupo, CrearClaseGrupoDto, ListarClaseGruposParams } from '@/types/clase-grupo';

// Re-exportar tipos para uso en otros módulos
export type { ClaseGrupo, CrearClaseGrupoDto, ListarClaseGruposParams };

/**
 * Transforma un objeto ClaseGrupo del backend (snake_case) al formato frontend (camelCase)
 */
function transformClaseGrupo(raw: Record<string, unknown>): ClaseGrupo {
  return {
    id: raw.id as string,
    codigo: raw.codigo as string,
    nombre: raw.nombre as string,
    tipo: raw.tipo as ClaseGrupo['tipo'],
    diaSemana: (raw.diaSemana || raw.diaSemana) as ClaseGrupo['diaSemana'],
    horaInicio: (raw.horaInicio || raw.horaInicio) as string,
    horaFin: (raw.horaFin || raw.horaFin) as string,
    fechaInicio: (raw.fechaInicio || raw.fechaInicio) as string,
    fechaFin: (raw.fechaFin || raw.fechaFin) as string,
    anioLectivo: (raw.anioLectivo || raw.anioLectivo) as number,
    cupoMaximo: (raw.cupoMaximo || raw.cupoMaximo) as number,
    activo: raw.activo as boolean,
    docenteId: (raw.docenteId || raw.docenteId) as string,
    productoId: (raw.productoId || raw.productoId) as string | undefined,
    grupoId: (raw.grupoId || raw.grupoId) as string | undefined,
    rutaCurricularId: (raw.rutaCurricularId || raw.rutaCurricularId) as string | undefined,
    sectorId: (raw.sectorId || raw.sectorId) as string | undefined,
    nivel: raw.nivel as string | undefined,
    createdAt: (raw.createdAt || raw.createdAt) as string,
    updatedAt: (raw.updatedAt || raw.updatedAt) as string,
    // Relations
    docente: raw.docente as ClaseGrupo['docente'],
    rutaCurricular: raw.rutaCurricular as ClaseGrupo['rutaCurricular'],
    sector: raw.sector as ClaseGrupo['sector'],
    inscripciones: raw.inscripciones as ClaseGrupo['inscripciones'],
    // Computed fields
    totalInscriptos: (raw.totalInscriptos || raw.totalInscriptos) as number | undefined,
    totalAsistencias: (raw.totalAsistencias || raw.totalAsistencias) as number | undefined,
    cuposDisponibles: (raw.cuposDisponibles || raw.cuposDisponibles) as number | undefined,
  };
}

/**
 * Crear un nuevo ClaseGrupo
 */
export async function crearClaseGrupo(data: CrearClaseGrupoDto): Promise<ClaseGrupo> {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.post<ClaseGrupo>('/admin/clase-grupos', data);
    return response;
  } catch (error) {
    console.error('Error al crear el grupo de clases:', error);
    throw error;
  }
}

/**
 * Listar ClaseGrupos con filtros opcionales
 *
 * NOTA: El interceptor de axios hace unwrap de { data: ... } automáticamente.
 * El backend retorna { success, data: [...], total } pero el interceptor
 * extrae solo el contenido de "data", así que recibimos el array directamente.
 */
export async function listarClaseGrupos(params?: ListarClaseGruposParams): Promise<{
  success: boolean;
  data: ClaseGrupo[];
  total: number;
}> {
  const queryParams = new URLSearchParams();

  if (params?.anioLectivo) {
    queryParams.append('anioLectivo', params.anioLectivo.toString());
  }
  if (params?.activo !== undefined) {
    queryParams.append('activo', params.activo.toString());
  }
  if (params?.docenteId) {
    queryParams.append('docenteId', params.docenteId);
  }
  if (params?.tipo) {
    queryParams.append('tipo', params.tipo);
  }
  // FASE 3: Filtro por producto (para listar horarios de un Club)
  if (params?.productoId) {
    queryParams.append('productoId', params.productoId);
  }
  if (params?.grupoId) {
    queryParams.append('grupoId', params.grupoId);
  }

  const queryString = queryParams.toString();
  const url = `/admin/clase-grupos${queryString ? `?${queryString}` : ''}`;

  try {
    // El backend retorna { success, data: [...], total }
    const response = await axios.get<{
      success: boolean;
      data: Record<string, unknown>[];
      total: number;
    }>(url);

    // Transformar snake_case a camelCase
    const rawData = Array.isArray(response) ? response : response?.data || [];
    const claseGrupos = rawData.map(transformClaseGrupo);

    return {
      success: true,
      data: claseGrupos,
      total: claseGrupos.length,
    };
  } catch (error) {
    console.error('Error al listar los grupos de clases:', error);
    throw error;
  }
}

/**
 * Obtener un ClaseGrupo por ID con todos sus detalles
 */
export async function obtenerClaseGrupo(id: string): Promise<{
  success: boolean;
  data: ClaseGrupo;
}> {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<{
      success: boolean;
      data: ClaseGrupo;
    }>(`/admin/clase-grupos/${id}`);

    return response;
  } catch (error) {
    console.error('Error al obtener el grupo de clases:', error);
    throw error;
  }
}

/**
 * DTO para actualizar un ClaseGrupo (todos los campos opcionales)
 */
export interface ActualizarClaseGrupoDto {
  codigo?: string;
  nombre?: string;
  tipo?: 'GRUPO_REGULAR' | 'CURSO_TEMPORAL';
  diaSemana?: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
  horaInicio?: string;
  horaFin?: string;
  fechaInicio?: string;
  fechaFin?: string;
  cupoMaximo?: number;
  docenteId?: string;
  activo?: boolean;
}

/**
 * Actualizar un ClaseGrupo existente
 * PUT /admin/clase-grupos/:id
 */
export async function actualizarClaseGrupo(
  id: string,
  data: ActualizarClaseGrupoDto,
): Promise<ClaseGrupo> {
  try {
    const response = await axios.put<ClaseGrupo>(`/admin/clase-grupos/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error al actualizar el grupo de clases:', error);
    throw error;
  }
}

/**
 * Eliminar/Desactivar un ClaseGrupo
 * DELETE /admin/clase-grupos/:id - soft delete (desactiva)
 * DELETE /admin/clase-grupos/:id?permanent=true - hard delete (elimina permanentemente)
 *
 * @param id - ID del ClaseGrupo
 * @param permanent - Si true, elimina permanentemente (solo si no tiene inscripciones activas)
 */
export async function eliminarClaseGrupo(
  id: string,
  permanent: boolean = false,
): Promise<{ success: boolean; message: string }> {
  try {
    const url = permanent
      ? `/admin/clase-grupos/${id}?permanent=true`
      : `/admin/clase-grupos/${id}`;
    const response = await axios.delete<{ success: boolean; message: string }>(url);
    return response;
  } catch (error) {
    console.error('Error al eliminar el grupo de clases:', error);
    throw error;
  }
}

/**
 * =============================================================================
 * ENDPOINTS PARA DOCENTES - Portal Docente
 * =============================================================================
 */

/**
 * Equipo del estudiante (gamificación)
 */
export interface EquipoDto {
  nombre: string;
  color: string;
}

/**
 * Estadísticas individuales del estudiante en el grupo
 */
export interface EstadisticasEstudianteDto {
  puntosTotal: number;
  clasesAsistidas: number;
  porcentajeAsistencia: number;
  tareasCompletadas: number;
  tareasTotal: number;
  ultimaAsistencia: string | null;
}

/**
 * Estudiante inscrito con sus estadísticas completas
 */
export interface EstudianteConStatsDto {
  id: string;
  nombre: string;
  apellido: string;
  avatarUrl: string | null;
  equipo: EquipoDto | null;
  stats: EstadisticasEstudianteDto;
}

/**
 * Tarea asignada al grupo
 */
export interface TareaGrupoDto {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaAsignacion: string;
  fechaVencimiento: string | null;
  completadas: number;
  pendientes: number;
}

/**
 * Tipo de observación (clasificada por sentiment analysis)
 */
export type TipoObservacion = 'positiva' | 'neutral' | 'atencion';

/**
 * Observación reciente del grupo
 */
export interface ObservacionRecienteDto {
  id: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    avatarUrl?: string | null;
  };
  observacion: string;
  fecha: string;
  estado: 'Presente' | 'Ausente' | 'Justificado' | 'Pendiente';
  tipo: TipoObservacion;
}

/**
 * Ruta curricular del grupo
 */
export interface RutaCurricularDto {
  id: string;
  nombre: string;
  color: string | null;
}

/**
 * Estadísticas generales del grupo
 */
export interface StatsGrupoDto {
  totalEstudiantes: number;
  asistenciaPromedio: number;
  puntosPromedio: number;
  tareasCompletadasPromedio: number;
}

/**
 * Próxima clase del grupo
 */
export interface ProximaClaseDto {
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  minutosParaEmpezar: number | null; // Solo si es hoy
}

/**
 * Response completo del endpoint GET /clase-grupos/:id/detalle-completo
 */
export interface GrupoDetalleCompletoDto {
  id: string;
  nombre: string;
  codigo: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
  rutaCurricular: RutaCurricularDto | null;
  estudiantes: EstudianteConStatsDto[];
  tareas: TareaGrupoDto[];
  observacionesRecientes: ObservacionRecienteDto[];
  stats: StatsGrupoDto;
  proximaClase: ProximaClaseDto | null;
  docenteId: string;
  activo: boolean;
}

/**
 * Obtener detalle completo de un grupo de clase (PARA DOCENTES)
 * GET /api/clase-grupos/:id/detalle-completo
 *
 * Incluye:
 * - Estudiantes con estadísticas (asistencia, puntos, última clase)
 * - Tareas del grupo
 * - Observaciones recientes
 * - Próxima clase
 *
 * Requiere: Rol Docente (titular del grupo) o Admin
 */
export async function obtenerDetalleCompletoGrupo(
  claseGrupoId: string,
): Promise<GrupoDetalleCompletoDto> {
  try {
    const response = await axios.get<GrupoDetalleCompletoDto>(
      `/clase-grupos/${claseGrupoId}/detalle-completo`,
    );
    return response;
  } catch (error) {
    console.error('Error al obtener detalle completo del grupo:', error);
    throw error;
  }
}
