/**
 * Tipos TypeScript para el módulo de Equipos
 * Deben coincidir con los modelos del backend (Prisma)
 */

/**
 * Tipo base de Equipo
 * Representa un equipo de gamificación en el sistema
 */
export interface Equipo {
  id: string;
  nombre: string;
  color_primario: string;
  color_secundario: string;
  icono_url: string | null;
  puntos_totales: number;
  createdAt: string;
  updatedAt: string;
  estudiantes?: EstudianteEnEquipo[];
}

/**
 * Estudiante simplificado para mostrar en Equipo
 */
export interface EstudianteEnEquipo {
  id: string;
  nombre: string;
  apellido: string;
  puntos_totales: number;
  nivel_actual?: number;
}

/**
 * DTO para crear un nuevo equipo
 */
export interface CreateEquipoDto {
  nombre: string;
  color_primario: string;
  color_secundario: string;
  icono_url?: string;
}

/**
 * DTO para actualizar un equipo existente
 * Todos los campos son opcionales
 */
export interface UpdateEquipoDto {
  nombre?: string;
  color_primario?: string;
  color_secundario?: string;
  icono_url?: string;
}

/**
 * Parámetros de query para filtrar equipos
 */
export interface QueryEquiposDto {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: 'nombre' | 'puntos_totales' | 'createdAt';
  order?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de equipos
 */
export interface EquiposResponse {
  data: Equipo[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Estadísticas de equipos
 */
export interface EquiposEstadisticas {
  totalEquipos: number;
  totalEstudiantes: number;
  promedioEstudiantesPorEquipo: number;
  ranking: EquipoRanking[];
}

/**
 * Item de ranking de equipos
 */
export interface EquipoRanking {
  posicion: number;
  id: string;
  nombre: string;
  puntos_totales: number;
  cantidad_estudiantes: number;
}

/**
 * Respuesta al eliminar un equipo
 */
export interface DeleteEquipoResponse {
  message: string;
  estudiantesDesvinculados: number;
}
