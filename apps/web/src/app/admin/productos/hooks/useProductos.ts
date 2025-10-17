import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin.store';
import { Producto, CrearProductoDto } from '@/lib/api/catalogo.api';
import { TipoProducto } from '@/types/catalogo.types';

export type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;
export type FilterType = 'all' | TipoProducto | 'inactive';

export interface ProductForm {
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

export const emptyForm: ProductForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  tipo: TipoProducto.Suscripcion,
  activo: true,
};

export const useProductos = () => {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct, isLoading, error } = useAdminStore();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showInactive, setShowInactive] = useState(true);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts(showInactive);
  }, [showInactive, fetchProducts]);

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

  return {
    // State
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

    // Actions
    setFilter,
    setShowInactive,
    setFormData,
    setModalType,
    openModal,
    closeModal,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    validateForm,
  };
};
