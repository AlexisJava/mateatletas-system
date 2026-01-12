import { z } from 'zod';
import { areaEnum, houseEnum } from './base.schema';
import { slideSchema } from './slide.schema';

// Metadata de la lección
export const lessonMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  area: areaEnum,
  house: houseEnum,
  duration: z.number().positive().describe('Duración estimada en minutos'),
  xpTotal: z.number().positive(),
  description: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type LessonMetadata = z.infer<typeof lessonMetadataSchema>;

// Lección completa
export const lessonSchema = z.object({
  metadata: lessonMetadataSchema,
  slides: z.array(slideSchema).min(1),
});

export type Lesson = z.infer<typeof lessonSchema>;

// Helper para validar una lección completa
export function validateLesson(data: unknown): Lesson {
  return lessonSchema.parse(data);
}

// Helper para validación segura
export function safeValidateLesson(data: unknown) {
  return lessonSchema.safeParse(data);
}
