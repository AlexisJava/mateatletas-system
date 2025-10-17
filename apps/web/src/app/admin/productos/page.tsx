'use client';

import { Button } from '@/components/ui';
import { TipoProducto } from '@/types/catalogo.types';
import { useProductos } from './hooks/useProductos';
import {
  ProductoFilters,
  ProductosTable,
  ProductoFormModal,
  DeleteConfirmDialog,
  ViewProductModal,
} from './components';

export default function AdminProductosPage() {
  const {
    products,
    filteredProducts,
    modalType,
    selectedProduct,
    filter,
    showInactive,
    formData,
    formErrors,
    isLoading,
    error,
    setFilter,
    setShowInactive,
    setFormData,
    setModalType,
    openModal,
    closeModal,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  } = useProductos();

  // Stats calculations
  const stats = {
    suscripciones: products.filter((p) => p.tipo === TipoProducto.Suscripcion).length,
    cursos: products.filter((p) => p.tipo === TipoProducto.Curso).length,
    recursos: products.filter((p) => p.tipo === TipoProducto.Recurso).length,
    activos: products.filter((p) => p.activo).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2a1a5e]">Gestión de Productos</h1>
          <p className="text-gray-600 mt-1">Administrá el catálogo de suscripciones, cursos y recursos</p>
        </div>
        <Button
          variant="primary"
          onClick={() => openModal('create')}
          className="bg-gradient-to-r from-[#ff6b35] to-[#f7b801]"
        >
          + Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <ProductoFilters
        filter={filter}
        setFilter={setFilter}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-700">Suscripciones</div>
          <div className="text-2xl font-bold text-blue-900">{stats.suscripciones}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-700">Cursos</div>
          <div className="text-2xl font-bold text-purple-900">{stats.cursos}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700">Recursos</div>
          <div className="text-2xl font-bold text-green-900">{stats.recursos}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-700">Total Activos</div>
          <div className="text-2xl font-bold text-gray-900">{stats.activos}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Products Table */}
      <ProductosTable
        products={filteredProducts}
        isLoading={isLoading}
        onOpenModal={openModal}
      />

      {/* Modals */}
      <ProductoFormModal
        modalType={modalType}
        formData={formData}
        formErrors={formErrors}
        onClose={closeModal}
        onSubmit={modalType === 'create' ? handleCreateProduct : handleUpdateProduct}
        onChange={setFormData}
      />

      <ViewProductModal
        product={selectedProduct}
        isOpen={modalType === 'view'}
        onClose={closeModal}
        onEdit={() => setModalType('edit')}
      />

      <DeleteConfirmDialog
        product={selectedProduct}
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
