import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getAllProducts,
  deleteProduct,
  getProductosVentasCountBatch,
  type Producto,
} from '@/lib/api/admin.api';
import type {
  TipoFilter,
  StatusFilter,
  ProductosStats,
  AdminProducto,
} from '../types/productos.types';

/** Query key para invalidación */
export const PRODUCTOS_KEY = ['admin', 'productos'] as const;

interface UseProductosReturn {
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tierFilter: TipoFilter;
  setTierFilter: (filter: TipoFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  selectedProduct: AdminProducto | null;
  setSelectedProduct: (product: AdminProducto | null) => void;
  filteredProducts: AdminProducto[];
  stats: ProductosStats;
  totalCount: number;
  handleEdit: (product: AdminProducto) => void;
  handleDelete: (product: AdminProducto) => Promise<void>;
  refetch: () => Promise<void>;
  isFormModalOpen: boolean;
  editingProduct: AdminProducto | null;
  openCreateModal: () => void;
  openEditModal: (product: AdminProducto) => void;
  closeFormModal: () => void;
}

/**
 * Función para obtener todos los productos con ventas en batch
 * Usa endpoint batch para evitar N+1
 */
async function fetchAllProducts(): Promise<AdminProducto[]> {
  // Fetch en paralelo: productos + ventas batch
  const [productos, ventasBatch] = await Promise.all([
    getAllProducts(true),
    getProductosVentasCountBatch().catch(
      () => ({}) as Record<string, { total: number; pagadas: number; pendientes: number }>,
    ),
  ]);

  // Combinar productos con sus ventas
  return productos.map((p: Producto) => ({
    ...p,
    ventas: ventasBatch[p.id]?.total ?? 0,
  }));
}

/**
 * useProductos - Hook para gestión de productos
 *
 * Usa React Query para:
 * - Cachear datos por 5 minutos
 * - Navegación instantánea entre pestañas
 * - Invalidación automática al eliminar
 *
 * Llama al backend GET /productos para obtener todos los productos.
 */
export function useProductos(): UseProductosReturn {
  const queryClient = useQueryClient();

  // Estado local para UI
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TipoFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [selectedProduct, setSelectedProduct] = useState<AdminProducto | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProducto | null>(null);

  // Query principal
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PRODUCTOS_KEY,
    queryFn: fetchAllProducts,
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: async (product: AdminProducto) => {
      await deleteProduct(product.id, false); // Soft delete
      return product;
    },
    onSuccess: (deletedProduct) => {
      // Actualizar cache - marcar como inactivo
      queryClient.setQueryData<AdminProducto[]>(
        PRODUCTOS_KEY,
        (old) => old?.map((p) => (p.id === deletedProduct.id ? { ...p, activo: false } : p)) ?? [],
      );
      toast.success(`"${deletedProduct.nombre}" desactivado`);
    },
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = tierFilter === 'all' || product.tipo === tierFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.activo) ||
        (statusFilter === 'inactive' && !product.activo);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [products, searchQuery, tierFilter, statusFilter]);

  const stats: ProductosStats = useMemo(() => {
    const activeProducts = products.filter((p) => p.activo);
    const eventos = products.filter((p) => p.tipo === 'Evento').length;
    const cursos = products.filter((p) => p.tipo === 'Curso').length;
    const digitales = products.filter((p) => p.tipo === 'Digital').length;
    const fisicos = products.filter((p) => p.tipo === 'Fisico').length;
    const servicios = products.filter((p) => p.tipo === 'Servicio').length;

    return {
      total: products.length,
      activos: activeProducts.length,
      eventos,
      cursos,
      digitales,
      fisicos,
      servicios,
    };
  }, [products]);

  const handleEdit = useCallback((product: AdminProducto) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  }, []);

  const openEditModal = useCallback((product: AdminProducto) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  }, []);

  const handleDelete = useCallback(
    async (product: AdminProducto) => {
      const confirmMessage = `¿Desactivar "${product.nombre}"? Podrás reactivarlo desde el filtro "Inactivos".`;
      if (!window.confirm(confirmMessage)) return;

      try {
        await deleteMutation.mutateAsync(product);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar producto';
        toast.error(message);
      }
    },
    [deleteMutation],
  );

  return {
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar productos') : null,
    searchQuery,
    setSearchQuery,
    tierFilter,
    setTierFilter,
    statusFilter,
    setStatusFilter,
    selectedProduct,
    setSelectedProduct,
    filteredProducts,
    stats,
    totalCount: products.length,
    handleEdit,
    handleDelete,
    refetch: async () => {
      await refetch();
    },
    isFormModalOpen,
    editingProduct,
    openCreateModal,
    openEditModal,
    closeFormModal,
  };
}
