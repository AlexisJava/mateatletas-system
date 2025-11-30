/**
 * Tipos para ClaseGrupos (grupos de clases recurrentes)
 */

/* eslint-disable no-unused-vars */
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
/* eslint-enable no-unused-vars */

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
  diaSemana: DiaSemana;
  horaInicio: string; // "19:30"
  horaFin: string; // "21:00"
  fechaInicio: string; // ISO date
  fechaFin: string; // ISO date
  anioLectivo: number;
  cupoMaximo: number;
  activo: boolean;
  docenteId: string;
  rutaCurricularId?: string;
  sectorId?: string;
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
  totalInscriptos?: number;
  totalAsistencias?: number;
  cuposDisponibles?: number;
}

export interface InscripcionClaseGrupo {
  id: string;
  claseGrupoId: string;
  estudianteId: string;
  tutorId: string;
  fechaInscripcion: string;
  fechaBaja?: string;

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
  grupoId: string;
  codigo: string;
  nombre: string;
  tipo: TipoClaseGrupo;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:MM"
  horaFin: string; // "HH:MM"
  fechaInicio: string; // ISO date
  fechaFin?: string; // Optional - auto-calculated for GRUPO_REGULAR
  anioLectivo: number;
  cupoMaximo: number;
  docenteId: string;
  rutaCurricularId?: string;
  sectorId?: string;
  nivel?: string;
  estudiantesIds: string[];
}

export interface ListarClaseGruposParams {
  anioLectivo?: number;
  activo?: boolean;
  docenteId?: string;
  tipo?: TipoClaseGrupo;
}
