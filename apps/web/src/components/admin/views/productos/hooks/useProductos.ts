import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getAllProducts, deleteProduct, type Producto } from '@/lib/api/admin.api';
import type {
  TipoFilter,
  StatusFilter,
  ProductosStats,
  AdminProducto,
} from '../types/productos.types';

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
  // Modal de formulario
  isFormModalOpen: boolean;
  editingProduct: AdminProducto | null;
  openCreateModal: () => void;
  openEditModal: (product: AdminProducto) => void;
  closeFormModal: () => void;
}

/**
 * useProductos - Hook para gestión de productos
 *
 * Llama al backend GET /productos para obtener todos los productos.
 */
export function useProductos(): UseProductosReturn {
  const [products, setProducts] = useState<AdminProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TipoFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [selectedProduct, setSelectedProduct] = useState<AdminProducto | null>(null);
  // Estados para modal crear/editar
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProducto | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener todos los productos (incluye inactivos para admin)
      const data = await getAllProducts(true);

      // Adaptar al tipo AdminProducto
      const productosUnicos: AdminProducto[] = data.map((p: Producto) => ({
        ...p,
        ventas: 0, // Backend no tiene endpoint de ventas agregadas por producto
      }));

      setProducts(productosUnicos);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
      console.error('useProductos: Error al cargar:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      if (!window.confirm(confirmMessage)) {
        return;
      }

      try {
        await deleteProduct(product.id, false); // Soft delete
        toast.success(`"${product.nombre}" desactivado`);
        await fetchProducts(); // Refetch
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar producto';
        console.error('Error al eliminar producto:', message);
        toast.error(message);
      }
    },
    [fetchProducts],
  );

  return {
    isLoading,
    error,
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
    refetch: fetchProducts,
    // Modal de formulario
    isFormModalOpen,
    editingProduct,
    openCreateModal,
    openEditModal,
    closeFormModal,
  };
}
