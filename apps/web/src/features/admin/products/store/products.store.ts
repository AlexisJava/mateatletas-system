import { create } from 'zustand';
import type { Producto } from '@/types/catalogo.types';
import type { CrearProductoDto, ActualizarProductoDto } from '@/lib/api/catalogo.api';
import * as adminApi from '@/lib/api/admin.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface ProductsStore {
  products: Producto[];
  isLoading: boolean;
  error: string | null;

  fetchProducts: (includeInactive?: boolean) => Promise<void>;
  createProduct: (data: CrearProductoDto) => Promise<boolean>;
  updateProduct: (id: string, data: ActualizarProductoDto) => Promise<boolean>;
  deleteProduct: (id: string, hardDelete?: boolean) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (includeInactive = true) => {
    set({ isLoading: true, error: null });
    try {
      const products = await adminApi.getAllProducts(includeInactive);
      set({ products, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading products'), isLoading: false });
    }
  },

  createProduct: async (data: CrearProductoDto): Promise<boolean> => {
    try {
      await adminApi.createProduct(data);
      await get().fetchProducts();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error creating product') });
      return false;
    }
  },

  updateProduct: async (id: string, data: ActualizarProductoDto): Promise<boolean> => {
    try {
      await adminApi.updateProduct(id, data);
      await get().fetchProducts();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error updating product') });
      return false;
    }
  },

  deleteProduct: async (id: string, hardDelete = false): Promise<boolean> => {
    try {
      await adminApi.deleteProduct(id, hardDelete);
      await get().fetchProducts();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error deleting product') });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ products: [], isLoading: false, error: null }),
}));
