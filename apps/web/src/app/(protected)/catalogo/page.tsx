'use client';

import { useEffect, useState } from 'react';
import { useCatalogoStore } from '@/store/catalogo.store';
import {
  ProductCard,
  ProductFilter,
  ProductModal,
} from '@/components/features/catalogo';
import { Card } from '@/components/ui';
import { Producto, TipoProducto } from '@/types/catalogo.types';

/**
 * Página de Catálogo de Productos
 * Ruta: /catalogo
 *
 * Muestra todos los productos disponibles (suscripciones, cursos, recursos)
 * con filtros y modales de detalle.
 */
export default function CatalogoPage() {
  const {
    productos,
    filtroActivo,
    isLoading,
    error,
    fetchProductos,
    setFiltro,
    getProductosFiltrados,
  } = useCatalogoStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  // Cargar productos al montar
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Obtener productos filtrados
  const productosFiltrados = getProductosFiltrados();

  // Contador de productos por tipo
  const productCount = {
    todos: productos.length,
    Suscripcion: productos.filter((p) => p.tipo === TipoProducto.Suscripcion).length,
    Curso: productos.filter((p) => p.tipo === TipoProducto.Curso).length,
    RecursoDigital: productos.filter((p) => p.tipo === TipoProducto.RecursoDigital).length,
  };

  // Handler para abrir modal
  const handleProductClick = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalOpen(true);
  };

  // Handler para cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setProductoSeleccionado(null), 300);
  };

  // Handler para comprar (placeholder)
  const handleComprar = (producto: Producto) => {
    // TODO: Implementar navegación a proceso de pago
    alert(`Redirigiendo al proceso de pago para: ${producto.nombre}`);
    handleCloseModal();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-5xl">🎓</span>
          <div>
            <h1 className="font-[family-name:var(--font-fredoka)] text-5xl text-[#2a1a5e]">
              Catálogo de Productos
            </h1>
            <p className="text-gray-600 mt-1">
              Descubre todos nuestros cursos, suscripciones y recursos
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <ProductFilter
        filtroActivo={filtroActivo}
        onFiltroChange={setFiltro}
        productCount={productCount}
      />

      {/* Error state */}
      {error && (
        <Card className="bg-red-50 border-2 border-red-300">
          <div className="flex items-center gap-3 text-red-700">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold">Error al cargar productos</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="animate-pulse border-3 border-black shadow-[5px_5px_0px_rgba(0,0,0,0.1)]"
            >
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && productosFiltrados.length === 0 && (
        <Card className="py-16">
          <div className="text-center space-y-4">
            <div className="text-7xl">🔍</div>
            <div>
              <h3 className="font-[family-name:var(--font-fredoka)] text-3xl text-[#2a1a5e] mb-2">
                No hay productos disponibles
              </h3>
              <p className="text-gray-600">
                {filtroActivo === 'todos'
                  ? 'No se encontraron productos en el catálogo'
                  : `No hay productos del tipo "${filtroActivo}"`}
              </p>
            </div>
            {filtroActivo !== 'todos' && (
              <button
                onClick={() => setFiltro('todos')}
                className="
                  mt-4
                  px-6 py-3
                  bg-primary
                  text-white
                  font-bold
                  rounded-lg
                  border-2 border-black
                  shadow-[3px_3px_0px_rgba(0,0,0,1)]
                  hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]
                  hover:scale-105
                  transition-all
                "
              >
                Ver todos los productos
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Grid de productos */}
      {!isLoading && productosFiltrados.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Mostrando <span className="font-bold">{productosFiltrados.length}</span>{' '}
              {productosFiltrados.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onClick={() => handleProductClick(producto)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal de detalle */}
      <ProductModal
        producto={productoSeleccionado}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onComprar={handleComprar}
      />
    </div>
  );
}
