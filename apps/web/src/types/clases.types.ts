import {
  claseSchema,
  inscripcionClaseSchema,
  reservarClaseSchema,
  estadoClaseEnum,
  estadoAsistenciaEnum,
  ESTADO_CLASE,
  ESTADO_ASISTENCIA,
  type Clase as SharedClase,
  type ClasesList,
  type InscripcionClase as SharedInscripcionClase,
  type ReservarClaseInput,
  type EstadoClase as SharedEstadoClase,
} from '@mateatletas/shared';
import { z } from 'zod';

/**
 * Ruta Curricular (Ej: Álgebra, Geometría, Lógica...)
 */
export interface RutaCurricular {
  id: string;
  nombre: string;
  color: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

// Re-exportar runtime constants (SINGLE SOURCE OF TRUTH)
export { ESTADO_CLASE, ESTADO_ASISTENCIA };

// Exportar schemas de Zod
export const estadoClaseSchema = estadoClaseEnum;
export const estadoAsistenciaSchema = estadoAsistenciaEnum;

// Exportar tipos TypeScript
export type EstadoClase = SharedEstadoClase;

export type Clase = SharedClase;
export type InscripcionClase = SharedInscripcionClase;
export type CrearReservaDto = ReservarClaseInput;
export type ClasesListResponse = ClasesList;

export interface FiltroClases {
  ruta_curricular_id?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  soloDisponibles?: boolean;
}

export const claseSchemaClient = claseSchema;
export const inscripcionClaseSchemaClient = inscripcionClaseSchema;
export const reservarClaseSchemaClient = reservarClaseSchema;
export const clasesResponseSchema = z.array(claseSchemaClient);

/**
 * Extensión del tipo Clase que incluye relaciones de Prisma
 * Usado cuando se hacen queries con include en el backend
 */
export interface ClaseConRelaciones extends SharedClase {
  _count?: {
    inscripciones?: number;
    asistencias?: number;
  };
  ruta_curricular?: RutaCurricular;
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}
