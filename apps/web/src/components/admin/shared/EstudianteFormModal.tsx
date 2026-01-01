'use client';

import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  crearEstudianteConCredenciales,
  getSectores,
  getCasas,
  type CrearEstudianteConCredencialesDto,
  type CrearEstudianteConCredencialesResponse,
  type Sector,
  type Casa,
} from '@/lib/api/admin.api';

type NivelEscolar = 'Primaria' | 'Secundaria' | 'Universidad';

interface EstudianteFormData {
  // Estudiante
  nombreEstudiante: string;
  apellidoEstudiante: string;
  edadEstudiante: string;
  nivelEscolar: NivelEscolar | '';
  sectorId: string;
  casaId: string;
  // Tutor
  nombreTutor: string;
  apellidoTutor: string;
  emailTutor: string;
  telefonoTutor: string;
  dniTutor: string;
}

interface FormErrors {
  nombreEstudiante?: string;
  apellidoEstudiante?: string;
  edadEstudiante?: string;
  nivelEscolar?: string;
  sectorId?: string;
  nombreTutor?: string;
  apellidoTutor?: string;
  emailTutor?: string;
}

interface EstudianteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Callback cuando se crea exitosamente (modo standalone) */
  onSuccess?: (response: CrearEstudianteConCredencialesResponse) => void;
  /** Callback con el DTO para que el padre maneje la API (modo delegado) */
  onSubmitDto?: (dto: CrearEstudianteConCredencialesDto) => Promise<void>;
  preselectedSectorId?: string;
}

const INITIAL_FORM_DATA: EstudianteFormData = {
  nombreEstudiante: '',
  apellidoEstudiante: '',
  edadEstudiante: '',
  nivelEscolar: '',
  sectorId: '',
  casaId: '',
  nombreTutor: '',
  apellidoTutor: '',
  emailTutor: '',
  telefonoTutor: '',
  dniTutor: '',
};

const NIVELES_ESCOLARES: { value: NivelEscolar; label: string }[] = [
  { value: 'Primaria', label: 'Primaria' },
  { value: 'Secundaria', label: 'Secundaria' },
  { value: 'Universidad', label: 'Universidad' },
];

/**
 * EstudianteFormModal - Modal para crear estudiantes con credenciales
 */
