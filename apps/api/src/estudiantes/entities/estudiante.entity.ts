/**
 * Interfaz TypeScript para Estudiante
 * Representa la estructura de un estudiante en el sistema
 *
 * NOTA: puntos_totales fue eliminado, usar RecursosEstudiante.xp_total
 */
export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  fotoUrl?: string;
  tutor_id: string;
  casaId?: string;
  nivel_actual: number;
  createdAt: Date;
  updatedAt: Date;
  // Relación opcional con recursos
  recursos?: {
    xp_total: number;
  };
}
