'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Select } from '@/components/ui';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import type { Estudiante, CreateEstudianteData } from '@/types/estudiante';

interface EstudianteFormState {
  nombre: string;
  apellido: string;
  edad: number;
  nivel_escolar: string;
  foto_url: string;
  equipo_id: string;
}

interface EstudianteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante?: Estudiante | null;
  onSuccess?: () => void;
}

/**
 * Modal con formulario para crear/editar estudiante
 * Incluye validaciones y manejo de estados
 */
export function EstudianteFormModal({
  isOpen,
  onClose,
  estudiante,
  onSuccess,
}: EstudianteFormModalProps) {
  const { createEstudiante, updateEstudiante, equipos, fetchEquipos, isCreating, isUpdating } =
    useEstudiantesStore();

  const isEdit = !!estudiante;
  const isLoading = isCreating || isUpdating;

  // Cargar equipos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchEquipos();
    }
  }, [isOpen, fetchEquipos]);

  // Form state
  const [formData, setFormData] = useState<EstudianteFormState>({
    nombre: '',
    apellido: '',
    edad: 8,
    nivel_escolar: '',
    foto_url: '',
    equipo_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos si es edición
  useEffect(() => {
    if (estudiante) {
      const nivelEscolar = estudiante.nivel_escolar ?? '';

      setFormData({
        nombre: estudiante.nombre ?? '',
        apellido: estudiante.apellido ?? '',
        edad: estudiante.edad ?? 8,
        nivel_escolar: nivelEscolar,
        foto_url: estudiante.foto_url || '',
        equipo_id: estudiante.equipo_id || '',
      });
    } else {
      // Reset form para nuevo estudiante
      setFormData({
        nombre: '',
        apellido: '',
        edad: 8,
        nivel_escolar: '',
        foto_url: '',
        equipo_id: '',
      });
    }
    setErrors({});
  }, [estudiante, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.edad || formData.edad < 5) {
      newErrors.edad = 'Debe tener al menos 5 años';
    }
    if (formData.edad > 25) {
      newErrors.edad = 'Debe tener máximo 25 años';
    }

    if (!formData.nivel_escolar) {
      newErrors.nivel_escolar = 'El nivel escolar es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data: CreateEstudianteData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        edad: formData.edad,
        nivel_escolar: formData.nivel_escolar as 'Primaria' | 'Secundaria' | 'Universidad',
        foto_url: formData.foto_url.trim() || undefined,
        equipo_id: formData.equipo_id || undefined,
      };

      if (isEdit) {
        await updateEstudiante(estudiante.id, data);
      } else {
        await createEstudiante(data);
      }

      onSuccess?.();

      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };

      setErrors({
        general: err.response?.data?.message || 'Error al guardar estudiante',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Estudiante' : 'Agregar Estudiante'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
            placeholder="Ej: María"
          />

          <Input
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            error={errors.apellido}
            required
            placeholder="Ej: González"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edad" className="block text-sm font-medium text-gray-200 mb-2">
              Edad *
            </label>
            <input
              type="number"
              id="edad"
              name="edad"
              min="5"
              max="25"
              value={formData.edad}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setFormData({ ...formData, edad: value });
                if (errors.edad) {
                  setErrors((prev) => ({ ...prev, edad: '' }));
                }
              }}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.edad && <p className="mt-1 text-sm text-red-400">{errors.edad}</p>}
          </div>

          <Select
            label="Nivel Escolar"
            name="nivel_escolar"
            options={[
              { value: 'Primaria', label: 'Primaria' },
              { value: 'Secundaria', label: 'Secundaria' },
              { value: 'Universidad', label: 'Universidad' },
            ]}
            value={formData.nivel_escolar}
            onChange={handleChange}
            error={errors.nivel_escolar}
            required
          />
        </div>

        <Select
          label="Equipo (Opcional)"
          name="equipo_id"
          options={(equipos || []).map((eq) => ({
            value: eq.id,
            label: eq.nombre,
          }))}
          value={formData.equipo_id}
          onChange={handleChange}
          placeholder="Sin equipo"
        />

        <Input
          label="Foto URL (Opcional)"
          name="foto_url"
          type="url"
          value={formData.foto_url}
          onChange={handleChange}
          placeholder="https://ejemplo.com/foto.jpg"
        />

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
            }}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </>
            ) : isEdit ? (
              'Guardar Cambios'
            ) : (
              'Agregar Estudiante'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
