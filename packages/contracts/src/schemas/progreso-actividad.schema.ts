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
  estudianteId: z.string().cuid(),
  actividadId: z.string().cuid(),
  asignacionId: z.string().cuid(),

  // Estado de progreso
  iniciado: z.boolean(),
  fechaInicio: z.date().nullable(),
  completado: z.boolean(),
  fechaCompletado: z.date().nullable(),

  // Métricas
  puntosObtenidos: z.number().int().nonnegative(),
  tiempoTotalMinutos: z.number().int().nonnegative(),
  intentos: z.number().int().nonnegative(),
  mejorPuntaje: z.number().int().nonnegative(),

  // Estado del juego (flexible según el tipo de actividad)
  estadoJuego: z.record(z.string(), z.unknown()).nullable(),

  // Respuestas detalladas para análisis del docente
  respuestasDetalle: z.array(z.record(z.string(), z.unknown())).nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProgresoEstudianteActividad = z.infer<typeof ProgresoEstudianteActividadSchema>;

// ============================================================================
// DTOs - INICIAR ACTIVIDAD
// ============================================================================

export const IniciarActividadSchema = z.object({
  estudianteId: z.string().cuid(),
  actividadId: z.string().cuid(),
  asignacionId: z.string().cuid(),
});

export type IniciarActividad = z.infer<typeof IniciarActividadSchema>;

// ============================================================================
// DTOs - COMPLETAR ACTIVIDAD
// ============================================================================

export const CompletarActividadSchema = z.object({
  estudianteId: z.string().cuid(),
  actividadId: z.string().cuid(),
  asignacionId: z.string().cuid(),

  // Métricas del intento actual
  puntosObtenidos: z.number().int().nonnegative(),
  puntajeIntento: z.number().int().nonnegative(), // Puntaje de este intento
  tiempoMinutos: z.number().int().nonnegative(),

  // Resultados
  estrellas: z.number().int().min(0).max(3), // 0-3 estrellas
  porcentajeAciertos: z.number().min(0).max(100),

  // Detalles opcionales
  respuestasDetalle: z
    .array(
      z.object({
        preguntaId: z.string().or(z.number()).optional(),
        correcta: z.boolean(),
        tiempoSegundos: z.number().optional(),
        respuestaUsuario: z.string().or(z.number()).or(z.boolean()).optional(),
        respuestaCorrecta: z.string().or(z.number()).or(z.boolean()).optional(),
      }),
    )
    .optional(),

  // Estado final del juego (para continuar después)
  estadoJuego: z.record(z.string(), z.unknown()).optional(),
});

export type CompletarActividad = z.infer<typeof CompletarActividadSchema>;

// ============================================================================
// DTOs - GUARDAR PROGRESO (sin completar)
// ============================================================================

export const GuardarProgresoActividadSchema = z.object({
  estudianteId: z.string().cuid(),
  actividadId: z.string().cuid(),
  asignacionId: z.string().cuid(),

  // Estado actual del juego
  estadoJuego: z.record(z.string(), z.unknown()),

  // Tiempo parcial
  tiempoMinutos: z.number().int().nonnegative(),
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
      xpGanado: z.number().int().nonnegative(),
      monedasGanadas: z.number().int().nonnegative(),
      gemasGanadas: z.number().int().nonnegative().optional(),
      nivelSubido: z.boolean(),
      nivelActual: z.number().int().positive(),
      logrosDesbloqueados: z.array(
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
  estudianteId: z.string().cuid(),
  actividadesCompletadas: z.number().int().nonnegative(),
  actividadesEnProgreso: z.number().int().nonnegative(),
  tiempoTotalMinutos: z.number().int().nonnegative(),
  puntosTotales: z.number().int().nonnegative(),
  mejorRacha: z.number().int().nonnegative(), // Días consecutivos

  // Últimas actividades
  ultimasActividades: z.array(
    z.object({
      id: z.string().cuid(),
      actividadTitulo: z.string(),
      completado: z.boolean(),
      fecha: z.date(),
      puntos: z.number().int().nonnegative(),
      estrellas: z.number().int().min(0).max(3).optional(),
    }),
  ),
});

export type HistorialProgresoEstudiante = z.infer<typeof HistorialProgresoEstudianteSchema>;
