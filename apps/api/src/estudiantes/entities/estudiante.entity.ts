/**
 * Interfaz TypeScript para Estudiante
 * Representa la estructura de un estudiante en el sistema
 */
export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  fotoUrl?: string;
  tutor_id: string;
  equipoId?: string;
  puntos_totales: number;
  nivel_actual: number;
  createdAt: Date;
  updatedAt: Date;
}
