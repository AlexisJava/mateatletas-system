'use client';

/**
 * ClaseGrupoFormModal - Modal para crear/editar horarios de un Club
 *
 * Permite crear o editar un ClaseGrupo con:
 * - Nombre y código
 * - Día y horario semanal
 * - Docente asignado (con notificación automática)
 * - Tipo (Regular o Temporal)
 * - Cupo máximo
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Clock, Loader2, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { crearClaseGrupo, actualizarClaseGrupo, type ClaseGrupo } from '@/lib/api/clase-grupos.api';
import { getDocentes, listarGruposPedagogicos, type GrupoPedagogico } from '@/lib/api/admin.api';
import type { DocenteFromSchema } from '@/lib/schemas/docente.schema';
import {
  DiaSemana,
  TipoClaseGrupo,
  DIA_SEMANA_LABELS,
  TIPO_CLASE_GRUPO_LABELS,
} from '@/types/clase-grupo';

interface ClaseGrupoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productoId: string;
  productoNombre: string;
  claseGrupo?: ClaseGrupo | null;
}

interface FormData {
  nombre: string;
  codigo: string;
  tipo: TipoClaseGrupo;
  diaSemana: DiaSemana | '';
  horaInicio: string;
  horaFin: string;
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: string;
  docenteId: string;
  grupoId: string;
}

interface FormErrors {
  nombre?: string;
  codigo?: string;
  tipo?: string;
  diaSemana?: string;
  horaInicio?: string;
  horaFin?: string;
  fechaInicio?: string;
  fechaFin?: string;
  cupoMaximo?: string;
  docenteId?: string;
  grupoId?: string;
}

const INITIAL_FORM_DATA: FormData = {
  nombre: '',
  codigo: '',
  tipo: TipoClaseGrupo.GRUPO_REGULAR,
  diaSemana: '',
  horaInicio: '18:00',
  horaFin: '19:30',
  fechaInicio: new Date().toISOString().split('T')[0] || '',
  fechaFin: '',
  cupoMaximo: '15',
  docenteId: '',
  grupoId: '',
};

function extractDatePart(dateTime: string | null | undefined): string {
  if (!dateTime) return '';
  const parts = dateTime.split('T');
  return parts[0] ?? '';
}

export function ClaseGrupoFormModal({
  isOpen,
  onClose,
  onSuccess,
  productoId,
  productoNombre,
  claseGrupo,
}: ClaseGrupoFormModalProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docentes, setDocentes] = useState<DocenteFromSchema[]>([]);
  const [grupos, setGrupos] = useState<GrupoPedagogico[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEditMode = Boolean(claseGrupo);
  const title = isEditMode ? 'Editar Horario' : 'Nuevo Horario';

  // Cargar docentes y grupos pedagógicos al abrir
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingData(true);
    Promise.all([getDocentes(), listarGruposPedagogicos()])
      .then(([docentesRes, gruposRes]) => {
        setDocentes(docentesRes);
        setGrupos(gruposRes);
      })
      .catch((error) => {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar docentes y grupos');
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, [isOpen]);

  // Cargar datos del ClaseGrupo en modo edición
  useEffect(() => {
    if (isOpen && claseGrupo) {
      setFormData({
        nombre: claseGrupo.nombre,
        codigo: claseGrupo.codigo,
        tipo: claseGrupo.tipo,
        diaSemana: claseGrupo.diaSemana,
        horaInicio: claseGrupo.horaInicio,
        horaFin: claseGrupo.horaFin,
        fechaInicio: extractDatePart(claseGrupo.fechaInicio),
        fechaFin: extractDatePart(claseGrupo.fechaFin),
        cupoMaximo: String(claseGrupo.cupoMaximo),
        docenteId: claseGrupo.docenteId,
        grupoId: claseGrupo.grupoId || '',
      });
      setErrors({});
    } else if (isOpen && !claseGrupo) {
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
    }
  }, [isOpen, claseGrupo]);

  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
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
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }

    if (!formData.diaSemana) {
      newErrors.diaSemana = 'Selecciona un día';
    }

    if (!formData.horaInicio) {
      newErrors.horaInicio = 'Requerido';
    }

    if (!formData.horaFin) {
      newErrors.horaFin = 'Requerido';
    }

    if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
      newErrors.horaFin = 'Debe ser posterior al inicio';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'Requerido';
    }

    if (formData.tipo === TipoClaseGrupo.CURSO_TEMPORAL && !formData.fechaFin) {
      newErrors.fechaFin = 'Requerido para cursos temporales';
    }

    if (formData.fechaInicio && formData.fechaFin) {
      if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
        newErrors.fechaFin = 'Debe ser posterior al inicio';
      }
    }

    const cupo = parseInt(formData.cupoMaximo, 10);
    if (!formData.cupoMaximo || isNaN(cupo) || cupo < 1 || cupo > 50) {
      newErrors.cupoMaximo = 'Entre 1 y 50';
    }

    if (!formData.docenteId) {
      newErrors.docenteId = 'Selecciona un docente';
    }

    if (!formData.grupoId) {
      newErrors.grupoId = 'Selecciona un grupo pedagógico';
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
        if (isEditMode && claseGrupo) {
          await actualizarClaseGrupo(claseGrupo.id, {
            nombre: formData.nombre.trim(),
            codigo: formData.codigo.trim(),
            tipo: formData.tipo,
            diaSemana: formData.diaSemana as DiaSemana,
            horaInicio: formData.horaInicio,
            horaFin: formData.horaFin,
            fechaInicio: formData.fechaInicio,
            fechaFin: formData.fechaFin || undefined,
            cupoMaximo: parseInt(formData.cupoMaximo, 10),
            docenteId: formData.docenteId,
          });
          toast.success('Horario actualizado');
        } else {
          await crearClaseGrupo({
            grupoId: formData.grupoId,
            codigo: formData.codigo.trim(),
            nombre: formData.nombre.trim(),
            tipo: formData.tipo,
            diaSemana: formData.diaSemana as DiaSemana,
            horaInicio: formData.horaInicio,
            horaFin: formData.horaFin,
            fechaInicio: formData.fechaInicio,
            fechaFin: formData.fechaFin || undefined,
            anioLectivo: new Date().getFullYear(),
            cupoMaximo: parseInt(formData.cupoMaximo, 10),
            docenteId: formData.docenteId,
            estudiantesIds: [],
            productoId, // FASE 3: Vincular horario con producto (Club)
          });
          toast.success('Horario creado. El docente será notificado.');
        }

        onSuccess();
        onClose();
      } catch (error) {
        // Extraer mensaje de error del backend (AxiosError)
        let message = 'Error al guardar';
        if (error && typeof error === 'object') {
          const axiosError = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          message = axiosError.response?.data?.message || axiosError.message || message;
        }
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditMode, claseGrupo, onSuccess, onClose, validate],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent-muted)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--admin-accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
              <p className="text-xs text-[var(--admin-text-muted)]">{productoNombre}</p>
            </div>
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
        {isLoadingData ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-accent)]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Nombre y Código */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Nombre <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Ñandú N3 - Lunes"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.nombre ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
                  }`}
                />
                {errors.nombre && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Código <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value)}
                  placeholder="Ej: NANDU-N3-LUN"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.codigo ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
                  }`}
                />
                {errors.codigo && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.codigo}</p>
                )}
              </div>
            </div>

            {/* Grupo Pedagógico */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                Grupo Pedagógico <span className="text-[var(--status-error)]">*</span>
              </label>
              <select
                value={formData.grupoId}
                onChange={(e) => handleChange('grupoId', e.target.value)}
                disabled={isSubmitting || isEditMode}
                className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                  errors.grupoId ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
                } ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option value="">Seleccionar grupo...</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.codigo}
                    {grupo.nombre ? ` - ${grupo.nombre}` : ''}
                  </option>
                ))}
              </select>
              {errors.grupoId && (
                <p className="mt-1 text-xs text-[var(--status-error)]">{errors.grupoId}</p>
              )}
            </div>

            {/* Docente */}
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                <GraduationCap className="w-4 h-4 inline mr-1" />
                Docente <span className="text-[var(--status-error)]">*</span>
              </label>
              <select
                value={formData.docenteId}
                onChange={(e) => handleChange('docenteId', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                  errors.docenteId ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
                }`}
              >
                <option value="">Seleccionar docente...</option>
                {docentes.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombre} {docente.apellido}
                    {docente.titulo ? ` - ${docente.titulo}` : ''}
                  </option>
                ))}
              </select>
              {errors.docenteId && (
                <p className="mt-1 text-xs text-[var(--status-error)]">{errors.docenteId}</p>
              )}
            </div>

            {/* Día y Horario */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Día <span className="text-[var(--status-error)]">*</span>
                </label>
                <select
                  value={formData.diaSemana}
                  onChange={(e) => handleChange('diaSemana', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.diaSemana
                      ? 'border-[var(--status-error)]'
                      : 'border-[var(--admin-border)]'
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  {Object.values(DiaSemana).map((dia) => (
                    <option key={dia} value={dia}>
                      {DIA_SEMANA_LABELS[dia]}
                    </option>
                  ))}
                </select>
                {errors.diaSemana && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.diaSemana}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Hora inicio <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => handleChange('horaInicio', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.horaInicio
                      ? 'border-[var(--status-error)]'
                      : 'border-[var(--admin-border)]'
                  }`}
                />
                {errors.horaInicio && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.horaInicio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Hora fin <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => handleChange('horaFin', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.horaFin ? 'border-[var(--status-error)]' : 'border-[var(--admin-border)]'
                  }`}
                />
                {errors.horaFin && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.horaFin}</p>
                )}
              </div>
            </div>

            {/* Tipo y Cupo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Tipo <span className="text-[var(--status-error)]">*</span>
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value as TipoClaseGrupo)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all"
                >
                  {Object.values(TipoClaseGrupo).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {TIPO_CLASE_GRUPO_LABELS[tipo]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Cupo máximo <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="number"
                  value={formData.cupoMaximo}
                  onChange={(e) => handleChange('cupoMaximo', e.target.value)}
                  min="1"
                  max="50"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.cupoMaximo
                      ? 'border-[var(--status-error)]'
                      : 'border-[var(--admin-border)]'
                  }`}
                />
                {errors.cupoMaximo && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.cupoMaximo}</p>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Fecha inicio <span className="text-[var(--status-error)]">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => handleChange('fechaInicio', e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.fechaInicio
                      ? 'border-[var(--status-error)]'
                      : 'border-[var(--admin-border)]'
                  }`}
                />
                {errors.fechaInicio && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.fechaInicio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1.5">
                  Fecha fin{' '}
                  {formData.tipo === TipoClaseGrupo.CURSO_TEMPORAL && (
                    <span className="text-[var(--status-error)]">*</span>
                  )}
                </label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => handleChange('fechaFin', e.target.value)}
                  disabled={isSubmitting}
                  placeholder={formData.tipo === TipoClaseGrupo.GRUPO_REGULAR ? 'Auto: 15/dic' : ''}
                  className={`w-full px-4 py-2.5 bg-[var(--admin-surface-2)] border rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 transition-all ${
                    errors.fechaFin
                      ? 'border-[var(--status-error)]'
                      : 'border-[var(--admin-border)]'
                  }`}
                />
                {formData.tipo === TipoClaseGrupo.GRUPO_REGULAR && !formData.fechaFin && (
                  <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                    Se usará 15/dic del año lectivo
                  </p>
                )}
                {errors.fechaFin && (
                  <p className="mt-1 text-xs text-[var(--status-error)]">{errors.fechaFin}</p>
                )}
              </div>
            </div>
          </form>
        )}

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
            disabled={isSubmitting || isLoadingData}
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
              'Crear Horario'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClaseGrupoFormModal;
