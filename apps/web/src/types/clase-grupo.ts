/**
 * Tipos para ClaseGrupos (grupos de clases recurrentes)
 */

export enum TipoClaseGrupo {
  GRUPO_REGULAR = 'GRUPO_REGULAR',
  CURSO_TEMPORAL = 'CURSO_TEMPORAL',
}

export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO',
}

export const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  [DiaSemana.LUNES]: 'Lunes',
  [DiaSemana.MARTES]: 'Martes',
  [DiaSemana.MIERCOLES]: 'Miércoles',
  [DiaSemana.JUEVES]: 'Jueves',
  [DiaSemana.VIERNES]: 'Viernes',
  [DiaSemana.SABADO]: 'Sábado',
  [DiaSemana.DOMINGO]: 'Domingo',
};

export const TIPO_CLASE_GRUPO_LABELS: Record<TipoClaseGrupo, string> = {
  [TipoClaseGrupo.GRUPO_REGULAR]: 'Grupo Regular (finaliza 15/dic)',
  [TipoClaseGrupo.CURSO_TEMPORAL]: 'Curso Temporal (fecha específica)',
};

export interface ClaseGrupo {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoClaseGrupo;
  dia_semana: DiaSemana;
  hora_inicio: string; // "19:30"
  hora_fin: string; // "21:00"
  fecha_inicio: string; // ISO date
  fecha_fin: string; // ISO date
  anio_lectivo: number;
  cupo_maximo: number;
  activo: boolean;
  docente_id: string;
  ruta_curricular_id?: string;
  sector_id?: string;
  nivel?: string;
  created_at: string;
  updated_at: string;

  // Relations (populated in includes)
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  rutaCurricular?: {
    id: string;
    nombre: string;
    color: string;
  };
  sector?: {
    id: string;
    nombre: string;
    color: string;
  };
  inscripciones?: InscripcionClaseGrupo[];

  // Computed fields
  total_inscriptos?: number;
  total_asistencias?: number;
  cupos_disponibles?: number;
}

export interface InscripcionClaseGrupo {
  id: string;
  clase_grupo_id: string;
  estudiante_id: string;
  tutor_id: string;
  fecha_inscripcion: string;
  fecha_baja?: string;

  estudiante?: {
    id: string;
    nombre: string;
    apellido: string;
    edad: number;
    email: string;
  };
  tutor?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface CrearClaseGrupoDto {
  codigo: string;
  nombre: string;
  tipo: TipoClaseGrupo;
  dia_semana: DiaSemana;
  hora_inicio: string; // "HH:MM"
  hora_fin: string; // "HH:MM"
  fecha_inicio: string; // ISO date
  fecha_fin?: string; // Optional - auto-calculated for GRUPO_REGULAR
  anio_lectivo: number;
  cupo_maximo: number;
  docente_id: string;
  ruta_curricular_id?: string;
  sector_id?: string;
  nivel?: string;
  estudiantes_ids: string[];
}

export interface ListarClaseGruposParams {
  anio_lectivo?: number;
  activo?: boolean;
  docente_id?: string;
  tipo?: TipoClaseGrupo;
}
