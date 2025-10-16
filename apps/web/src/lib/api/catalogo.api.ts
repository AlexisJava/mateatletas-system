/**
 * API Client para Catálogo de Productos
 */

import axios from '../axios';
import { Producto, TipoProducto } from '@/types/catalogo.types';

// Re-export types for convenience
export type { Producto } from '@/types/catalogo.types';
export { TipoProducto } from '@/types/catalogo.types';

/**
 * DTO para crear/actualizar producto
 */
export interface CrearProductoDto {
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: TipoProducto | string;
  activo: boolean;
  // Campos específicos por tipo
  fecha_inicio?: string;
  fecha_fin?: string;
  cupo_maximo?: number;
  duracion_meses?: number;
  duracion_dias?: number;
}

/**
 * Obtener todos los productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto[]>('/productos') as unknown as Producto[];
};

/**
 * Obtener producto por ID
 */
export const getProductoPorId = async (id: string): Promise<Producto> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto>(`/productos/${id}`) as unknown as Producto;
};

/**
 * Obtener solo cursos
 */
export const getCursos = async (): Promise<Producto[]> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto[]>('/productos/cursos') as unknown as Producto[];
};

/**
 * Obtener solo suscripciones
 */
export const getSuscripciones = async (): Promise<Producto[]> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto[]>('/productos/suscripciones') as unknown as Producto[];
};

/**
 * Filtrar productos por tipo
 */
export const getProductosPorTipo = async (
  tipo: TipoProducto
): Promise<Producto[]> => {
  if (tipo === TipoProducto.Curso) return getCursos();
  if (tipo === TipoProducto.Suscripcion) return getSuscripciones();
  return getProductos();
};
