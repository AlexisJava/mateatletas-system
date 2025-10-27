'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface CreateGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  edad_minima: string;
  edad_maxima: string;
}

export function CreateGrupoModal({ isOpen, onClose, onSuccess }: CreateGrupoModalProps) {
  const [formData, setFormData] = useState<FormData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    edad_minima: '',
    edad_maxima: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.codigo.trim()) {
      setError('El código es obligatorio');
      return;
    }

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (formData.edad_minima && formData.edad_maxima) {
      const min = parseInt(formData.edad_minima);
      const max = parseInt(formData.edad_maxima);
      if (min > max) {
        setError('La edad mínima no puede ser mayor que la máxima');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        edad_minima: formData.edad_minima ? parseInt(formData.edad_minima) : undefined,
        edad_maxima: formData.edad_maxima ? parseInt(formData.edad_maxima) : undefined,
      };

      const response = await fetch('http://localhost:3001/api/grupos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Success
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error('Error al crear grupo:', err);
      if (err instanceof Error) {
        setError(err.message || 'Error al crear el grupo');
      } else {
        setError('Error al crear el grupo');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      edad_minima: '',
      edad_maxima: '',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/95 to-pink-900/95 rounded-xl p-6 max-w-2xl w-full border border-purple-500/30 shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">✨ Crear Nuevo Grupo</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Código <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
              placeholder="ej: B2, ROBLOX, AJEDREZ, CV2025"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={20}
            />
            <p className="text-xs text-white/40 mt-1">
              Identificador corto único (ej: &quot;B2&quot; para Básico 2, &quot;ROBLOX&quot; para curso de Roblox)
            </p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="ej: Básico 2, Roblox - Programación Básica, Ajedrez Intermedio"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-white/40 mt-1">
              Nombre descriptivo completo del grupo
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="ej: Grupo para niños de 8-9 años que quieren aprender matemática de forma divertida"
              disabled={isSubmitting}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Rango de Edades */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Edad Mínima
              </label>
              <input
                type="number"
                value={formData.edad_minima}
                onChange={(e) => handleChange('edad_minima', e.target.value)}
                placeholder="ej: 6"
                min="1"
                max="99"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Edad Máxima
              </label>
              <input
                type="number"
                value={formData.edad_maxima}
                onChange={(e) => handleChange('edad_maxima', e.target.value)}
                placeholder="ej: 9"
                min="1"
                max="99"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <p className="text-xs text-white/40 -mt-2">
            Rango de edades sugerido (opcional)
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear Grupo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
