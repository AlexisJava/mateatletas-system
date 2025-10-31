'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { createPlanificacion } from '@/lib/api/planificaciones.api';
import { isAxiosError } from 'axios';

interface Grupo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  edad_minima: number | null;
  edad_maxima: number | null;
}

interface CreatePlanificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export const CreatePlanificacionModal: React.FC<CreatePlanificacionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentYear = new Date().getFullYear();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [formData, setFormData] = useState({
    grupo_id: '',
    mes: new Date().getMonth() + 1,
    anio: currentYear,
    titulo: '',
    descripcion: '',
    tematica_principal: '',
    objetivos_aprendizaje: [''],
    notas_docentes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch grupos al abrir modal
  useEffect(() => {
    if (isOpen && grupos.length === 0) {
      const fetchGrupos = async () => {
        setLoadingGrupos(true);
        try {
          const response = await fetch('http://localhost:3001/api/grupos');
          const data = await response.json();
          setGrupos(data);
        } catch (err) {
          console.error('Error al cargar grupos:', err);
          setError('Error al cargar los grupos disponibles');
        } finally {
          setLoadingGrupos(false);
        }
      };
      fetchGrupos();
    }
  }, [isOpen, grupos.length]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleObjetivoChange = (index: number, value: string) => {
    const nuevosObjetivos = [...formData.objetivos_aprendizaje];
    nuevosObjetivos[index] = value;
    setFormData((prev) => ({ ...prev, objetivos_aprendizaje: nuevosObjetivos }));
  };

  const agregarObjetivo = () => {
    setFormData((prev) => ({
      ...prev,
      objetivos_aprendizaje: [...prev.objetivos_aprendizaje, ''],
    }));
  };

  const eliminarObjetivo = (index: number) => {
    if (formData.objetivos_aprendizaje.length > 1) {
      const nuevosObjetivos = formData.objetivos_aprendizaje.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, objetivos_aprendizaje: nuevosObjetivos }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.grupo_id) {
      setError('Debe seleccionar un grupo');
      return;
    }
    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!formData.tematica_principal.trim()) {
      setError('La temática principal es requerida');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        grupo_id: formData.grupo_id,
        mes: formData.mes,
        anio: formData.anio,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        tematica_principal: formData.tematica_principal.trim(),
        objetivos_aprendizaje: formData.objetivos_aprendizaje
          .map((obj) => obj.trim())
          .filter((obj) => obj.length > 0),
        notas_docentes: formData.notas_docentes.trim() || undefined,
      };

      await createPlanificacion(payload);

      // Reset form
      setFormData({
        grupo_id: '',
        mes: new Date().getMonth() + 1,
        anio: currentYear,
        titulo: '',
        descripcion: '',
        tematica_principal: '',
        objetivos_aprendizaje: [''],
        notas_docentes: '',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al crear planificación:', err);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al crear la planificación');
      } else {
        setError('Error al crear la planificación');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        {/* Fondo glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-xl rounded-2xl" />
        <div className="absolute inset-0 border-2 border-pink-400/30 rounded-2xl" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/50">
                <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-white via-pink-200 to-rose-200 bg-clip-text text-transparent">
                  Nueva Planificación
                </h2>
                <p className="text-sm text-white/60 font-medium">Crear planificación mensual inmersiva</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-400/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grupo y Período */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                  Grupo *
                </label>
                <select
                  value={formData.grupo_id}
                  onChange={(e) => handleChange('grupo_id', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                  disabled={loadingGrupos}
                >
                  <option value="">{loadingGrupos ? 'Cargando...' : 'Seleccionar'}</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.codigo} - {grupo.nombre}
                      {grupo.edad_minima && grupo.edad_maxima && ` (${grupo.edad_minima}-${grupo.edad_maxima} años)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                  Mes *
                </label>
                <select
                  value={formData.mes}
                  onChange={(e) => handleChange('mes', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  {MESES.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                  Año *
                </label>
                <input
                  type="number"
                  value={formData.anio}
                  onChange={(e) => handleChange('anio', parseInt(e.target.value))}
                  min={2024}
                  max={2030}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ej: Multiplicaciones - Diciembre 2024"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            {/* Temática Principal */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Temática Principal *
              </label>
              <input
                type="text"
                value={formData.tematica_principal}
                onChange={(e) => handleChange('tematica_principal', e.target.value)}
                placeholder="Ej: Multiplicaciones, Fracciones, Geometría"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Descripción general del mes..."
                rows={3}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            {/* Objetivos de Aprendizaje */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Objetivos de Aprendizaje
              </label>
              <div className="space-y-2">
                {formData.objetivos_aprendizaje.map((objetivo, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={objetivo}
                      onChange={(e) => handleObjetivoChange(index, e.target.value)}
                      placeholder={`Objetivo ${index + 1}`}
                      className="flex-1 px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {formData.objetivos_aprendizaje.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarObjetivo(index)}
                        className="px-3 py-2 rounded-xl bg-red-500/20 border border-red-400/50 text-red-300 font-bold hover:bg-red-500/30 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={agregarObjetivo}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all"
                >
                  + Agregar Objetivo
                </button>
              </div>
            </div>

            {/* Notas para Docentes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/60 mb-2">
                Notas para Docentes
              </label>
              <textarea
                value={formData.notas_docentes}
                onChange={(e) => handleChange('notas_docentes', e.target.value)}
                placeholder="Instrucciones especiales para los docentes..."
                rows={3}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white font-medium placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-bold hover:bg-white/10 disabled:opacity-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500/50 to-rose-500/50 border-2 border-pink-400/50 text-white font-bold hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Creando...' : 'Crear Planificación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
