/**
 * Types para el módulo de Catálogo de Productos
 */

/**
 * Tipos de producto disponibles
 */
export enum TipoProducto {
  Suscripcion = 'Suscripcion',
  Curso = 'Curso',
  Recurso = 'Recurso',
}

/**
 * Producto del catálogo
 */
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: TipoProducto;
  duracion_dias: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros para productos
 */
export type FiltroProducto = 'todos' | TipoProducto;

/**
 * Response del API para lista de productos
 */
export interface ProductosResponse {
  productos: Producto[];
  total: number;
}
