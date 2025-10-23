/**
 * Interface simplificada del repositorio de Estudiantes
 * Solo expone los métodos necesarios para el módulo de pagos
 *
 * El repositorio real está en el módulo de estudiantes
 * Esta interface permite desacoplar el módulo de pagos
 */
export interface IEstudianteRepository {
  /**
   * Obtiene un estudiante por su ID
   * @returns Estudiante o null si no existe
   */
  obtenerPorId(id: string): Promise<Estudiante | null>;

  /**
   * Obtiene múltiples estudiantes por sus IDs
   * @returns Array de estudiantes (solo los que existen)
   */
  obtenerPorIds(ids: readonly string[]): Promise<Estudiante[]>;
}

/**
 * Representa un estudiante (vista para pagos)
 * Solo incluye los campos necesarios para cálculos de precios
 */
export interface Estudiante {
  readonly id: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly tutorId: string;
}
