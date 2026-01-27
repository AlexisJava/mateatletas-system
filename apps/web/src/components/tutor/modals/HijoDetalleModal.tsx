'use client';

import { useState } from 'react';
import { X, Star, BarChart3, Trophy, BookOpen, Shield, Pencil, Loader2, Check } from 'lucide-react';
import type { HijoInfo, UpdateEstudianteRequest } from '@/lib/api/tutores.api';
import { tutoresApi } from '@/lib/api/tutores.api';
import toast from 'react-hot-toast';

interface HijoDetalleModalProps {
  hijo: HijoInfo;
  onClose: () => void;
  /** Callback cuando se actualizan los datos del hijo */
  onUpdate?: () => void;
}

interface CasaTheme {
  gradient: string;
  text: string;
}

const DEFAULT_THEME: CasaTheme = { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-300' };

const CASA_THEMES: Record<string, CasaTheme> = {
  QUANTUM: { gradient: 'from-pink-500 to-orange-500', text: 'text-pink-300' },
  VERTEX: DEFAULT_THEME,
  PULSAR: { gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-300' },
};

function getCasaTheme(casa: string): CasaTheme {
  return CASA_THEMES[casa] ?? DEFAULT_THEME;
}

const NIVEL_OPTIONS = ['Primaria', 'Secundaria', 'Universidad'] as const;

/**
 * Modal con detalle completo de un hijo
 * Muestra estadísticas, últimas clases, logros
 * Permite editar datos básicos del estudiante
 */
export function HijoDetalleModal({ hijo, onClose, onUpdate }: HijoDetalleModalProps) {
  const theme = getCasaTheme(hijo.casa ?? 'VERTEX');
  const initials = `${hijo.nombre[0] ?? ''}${hijo.apellido[0] ?? ''}`.toUpperCase();

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: hijo.nombre,
    apellido: hijo.apellido,
    edad: hijo.edad ?? 0,
    nivelEscolar: (hijo.nivelEscolar ?? 'Primaria') as 'Primaria' | 'Secundaria' | 'Universidad',
  });

  const handleInputChange = (field: keyof typeof formData, value: string | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (): Promise<void> => {
    // Validación básica
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      toast.error('Nombre y apellido son requeridos');
      return;
    }
    if (formData.edad < 3 || formData.edad > 99) {
      toast.error('La edad debe estar entre 3 y 99 años');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: UpdateEstudianteRequest = {};

      // Solo enviar campos que cambiaron
      if (formData.nombre.trim() !== hijo.nombre) {
        updateData.nombre = formData.nombre.trim();
      }
      if (formData.apellido.trim() !== hijo.apellido) {
        updateData.apellido = formData.apellido.trim();
      }
      if (formData.edad !== hijo.edad) {
        updateData.edad = formData.edad;
      }
      if (formData.nivelEscolar !== hijo.nivelEscolar) {
        updateData.nivelEscolar = formData.nivelEscolar;
      }

      // Si no hay cambios, salir del modo edición
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      await tutoresApi.updateEstudiante(hijo.id, updateData);
      toast.success('Datos actualizados correctamente');
      setIsEditing(false);
      onUpdate?.();
    } catch {
      toast.error('Error al actualizar los datos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    // Restaurar valores originales
    setFormData({
      nombre: hijo.nombre,
      apellido: hijo.apellido,
      edad: hijo.edad ?? 0,
      nivelEscolar: (hijo.nivelEscolar ?? 'Primaria') as 'Primaria' | 'Secundaria' | 'Universidad',
    });
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-colors"
                title="Editar datos"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}
            >
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>

            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-lg font-bold w-full focus:outline-none focus:border-cyan-500"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-lg font-bold w-full focus:outline-none focus:border-cyan-500"
                    placeholder="Apellido"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">
                    {hijo.nombre} {hijo.apellido}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className={`w-4 h-4 ${theme.text}`} />
                    <span className={`text-sm font-semibold ${theme.text}`}>
                      Casa {hijo.casa ?? 'Sin asignar'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Formulario de edición adicional */}
        {isEditing && (
          <div className="px-6 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Edad</label>
                <input
                  type="number"
                  min={3}
                  max={99}
                  value={formData.edad}
                  onChange={(e) => handleInputChange('edad', parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nivel escolar</label>
                <select
                  value={formData.nivelEscolar}
                  onChange={(e) =>
                    handleInputChange(
                      'nivelEscolar',
                      e.target.value as 'Primaria' | 'Secundaria' | 'Universidad',
                    )
                  }
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:border-cyan-500"
                >
                  {NIVEL_OPTIONS.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid - solo mostrar cuando no está editando */}
        {!isEditing && (
          <>
            <div className="px-6 pb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Estadísticas
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <StatBox
                  icon={Star}
                  label="Puntos"
                  value={hijo.puntosTotales.toString()}
                  color="text-amber-400"
                  bgColor="bg-amber-500/10"
                />
                <StatBox
                  icon={BarChart3}
                  label="Asistencia"
                  value={`${hijo.asistenciaPromedio}%`}
                  color="text-cyan-400"
                  bgColor="bg-cyan-500/10"
                />
                <StatBox
                  icon={Trophy}
                  label="Logros"
                  value="--"
                  color="text-purple-400"
                  bgColor="bg-purple-500/10"
                />
                <StatBox
                  icon={BookOpen}
                  label="Clases"
                  value="--"
                  color="text-emerald-400"
                  bgColor="bg-emerald-500/10"
                />
              </div>
            </div>

            {/* Datos adicionales */}
            <div className="px-6 pb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Información
              </h3>
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Edad</span>
                  <span className="text-white text-sm font-medium">
                    {hijo.edad ? `${hijo.edad} años` : 'No especificada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Nivel escolar</span>
                  <span className="text-white text-sm font-medium">
                    {hijo.nivelEscolar ?? 'No especificado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Últimas clases - Placeholder */}
            <div className="px-6 pb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Últimas Clases
              </h3>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">
                  Próximamente: historial de clases y asistencia
                </p>
              </div>
            </div>

            {/* Logros recientes - Placeholder */}
            <div className="px-6 pb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Logros Recientes
              </h3>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">Próximamente: logros y medallas obtenidas</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface StatBoxProps {
  icon: typeof Star;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatBox({ icon: Icon, label, value, color, bgColor }: StatBoxProps) {
  return (
    <div className={`${bgColor} rounded-xl p-3 text-center`}>
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
