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
  tutorId: z.string(),
  estudianteId: z.string(),
  comisionId: z.string(),
  productoId: z.string(),

  // Modalidad de pago
  modalidad: modalidadPagoCursoEnum,

  // Montos
  montoTotal: z.number().int().positive('El monto total debe ser positivo'),
  montoPorCuota: z.number().int().positive().nullable().optional(),
  cantidadCuotas: z.number().int().positive().nullable().optional(),
  cuotasPagadas: z.number().int().nonnegative().default(0),

  // MercadoPago
  paymentId: z.string().nullable().optional(),
  preapprovalId: z.string().nullable().optional(),

  // Estado
  estado: estadoPagoCursoEnum,

  // Fechas
  fechaPago: z.string().datetime().nullable().optional(),
  fechaProximoCobro: z.string().datetime().nullable().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PagoCurso = z.infer<typeof pagoCursoSchema>;

/**
 * Schema para crear pago de curso (contado)
 */
export const createPagoCursoContadoSchema = z.object({
  estudianteId: z.string(),
  comisionId: z.string(),
  productoId: z.string(),
  modalidad: z.literal('CONTADO'),
  montoTotal: z.number().int().positive('El monto total debe ser positivo'),
});

export type CreatePagoCursoContadoDto = z.infer<typeof createPagoCursoContadoSchema>;

/**
 * Schema para crear pago de curso (cuotas)
 */
export const createPagoCursoCuotasSchema = z.object({
  estudianteId: z.string(),
  comisionId: z.string(),
  productoId: z.string(),
  modalidad: z.literal('CUOTAS'),
  montoTotal: z.number().int().positive('El monto total debe ser positivo'),
  montoPorCuota: z.number().int().positive('El monto por cuota debe ser positivo'),
  cantidadCuotas: z.number().int().min(2, 'Mínimo 2 cuotas').max(12, 'Máximo 12 cuotas'),
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
  paymentId: z.string().nullable().optional(),
  preapprovalId: z.string().nullable().optional(),
  fechaPago: z.string().datetime().nullable().optional(),
  fechaProximoCobro: z.string().datetime().nullable().optional(),
  cuotasPagadas: z.number().int().nonnegative().optional(),
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
      fechaInicio: z.string().datetime(),
      fechaFin: z.string().datetime(),
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
  totalPagos: z.number(),
  montoTotalPagado: z.number(),
  pagosPendientes: z.number(),
  proximosCobros: z.array(
    z.object({
      id: z.string(),
      productoNombre: z.string(),
      monto: z.number(),
      fecha: z.string().datetime(),
      cuotaNumero: z.number(),
      cuotasTotal: z.number(),
    }),
  ),
});

export type PagosCursoResumen = z.infer<typeof pagosCursoResumenSchema>;
