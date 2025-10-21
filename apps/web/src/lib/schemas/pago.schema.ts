import { z } from 'zod';

/**
 * Schema de estado de inscripción a curso
 * Coincide con EstadoInscripcion enum en types/pago.types.ts
 */
export const estadoInscripcionSchema = z.enum([
  'PreInscrito',
  'Inscrito',
  'Cancelado',
]);

/**
 * Schema de Producto simplificado (para relaciones)
 */
const productoEnPagoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  precio: z.number(),
  tipo: z.string(),
});

/**
 * Schema de Pago
 * Coincide con Pago interface en types/pago.types.ts
 */
export const pagoSchema = z.object({
  id: z.string(),
  tutor_id: z.string(),
  monto: z.number().nonnegative(),
  metodo_pago: z.string(),
  estado_pago: z.string(),
  mercado_pago_id: z.string().nullable(),
  mercado_pago_status: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema de Inscripción a Curso
 * Coincide con InscripcionCurso interface en types/pago.types.ts
 */
export const inscripcionCursoSchema = z.object({
  id: z.string(),
  estudiante_id: z.string(),
  producto_id: z.string(),
  estado: estadoInscripcionSchema,
  fecha_inscripcion: z.string().nullable(),
  pago_id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Relación opcional con producto
  producto: productoEnPagoSchema.optional(),
});

/**
 * Schema de Preferencia de Pago (MercadoPago)
 * Coincide con PreferenciaPago interface en types/pago.types.ts
 */
export const preferenciaPagoSchema = z.object({
  id: z.string(),
  init_point: z.string().url(),
  sandbox_init_point: z.string().url().optional(),
});

/**
 * Schema para crear preferencia de suscripción
 * Coincide con CrearPreferenciaSuscripcionRequest en types/pago.types.ts
 */
export const crearPreferenciaSuscripcionSchema = z.object({
  producto_id: z.string(),
});

/**
 * Schema para crear preferencia de curso
 * Coincide con CrearPreferenciaCursoRequest en types/pago.types.ts
 */
export const crearPreferenciaCursoSchema = z.object({
  producto_id: z.string(),
  estudiante_id: z.string(),
});

/**
 * Schema para lista de inscripciones a cursos
 */
export const inscripcionesCursoListSchema = z.array(inscripcionCursoSchema);

/**
 * Schema para lista de pagos
 */
export const pagosListSchema = z.array(pagoSchema);

/**
 * Schema para crear pago
 */
export const createPagoSchema = pagoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema para actualizar pago
 */
export const updatePagoSchema = pagoSchema.partial().required({ id: true });

// ============================================
// TIPOS DERIVADOS
// ============================================

export type PagoFromSchema = z.infer<typeof pagoSchema>;
export type InscripcionCursoFromSchema = z.infer<typeof inscripcionCursoSchema>;
export type EstadoInscripcion = z.infer<typeof estadoInscripcionSchema>;
export type PreferenciaPago = z.infer<typeof preferenciaPagoSchema>;
export type CrearPreferenciaSuscripcionInput = z.infer<typeof crearPreferenciaSuscripcionSchema>;
export type CrearPreferenciaCursoInput = z.infer<typeof crearPreferenciaCursoSchema>;
export type CreatePagoInput = z.infer<typeof createPagoSchema>;
export type UpdatePagoInput = z.infer<typeof updatePagoSchema>;
