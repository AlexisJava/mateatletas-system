/**
 * API Client para Catálogo de Productos
 */

import axios from '../axios';
import { Producto, TipoProducto } from '@/types/catalogo.types';
import {
  productoSchema,
  productosListSchema,
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
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<Producto[]>('/productos');
    return productosListSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener los productos del catálogo:', error);
    throw error;
  }
};

/**
 * Obtener producto por ID
 */
export const getProductoPorId = async (id: string): Promise<Producto> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<Producto>(`/productos/${id}`);
    return productoSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener el producto del catálogo por ID:', error);
    throw error;
  }
};

/**
 * Obtener solo cursos
 */
export const getCursos = async (): Promise<Producto[]> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<Producto[]>('/productos/cursos');
    return productosListSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener los cursos del catálogo:', error);
    throw error;
  }
};

/**
 * Obtener solo suscripciones
 */
export const getSuscripciones = async (): Promise<Producto[]> => {
    // El interceptor ya retorna response.data directamente
  try {
    const response = await axios.get<Producto[]>(
      '/productos/suscripciones'
    );
    return productosListSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener las suscripciones del catálogo:', error);
    throw error;
  }
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
