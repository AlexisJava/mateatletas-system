import { z } from 'zod';

/**
 * Schema principal de Producto
 * Coincide EXACTAMENTE con el tipo Producto en types/catalogo.types.ts
 */
export const productoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  precio: z.number(),
  tipo: z.enum(['Suscripcion', 'Curso', 'Recurso']), // Coincidir con TipoProducto enum
  duracion_dias: z.number().nullable(),
  activo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Campos opcionales según tipo
  fecha_inicio: z.string().nullable().optional(),
  fecha_fin: z.string().nullable().optional(),
  cupo_maximo: z.number().nullable().optional(),
  duracion_meses: z.number().nullable().optional(),
});

/**
 * Lista de productos
 */
export const productosListSchema = z.array(productoSchema);

/**
 * Derivar tipos desde los schemas
 */
export type ProductoSchemaType = z.infer<typeof productoSchema>;
