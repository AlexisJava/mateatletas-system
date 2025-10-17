import { Producto } from '@/lib/api/catalogo.api';
import { TipoProducto } from '@/types/catalogo.types';
import { Button } from '@/components/ui';
import { ModalType } from '../hooks/useProductos';

interface ProductosTableProps {
  products: Producto[];
  isLoading: boolean;
  onOpenModal: (type: ModalType, product?: Producto) => void;
}

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

export const ProductosTable: React.FC<ProductosTableProps> = ({
  products,
  isLoading,
  onOpenModal,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff6b35]"></div>
        <p className="mt-4 text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">No hay productos con el filtro seleccionado</p>
        <Button
          variant="primary"
          onClick={() => onOpenModal('create')}
          className="mt-4"
        >
          Crear Primer Producto
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
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
              onClick={() => onOpenModal('view', product)}
              className="flex-1 px-3 py-2 text-sm font-medium text-[#2a1a5e] hover:bg-gray-100 rounded transition-colors"
            >
              Ver
            </button>
            <button
              onClick={() => onOpenModal('edit', product)}
              className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => onOpenModal('delete', product)}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
