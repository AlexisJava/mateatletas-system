/**
 * Schemas Zod para el sistema de Progreso de Actividades
 * Define tipos y validaciones para el tracking de progreso del estudiante
 */

import { z } from 'zod';

// ============================================================================
// PROGRESO ESTUDIANTE ACTIVIDAD
// ============================================================================

export const ProgresoEstudianteActividadSchema = z.object({
  id: z.string().cuid(),
  estudiante_id: z.string().cuid(),
  actividad_id: z.string().cuid(),
  asignacion_id: z.string().cuid(),

  // Estado de progreso
  iniciado: z.boolean(),
  fecha_inicio: z.date().nullable(),
  completado: z.boolean(),
  fecha_completado: z.date().nullable(),

  // Métricas
  puntos_obtenidos: z.number().int().nonnegative(),
  tiempo_total_minutos: z.number().int().nonnegative(),
  intentos: z.number().int().nonnegative(),
  mejor_puntaje: z.number().int().nonnegative(),

  // Estado del juego (flexible según el tipo de actividad)
  estado_juego: z.record(z.string(), z.unknown()).nullable(),

  // Respuestas detalladas para análisis del docente
  respuestas_detalle: z.array(z.record(z.string(), z.unknown())).nullable(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type ProgresoEstudianteActividad = z.infer<typeof ProgresoEstudianteActividadSchema>;

// ============================================================================
// DTOs - INICIAR ACTIVIDAD
// ============================================================================

export const IniciarActividadSchema = z.object({
  estudiante_id: z.string().cuid(),
  actividad_id: z.string().cuid(),
  asignacion_id: z.string().cuid(),
});

export type IniciarActividad = z.infer<typeof IniciarActividadSchema>;

// ============================================================================
// DTOs - COMPLETAR ACTIVIDAD
// ============================================================================

export const CompletarActividadSchema = z.object({
  estudiante_id: z.string().cuid(),
  actividad_id: z.string().cuid(),
  asignacion_id: z.string().cuid(),

  // Métricas del intento actual
  puntos_obtenidos: z.number().int().nonnegative(),
  puntaje_intento: z.number().int().nonnegative(), // Puntaje de este intento
  tiempo_minutos: z.number().int().nonnegative(),

  // Resultados
  estrellas: z.number().int().min(0).max(3), // 0-3 estrellas
  porcentaje_aciertos: z.number().min(0).max(100),

  // Detalles opcionales
  respuestas_detalle: z
    .array(
      z.object({
        pregunta_id: z.string().or(z.number()).optional(),
        correcta: z.boolean(),
        tiempo_segundos: z.number().optional(),
        respuesta_usuario: z.string().or(z.number()).or(z.boolean()).optional(),
        respuesta_correcta: z.string().or(z.number()).or(z.boolean()).optional(),
      }),
    )
    .optional(),

  // Estado final del juego (para continuar después)
  estado_juego: z.record(z.string(), z.unknown()).optional(),
});

export type CompletarActividad = z.infer<typeof CompletarActividadSchema>;

// ============================================================================
// DTOs - GUARDAR PROGRESO (sin completar)
// ============================================================================

export const GuardarProgresoActividadSchema = z.object({
  estudiante_id: z.string().cuid(),
  actividad_id: z.string().cuid(),
  asignacion_id: z.string().cuid(),

  // Estado actual del juego
  estado_juego: z.record(z.string(), z.unknown()),

  // Tiempo parcial
  tiempo_minutos: z.number().int().nonnegative(),
});

export type GuardarProgresoActividad = z.infer<typeof GuardarProgresoActividadSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export const ProgresoActualizadoResponseSchema = z.object({
  progreso: ProgresoEstudianteActividadSchema,

  // Si se completó, incluir recompensas
  recompensas: z
    .object({
      xp_ganado: z.number().int().nonnegative(),
      monedas_ganadas: z.number().int().nonnegative(),
      gemas_ganadas: z.number().int().nonnegative().optional(),
      nivel_subido: z.boolean(),
      nivel_actual: z.number().int().positive(),
      logros_desbloqueados: z.array(
        z.object({
          id: z.string().cuid(),
          nombre: z.string(),
          descripcion: z.string(),
          puntos: z.number().int().nonnegative(),
        }),
      ),
    })
    .optional(),

  mensaje: z.string(),
});

export type ProgresoActualizadoResponse = z.infer<typeof ProgresoActualizadoResponseSchema>;

// ============================================================================
// HISTORIAL DE PROGRESO
// ============================================================================

export const HistorialProgresoEstudianteSchema = z.object({
  estudiante_id: z.string().cuid(),
  actividades_completadas: z.number().int().nonnegative(),
  actividades_en_progreso: z.number().int().nonnegative(),
  tiempo_total_minutos: z.number().int().nonnegative(),
  puntos_totales: z.number().int().nonnegative(),
  mejor_racha: z.number().int().nonnegative(), // Días consecutivos

  // Últimas actividades
  ultimas_actividades: z.array(
    z.object({
      id: z.string().cuid(),
      actividad_titulo: z.string(),
      completado: z.boolean(),
      fecha: z.date(),
      puntos: z.number().int().nonnegative(),
      estrellas: z.number().int().min(0).max(3).optional(),
    }),
  ),
});

export type HistorialProgresoEstudiante = z.infer<typeof HistorialProgresoEstudianteSchema>;
