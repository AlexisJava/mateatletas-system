import { useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_PRODUCTS, type MockProduct } from '@/lib/constants/admin-mock-data';
import type { TierFilter, StatusFilter, ProductosStats } from '../types/productos.types';

/**
 * useProductos - Hook para lógica de productos
 */

export function useProductos() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = tierFilter === 'all' || product.tier === tierFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.activo) ||
        (statusFilter === 'inactive' && !product.activo);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [searchQuery, tierFilter, statusFilter]);

  const stats: ProductosStats = useMemo(() => {
    const activeProducts = MOCK_PRODUCTS.filter((p) => p.activo);
    const totalInscritos = activeProducts.reduce((acc, p) => acc + p.inscritos, 0);
    const totalIngresos = activeProducts.reduce((acc, p) => acc + p.precio * p.inscritos, 0);

    return {
      total: MOCK_PRODUCTS.length,
      activos: activeProducts.length,
      totalInscritos,
      totalIngresos,
    };
  }, []);

  const handleEdit = useCallback((_product: MockProduct) => {
    // TODO: Implementar edición
  }, []);

  const handleDelete = useCallback((_product: MockProduct) => {
    // TODO: Implementar eliminación
  }, []);

  return {
    isLoading,
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
    totalCount: MOCK_PRODUCTS.length,
    handleEdit,
    handleDelete,
  };
}
