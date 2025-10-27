import { z } from 'zod';
import { productoSchema } from './producto.schema';

// =============================================================================
// CURSO SCHEMAS
// =============================================================================

export const tipoContenidoEnum = z.enum([
  'Video',
  'Texto',
  'Quiz',
  'Tarea',
  'JuegoInteractivo',
  'Lectura',
  'Practica',
]);

export type TipoContenido = z.infer<typeof tipoContenidoEnum>;

export const contenidoVideoSchema = z
  .object({
    url: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    duracion: z.number().int().positive().optional(),
  })
  .strict();

export type ContenidoVideo = z.infer<typeof contenidoVideoSchema>;

export const contenidoTextoSchema = z
  .object({
    texto: z.string().optional(),
    contenido: z.string().optional(),
  })
  .strict();

export type ContenidoTexto = z.infer<typeof contenidoTextoSchema>;

export const contenidoQuizSchema = z
  .object({
    preguntas: z.array(
      z.object({
        id: z.string(),
        pregunta: z.string(),
        opciones: z.array(z.string()),
        respuesta_correcta: z.number().int(),
      }),
    ),
  })
  .strict();

export type ContenidoQuiz = z.infer<typeof contenidoQuizSchema>;

export const contenidoTareaSchema = z
  .object({
    descripcion: z.string(),
    instrucciones: z.string().optional(),
  })
  .strict();

export type ContenidoTarea = z.infer<typeof contenidoTareaSchema>;

export const contenidoGenericoSchema = z.record(z.string(), z.unknown());

export type ContenidoGenerico = z.infer<typeof contenidoGenericoSchema>;

export const contenidoLeccionSchema = z.union([
  contenidoVideoSchema,
  contenidoTextoSchema,
  contenidoQuizSchema,
  contenidoTareaSchema,
  contenidoGenericoSchema,
]);

export type ContenidoLeccion = z.infer<typeof contenidoLeccionSchema>;

export const leccionSchema = z.object({
  id: z.string(),
  modulo_id: z.string(),
  titulo: z.string(),
  descripcion: z.string().nullable(),
  tipo_contenido: tipoContenidoEnum,
  contenido: contenidoLeccionSchema,
  orden: z.number().int().nonnegative(),
  duracion_estimada_minutos: z.number().int().nonnegative(),
  puntos: z.number().int().nonnegative(),
  publicado: z.boolean(),
  leccion_prerequisito_id: z.string().nullable(),
  logro_desbloqueado_id: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Leccion = z.infer<typeof leccionSchema>;

export const moduloSchema = z.object({
  id: z.string(),
  producto_id: z.string(),
  titulo: z.string(),
  descripcion: z.string().nullable(),
  orden: z.number().int().nonnegative(),
  duracion_estimada_minutos: z.number().int().nonnegative(),
  puntos_totales: z.number().int().nonnegative(),
  publicado: z.boolean(),
  lecciones: z.array(leccionSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Modulo = z.infer<typeof moduloSchema>;

export const progresoLeccionSchema = z.object({
  id: z.string(),
  estudiante_id: z.string(),
  leccion_id: z.string(),
  progreso_porcentaje: z.number().min(0).max(100),
  tiempo_invertido_minutos: z.number().int().nonnegative(),
  completado: z.boolean(),
  calificacion: z.number().nullable(),
  intentos: z.number().int().nonnegative(),
  notas_estudiante: z.string().nullable(),
  ultima_respuesta: contenidoLeccionSchema.nullable().optional(),
  fecha_completado: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProgresoLeccion = z.infer<typeof progresoLeccionSchema>;

export const progresoCursoSchema = z.object({
  producto_id: z.string(),
  total_modulos: z.number().int().nonnegative(),
  total_lecciones: z.number().int().nonnegative(),
  lecciones_completadas: z.number().int().nonnegative(),
  porcentaje_completado: z.number().min(0).max(100),
  puntos_ganados: z.number().int().nonnegative(),
  tiempo_total_minutos: z.number().int().nonnegative(),
  siguiente_leccion: leccionSchema.nullable(),
});

export type ProgresoCurso = z.infer<typeof progresoCursoSchema>;

export const cursoDetalleSchema = z.object({
  producto: productoSchema,
  modulos: z.array(moduloSchema),
  progreso: progresoCursoSchema.optional(),
});

export type CursoDetalle = z.infer<typeof cursoDetalleSchema>;

export const createModuloSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  orden: z.number().int().nonnegative().optional(),
  publicado: z.boolean().optional(),
});

export type CreateModuloInput = z.infer<typeof createModuloSchema>;

export const updateModuloSchema = createModuloSchema.partial();

export type UpdateModuloInput = z.infer<typeof updateModuloSchema>;

export const createLeccionSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  tipo_contenido: tipoContenidoEnum,
  contenido: contenidoLeccionSchema,
  orden: z.number().int().nonnegative().optional(),
  duracion_estimada_minutos: z.number().int().nonnegative(),
  puntos: z.number().int().nonnegative().optional(),
  publicado: z.boolean().optional(),
  leccion_prerequisito_id: z.string().optional(),
  logro_desbloqueado_id: z.string().optional(),
});

export type CreateLeccionInput = z.infer<typeof createLeccionSchema>;

export const updateLeccionSchema = createLeccionSchema.partial();

export type UpdateLeccionInput = z.infer<typeof updateLeccionSchema>;

export const completarLeccionSchema = z
  .object({
    progreso_porcentaje: z.number().min(0).max(100).optional(),
    tiempo_invertido_minutos: z.number().int().nonnegative().optional(),
    calificacion: z.number().optional(),
    notas_estudiante: z.string().optional(),
    ultima_respuesta: contenidoLeccionSchema.optional(),
  })
  .partial();

export type CompletarLeccionInput = z.infer<typeof completarLeccionSchema>;

export const modulosListSchema = z.array(moduloSchema);
export const leccionesListSchema = z.array(leccionSchema);

export type ModulosList = z.infer<typeof modulosListSchema>;
export type LeccionesList = z.infer<typeof leccionesListSchema>;
