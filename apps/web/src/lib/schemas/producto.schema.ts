import { z } from 'zod';

/**
 * Schema principal de Producto
 * Coincide EXACTAMENTE con el tipo Producto en types/catalogo.types.ts
 *
 * NOTA: Prisma devuelve Decimal como string, usamos coerce para convertir
 */
export const productoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(), // Opcional en Prisma
  precio: z.coerce.number(), // Prisma Decimal viene como string
  tipo: z.enum(['Evento', 'Digital', 'Fisico', 'Curso', 'Servicio', 'Bundle', 'Certificacion']),
  subcategoria: z.string().nullable().optional(),
  duracion_dias: z.coerce.number().nullable().optional(), // Campo legacy, puede no existir
  activo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Campos opcionales según tipo (Evento, Curso)
  fecha_inicio: z.string().nullable().optional(),
  fecha_fin: z.string().nullable().optional(),
  cupo_maximo: z.coerce.number().nullable().optional(),
  duracion_meses: z.coerce.number().nullable().optional(), // Campo real de Prisma
});

/**
 * Lista de productos
 */
export const productosListSchema = z.array(productoSchema);

/**
 * Derivar tipos desde los schemas
 */
export type ProductoSchemaType = z.infer<typeof productoSchema>;
