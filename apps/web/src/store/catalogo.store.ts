import { getErrorMessage, isAxiosError } from '@/lib/utils/error-handler';
/**
 * Zustand Store para Catálogo de Productos
 */

import { create } from 'zustand';
import { Producto, FiltroProducto } from '@/types/catalogo.types';
import * as catalogoApi from '@/lib/api/catalogo.api';

interface CatalogoStore {
  // State
  productos: Producto[];
  productoSeleccionado: Producto | null;
  filtroActivo: FiltroProducto;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProductos: () => Promise<void>;
  fetchProductoPorId: (id: string) => Promise<void>;
  setFiltro: (filtro: FiltroProducto) => void;
  setProductoSeleccionado: (producto: Producto | null) => void;
  getProductosFiltrados: () => Producto[];
  clearError: () => void;
}

export const useCatalogoStore = create<CatalogoStore>((set, get) => ({
  // Initial state
  productos: [],
  productoSeleccionado: null,
  filtroActivo: 'todos',
  isLoading: false,
  error: null,

  // Fetch all products
  fetchProductos: async () => {
    console.log('🟡 [CATALOGO STORE] fetchProductos - iniciando...');
    set({ isLoading: true, error: null });
    try {
      const response = await catalogoApi.getProductos();
      console.log('🟡 [CATALOGO STORE] fetchProductos - RAW RESPONSE:', response);

      // El axios interceptor ya retorna response.data directamente
      // Pero el backend puede estar retornando { data: productos }
      const productos = Array.isArray(response) ? response : ((response as any)?.data || []);

      console.log('🟡 [CATALOGO STORE] fetchProductos - SUCCESS:', productos.length, 'productos');
      set({ productos, isLoading: false });
    } catch (error: unknown) {
      console.error('🔴 [CATALOGO STORE] fetchProductos - ERROR:', error);
      if (isAxiosError(error)) {
        console.error('🔴 [CATALOGO STORE] Error response:', error.response?.data);
      }
      set({
        error: getErrorMessage(error, 'Error al cargar productos'),
        isLoading: false,
      });
    }
  },

  // Fetch product by ID
  fetchProductoPorId: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const producto = await catalogoApi.getProductoPorId(id);
      set({ productoSeleccionado: producto, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar producto'),
        isLoading: false,
      });
    }
  },

  // Set filter
  setFiltro: (filtro: FiltroProducto) => {
    set({ filtroActivo: filtro });
  },

  // Set selected product
  setProductoSeleccionado: (producto: Producto | null) => {
    set({ productoSeleccionado: producto });
  },

  // Get filtered products
  getProductosFiltrados: () => {
    const { productos, filtroActivo } = get();

    if (filtroActivo === 'todos') {
      return productos;
    }

    return productos.filter((p) => p.tipo === filtroActivo);
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
