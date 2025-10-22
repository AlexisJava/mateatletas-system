/**
 * API Client para Catálogo de Productos
 */

import axios from '../axios';
import { Producto, TipoProducto } from '@/types/catalogo.types';
import {
  productoSchema,
  productosListSchema,
  createProductoSchema,
  updateProductoSchema,
  type CreateProductoDto,
  type UpdateProductoDto,
} from '@mateatletas/contracts';

// Re-export types for convenience
export type { Producto } from '@/types/catalogo.types';
export { TipoProducto } from '@/types/catalogo.types';
export type CrearProductoDto = CreateProductoDto;
export type ActualizarProductoDto = UpdateProductoDto;

/**
 * Obtener todos los productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  const response = await axios.get<Producto[]>('/productos');
  return productosListSchema.parse(response);
};

/**
 * Obtener producto por ID
 */
export const getProductoPorId = async (id: string): Promise<Producto> => {
  const response = await axios.get<Producto>(`/productos/${id}`);
  return productoSchema.parse(response);
};

/**
 * Obtener solo cursos
 */
export const getCursos = async (): Promise<Producto[]> => {
  const response = await axios.get<Producto[]>('/productos/cursos');
  return productosListSchema.parse(response);
};

/**
 * Obtener solo suscripciones
 */
export const getSuscripciones = async (): Promise<Producto[]> => {
  const response = await axios.get<Producto[]>('/productos/suscripciones');
  return productosListSchema.parse(response);
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
