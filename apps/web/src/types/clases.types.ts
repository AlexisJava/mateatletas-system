import {
  claseSchema,
  inscripcionClaseSchema,
  reservarClaseSchema,
  estadoClaseEnum,
  estadoAsistenciaEnum,
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

export type EstadoClase = SharedEstadoClase;
export const estadoClaseSchema = estadoClaseEnum;
export const estadoAsistenciaSchema = estadoAsistenciaEnum;

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
