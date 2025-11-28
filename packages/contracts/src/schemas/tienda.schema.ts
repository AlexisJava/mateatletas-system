/**
 * Schemas Zod para el sistema de Tienda y Recursos
 * Define tipos y validaciones para XP, Monedas, Gemas, Items, Compras
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const TipoRecursoSchema = z.enum(['XP', 'MONEDAS', 'GEMAS']);
export type TipoRecurso = z.infer<typeof TipoRecursoSchema>;

export const TipoItemSchema = z.enum([
  'AVATAR',
  'SKIN',
  'ACCESORIO',
  'POWERUP',
  'COSMETICO',
  'TITULO',
  'EMOJI',
  'FONDO',
  'MARCO',
]);
export type TipoItem = z.infer<typeof TipoItemSchema>;

export const RarezaItemSchema = z.enum(['COMUN', 'RARO', 'EPICO', 'LEGENDARIO']);
export type RarezaItem = z.infer<typeof RarezaItemSchema>;

// ============================================================================
// RECURSOS DEL ESTUDIANTE
// ============================================================================

export const RecursosEstudianteSchema = z.object({
  id: z.string().cuid(),
  estudiante_id: z.string().cuid(),
  xp_total: z.number().int().nonnegative(),
  monedas_total: z.number().int().nonnegative(),
  gemas_total: z.number().int().nonnegative(),
  ultima_actualizacion: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type RecursosEstudiante = z.infer<typeof RecursosEstudianteSchema>;

// DTO para crear/actualizar recursos
export const CreateRecursosEstudianteSchema = z.object({
  estudiante_id: z.string().cuid(),
});
export type CreateRecursosEstudiante = z.infer<typeof CreateRecursosEstudianteSchema>;

// ============================================================================
// TRANSACCIONES DE RECURSOS
// ============================================================================

export const TransaccionRecursoSchema = z.object({
  id: z.string().cuid(),
  recursos_estudiante_id: z.string().cuid(),
  tipo_recurso: TipoRecursoSchema,
  cantidad: z.number().int(),
  razon: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  fecha: z.coerce.date(),
  createdAt: z.coerce.date(),
});
export type TransaccionRecurso = z.infer<typeof TransaccionRecursoSchema>;

// DTO para crear transacción
export const CreateTransaccionRecursoSchema = z.object({
  recursos_estudiante_id: z.string().cuid(),
  tipo_recurso: TipoRecursoSchema,
  cantidad: z.number().int(),
  razon: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateTransaccionRecurso = z.infer<typeof CreateTransaccionRecursoSchema>;

// ============================================================================
// CATEGORÍAS DE ITEMS
// ============================================================================

export const CategoriaItemSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  icono: z.string().min(1),
  orden: z.number().int().nonnegative(),
  activa: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CategoriaItem = z.infer<typeof CategoriaItemSchema>;

// DTO para crear categoría
export const CreateCategoriaItemSchema = z.object({
  nombre: z.string().min(1).max(50),
  descripcion: z.string().max(200).optional(),
  icono: z.string().min(1).max(10),
  orden: z.number().int().nonnegative().default(0),
  activa: z.boolean().default(true),
});
export type CreateCategoriaItem = z.infer<typeof CreateCategoriaItemSchema>;

// DTO para actualizar categoría
export const UpdateCategoriaItemSchema = CreateCategoriaItemSchema.partial();
export type UpdateCategoriaItem = z.infer<typeof UpdateCategoriaItemSchema>;

// ============================================================================
// ITEMS DE LA TIENDA
// ============================================================================

export const ItemTiendaSchema = z.object({
  id: z.string().cuid(),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  categoria_id: z.string().cuid(),
  tipo_item: TipoItemSchema,
  precio_monedas: z.number().int().nonnegative(),
  precio_gemas: z.number().int().nonnegative(),
  imagen_url: z.string().url().optional(),
  rareza: RarezaItemSchema,
  edicion_limitada: z.boolean(),
  fecha_inicio: z.coerce.date().optional(),
  fecha_fin: z.coerce.date().optional(),
  nivel_minimo_requerido: z.number().int().positive(),
  disponible: z.boolean(),
  veces_comprado: z.number().int().nonnegative(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ItemTienda = z.infer<typeof ItemTiendaSchema>;

// Item con información de categoría
export const ItemTiendaConCategoriaSchema = ItemTiendaSchema.extend({
  categoria: CategoriaItemSchema,
});
export type ItemTiendaConCategoria = z.infer<typeof ItemTiendaConCategoriaSchema>;

// DTO para crear item
export const CreateItemTiendaSchema = z
  .object({
    nombre: z.string().min(1).max(100),
    descripcion: z.string().max(500).optional(),
    categoria_id: z.string().cuid(),
    tipo_item: TipoItemSchema,
    precio_monedas: z.number().int().nonnegative().default(0),
    precio_gemas: z.number().int().nonnegative().default(0),
    imagen_url: z.string().url().optional(),
    rareza: RarezaItemSchema.default('COMUN'),
    edicion_limitada: z.boolean().default(false),
    fecha_inicio: z.coerce.date().optional(),
    fecha_fin: z.coerce.date().optional(),
    nivel_minimo_requerido: z.number().int().positive().default(1),
    disponible: z.boolean().default(true),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((data) => data.precio_monedas > 0 || data.precio_gemas > 0, {
    message: 'El item debe tener al menos un precio (monedas o gemas)',
    path: ['precio_monedas'],
  });
export type CreateItemTienda = z.infer<typeof CreateItemTiendaSchema>;

// DTO para actualizar item
export const UpdateItemTiendaSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().max(500).optional(),
  categoria_id: z.string().cuid().optional(),
  tipo_item: TipoItemSchema.optional(),
  precio_monedas: z.number().int().nonnegative().optional(),
  precio_gemas: z.number().int().nonnegative().optional(),
  imagen_url: z.string().url().optional(),
  rareza: RarezaItemSchema.optional(),
  edicion_limitada: z.boolean().optional(),
  fecha_inicio: z.coerce.date().optional(),
  fecha_fin: z.coerce.date().optional(),
  nivel_minimo_requerido: z.number().int().positive().optional(),
  disponible: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type UpdateItemTienda = z.infer<typeof UpdateItemTiendaSchema>;

// ============================================================================
// ITEMS OBTENIDOS (INVENTARIO)
// ============================================================================

export const ItemObtenidoSchema = z.object({
  id: z.string().cuid(),
  estudiante_id: z.string().cuid(),
  item_id: z.string().cuid(),
  fecha_obtencion: z.coerce.date(),
  equipado: z.boolean(),
  cantidad: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ItemObtenido = z.infer<typeof ItemObtenidoSchema>;

// Item obtenido con información del item
export const ItemObtenidoConInfoSchema = ItemObtenidoSchema.extend({
  item: ItemTiendaConCategoriaSchema,
});
export type ItemObtenidoConInfo = z.infer<typeof ItemObtenidoConInfoSchema>;

// ============================================================================
// COMPRAS
// ============================================================================

export const CompraItemSchema = z.object({
  id: z.string().cuid(),
  recursos_estudiante_id: z.string().cuid(),
  item_id: z.string().cuid(),
  monedas_gastadas: z.number().int().nonnegative(),
  gemas_gastadas: z.number().int().nonnegative(),
  fecha_compra: z.coerce.date(),
  createdAt: z.coerce.date(),
});
export type CompraItem = z.infer<typeof CompraItemSchema>;

// DTO para realizar compra
export const RealizarCompraSchema = z.object({
  item_id: z.string().cuid(),
  estudiante_id: z.string().cuid(),
});
export type RealizarCompra = z.infer<typeof RealizarCompraSchema>;

// ============================================================================
// DTOs DE RESPUESTA
// ============================================================================

// Respuesta al obtener items de la tienda
export const ItemsTiendaResponseSchema = z.object({
  items: z.array(ItemTiendaConCategoriaSchema),
  total: z.number().int().nonnegative(),
  categorias: z.array(CategoriaItemSchema),
});
export type ItemsTiendaResponse = z.infer<typeof ItemsTiendaResponseSchema>;

// Respuesta al obtener inventario del estudiante
export const InventarioEstudianteResponseSchema = z.object({
  items: z.array(ItemObtenidoConInfoSchema),
  total: z.number().int().nonnegative(),
  recursos: RecursosEstudianteSchema,
});
export type InventarioEstudianteResponse = z.infer<typeof InventarioEstudianteResponseSchema>;

// Respuesta al realizar compra
export const CompraResponseSchema = z.object({
  compra: CompraItemSchema,
  item_obtenido: ItemObtenidoSchema,
  recursos_actualizados: RecursosEstudianteSchema,
  mensaje: z.string(),
});
export type CompraResponse = z.infer<typeof CompraResponseSchema>;

// Respuesta de recursos actualizados (después de completar actividad)
export const RecursosActualizadosResponseSchema = z.object({
  recursos: RecursosEstudianteSchema,
  transacciones: z.array(TransaccionRecursoSchema),
  mensaje: z.string(),
});
export type RecursosActualizadosResponse = z.infer<typeof RecursosActualizadosResponseSchema>;

// DTO para actualizar recursos después de actividad
export const ActualizarRecursosPorActividadSchema = z.object({
  estudiante_id: z.string().cuid(),
  xp_ganado: z.number().int().nonnegative(),
  monedas_ganadas: z.number().int().nonnegative(),
  gemas_ganadas: z.number().int().nonnegative().optional(),
  actividad_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ActualizarRecursosPorActividad = z.infer<typeof ActualizarRecursosPorActividadSchema>;

// ============================================================================
// FILTROS Y QUERIES
// ============================================================================

// Filtros para listar items de la tienda
export const FiltrosItemsTiendaSchema = z.object({
  categoria_id: z.string().cuid().optional(),
  tipo_item: TipoItemSchema.optional(),
  rareza: RarezaItemSchema.optional(),
  nivel_estudiante: z.number().int().positive().optional(),
  solo_disponibles: z.boolean().default(true),
  incluir_edicion_limitada: z.boolean().default(true),
});
export type FiltrosItemsTienda = z.infer<typeof FiltrosItemsTiendaSchema>;

// Filtros para inventario
export const FiltrosInventarioSchema = z.object({
  tipo_item: TipoItemSchema.optional(),
  equipado: z.boolean().optional(),
});
export type FiltrosInventario = z.infer<typeof FiltrosInventarioSchema>;
