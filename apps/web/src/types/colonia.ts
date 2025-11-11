/**
 * Tipos de datos para la Colonia de Verano 2025
 */

export type CourseArea = 'Matemática' | 'Programación' | 'Ciencias' | 'Didáctica de la Matemática';
export type AgeRange = '5-6' | '6-7' | '8-9' | '10-12' | '8-12' | '13-17';
export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves';
export type TimeSlot = '10:30-11:30' | '10:30-12:00' | '14:30-16:00' | '15:00-16:00';

/**
 * Horario disponible para un curso
 */
export interface CourseSchedule {
  id: string; // ID único para este horario específico (e.g., 'mat-iniciacion-lunes')
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
  instructor: string;
}

/**
 * Curso con múltiples horarios disponibles
 */
export interface Course {
  id: string; // ID base del curso (e.g., 'mat-iniciacion')
  name: string;
  area: CourseArea;
  ageRange: AgeRange;
  description: string;
  color: string; // Color específico del área
  icon: string; // Emoji o ícono
  schedules: CourseSchedule[]; // Horarios disponibles para este curso

  // Mantener compatibilidad con código legacy
  dayOfWeek?: DayOfWeek; // Deprecado: usar schedules[0].dayOfWeek
  timeSlot?: TimeSlot; // Deprecado: usar schedules[0].timeSlot
  instructor?: string; // Deprecado: usar schedules[0].instructor
}

export interface PricingOption {
  courses: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  features: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CourseDetails {
  temario: string[]; // 8 items (semana por semana)
  objetivos: string[];
  metodologia: string;
  requisitos: string[];
}
