import { useProductsStore } from '../store/products.store';

// Selector hooks para optimizar re-renders
export const useProducts = () => useProductsStore((state) => state.products);
export const useProductsLoading = () => useProductsStore((state) => state.isLoading);
export const useProductsError = () => useProductsStore((state) => state.error);

// Action hooks
export const useFetchProducts = () => useProductsStore((state) => state.fetchProducts);
export const useCreateProduct = () => useProductsStore((state) => state.createProduct);
export const useUpdateProduct = () => useProductsStore((state) => state.updateProduct);
export const useDeleteProduct = () => useProductsStore((state) => state.deleteProduct);
export const useClearProductsError = () => useProductsStore((state) => state.clearError);
export const useResetProducts = () => useProductsStore((state) => state.reset);
