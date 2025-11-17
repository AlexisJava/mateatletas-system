/**
 * API client para ClaseGrupos (grupos de clases recurrentes)
 */

import axios from '@/lib/axios';
import type {
  ClaseGrupo,
  CrearClaseGrupoDto,
  ListarClaseGruposParams,
} from '@/types/clase-grupo';

// Re-exportar tipos para uso en otros módulos
export type { ClaseGrupo, CrearClaseGrupoDto, ListarClaseGruposParams };

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
 */
export async function listarClaseGrupos(
  params?: ListarClaseGruposParams
): Promise<{
  success: boolean;
  data: ClaseGrupo[];
  total: number;
}> {
  const queryParams = new URLSearchParams();

  if (params?.anioLectivo) {
    queryParams.append('anio_lectivo', params.anioLectivo.toString());
  }
  if (params?.activo !== undefined) {
    queryParams.append('activo', params.activo.toString());
  }
  if (params?.docenteId) {
    queryParams.append('docente_id', params.docenteId);
  }
  if (params?.tipo) {
    queryParams.append('tipo', params.tipo);
  }

  const queryString = queryParams.toString();
  const url = `/admin/clase-grupos${queryString ? `?${queryString}` : ''}`;

    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<{
      success: boolean;
      data: ClaseGrupo[];
      total: number;
    }>(url);

    return response;
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
  avatar_url: string | null;
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
    avatar_url?: string | null;
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
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
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