export function EstudianteFormModal({
  isOpen,
  onClose,
  onSuccess,
  onSubmitDto,
  preselectedSectorId,
}: EstudianteFormModalProps) {
  const [formData, setFormData] = useState<EstudianteFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [casas, setCasas] = useState<Casa[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Ref para controlar si el request sigue siendo válido
  const currentRequestRef = useRef<string | null>(null);

  // Cargar sectores y casas
  useEffect(() => {
    if (!isOpen) return;

    // Generar ID único para este request
    const requestId = `catalogos-${Date.now()}`;
    currentRequestRef.current = requestId;

    setIsLoadingData(true);

    Promise.all([getSectores(), getCasas()])
      .then(([sectoresData, casasData]) => {
        // Verificar que este request siga siendo el actual
        if (currentRequestRef.current !== requestId) return;

        setSectores(sectoresData.filter((s) => s.activo));
        setCasas(casasData.filter((c) => c.activo));
      })
      .catch((error) => {
        // Solo mostrar error si el request sigue siendo actual
        if (currentRequestRef.current !== requestId) return;

        console.error('Error cargando datos:', error);
        toast.error('Error al cargar sectores y casas');
      })
      .finally(() => {
        // Solo actualizar loading si el request sigue siendo actual
        if (currentRequestRef.current === requestId) {
          setIsLoadingData(false);
        }
      });

    // Cleanup: invalidar el request anterior
    return () => {
      currentRequestRef.current = null;
    };
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...INITIAL_FORM_DATA,
        sectorId: preselectedSectorId || '',
      });
      setErrors({});
    }
  }, [isOpen, preselectedSectorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Estudiante
    if (!formData.nombreEstudiante.trim()) {
      newErrors.nombreEstudiante = 'El nombre es requerido';
    } else if (formData.nombreEstudiante.length < 2) {
      newErrors.nombreEstudiante = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellidoEstudiante.trim()) {
      newErrors.apellidoEstudiante = 'El apellido es requerido';
    } else if (formData.apellidoEstudiante.length < 2) {
      newErrors.apellidoEstudiante = 'El apellido debe tener al menos 2 caracteres';
    }

    const edad = parseInt(formData.edadEstudiante, 10);
    if (!formData.edadEstudiante || isNaN(edad)) {
      newErrors.edadEstudiante = 'La edad es requerida';
    } else if (edad < 3 || edad > 18) {
      newErrors.edadEstudiante = 'La edad debe estar entre 3 y 18 años';
    }

    if (!formData.nivelEscolar) {
      newErrors.nivelEscolar = 'El nivel escolar es requerido';
    }

    if (!formData.sectorId) {
      newErrors.sectorId = 'El sector es requerido';
    }

    // Tutor
    if (!formData.nombreTutor.trim()) {
      newErrors.nombreTutor = 'El nombre del tutor es requerido';
    } else if (formData.nombreTutor.length < 2) {
      newErrors.nombreTutor = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellidoTutor.trim()) {
      newErrors.apellidoTutor = 'El apellido del tutor es requerido';
    } else if (formData.apellidoTutor.length < 2) {
      newErrors.apellidoTutor = 'El apellido debe tener al menos 2 caracteres';
    }

    // Email opcional pero debe ser válido si se proporciona
    if (formData.emailTutor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailTutor)) {
      newErrors.emailTutor = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const dto: CrearEstudianteConCredencialesDto = {
        nombreEstudiante: formData.nombreEstudiante.trim(),
        apellidoEstudiante: formData.apellidoEstudiante.trim(),
        edadEstudiante: parseInt(formData.edadEstudiante, 10),
        nivelEscolar: formData.nivelEscolar as NivelEscolar,
        sectorId: formData.sectorId,
        casaId: formData.casaId || undefined,
        nombreTutor: formData.nombreTutor.trim(),
        apellidoTutor: formData.apellidoTutor.trim(),
        emailTutor: formData.emailTutor.trim() || undefined,
        telefonoTutor: formData.telefonoTutor.trim() || undefined,
        dniTutor: formData.dniTutor.trim() || undefined,
      };

      // Modo delegado: el padre maneja la API
      if (onSubmitDto) {
        await onSubmitDto(dto);
        onClose();
        return;
      }

      // Modo standalone: este componente hace la llamada API
      const response = await crearEstudianteConCredenciales(dto);
      toast.success('Estudiante creado exitosamente');
      onSuccess?.(response);
      onClose();
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      toast.error('Error al crear estudiante');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[var(--admin-border)] bg-[var(--admin-surface-1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent-muted)] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[var(--admin-accent)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--admin-text)]">Crear Estudiante</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-accent)]" />
            </div>
          ) : (
            <>
              {/* Datos del Estudiante */}
              <div>
                <h3 className="text-sm font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-4">
                  Datos del Estudiante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombreEstudiante"
                      value={formData.nombreEstudiante}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.nombreEstudiante ? 'border-red-500' : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                      placeholder="Ej: Juan"
                    />
                    {errors.nombreEstudiante && (
                      <p className="text-red-500 text-xs mt-1">{errors.nombreEstudiante}</p>
                    )}
                  </div>

                  {/* Apellido */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellidoEstudiante"
                      value={formData.apellidoEstudiante}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.apellidoEstudiante
                          ? 'border-red-500'
                          : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                      placeholder="Ej: Pérez"
                    />
                    {errors.apellidoEstudiante && (
                      <p className="text-red-500 text-xs mt-1">{errors.apellidoEstudiante}</p>
                    )}
                  </div>

                  {/* Edad */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Edad *
                    </label>
                    <input
                      type="number"
                      name="edadEstudiante"
                      value={formData.edadEstudiante}
                      onChange={handleChange}
                      min={3}
                      max={18}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.edadEstudiante ? 'border-red-500' : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                      placeholder="Ej: 10"
                    />
                    {errors.edadEstudiante && (
                      <p className="text-red-500 text-xs mt-1">{errors.edadEstudiante}</p>
                    )}
                  </div>

                  {/* Nivel Escolar */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Nivel Escolar *
                    </label>
                    <select
                      name="nivelEscolar"
                      value={formData.nivelEscolar}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.nivelEscolar ? 'border-red-500' : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                    >
                      <option value="">Seleccionar nivel</option>
                      {NIVELES_ESCOLARES.map((nivel) => (
                        <option key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </option>
                      ))}
                    </select>
                    {errors.nivelEscolar && (
                      <p className="text-red-500 text-xs mt-1">{errors.nivelEscolar}</p>
                    )}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Sector *
                    </label>
                    <select
                      name="sectorId"
                      value={formData.sectorId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.sectorId ? 'border-red-500' : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                    >
                      <option value="">Seleccionar sector</option>
                      {sectores.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.sectorId && (
                      <p className="text-red-500 text-xs mt-1">{errors.sectorId}</p>
                    )}
                  </div>

                  {/* Casa (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Casa (opcional)
                    </label>
                    <select
                      name="casaId"
                      value={formData.casaId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                    >
                      <option value="">Sin asignar</option>
                      {casas.map((casa) => (
                        <option key={casa.id} value={casa.id}>
                          {casa.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-[var(--admin-border)]" />

              {/* Datos del Tutor */}
              <div>
                <h3 className="text-sm font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-4">
                  Datos del Tutor/Padre
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre Tutor */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombreTutor"
                      value={formData.nombreTutor}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.nombreTutor ? 'border-red-500' : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                      placeholder="Ej: Carlos"
                    />
                    {errors.nombreTutor && (
                      <p className="text-red-500 text-xs mt-1">{errors.nombreTutor}</p>
                    )}
                  </div>

                  {/* Apellido Tutor */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellidoTutor"
                      value={formData.apellidoTutor}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.apellidoTutor ? 'border-red-500' : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                      placeholder="Ej: Pérez"
                    />
                    {errors.apellidoTutor && (
                      <p className="text-red-500 text-xs mt-1">{errors.apellidoTutor}</p>
                    )}
                  </div>

                  {/* Email Tutor (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      name="emailTutor"
                      value={formData.emailTutor}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border ${
                        errors.emailTutor ? 'border-red-500' : 'border-[var(--admin-border)]'
                      } text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]`}
                      placeholder="Ej: carlos@email.com"
                    />
                    {errors.emailTutor && (
                      <p className="text-red-500 text-xs mt-1">{errors.emailTutor}</p>
                    )}
                  </div>

                  {/* Teléfono Tutor (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      name="telefonoTutor"
                      value={formData.telefonoTutor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                      placeholder="Ej: +54 9 11 1234-5678"
                    />
                  </div>

                  {/* DNI Tutor (opcional) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--admin-text)] mb-1">
                      DNI (opcional)
                    </label>
                    <input
                      type="text"
                      name="dniTutor"
                      value={formData.dniTutor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                      placeholder="Ej: 12345678"
                    />
                    <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                      El DNI ayuda a identificar tutores existentes y evitar duplicados
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--admin-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingData}
              className="px-4 py-2 rounded-lg bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Crear Estudiante
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EstudianteFormModal;
