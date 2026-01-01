import { z } from 'zod';

// ============================================================================
// PRODUCTO (CATÁLOGO) SCHEMAS
// ============================================================================

/**
 * Enum para tipo de producto
 * - Evento: Colonia, talleres, workshops (con fecha y cupo)
 * - Digital: PDFs, guías, videos descargables
 * - Fisico: Remeras, libros, merch (con stock)
 * - Curso: Cursos online con duración
 * - Servicio: Clase particular, mentoría 1:1
 * - Bundle: Combo de productos
 * - Certificacion: Examen + certificado
 */
export const tipoProductoEnum = z.enum([
  'Evento',
  'Digital',
  'Fisico',
  'Curso',
  'Servicio',
  'Bundle',
  'Certificacion',
]);

export type TipoProducto = z.infer<typeof tipoProductoEnum>;

/**
 * Schema base de Producto
 */
export const productoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  precio: z.number().positive('El precio debe ser positivo'),
  tipo: tipoProductoEnum,
  subcategoria: z.string().nullable().optional(),
  activo: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Campos específicos para Evento/Curso
  fecha_inicio: z.string().datetime().nullable().optional(),
  fecha_fin: z.string().datetime().nullable().optional(),
  cupo_maximo: z.number().int().positive().nullable().optional(),
  // Campos específicos para Servicio
  duracion_meses: z.number().int().positive().nullable().optional(),
  duracion_dias: z.number().int().positive().nullable().optional(),
});

export type Producto = z.infer<typeof productoSchema>;

/**
 * Schema para lista de productos
 */
export const productosListSchema = z.array(productoSchema);

export type ProductosList = z.infer<typeof productosListSchema>;

/**
 * Schema para response de productos
 */
export const productosResponseSchema = z.object({
  productos: z.array(productoSchema),
  total: z.number(),
});

export type ProductosResponse = z.infer<typeof productosResponseSchema>;

/**
 * Schema para crear producto
 */
export const createProductoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string(),
  precio: z.number().positive('El precio debe ser positivo'),
  tipo: tipoProductoEnum,
  subcategoria: z.string().optional(),
  activo: z.boolean(),
  // Campos opcionales según tipo
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  cupo_maximo: z.number().int().positive().optional(),
  duracion_meses: z.number().int().positive().optional(),
  duracion_dias: z.number().int().positive().optional(),
});

export type CreateProductoDto = z.infer<typeof createProductoSchema>;

/**
 * Schema para actualizar producto
 */
export const updateProductoSchema = createProductoSchema.partial();

export type UpdateProductoDto = z.infer<typeof updateProductoSchema>;
