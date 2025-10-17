import { Button } from '@/components/ui';
import { TipoProducto } from '@/types/catalogo.types';
import { ProductForm, ModalType } from '../hooks/useProductos';

interface ProductoFormModalProps {
  modalType: ModalType;
  formData: ProductForm;
  formErrors: Record<string, string>;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (data: ProductForm) => void;
}

export const ProductoFormModal: React.FC<ProductoFormModalProps> = ({
  modalType,
  formData,
  formErrors,
  onClose,
  onSubmit,
  onChange,
}) => {
  if (modalType !== 'create' && modalType !== 'edit') return null;

  return (
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
              onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
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
              onChange={(e) => onChange({ ...formData, descripcion: e.target.value })}
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
                onChange={(e) => onChange({ ...formData, precio: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => onChange({ ...formData, tipo: e.target.value as TipoProducto })}
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
                    onChange={(e) => onChange({ ...formData, fecha_inicio: e.target.value })}
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
                    onChange={(e) => onChange({ ...formData, fecha_fin: e.target.value })}
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
                    onChange={(e) => onChange({ ...formData, duracion_meses: parseInt(e.target.value) || undefined })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent ${
                      formErrors.duracion_meses ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: 9"
                  />
                  {formErrors.duracion_meses && <p className="text-red-500 text-sm mt-1">{formErrors.duracion_meses}</p>}
                  <p className="text-xs text-gray-500 mt-1">Ej: &quot;Exploradores Matemáticos de 9 meses&quot;</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cupo Máximo *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cupo_maximo || ''}
                    onChange={(e) => onChange({ ...formData, cupo_maximo: parseInt(e.target.value) || undefined })}
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
                  onChange={(e) => onChange({ ...formData, duracion_meses: parseInt(e.target.value) || undefined })}
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
              onChange={(e) => onChange({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-[#ff6b35] rounded focus:ring-[#ff6b35]"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
              Producto activo (visible en el catálogo)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            className="flex-1"
          >
            {modalType === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};
