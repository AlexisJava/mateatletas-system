import { Button } from '@/components/ui';
import { Producto } from '@/lib/api/catalogo.api';
import { TipoProducto } from '@/types/catalogo.types';

interface ViewProductModalProps {
  product: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const tipoColors: Record<TipoProducto, string> = {
  [TipoProducto.Suscripcion]: 'bg-blue-100 text-blue-800',
  [TipoProducto.Curso]: 'bg-purple-100 text-purple-800',
  [TipoProducto.RecursoDigital]: 'bg-green-100 text-green-800',
};

const tipoIcons: Record<TipoProducto, string> = {
  [TipoProducto.Suscripcion]: '📅',
  [TipoProducto.Curso]: '📚',
  [TipoProducto.RecursoDigital]: '📄',
};

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-[#2a1a5e]">Detalles del Producto</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tipoColors[product.tipo as TipoProducto]}`}>
            {tipoIcons[product.tipo as TipoProducto]} {product.tipo}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Nombre</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{product.nombre}</div>
          </div>

          {product.descripcion && (
            <div>
              <div className="text-sm font-medium text-gray-500">Descripción</div>
              <div className="text-sm text-gray-900 mt-1">{product.descripcion}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm font-medium text-gray-500">Precio</div>
              <div className="text-xl font-bold text-[#ff6b35] mt-1">
                ${product.precio.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Estado</div>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${
                product.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {product.tipo === TipoProducto.Curso && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm font-medium text-gray-500">Fecha de Inicio</div>
                <div className="text-sm text-gray-900 mt-1">
                  {product.fecha_inicio ? new Date(product.fecha_inicio).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Fecha de Fin</div>
                <div className="text-sm text-gray-900 mt-1">
                  {product.fecha_fin ? new Date(product.fecha_fin).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Cupo Máximo</div>
                <div className="text-sm text-gray-900 mt-1">
                  {product.cupo_maximo} estudiantes
                </div>
              </div>
            </div>
          )}

          {product.tipo === TipoProducto.Suscripcion && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-gray-500">Duración</div>
              <div className="text-sm text-gray-900 mt-1">
                {product.duracion_meses} {(product.duracion_meses) === 1 ? 'mes' : 'meses'}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={onEdit}
            className="flex-1"
          >
            Editar Producto
          </Button>
        </div>
      </div>
    </div>
  );
};
