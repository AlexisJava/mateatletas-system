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

  // Campos específicos para tipo Curso
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  cupo_maximo?: number | null;

  // Campos específicos para tipo Suscripcion
  duracion_meses?: number | null;
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
