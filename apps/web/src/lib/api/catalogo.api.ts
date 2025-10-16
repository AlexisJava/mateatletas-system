/**
 * API Client para Catálogo de Productos
 */

import axios from '../axios';
import { Producto, TipoProducto } from '@/types/catalogo.types';

/**
 * Obtener todos los productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto[]>('/productos');
};

/**
 * Obtener producto por ID
 */
export const getProductoPorId = async (id: string): Promise<Producto> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto>(`/productos/${id}`);
};

/**
 * Obtener solo cursos
 */
export const getCursos = async (): Promise<Producto[]> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto[]>('/productos/cursos');
};

/**
 * Obtener solo suscripciones
 */
export const getSuscripciones = async (): Promise<Producto[]> => {
  // El interceptor ya retorna response.data
  return await axios.get<Producto[]>('/productos/suscripciones');
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
