/**
 * Interfaz para Estudiante
 * Representa un estudiante en el sistema
 */
export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  nivel_escolar: 'Primaria' | 'Secundaria' | 'Universidad';
  foto_url?: string;
  tutor_id: string;
  equipo_id?: string;
  puntos_totales: number;
  nivel_actual: number;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  equipo?: Equipo;
}

/**
 * Interfaz para Equipo
 * Representa un equipo de gamificación
 */
export interface Equipo {
  id: string;
  nombre: string;
  color_primario: string;
  color_secundario: string;
  icono_url?: string;
  puntos_totales: number;
}

/**
 * DTO para crear un estudiante
 */
export interface CreateEstudianteData {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // ISO format
  nivel_escolar: 'Primaria' | 'Secundaria' | 'Universidad';
  foto_url?: string;
  equipo_id?: string;
}

/**
 * DTO para actualizar un estudiante
 */
export type UpdateEstudianteData = Partial<CreateEstudianteData>;

/**
 * Parámetros de consulta para listar estudiantes
 */
export interface QueryEstudiantesParams {
  equipo_id?: string;
  nivel_escolar?: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta de la API al listar estudiantes
 */
export interface EstudiantesResponse {
  data: Estudiante[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Estadísticas de estudiantes
 */
export interface EstadisticasEstudiantes {
  total: number;
  por_nivel: Record<string, number>;
  por_equipo: Record<string, number>;
  puntos_totales: number;
}
