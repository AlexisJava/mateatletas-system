import { z } from 'zod';

export const tipoContenidoEnum = z.enum([
  'Video',
  'Texto',
  'Quiz',
  'Tarea',
  'JuegoInteractivo',
  'Lectura',
  'Practica',
]);

export const contenidoVideoSchema = z.object({
  url: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  duracion: z.number().nonnegative().optional(),
});

export const contenidoTextoSchema = z.object({
  texto: z.string().optional(),
  contenido: z.string().optional(),
});

export const contenidoQuizSchema = z.object({
  preguntas: z
    .array(
      z.object({
        id: z.string(),
        pregunta: z.string(),
        opciones: z.array(z.string()),
        respuesta_correcta: z.number(),
      }),
    )
    .default([]),
});

export const contenidoTareaSchema = z.object({
  descripcion: z.string(),
  instrucciones: z.string().optional(),
});

const contenidoGenericoSchema = z.record(z.unknown());

export const leccionSchema = z.object({
  id: z.string(),
  modulo_id: z.string(),
  titulo: z.string(),
  descripcion: z.string().nullable(),
  tipo_contenido: tipoContenidoEnum,
  contenido: z.union([
    contenidoVideoSchema,
    contenidoTextoSchema,
    contenidoQuizSchema,
    contenidoTareaSchema,
    contenidoGenericoSchema,
  ]),
  orden: z.number(),
  duracion_estimada_minutos: z.number(),
  puntos: z.number(),
  publicado: z.boolean(),
  leccion_prerequisito_id: z.string().nullable(),
  logro_desbloqueado_id: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const leccionesListSchema = z.array(leccionSchema);

export type TipoContenido = z.infer<typeof tipoContenidoEnum>;
export type LeccionFromSchema = z.infer<typeof leccionSchema>;
