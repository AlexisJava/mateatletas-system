import { EstadoAsistencia } from '@prisma/client';

/**
 * DTOs para el endpoint GET /clase-grupos/:id/detalle-completo
 * Provee TODA la información necesaria para la vista de detalles del grupo
 * Sin `any` ni `unknown` - TypeScript estricto
 */

/**
 * Casa del estudiante (gamificación 2026)
 */
export interface CasaDto {
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
  avatar_gradient: number;
  casa: CasaDto | null;
  stats: EstadisticasEstudianteDto;
}

/**
 * Tarea asignada al grupo
 */
export interface TareaGrupoDto {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  estado: string;
  estudiantesCompletaron: string[]; // IDs de estudiantes
  estudiantesPendientes: string[]; // IDs de estudiantes
}

/**
 * Tipo de observación
 */
export type TipoObservacion = 'positiva' | 'neutral' | 'atencion';

/**
 * Observación reciente de un estudiante
 */
export interface ObservacionRecienteDto {
  id: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
  };
  observacion: string;
  fecha: string;
  estado: EstadoAsistencia;
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
 * Información de la próxima clase
 */
export interface ProximaClaseDto {
  fecha: string; // Próximo día que coincide con dia_semana
  hora: string; // hora_inicio del grupo
  minutosParaEmpezar: number | null; // null si no es hoy
}

/**
 * Response completo del endpoint de detalle de grupo
 * Contiene TODA la información necesaria para renderizar la vista
 */
export interface GrupoDetalleCompletoDto {
  // Info básica del grupo
  id: string;
  nombre: string;
  codigo: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
  rutaCurricular: RutaCurricularDto | null;

  // Estudiantes con estadísticas completas
  estudiantes: EstudianteConStatsDto[];

  // Tareas asignadas
  tareas: TareaGrupoDto[];

  // Observaciones recientes
  observacionesRecientes: ObservacionRecienteDto[];

  // Estadísticas del grupo
  stats: StatsGrupoDto;

  // Próxima clase
  proximaClase: ProximaClaseDto | null;

  // Metadata
  docenteId: string;
  activo: boolean;
}
