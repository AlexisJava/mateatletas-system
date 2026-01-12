import { z } from 'zod';
import {
  presentationIntentSchema,
  interactionIntentSchema,
  gamificationIntentSchema,
  narrativeIntentSchema,
  layoutIntentSchema,
  closureIntentSchema,
} from './intents';

// Union de TODOS los intents posibles
export const slideSchema = z.union([
  presentationIntentSchema,
  interactionIntentSchema,
  gamificationIntentSchema,
  narrativeIntentSchema,
  layoutIntentSchema,
  closureIntentSchema,
]);

export type Slide = z.infer<typeof slideSchema>;

// Helper para validar un slide
export function validateSlide(data: unknown): Slide {
  return slideSchema.parse(data);
}

// Helper para validación segura (no tira error)
export function safeValidateSlide(data: unknown) {
  return slideSchema.safeParse(data);
}
