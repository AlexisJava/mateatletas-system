import { productoSchema, productosResponseSchema, tipoProductoEnum } from '@mateatletas/contracts';
import type { z } from 'zod';

/**
 * Tipos de producto disponibles
 */
export const TipoProducto = tipoProductoEnum.enum;
export type TipoProducto = (typeof TipoProducto)[keyof typeof TipoProducto];

/**
 * Producto del catálogo
 */
export type Producto = z.infer<typeof productoSchema>;

/**
 * Filtros para productos
 */
export type FiltroProducto = 'todos' | TipoProducto;

/**
 * Response del API para lista de productos
 */
export type ProductosResponse = z.infer<typeof productosResponseSchema>;
