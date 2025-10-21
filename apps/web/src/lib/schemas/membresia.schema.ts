import { z } from 'zod';

/**
 * Schema de estado de membresía
 * Coincide con EstadoMembresia enum en types/pago.types.ts
 */
export const estadoMembresiaSchema = z.enum([
  'Pendiente',
  'Activa',
  'Vencida',
  'Cancelada',
]);

/**
 * Schema de Producto simplificado (para relación en Membresía)
 */
const productoEnMembresiaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  precio: z.number(),
  tipo: z.string(),
});

/**
 * Schema principal de Membresía
 * Coincide con Membresia interface en types/pago.types.ts
 */
export const membresiaSchema = z.object({
  id: z.string(),
  tutor_id: z.string(),
  producto_id: z.string(),
  estado: estadoMembresiaSchema,
  fecha_inicio: z.string().nullable(),
  fecha_vencimiento: z.string().nullable(),
  pago_id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Relación opcional con producto
  producto: productoEnMembresiaSchema.optional(),
});

/**
 * Schema para lista de membresías
 */
export const membresiasListSchema = z.array(membresiaSchema);

/**
 * Schema para respuesta de estado de membresía
 * Coincide con EstadoMembresiaResponse en types/pago.types.ts
 */
export const estadoMembresiaResponseSchema = z.object({
  tiene_membresia: z.boolean(),
  membresia: membresiaSchema.nullable(),
});

/**
 * Schema para crear membresía
 */
export const createMembresiaSchema = membresiaSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  producto: true,
});

/**
 * Schema para actualizar membresía
 */
export const updateMembresiaSchema = membresiaSchema.partial().required({ id: true });

// ============================================
// TIPOS DERIVADOS
// ============================================

export type MembresiaFromSchema = z.infer<typeof membresiaSchema>;
export type EstadoMembresia = z.infer<typeof estadoMembresiaSchema>;
export type EstadoMembresiaResponse = z.infer<typeof estadoMembresiaResponseSchema>;
export type CreateMembresiaInput = z.infer<typeof createMembresiaSchema>;
export type UpdateMembresiaInput = z.infer<typeof updateMembresiaSchema>;
