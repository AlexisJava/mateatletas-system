'use client';
import { Button } from '@/components/ui';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin.store';
import { Producto, CrearProductoDto } from '@/lib/api/catalogo.api';
import { TipoProducto } from '@/types/catalogo.types';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

interface ProductForm {
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: TipoProducto;
  activo: boolean;
  // For Curso
  fecha_inicio?: string;
  fecha_fin?: string;
  cupo_maximo?: number;
  // For Suscripcion
  duracion_meses?: number;
}

const emptyForm: ProductForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  tipo: TipoProducto.Suscripcion,
  activo: true,
};

export default function AdminProductosPage() {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct, isLoading, error } = useAdminStore();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [filter, setFilter] = useState<'all' | TipoProducto | 'inactive'>('all');
  const [showInactive, setShowInactive] = useState(true);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts(showInactive);
  }, [showInactive]);

  const filteredProducts = products.filter((p) => {
    if (filter === 'inactive') return !p.activo;
    if (filter === 'all') return true;
    return p.tipo === filter;
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (formData.precio < 0) errors.precio = 'El precio debe ser mayor o igual a 0';

    if (formData.tipo === TipoProducto.Curso) {
      if (!formData.fecha_inicio) errors.fecha_inicio = 'La fecha de inicio es requerida';
      if (!formData.fecha_fin) errors.fecha_fin = 'La fecha de fin es requerida';
      if (!formData.cupo_maximo || formData.cupo_maximo < 1) errors.cupo_maximo = 'El cupo debe ser al menos 1';

      if (formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio >= formData.fecha_fin) {
        errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (formData.tipo === TipoProducto.Suscripcion) {
      if (!formData.duracion_meses || formData.duracion_meses < 1) {
        errors.duracion_meses = 'La duración debe ser al menos 1 mes';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;

    const productData: Partial<CrearProductoDto> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: formData.precio,
      tipo: formData.tipo,
      activo: formData.activo,
    };

    if (formData.tipo === TipoProducto.Curso) {
      productData.fecha_inicio = formData.fecha_inicio;
      productData.fecha_fin = formData.fecha_fin;
      productData.cupo_maximo = formData.cupo_maximo;
    } else if (formData.tipo === TipoProducto.Suscripcion) {
      productData.duracion_meses = formData.duracion_meses;
    }

    const success = await createProduct(productData as CrearProductoDto);
    if (success) {
      closeModal();
      resetForm();
    }
  };

  const handleUpdateProduct = async () => {
    if (!validateForm() || !selectedProduct) return;

    const productData: Partial<CrearProductoDto> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: formData.precio,
      activo: formData.activo,
    };

    if (formData.tipo === TipoProducto.Curso) {
      productData.fecha_inicio = formData.fecha_inicio;
      productData.fecha_fin = formData.fecha_fin;
      productData.cupo_maximo = formData.cupo_maximo;
    } else if (formData.tipo === TipoProducto.Suscripcion) {
      productData.duracion_meses = formData.duracion_meses;
    }

    const success = await updateProduct(selectedProduct.id, productData);
    if (success) {
      closeModal();
      resetForm();
    }
  };

  const handleDeleteProduct = async (hardDelete = false) => {
    if (!selectedProduct) return;
    const success = await deleteProduct(selectedProduct.id, hardDelete);
    if (success) {
      closeModal();
    }
  };

  const openModal = (type: ModalType, product?: Producto) => {
    setSelectedProduct(product || null);
    if (type === 'edit' && product) {
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio: product.precio,
        tipo: product.tipo,
        activo: product.activo,
        fecha_inicio: product.fecha_inicio || '',
        fecha_fin: product.fecha_fin || '',
        cupo_maximo: product.cupo_maximo || undefined,
        duracion_meses: product.duracion_meses || undefined,
      });
    }
    setModalType(type);
    setFormErrors({});
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
  };

  const tipoColors: Record<TipoProducto, string> = {
    [TipoProducto.Suscripcion]: 'bg-blue-100 text-blue-800',
    [TipoProducto.Curso]: 'bg-purple-100 text-purple-800',
    [TipoProducto.Recurso]: 'bg-green-100 text-green-800',
  };

  const tipoIcons: Record<TipoProducto, string> = {
    [TipoProducto.Suscripcion]: '📅',
    [TipoProducto.Curso]: '📚',
    [TipoProducto.Recurso]: '📄',
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
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {(['all', TipoProducto.Suscripcion, TipoProducto.Curso, TipoProducto.Recurso, 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === f
                  ? 'bg-[#ff6b35] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'inactive' ? 'Inactivos' : f}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded"
          />
          Mostrar inactivos
        </label>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-700">Suscripciones</div>
          <div className="text-2xl font-bold text-blue-900">
            {products.filter((p) => p.tipo === TipoProducto.Suscripcion).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-700">Cursos</div>
          <div className="text-2xl font-bold text-purple-900">
            {products.filter((p) => p.tipo === TipoProducto.Curso).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm font-medium text-green-700">Recursos</div>
          <div className="text-2xl font-bold text-green-900">
            {products.filter((p) => p.tipo === TipoProducto.Recurso).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-700">Total Activos</div>
          <div className="text-2xl font-bold text-gray-900">
            {products.filter((p) => p.activo).length}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No hay productos con el filtro seleccionado</p>
          <Button
            variant="primary"
            onClick={() => openModal('create')}
            className="mt-4"
          >
            Crear Primer Producto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                !product.activo ? 'opacity-60 border-2 border-dashed border-gray-300' : ''
              }`}
            >
              {/* Product Header */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tipoColors[product.tipo as TipoProducto]}`}>
                  {tipoIcons[product.tipo as TipoProducto]} {product.tipo}
                </span>
                {!product.activo && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                    Inactivo
                  </span>
                )}
              </div>

              {/* Product Info */}
              <h3 className="text-xl font-bold text-[#2a1a5e] mb-2">{product.nombre}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.descripcion || 'Sin descripción'}
              </p>

              {/* Product Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-bold text-[#ff6b35]">${product.precio.toLocaleString()}</span>
                </div>

                {product.tipo === 'Curso' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Inicio:</span>
                      <span className="font-medium">
                        {product.fecha_inicio ? new Date(product.fecha_inicio).toLocaleDateString('es-ES') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cupos:</span>
                      <span className="font-medium">{product.cupo_maximo}</span>
                    </div>
                  </>
                )}

                {product.tipo === 'Suscripcion' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">
                      {product.duracion_meses} {(product.duracion_meses) === 1 ? 'mes' : 'meses'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => openModal('view', product)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-[#2a1a5e] hover:bg-gray-100 rounded transition-colors"
                >
                  Ver
                </button>
                <button
                  onClick={() => openModal('edit', product)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => openModal('delete', product)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Product Modal */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl my-8">
            <h3 className="text-2xl font-bold text-[#2a1a5e] mb-6">
              {modalType === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
            </h3>

            <div className="space-y-4 mb-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                    formErrors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Suscripción Mensual Premium"
                />
                {formErrors.nombre && <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                      formErrors.precio ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.precio && <p className="text-red-500 text-sm mt-1">{formErrors.precio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Producto * {modalType === 'edit' && <span className="text-xs text-gray-500">(no editable)</span>}
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoProducto })}
                    disabled={modalType === 'edit'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value={TipoProducto.Suscripcion}>Suscripción</option>
                    <option value={TipoProducto.Curso}>Curso</option>
                    <option value={TipoProducto.Recurso}>Recurso Digital</option>
                  </select>
                </div>
              </div>

              {/* Curso-specific fields */}
              {formData.tipo === TipoProducto.Curso && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-gray-700">Información del Curso</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                          formErrors.fecha_inicio ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.fecha_inicio && <p className="text-red-500 text-sm mt-1">{formErrors.fecha_inicio}</p>}
                      <p className="text-xs text-gray-500 mt-1">Opcional si especificás duración en meses</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Fin
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                          formErrors.fecha_fin ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.fecha_fin && <p className="text-red-500 text-sm mt-1">{formErrors.fecha_fin}</p>}
                      <p className="text-xs text-gray-500 mt-1">Opcional si especificás duración en meses</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración (meses)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duracion_meses || ''}
                        onChange={(e) => setFormData({ ...formData, duracion_meses: parseInt(e.target.value) || undefined })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                          formErrors.duracion_meses ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: 9"
                      />
                      {formErrors.duracion_meses && <p className="text-red-500 text-sm mt-1">{formErrors.duracion_meses}</p>}
                      <p className="text-xs text-gray-500 mt-1">Ej: "Exploradores Matemáticos de 9 meses"</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cupo Máximo *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.cupo_maximo || ''}
                        onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) || undefined })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                          formErrors.cupo_maximo ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: 30"
                      />
                      {formErrors.cupo_maximo && <p className="text-red-500 text-sm mt-1">{formErrors.cupo_maximo}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Suscripcion-specific fields */}
              {formData.tipo === TipoProducto.Suscripcion && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-4">Información de Suscripción</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (meses) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duracion_meses || ''}
                      onChange={(e) => setFormData({ ...formData, duracion_meses: parseInt(e.target.value) || undefined })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                        formErrors.duracion_meses ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: 1"
                    />
                    {formErrors.duracion_meses && <p className="text-red-500 text-sm mt-1">{formErrors.duracion_meses}</p>}
                  </div>
                </div>
              )}

              {/* Active toggle */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-[#ff6b35] rounded focus:ring-[#ff6b35]"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Producto activo (visible en el catálogo)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={modalType === 'create' ? handleCreateProduct : handleUpdateProduct}
                className="flex-1"
              >
                {modalType === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {modalType === 'view' && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-[#2a1a5e]">Detalles del Producto</h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tipoColors[selectedProduct.tipo as TipoProducto]}`}>
                {tipoIcons[selectedProduct.tipo as TipoProducto]} {selectedProduct.tipo}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm font-medium text-gray-500">Nombre</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{selectedProduct.nombre}</div>
              </div>

              {selectedProduct.descripcion && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Descripción</div>
                  <div className="text-sm text-gray-900 mt-1">{selectedProduct.descripcion}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm font-medium text-gray-500">Precio</div>
                  <div className="text-xl font-bold text-[#ff6b35] mt-1">
                    ${selectedProduct.precio.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Estado</div>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${
                    selectedProduct.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {selectedProduct.tipo === 'Curso' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Fecha de Inicio</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {selectedProduct.fecha_inicio ? new Date(selectedProduct.fecha_inicio).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Fecha de Fin</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {selectedProduct.fecha_fin ? new Date(selectedProduct.fecha_fin).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Cupo Máximo</div>
                    <div className="text-sm text-gray-900 mt-1">
                      {selectedProduct.cupo_maximo} estudiantes
                    </div>
                  </div>
                </div>
              )}

              {selectedProduct.tipo === 'Suscripcion' && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium text-gray-500">Duración</div>
                  <div className="text-sm text-gray-900 mt-1">
                    {selectedProduct.duracion_meses} {(selectedProduct.duracion_meses) === 1 ? 'mes' : 'meses'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => setModalType('edit')}
                className="flex-1"
              >
                Editar Producto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {modalType === 'delete' && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-[#2a1a5e] mb-4">¿Eliminar producto?</h3>
            <p className="text-gray-600 mb-2">
              Estás por eliminar el producto <strong>{selectedProduct.nombre}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Podés desactivarlo (soft delete) o eliminarlo permanentemente de la base de datos.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => handleDeleteProduct(false)}
                className="w-full"
              >
                Desactivar (Soft Delete)
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteProduct(true)}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                Eliminar Permanentemente
              </Button>
              <Button variant="outline" onClick={closeModal} className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
