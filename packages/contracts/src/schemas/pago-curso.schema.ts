import { z } from 'zod';

// ============================================================================
// PAGO CURSO SCHEMAS (Cursos Temporales)
// ============================================================================

/**
 * Modalidad de pago de curso
 */
export const modalidadPagoCursoEnum = z.enum([
  'CONTADO', // Pago único
  'CUOTAS', // Pago en cuotas
]);

export type ModalidadPagoCurso = z.infer<typeof modalidadPagoCursoEnum>;

/**
 * Estado de pago de curso
 */
export const estadoPagoCursoEnum = z.enum([
  'PENDING', // Esperando pago
  'PAID', // Pagado completo
  'PARTIAL', // Parcialmente pagado (cuotas)
  'FAILED', // Pago fallido
  'REFUNDED', // Reembolsado
]);

export type EstadoPagoCurso = z.infer<typeof estadoPagoCursoEnum>;

/**
 * Schema base de PagoCurso
 */
export const pagoCursoSchema = z.object({
  id: z.string(),

  // Relaciones
  tutor_id: z.string(),
  estudiante_id: z.string(),
  comision_id: z.string(),
  producto_id: z.string(),

  // Modalidad de pago
  modalidad: modalidadPagoCursoEnum,

  // Montos
  monto_total: z.number().int().positive('El monto total debe ser positivo'),
  monto_por_cuota: z.number().int().positive().nullable().optional(),
  cantidad_cuotas: z.number().int().positive().nullable().optional(),
  cuotas_pagadas: z.number().int().nonnegative().default(0),

  // MercadoPago
  payment_id: z.string().nullable().optional(),
  preapproval_id: z.string().nullable().optional(),

  // Estado
  estado: estadoPagoCursoEnum,

  // Fechas
  fecha_pago: z.string().datetime().nullable().optional(),
  fecha_proximo_cobro: z.string().datetime().nullable().optional(),

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PagoCurso = z.infer<typeof pagoCursoSchema>;

/**
 * Schema para crear pago de curso (contado)
 */
export const createPagoCursoContadoSchema = z.object({
  estudiante_id: z.string(),
  comision_id: z.string(),
  producto_id: z.string(),
  modalidad: z.literal('CONTADO'),
  monto_total: z.number().int().positive('El monto total debe ser positivo'),
});

export type CreatePagoCursoContadoDto = z.infer<typeof createPagoCursoContadoSchema>;

/**
 * Schema para crear pago de curso (cuotas)
 */
export const createPagoCursoCuotasSchema = z.object({
  estudiante_id: z.string(),
  comision_id: z.string(),
  producto_id: z.string(),
  modalidad: z.literal('CUOTAS'),
  monto_total: z.number().int().positive('El monto total debe ser positivo'),
  monto_por_cuota: z.number().int().positive('El monto por cuota debe ser positivo'),
  cantidad_cuotas: z.number().int().min(2, 'Mínimo 2 cuotas').max(12, 'Máximo 12 cuotas'),
});

export type CreatePagoCursoCuotasDto = z.infer<typeof createPagoCursoCuotasSchema>;

/**
 * Schema unificado para crear pago de curso
 */
export const createPagoCursoSchema = z.discriminatedUnion('modalidad', [
  createPagoCursoContadoSchema,
  createPagoCursoCuotasSchema,
]);

export type CreatePagoCursoDto = z.infer<typeof createPagoCursoSchema>;

/**
 * Schema para actualizar pago de curso
 */
export const updatePagoCursoSchema = z.object({
  estado: estadoPagoCursoEnum.optional(),
  payment_id: z.string().nullable().optional(),
  preapproval_id: z.string().nullable().optional(),
  fecha_pago: z.string().datetime().nullable().optional(),
  fecha_proximo_cobro: z.string().datetime().nullable().optional(),
  cuotas_pagadas: z.number().int().nonnegative().optional(),
});

export type UpdatePagoCursoDto = z.infer<typeof updatePagoCursoSchema>;

/**
 * Schema con relaciones incluidas (para responses)
 */
export const pagoCursoWithRelationsSchema = pagoCursoSchema.extend({
  tutor: z
    .object({
      id: z.string(),
      nombre: z.string(),
      apellido: z.string(),
      email: z.string().email(),
    })
    .optional(),
  estudiante: z
    .object({
      id: z.string(),
      nombre: z.string(),
      apellido: z.string(),
    })
    .optional(),
  comision: z
    .object({
      id: z.string(),
      nombre: z.string(),
      fecha_inicio: z.string().datetime(),
      fecha_fin: z.string().datetime(),
    })
    .optional(),
  producto: z
    .object({
      id: z.string(),
      nombre: z.string(),
      precio: z.number(),
    })
    .optional(),
});

export type PagoCursoWithRelations = z.infer<typeof pagoCursoWithRelationsSchema>;

/**
 * Schema para lista de pagos de curso
 */
export const pagosCursoListSchema = z.array(pagoCursoSchema);

export type PagosCursoList = z.infer<typeof pagosCursoListSchema>;

/**
 * Schema para resumen de pagos (dashboard tutor)
 */
export const pagosCursoResumenSchema = z.object({
  total_pagos: z.number(),
  monto_total_pagado: z.number(),
  pagos_pendientes: z.number(),
  proximos_cobros: z.array(
    z.object({
      id: z.string(),
      producto_nombre: z.string(),
      monto: z.number(),
      fecha: z.string().datetime(),
      cuota_numero: z.number(),
      cuotas_total: z.number(),
    }),
  ),
});

export type PagosCursoResumen = z.infer<typeof pagosCursoResumenSchema>;
