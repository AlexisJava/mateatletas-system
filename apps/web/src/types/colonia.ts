/**
 * Tipos de datos para la Colonia de Verano 2025
 */

export type CourseArea = 'Matemática' | 'Programación' | 'Ciencias' | 'Didáctica de la Matemática';
export type AgeRange = '5-6' | '6-7' | '8-9' | '10-12' | '8-12' | '13-17';
export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves';
export type TimeSlot = '10:30-11:30' | '10:30-12:00' | '14:30-16:00' | '15:00-16:00';

export interface Course {
  id: string;
  name: string;
  area: CourseArea;
  ageRange: AgeRange;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
  description: string;
  instructor: string;
  color: string; // Color específico del área
  icon: string; // Emoji o ícono
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
