'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Package, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createProduct, updateProduct } from '@/lib/api/admin.api';
import type { AdminProducto } from '../types/productos.types';

type TipoProducto =
  | 'Evento'
  | 'Digital'
  | 'Fisico'
  | 'Curso'
  | 'Servicio'
  | 'Bundle'
  | 'Certificacion';

/** Tipos que requieren fecha y cupo */
const TIPOS_CON_FECHA = ['Evento', 'Curso'];

interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  tipo: TipoProducto | '';
  subcategoria: string;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  cupo_maximo: string;
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  tipo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cupo_maximo?: string;
}

interface ProductoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  producto?: AdminProducto | null;
}

const INITIAL_FORM_DATA: ProductoFormData = {
  nombre: '',
  descripcion: '',
  precio: '',
  tipo: '',
  subcategoria: '',
  activo: true,
  fecha_inicio: '',
  fecha_fin: '',
  cupo_maximo: '',
};

/** Extrae la parte de fecha de un datetime string ISO */
function extractDatePart(dateTime: string | null | undefined): string {
  if (!dateTime) return '';
  const parts = dateTime.split('T');
  return parts[0] ?? '';
}

/**
 * ProductoFormModal - Modal para crear/editar productos (Admin Theme)
 */
export function ProductoFormModal({
  isOpen,
  onClose,
  onSuccess,
  producto,
}: ProductoFormModalProps) {
  const [formData, setFormData] = useState<ProductoFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(producto);
  const title = isEditMode ? 'Editar Producto' : 'Crear Producto';

  useEffect(() => {
    if (isOpen && producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: String(producto.precio),
        tipo: producto.tipo as TipoProducto,
        subcategoria: (producto as { subcategoria?: string }).subcategoria || '',
        activo: producto.activo,
        fecha_inicio: extractDatePart(producto.fecha_inicio),
        fecha_fin: extractDatePart(producto.fecha_fin),
        cupo_maximo: producto.cupo_maximo ? String(producto.cupo_maximo) : '',
      });
      setErrors({});
    } else if (isOpen && !producto) {
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
    }
  }, [isOpen, producto]);

  const handleChange = useCallback(
    (field: keyof ProductoFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'Mínimo 3 caracteres';
    }

    const precio = parseFloat(formData.precio);
    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido';
    } else if (isNaN(precio) || precio <= 0) {
      newErrors.precio = 'Debe ser mayor a 0';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Selecciona un tipo';
    }

    // Validación para tipos con fecha y cupo (Evento, Curso)
    if (TIPOS_CON_FECHA.includes(formData.tipo)) {
      if (!formData.fecha_inicio) {
        newErrors.fecha_inicio = 'Requerido';
      }
      if (!formData.fecha_fin) {
        newErrors.fecha_fin = 'Requerido';
      }
      if (formData.fecha_inicio && formData.fecha_fin) {
        if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
          newErrors.fecha_fin = 'Debe ser posterior al inicio';
        }
      }
      if (!formData.cupo_maximo) {
        newErrors.cupo_maximo = 'Requerido';
      } else {
        const cupo = parseInt(formData.cupo_maximo, 10);
        if (isNaN(cupo) || cupo < 1) {
          newErrors.cupo_maximo = 'Mínimo 1';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);
      try {
        const payload = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || '',
          precio: parseFloat(formData.precio),
          tipo: formData.tipo as TipoProducto,
          subcategoria: formData.subcategoria.trim() || undefined,
          activo: formData.activo,
          ...(TIPOS_CON_FECHA.includes(formData.tipo) && {
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            cupo_maximo: parseInt(formData.cupo_maximo, 10),
          }),
        };

        if (isEditMode && producto) {
          await updateProduct(producto.id, payload);
          toast.success('Producto actualizado');
        } else {
          await createProduct(payload);
          toast.success('Producto creado');
        }

        onSuccess();
        onClose();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al guardar';
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditMode, producto, onSuccess, onClose, validate],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent-muted)] flex items-center justify-center">
              <Package className="w-5 h-5 text-[var(--admin-accent)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
              Nombre <span className="text-[var(--status-error)]">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Colonia de Verano 2026"
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                errors.nombre ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
              }`}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-[var(--status-error)]">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all resize-none"
            />
          </div>

          {/* Precio y Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                Precio (ARS) <span className="text-[var(--status-error)]">*</span>
              </label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => handleChange('precio', e.target.value)}
                placeholder="180000"
                min="1"
                step="0.01"
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                  errors.precio ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
                }`}
              />
              {errors.precio && (
                <p className="mt-1 text-xs text-[var(--status-error)]">{errors.precio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                Tipo <span className="text-[var(--status-error)]">*</span>
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                  errors.tipo ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
                }`}
              >
                <option value="">Seleccionar...</option>
                <option value="Evento">Evento (Colonia, Taller)</option>
                <option value="Curso">Curso Online</option>
                <option value="Digital">Recurso Digital</option>
                <option value="Fisico">Producto Físico</option>
                <option value="Servicio">Servicio (Mentoría)</option>
                <option value="Bundle">Bundle (Combo)</option>
                <option value="Certificacion">Certificación</option>
              </select>
              {errors.tipo && (
                <p className="mt-1 text-xs text-[var(--status-error)]">{errors.tipo}</p>
              )}
            </div>
          </div>

          {/* Subcategoría (opcional) */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
              Subcategoría
            </label>
            <input
              type="text"
              value={formData.subcategoria}
              onChange={(e) => handleChange('subcategoria', e.target.value)}
              placeholder="Ej: Matemáticas, Programación..."
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all"
            />
          </div>

          {/* Campos condicionales para Evento/Curso */}
          {TIPOS_CON_FECHA.includes(formData.tipo) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                    Fecha Inicio <span className="text-[var(--status-error)]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                      errors.fecha_inicio
                        ? 'border-[var(--status-error)]'
                        : 'border-[var(--admin-border)]'
                    }`}
                  />
                  {errors.fecha_inicio && (
                    <p className="mt-1 text-xs text-[var(--status-error)]">{errors.fecha_inicio}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                    Fecha Fin <span className="text-[var(--status-error)]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => handleChange('fecha_fin', e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                      errors.fecha_fin
                        ? 'border-[var(--status-error)]'
                        : 'border-[var(--admin-border)]'
                    }`}
                  />
                  {errors.fecha_fin && (
                    <p className="mt-1 text-xs text-[var(--status-error)]">{errors.fecha_fin}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Cupo Máximo <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="number"
                  value={formData.cupo_maximo}
                  onChange={(e) => handleChange('cupo_maximo', e.target.value)}
                  placeholder="50"
                  min="1"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.cupo_maximo
                      ? 'border-[var(--status-error)]'
                      : 'border-[var(--admin-border)]'
                  }`}
                />
                {errors.cupo_maximo && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.cupo_maximo}</p>
                )}
              </div>
            </>
          )}

          {/* Checkbox Activo */}
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-[var(--admin-surface-2)] rounded-xl border border-[var(--admin-border)] hover:border-[var(--admin-accent)]/50 transition-colors">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => handleChange('activo', e.target.checked)}
              disabled={isSubmitting}
              className="w-5 h-5 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)] cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-[var(--admin-text)]">Producto activo</span>
              <p className="text-xs text-[var(--admin-text-muted)]">Visible en el catálogo</p>
            </div>
          </label>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[var(--admin-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : isEditMode ? (
              'Guardar Cambios'
            ) : (
              'Crear Producto'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
