import { TipoProducto } from '../types/pagos.types';

/**
 * Interface simplificada del repositorio de Productos
 * Solo expone los métodos necesarios para el módulo de pagos
 *
 * El repositorio real está en el módulo de productos
 * Esta interface permite desacoplar el módulo de pagos
 */
export interface IProductoRepository {
  /**
   * Obtiene un producto por su ID
   * @returns Producto o null si no existe
   */
  obtenerPorId(id: string): Promise<Producto | null>;

  /**
   * Obtiene múltiples productos por sus IDs
   * @returns Array de productos (solo los que existen)
   */
  obtenerPorIds(ids: readonly string[]): Promise<Producto[]>;
}

/**
 * Representa un producto (vista para pagos)
 * Solo incluye los campos necesarios para cálculos de precios
 */
export interface Producto {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TipoProducto;
}
