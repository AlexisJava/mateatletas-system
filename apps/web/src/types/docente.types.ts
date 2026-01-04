/**
 * Tipos para el Portal Docente - Nuevos componentes
 *
 * Este archivo contiene los tipos usados por los componentes
 * del teacherdash-pro migrados al portal docente.
 */

import type { LucideIcon } from 'lucide-react';

// =============================================================================
// ALERTAS
// =============================================================================

export interface Alerta {
  id: string;
  tipo: string;
  severidad: 'alta' | 'media' | 'baja';
  mensaje: string;
  estudiante: string;
  comision_id: string;
}

// =============================================================================
// COMISIONES
// =============================================================================

export interface Comision {
  id: string;
  producto: string;
  horario: string;
  casa: 'QUANTUM' | 'VERTEX' | 'PULSAR' | string;
  inscripciones: number;
  cupo_maximo: number;
  thumbnail?: string;
  proximaClase?: string;
}

// =============================================================================
// ESTUDIANTES
// =============================================================================

export interface Student {
  id: string;
  name: string;
  avatar: string;
  comision_id: string;
  attendance: 'present' | 'absent' | 'late' | 'none';
  points: number;
  observations: string[];
}

// =============================================================================
// ESTADÍSTICAS DEL DASHBOARD
// =============================================================================

export interface DashboardStats {
  clasesSemana: number;
  totalEstudiantes: number;
  asistenciaPromedio: number;
  puntosOtorgados: number;
}

export interface StatMetric {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

// =============================================================================
// CLASES EN VIVO
// =============================================================================

export interface LiveSession {
  title: string;
  topic: string;
  duration: string;
  thumbnail: string;
  totalStudents: number;
}

// =============================================================================
// CURSOS
// =============================================================================

export interface Course {
  id: string;
  title: string;
  ageGroup: string;
  schedule: string;
  enrolled: number;
  capacity: number;
  progress: number;
  image: string;
}
