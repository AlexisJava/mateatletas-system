/**
 * Tipos para el módulo de Clases y Reservas
 */

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

/**
 * Estado de una clase
 */
export enum EstadoClase {
  Programada = 'Programada',
  EnCurso = 'EnCurso',
  Finalizada = 'Finalizada',
  Cancelada = 'Cancelada',
}

/**
 * Clase programada
 */
export interface Clase {
  id: string;
  docenteId: string;
  rutaCurricularId: string;
  titulo: string;
  descripcion: string | null;
  fechaHora: string; // ISO 8601
  duracionMinutos: number;
  cupoMaximo: number;
  cupoDisponible: number;
  estado: EstadoClase;
  createdAt: string;
  updatedAt: string;

  // Relaciones opcionales
  docente?: {
    id: string;
    user: {
      nombre: string;
      apellido: string;
    };
  };
  rutaCurricular?: RutaCurricular;
  inscripciones?: InscripcionClase[];
}

/**
 * Inscripción a una clase (Reserva)
 */
export interface InscripcionClase {
  id: string;
  claseId: string;
  estudianteId: string;
  tutorId: string;
  createdAt: string;

  // Relaciones opcionales
  clase?: Clase;
  estudiante?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

/**
 * Filtro para clases
 */
export interface FiltroClases {
  rutaCurricularId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  soloDisponibles?: boolean;
}

/**
 * Datos para crear una reserva
 */
export interface CrearReservaDto {
  estudianteId: string;
}
