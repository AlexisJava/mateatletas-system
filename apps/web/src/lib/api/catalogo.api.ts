/**
 * API Client para Catálogo de Productos
 */

import axios from '../axios';
import { Producto, TipoProducto } from '@/types/catalogo.types';

/**
 * Obtener todos los productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  console.log('🟠 [CATALOGO API] getProductos - llamando a /productos');
  const response = await axios.get('/productos');
  console.log('🟠 [CATALOGO API] getProductos - response:', response);
  // El interceptor ya retorna response.data, así que response ES la data
  return response as any;
};

/**
 * Obtener producto por ID
 */
export const getProductoPorId = async (id: string): Promise<Producto> => {
  const response = await axios.get(`/productos/${id}`);
  return response.data;
};

/**
 * Obtener solo cursos
 */
export const getCursos = async (): Promise<Producto[]> => {
  const response = await axios.get('/productos/cursos');
  return response.data;
};

/**
 * Obtener solo suscripciones
 */
export const getSuscripciones = async (): Promise<Producto[]> => {
  const response = await axios.get('/productos/suscripciones');
  return response.data;
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
