'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useProductos } from './hooks';
import { ProductsStatsGrid, ProductsFilters, ProductsGrid, ProductoFormModal } from './components';

/**
 * ProductosView - Vista de gestión de productos de pago único
 *
 * Gestiona productos: Cursos (talleres, colonias, eventos) y RecursoDigital.
 * Las Suscripciones STEAM se gestionan en FinanceView.
 */

export function ProductosView() {
  const router = useRouter();
  const {
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    tierFilter,
    setTierFilter,
    statusFilter,
    setStatusFilter,
    filteredProducts,
    stats,
    totalCount,
    handleDelete,
    refetch,
    isFormModalOpen,
    editingProduct,
    openCreateModal,
    openEditModal,
    closeFormModal,
  } = useProductos();

  // Navegar a la página de detalle del producto
  const handleViewProduct = (product: { id: string }) => {
    router.push(`/admin/productos/${product.id}`);
  };

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

      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Productos</h1>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Gestiona cursos, talleres, colonias y recursos digitales
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Producto
        </button>
      </div>

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
        onView={handleViewProduct}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {filteredProducts.length} de {totalCount} productos
      </div>

      {/* Form Modal (Crear/Editar) */}
      <ProductoFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSuccess={refetch}
        producto={editingProduct}
      />
    </div>
  );
}

export default ProductosView;
