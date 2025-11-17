// Tipos TypeScript para el Sistema de Calendario

import type { ClaseListado } from '@/types/admin-clases.types';

export enum TipoEvento {
  CLASE = 'CLASE',
  TAREA = 'TAREA',
  RECORDATORIO = 'RECORDATORIO',
  NOTA = 'NOTA',
}

export enum EstadoTarea {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum PrioridadTarea {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export interface Subtarea {
  id: string;
  titulo: string;
  completada: boolean;
  orden: number;
}

export interface Archivo {
  id: string;
  nombre: string;
  url: string;
  tipo: string;
  tamaño: number;
}

export interface Recurrencia {
  tipo: 'DIARIA' | 'SEMANAL' | 'MENSUAL';
  intervalo: number;
  diasSemana?: number[];
  fechaFin?: string;
  excepciones?: string[];
}

export interface RecordatorioTarea {
  minutosAntes: number;
  enviado: boolean;
}

// Modelo base de Evento
export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  fechaInicio: string;
  fechaFin: string;
  esTodoElDia: boolean;
  docenteId: string;
  claseId?: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones polimórficas
  tarea?: Tarea;
  recordatorio?: Recordatorio;
  nota?: Nota;
  clase?: ClaseListado; // Tipo Clase del sistema
}

// Tarea completa
export interface Tarea {
  id: string;
  eventoId: string;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  porcentajeCompletado: number;
  categoria?: string;
  etiquetas: string[];
  subtareas: Subtarea[];
  archivos: Archivo[];
  claseRelacionadaId?: string;
  estudianteRelacionadoId?: string;
  tiempoEstimadoMinutos?: number;
  tiempoRealMinutos?: number;
  recurrencia?: Recurrencia;
  recordatorios: RecordatorioTarea[];
  completedAt?: string;
}

// Recordatorio simple
export interface Recordatorio {
  id: string;
  eventoId: string;
  completado: boolean;
  color: string;
}

// Nota de texto largo
export interface Nota {
  id: string;
  eventoId: string;
  contenido: string;
  categoria?: string;
  color: string;
}

// DTOs para crear eventos
export interface CreateEventoBase {
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  fechaInicio: string;
  fechaFin: string;
  esTodoElDia?: boolean;
  claseId?: string;
}

export interface CreateTareaDto extends CreateEventoBase {
  estado?: EstadoTarea;
  prioridad?: PrioridadTarea;
  porcentajeCompletado?: number;
  categoria?: string;
  etiquetas?: string[];
  subtareas?: Subtarea[];
  archivos?: Archivo[];
  claseRelacionadaId?: string;
  estudianteRelacionadoId?: string;
  tiempoEstimadoMinutos?: number;
  tiempoRealMinutos?: number;
  recurrencia?: Recurrencia;
  recordatorios?: RecordatorioTarea[];
}

export interface CreateRecordatorioDto extends CreateEventoBase {
  completado?: boolean;
  color?: string;
}

export interface CreateNotaDto extends CreateEventoBase {
  contenido: string;
  categoria?: string;
  color?: string;
}

// Update DTOs
export type UpdateTareaDto = Partial<CreateTareaDto>;
export type UpdateRecordatorioDto = Partial<CreateRecordatorioDto>;
export type UpdateNotaDto = Partial<CreateNotaDto>;

// Vista Agenda agrupada
export interface VistaAgendaData {
  hoy: Evento[];
  manana: Evento[];
  proximos7Dias: Evento[];
  masAdelante: Evento[];
}

// Estadísticas del calendario
export interface EstadisticasCalendario {
  totalTareas: number;
  totalRecordatorios: number;
  totalNotas: number;
  tareasPendientes: number;
  tareasCompletadas: number;
  total: number;
}

// Filtros para búsqueda
export interface FiltrosCalendario {
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: TipoEvento;
  busqueda?: string;
}
