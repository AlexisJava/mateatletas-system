import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllProducts, deleteProduct, type Producto } from '@/lib/api/admin.api';
import type {
  TipoFilter,
  StatusFilter,
  ProductosStats,
  AdminProducto,
} from '../types/productos.types';

// Mock data para fallback cuando el backend no está disponible
const MOCK_PRODUCTOS: AdminProducto[] = [
  {
    id: 'prod-1',
    nombre: 'Colonia de Verano 2026 - Enero',
    descripcion: 'Programa STEAM completo para vacaciones de verano',
    precio: 180000,
    tipo: 'Curso',
    activo: true,
    ventas: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fecha_inicio: '2026-01-06T00:00:00.000Z',
    fecha_fin: '2026-01-31T00:00:00.000Z',
    cupo_maximo: 50,
  },
  {
    id: 'prod-2',
    nombre: 'Taller de Robótica - Marzo',
    descripcion: 'Introducción a la robótica con Arduino',
    precio: 95000,
    tipo: 'Curso',
    activo: true,
    ventas: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fecha_inicio: '2026-03-01T00:00:00.000Z',
    fecha_fin: '2026-03-15T00:00:00.000Z',
    cupo_maximo: 30,
  },
  {
    id: 'prod-3',
    nombre: 'Pack Material Didáctico Digital',
    descripcion: 'Guías, ejercicios y recursos descargables',
    precio: 25000,
    tipo: 'RecursoDigital',
    activo: true,
    ventas: 156,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    nombre: 'Curso de Verano 2025 (Archivado)',
    descripcion: 'Programa del año anterior',
    precio: 150000,
    tipo: 'Curso',
    activo: false,
    ventas: 89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
}

/**
 * useProductos - Hook para gestión de productos de pago único
 *
 * Llama al backend GET /productos para obtener productos.
 * Filtra solo Cursos y RecursoDigital (excluye Suscripciones).
 *
 * Fallback a mock data si hay error (desarrollo sin backend)
 */
export function useProductos(): UseProductosReturn {
  const [products, setProducts] = useState<AdminProducto[]>(MOCK_PRODUCTOS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TipoFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<AdminProducto | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener todos los productos (incluye inactivos para admin)
      const data = await getAllProducts(true);

      // Filtrar solo productos de pago único (excluir Suscripciones)
      // y adaptar al tipo AdminProducto
      const productosUnicos: AdminProducto[] = data
        .filter((p: Producto) => p.tipo !== 'Suscripcion')
        .map((p: Producto) => ({
          ...p,
          ventas: 0, // TODO: Obtener ventas desde endpoint específico
        }));

      setProducts(productosUnicos);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
      console.warn('useProductos: Usando datos mock por error:', message);
      // Mantener mock data como fallback
      setProducts(MOCK_PRODUCTOS);
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
    const cursos = products.filter((p) => p.tipo === 'Curso').length;
    const recursos = products.filter((p) => p.tipo === 'RecursoDigital').length;

    return {
      total: products.length,
      activos: activeProducts.length,
      cursos,
      recursos,
    };
  }, [products]);

  const handleEdit = useCallback((_product: AdminProducto) => {
    // TODO: Implementar edición con modal
    console.log('Edit product:', _product.id);
  }, []);

  const handleDelete = useCallback(
    async (product: AdminProducto) => {
      try {
        await deleteProduct(product.id, false); // Soft delete
        await fetchProducts(); // Refetch
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        throw err;
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
  };
}
