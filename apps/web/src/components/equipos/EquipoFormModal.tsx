'use client';

import { useState, useEffect } from 'react';
import type { Equipo, CreateEquipoDto } from '@/types/equipo.types';
import { Card, Button, Input } from '../ui';
import ColorPicker from './ColorPicker';

/**
 * Props del EquipoFormModal
 */
interface EquipoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (_data: CreateEquipoDto) => Promise<void>;
  equipoToEdit?: Equipo | null;
}

/**
 * Errores de validación del formulario
 */
interface FormErrors {
  nombre?: string;
  color_primario?: string;
  color_secundario?: string;
}

/**
 * Componente EquipoFormModal
 * Modal para crear o editar equipos
 *
 * Características:
 * - Formulario completo de equipo
 * - Validación de campos
 * - Modo crear / editar
 * - Previsualización de colores
 */
export default function EquipoFormModal({
  isOpen,
  onClose,
  onSubmit,
  equipoToEdit,
}: EquipoFormModalProps) {
  // Estado del formulario
  const [formData, setFormData] = useState<CreateEquipoDto>({
    nombre: '',
    color_primario: '#FF6B35',
    color_secundario: '#F7B801',
    icono_url: '',
  });

  // Errores de validación
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Cargar datos del equipo a editar
   */
  useEffect(() => {
    if (equipoToEdit) {
      setFormData({
        nombre: equipoToEdit.nombre,
        color_primario: equipoToEdit.color_primario,
        color_secundario: equipoToEdit.color_secundario,
        icono_url: equipoToEdit.icono_url || '',
      });
    } else {
      // Resetear formulario al abrir en modo crear
      setFormData({
        nombre: '',
        color_primario: '#FF6B35',
        color_secundario: '#F7B801',
        icono_url: '',
      });
    }
    setErrors({});
  }, [equipoToEdit, isOpen]);

  /**
   * Validar formato hexadecimal
   */
  const isValidHexColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  /**
   * Validar formulario
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del equipo es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    // Validar color primario
    if (!isValidHexColor(formData.color_primario)) {
      newErrors.color_primario =
        'El color primario debe ser un código hexadecimal válido (ej: #FF6B35)';
    }

    // Validar color secundario
    if (!isValidHexColor(formData.color_secundario)) {
      newErrors.color_secundario =
        'El color secundario debe ser un código hexadecimal válido (ej: #F7B801)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar cambios en los inputs
   */
  const handleChange = (field: keyof CreateEquipoDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al modificarlo
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos (sin icono_url si está vacío)
      const dataToSubmit: CreateEquipoDto = {
        nombre: formData.nombre.trim(),
        color_primario: formData.color_primario.toUpperCase(),
        color_secundario: formData.color_secundario.toUpperCase(),
      };

      if (formData.icono_url?.trim()) {
        dataToSubmit.icono_url = formData.icono_url.trim();
      }

      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      // El error se muestra a través del toast o del estado global
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Manejar cierre del modal
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full my-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-[#2a1a5e] mb-2">
              {equipoToEdit ? 'Editar equipo' : 'Crear nuevo equipo'}
            </h2>
            <p className="text-gray-600">
              {equipoToEdit
                ? 'Modifica los datos del equipo'
                : 'Completa los datos para crear un equipo'}
            </p>
          </div>

          {/* Campos del formulario */}
          <div className="space-y-6">
            {/* Nombre */}
            <Input
              label="Nombre del equipo"
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Quantum, Vertex, Nexus, Pulsar..."
              error={errors.nombre}
              required
              maxLength={50}
            />

            {/* Color primario */}
            <ColorPicker
              label="Color primario"
              value={formData.color_primario}
              onChange={(value) => handleChange('color_primario', value)}
              error={errors.color_primario}
              required
            />

            {/* Color secundario */}
            <ColorPicker
              label="Color secundario"
              value={formData.color_secundario}
              onChange={(value) => handleChange('color_secundario', value)}
              error={errors.color_secundario}
              required
            />

            {/* Previsualización del banner */}
            <div>
              <label className="block text-sm font-semibold text-[#2a1a5e] mb-2">
                Previsualización del equipo:
              </label>
              <div
                className="h-24 rounded-lg flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`,
                }}
              >
                <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                  {formData.nombre || 'Nombre del equipo'}
                </h3>
              </div>
            </div>

            {/* URL del ícono (opcional) */}
            <Input
              label="URL del ícono (opcional)"
              type="text"
              value={formData.icono_url}
              onChange={(e) => handleChange('icono_url', e.target.value)}
              placeholder="https://ejemplo.com/icono.png"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Guardando...'
                : equipoToEdit
                  ? 'Actualizar'
                  : 'Crear equipo'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
