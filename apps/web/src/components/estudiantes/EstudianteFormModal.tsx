'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '@/components/ui';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import type { Estudiante, CreateEstudianteData } from '@/types/estudiante';

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
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    nivel_escolar: '',
    foto_url: '',
    equipo_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos si es edición
  useEffect(() => {
    if (estudiante) {
      setFormData({
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        fecha_nacimiento: estudiante.fecha_nacimiento.split('T')[0],
        nivel_escolar: estudiante.nivel_escolar,
        foto_url: estudiante.foto_url || '',
        equipo_id: estudiante.equipo_id || '',
      });
    } else {
      // Reset form para nuevo estudiante
      setFormData({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        nivel_escolar: '',
        foto_url: '',
        equipo_id: '',
      });
    }
    setErrors({});
  }, [estudiante, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    } else {
      // Validar edad (5-25 años)
      const hoy = new Date();
      const nacimiento = new Date(formData.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const m = hoy.getMonth() - nacimiento.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }

      if (edad < 5) {
        newErrors.fecha_nacimiento = 'Debe tener al menos 5 años';
      } else if (edad > 25) {
        newErrors.fecha_nacimiento = 'Debe tener máximo 25 años';
      }
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
        fecha_nacimiento: formData.fecha_nacimiento,
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
          <Input
            label="Fecha de Nacimiento"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            error={errors.fecha_nacimiento}
            required
          />

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
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
          >
            {isEdit ? 'Guardar Cambios' : 'Agregar Estudiante'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
