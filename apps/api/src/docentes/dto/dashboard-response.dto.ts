/**
 * DTOs para respuesta del Dashboard del Docente
 *
 * TIPOS FUERTES - NO any, NO unknown
 * INFORMACIÓN BRUTAL Y CONCRETA
 */

export interface ClaseInminente {
  id: string;
  titulo: string;
  grupoNombre: string;
  grupoId: string;
  fecha_hora: string;
  duracion: number;
  estudiantesInscritos: number;
  cupo_maximo: number;
  minutosParaEmpezar: number;
}

/**
 * Clase del día con información concreta
 */
export interface ClaseDelDia {
  id: string;
  nombre: string;
  codigo: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estudiantes: EstudianteInscrito[];
  cupo_maximo: number;
  grupoId: string;
}

/**
 * Estudiante inscrito en una clase
 */
export interface EstudianteInscrito {
  id: string;
  nombre: string;
  apellido: string;
  avatar_gradient: number;
}

/**
 * Resumen de un grupo del docente
 */
export interface GrupoResumen {
  id: string;
  nombre: string;
  codigo: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estudiantesActivos: number;
  cupo_maximo: number;
  nivel: string | null;
}

/**
 * Estudiante con faltas consecutivas
 */
export interface EstudianteConFalta {
  id: string;
  nombre: string;
  apellido: string;
  faltas_consecutivas: number;
  ultimo_grupo: string;
  tutor_email: string | null;
}

export type TipoAlerta = 'warning' | 'info' | 'urgent';

export interface AccionAlerta {
  label: string;
  href: string;
}

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  mensaje: string;
  accion?: AccionAlerta;
}

export type TendenciaAsistencia = 'up' | 'down' | 'stable';

export interface StatsResumen {
  clasesHoy: number;
  clasesEstaSemana: number;
  asistenciaPromedio: number;
  tendenciaAsistencia: TendenciaAsistencia;
  observacionesPendientes: number;
  estudiantesTotal: number;
}

/**
 * Response completo del dashboard con información BRUTAL y CONCRETA
 */
export interface DashboardDocenteResponse {
  claseInminente: ClaseInminente | null;
  clasesHoy: ClaseDelDia[];
  misGrupos: GrupoResumen[];
  estudiantesConFaltas: EstudianteConFalta[];
  alertas: Alerta[];
  stats: StatsResumen;
}
