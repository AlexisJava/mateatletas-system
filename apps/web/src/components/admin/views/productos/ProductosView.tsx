'use client';

import { useProductos } from './hooks';
import { ProductsStatsGrid, ProductsFilters, ProductsGrid, ProductDetailModal } from './components';

/**
 * ProductosView - Vista de gestión de productos de pago único
 *
 * Gestiona productos: Cursos (talleres, colonias, eventos) y RecursoDigital.
 * Las Suscripciones STEAM se gestionan en FinanceView.
 */

export function ProductosView() {
  const {
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
    totalCount,
    handleEdit,
    handleDelete,
  } = useProductos();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error banner (datos mock en uso) */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-400">
          Usando datos de ejemplo (backend no disponible)
        </div>
      )}

      {/* Stats */}
      <ProductsStatsGrid stats={stats} />

      {/* Filters & Search */}
      <ProductsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tierFilter={tierFilter}
        onTierChange={setTierFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Products Grid */}
      <ProductsGrid
        products={filteredProducts}
        onView={setSelectedProduct}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {filteredProducts.length} de {totalCount} productos
      </div>

      {/* Detail Modal */}
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

export default ProductosView;
