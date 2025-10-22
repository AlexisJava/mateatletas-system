import { z } from 'zod';
import { membresiaSchema } from './membresia.schema';

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

const pagoTutorSchema = z.object({
  nombre: z.string(),
  apellido: z.string(),
  email: z.string(),
});

const pagoProductoBasicoSchema = z.object({
  id: z.string().optional(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  precio: z.number().optional(),
  tipo: z.string(),
});

const pagoEstudianteSchema = z.object({
  nombre: z.string(),
  apellido: z.string(),
});

export const adminPagoSchema = z.object({
  id: z.string(),
  monto: z.number(),
  estado: z.string(),
  mercadopago_payment_id: z.string().nullable().optional(),
  fecha_pago: z.string(),
  tutor: pagoTutorSchema,
  producto: pagoProductoBasicoSchema.pick({ nombre: true, tipo: true }),
  membresia: z
    .object({
      estado: z.string(),
      estudiantes: z.array(pagoEstudianteSchema),
    })
    .optional(),
  inscripcion: z
    .object({
      estudiante: pagoEstudianteSchema,
    })
    .optional(),
});

export const adminPagosResponseSchema = z.union([
  z.array(adminPagoSchema),
  z.object({
    message: z.string().optional(),
    pagos: z.array(adminPagoSchema),
  }),
]);

const historialProductoSchema = pagoProductoBasicoSchema.extend({
  precio: z.number(),
});

const historialEstudianteSchema = z
  .object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
  })
  .nullable();

const historialEntrySchema = z.object({
  id: z.string(),
  tipo: z.enum(['membresia', 'curso']),
  producto: historialProductoSchema,
  estado: z.string(),
  fecha: z
    .union([z.string(), z.date()])
    .transform((value) => (value instanceof Date ? value.toISOString() : value)),
  monto: z.number(),
  estudiante: historialEstudianteSchema,
});

const inscripcionActivaSchema = z
  .object({
    id: z.string(),
    estudiante_id: z.string(),
    producto_id: z.string(),
    estado: z.string(),
    fecha_inscripcion: z.string().nullable().optional(),
    pago_id: z.string().optional(),
    createdAt: z
      .union([z.string(), z.date()])
      .transform((value) => (value instanceof Date ? value.toISOString() : value)),
    updatedAt: z
      .union([z.string(), z.date()])
      .optional()
      .transform((value) => (value instanceof Date ? value.toISOString() : value)),
    producto: historialProductoSchema.optional(),
    estudiante: historialEstudianteSchema,
  })
  .passthrough();

export const pagosHistorialSchema = z.object({
  historial: z.array(historialEntrySchema),
  resumen: z
    .object({
      total_pagos: z.number(),
      total_gastado: z.number(),
      membresias_activas: z.number(),
      cursos_activos: z.number(),
      pagos_pendientes: z.number().optional(),
      pagos_aprobados: z.number().optional(),
      pagos_rechazados: z.number().optional(),
    })
    .passthrough(),
  activos: z.object({
    membresia_actual: membresiaSchema.nullable().optional(),
    inscripciones_cursos_activas: z.array(inscripcionActivaSchema),
  }),
});

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
export type AdminPago = z.infer<typeof adminPagoSchema>;
export type PagosHistorial = z.infer<typeof pagosHistorialSchema>;
