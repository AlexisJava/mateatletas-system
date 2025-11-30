/**
 * Tipos para el módulo de Asistencia (Docentes)
 */

import { Clase, RutaCurricular } from './clases.types';

/**
 * Estado de asistencia de un estudiante
 */
/* eslint-disable no-unused-vars */
export enum EstadoAsistencia {
  Presente = 'Presente',
  Ausente = 'Ausente',
  Justificado = 'Justificado',
  Tardanza = 'Tardanza',
}
/* eslint-enable no-unused-vars */

/**
 * Registro de asistencia
 */
export interface Asistencia {
  id: string;
  claseId: string;
  estudianteId: string;
  estado: EstadoAsistencia;
  observaciones: string | null;
  puntosOtorgados: number;
  fechaRegistro: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones opcionales
  clase?: Clase;
  estudiante?: {
    id: string;
    nombre: string;
    apellido: string;
    nivelEscolar?: string;
  };
}

/**
 * DTO para marcar asistencia
 */
export interface MarcarAsistenciaDto {
  estudianteId: string;
  estado: EstadoAsistencia;
  observaciones?: string;
  puntosOtorgados?: number;
}

/**
 * Lista de asistencia de una clase
 */
export interface ListaAsistencia {
  claseId: string;
  clase: {
    id: string;
    titulo: string;
    fechaHora: string;
    duracionMinutos: number;
    rutaCurricular?: RutaCurricular;
  };
  inscripciones: InscripcionConAsistencia[];
  estadisticas: {
    total: number;
    presentes: number;
    ausentes: number;
    justificados: number;
    tardanzas: number;
    pendientes: number;
  };
}

/**
 * Inscripción con su asistencia
 */
export interface InscripcionConAsistencia {
  id: string;
  estudianteId: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    nivelEscolar?: string;
    avatar?: string;
  };
  asistencia?: Asistencia;
}

/**
 * Historial de asistencia de un estudiante
 */
export interface HistorialAsistencia {
  estudianteId: string;
  estudiante: {
    nombre: string;
    apellido: string;
  };
  asistencias: Asistencia[];
  estadisticas: {
    totalClases: number;
    presentes: number;
    ausentes: number;
    justificados: number;
    tardanzas: number;
    porcentajeAsistencia: number;
    puntosTotal: number;
  };
}

/**
 * Estadísticas de asistencia de una clase
 */
export interface EstadisticasClase {
  claseId: string;
  clase: {
    titulo: string;
    fechaHora: string;
    rutaCurricular?: {
      nombre: string;
      color: string;
    };
  };
  totalInscritos: number;
  totalPresentes: number;
  totalAusentes: number;
  totalJustificados: number;
  totalTardanzas: number;
  porcentajeAsistencia: number;
  puntosOtorgadosTotal: number;
}

/**
 * Resumen de asistencia para docente
 */
export interface ResumenDocenteAsistencia {
  docenteId: string;
  totalClases: number;
  totalEstudiantes: number;
  promedioAsistencia: number;
  claseConMayorAsistencia?: {
    claseId: string;
    titulo: string;
    porcentaje: number;
  };
  claseConMenorAsistencia?: {
    claseId: string;
    titulo: string;
    porcentaje: number;
  };
  rutaMasAsistida?: {
    rutaId: string;
    nombre: string;
    porcentaje: number;
  };
}
