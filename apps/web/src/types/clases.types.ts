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
  docente_id: string;
  ruta_curricular_id: string;
  fecha_hora_inicio: string; // ISO 8601 DateTime
  duracion_minutos: number;
  cupo_maximo: number;
  cupo_disponible: number;
  estado: EstadoClase | 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada';
  titulo?: string;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones opcionales
  docente?: {
    id: string;
    user?: {
      nombre: string;
      apellido: string;
    };
  };
  ruta_curricular?: RutaCurricular;
  inscripciones?: InscripcionClase[];
}

/**
 * Inscripción a una clase (Reserva)
 */
export interface InscripcionClase {
  id: string;
  clase_id: string;
  estudiante_id: string;
  tutor_id: string;
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
  ruta_curricular_id?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  soloDisponibles?: boolean;
}

/**
 * Datos para crear una reserva
 */
export interface CrearReservaDto {
  estudiante_id: string;
}
