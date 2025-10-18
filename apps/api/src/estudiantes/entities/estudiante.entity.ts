/**
 * Interfaz TypeScript para Estudiante
 * Representa la estructura de un estudiante en el sistema
 */
export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivel_escolar: string;
  foto_url?: string;
  tutor_id: string;
  equipo_id?: string;
  puntos_totales: number;
  nivel_actual: number;
  createdAt: Date;
  updatedAt: Date;
}
