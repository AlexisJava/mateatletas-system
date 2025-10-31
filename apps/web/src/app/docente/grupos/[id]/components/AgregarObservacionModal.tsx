'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  CheckCircle,
  Loader2,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { StudentAvatar } from '@/components/ui/StudentAvatar';
import type { EstudianteConStatsDto } from '@/lib/api/clase-grupos.api';
import axios from '@/lib/axios';

interface AgregarObservacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  claseGrupoId: string;
  estudiantes: EstudianteConStatsDto[];
  onSuccess: () => void;
}

type TipoObservacion = 'positiva' | 'neutral' | 'atencion';

export default function AgregarObservacionModal({
  isOpen,
  onClose,
  claseGrupoId,
  estudiantes,
  onSuccess,
}: AgregarObservacionModalProps) {
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<
    string | null
  >(null);
  const [tipoObservacion, setTipoObservacion] =
    useState<TipoObservacion>('neutral');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validaciones
    if (!estudianteSeleccionado) {
      toast.error('Debes seleccionar un estudiante');
      return;
    }

    if (!observaciones.trim()) {
      toast.error('Debes escribir una observación');
      return;
    }

    try {
      setIsSubmitting(true);

      const fechaHoy = new Date().toISOString().split('T')[0];

      // Llamar al endpoint de asistencia batch con solo este estudiante
      // Esto actualizará la asistencia del día con las observaciones
      await axios.post('/asistencia/clase-grupo/batch', {
        clase_grupo_id: claseGrupoId,
        fecha: fechaHoy,
        asistencias: [
          {
            estudiante_id: estudianteSeleccionado,
            estado: 'Presente', // Default, no afecta si ya existe
            observaciones: observaciones.trim(),
          },
        ],
      });

      toast.success('✅ Observación agregada exitosamente');

      // Reset form
      setEstudianteSeleccionado(null);
      setObservaciones('');
      setTipoObservacion('neutral');

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al agregar observación:', error);
      toast.error(
        error?.response?.data?.message ||
          'Error al guardar observación. Intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const estudianteSelected = estudiantes.find(
    (e) => e.id === estudianteSeleccionado
  );

  const getTipoIcon = (tipo: TipoObservacion) => {
    switch (tipo) {
      case 'positiva':
        return <Smile className="w-5 h-5" />;
      case 'neutral':
        return <Meh className="w-5 h-5" />;
      case 'atencion':
        return <Frown className="w-5 h-5" />;
    }
  };

  const getTipoColor = (tipo: TipoObservacion) => {
    switch (tipo) {
      case 'positiva':
        return 'from-green-600 to-emerald-600';
      case 'neutral':
        return 'from-blue-600 to-cyan-600';
      case 'atencion':
        return 'from-orange-600 to-red-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-purple-500/30 pointer-events-auto">
              {/* Header */}
              <div
                className={`bg-gradient-to-r ${getTipoColor(tipoObservacion)} p-6 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      AGREGAR OBSERVACIÓN
                    </h2>
                    <p className="text-white/90 font-semibold">
                      {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[70vh] p-6 space-y-6">
                {/* Tipo de observación */}
                <div>
                  <label className="block text-white font-bold mb-3">
                    Tipo de Observación
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTipoObservacion('positiva')}
                      className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        tipoObservacion === 'positiva'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-600/50 scale-105'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      <Smile className="w-5 h-5" />
                      Positiva
                    </button>

                    <button
                      onClick={() => setTipoObservacion('neutral')}
                      className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        tipoObservacion === 'neutral'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 scale-105'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      <Meh className="w-5 h-5" />
                      Neutral
                    </button>

                    <button
                      onClick={() => setTipoObservacion('atencion')}
                      className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        tipoObservacion === 'atencion'
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/50 scale-105'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      <Frown className="w-5 h-5" />
                      Atención
                    </button>
                  </div>
                </div>

                {/* Selección de estudiante */}
                <div>
                  <label className="block text-white font-bold mb-3">
                    Seleccionar Estudiante
                  </label>
                  <div className="max-h-64 overflow-y-auto space-y-2 bg-white/5 rounded-xl p-3 border border-white/10">
                    {estudiantes.map((estudiante) => (
                      <button
                        key={estudiante.id}
                        onClick={() => setEstudianteSeleccionado(estudiante.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          estudianteSeleccionado === estudiante.id
                            ? 'bg-purple-600 shadow-lg shadow-purple-600/50'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {/* Avatar */}
                        <StudentAvatar
                          nombre={estudiante.nombre}
                          apellido={estudiante.apellido}
                          avatar_url={estudiante.avatar_url}
                          size="md"
                          className="border-2 border-purple-400/50"
                        />

                        <div className="flex-1 text-left">
                          <p className="text-white font-bold">
                            {estudiante.nombre} {estudiante.apellido}
                          </p>
                          {estudiante.equipo && (
                            <p className="text-xs text-gray-400">
                              Equipo: {estudiante.equipo.nombre}
                            </p>
                          )}
                        </div>

                        {estudianteSeleccionado === estudiante.id && (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campo de observación */}
                <div>
                  <label className="block text-white font-bold mb-3">
                    Observación
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder={
                      tipoObservacion === 'positiva'
                        ? 'Ej: Excelente participación en clase, demostró gran interés...'
                        : tipoObservacion === 'atencion'
                          ? 'Ej: Necesita reforzar conceptos básicos, mostró dificultad...'
                          : 'Ej: Avance regular, completó las actividades...'
                    }
                    rows={5}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    {observaciones.length} caracteres
                  </p>
                </div>

                {/* Preview */}
                {estudianteSelected && observaciones && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm font-bold mb-2">
                      Vista Previa:
                    </p>
                    <div className="flex items-start gap-3">
                      <StudentAvatar
                        nombre={estudianteSelected.nombre}
                        apellido={estudianteSelected.apellido}
                        avatar_url={estudianteSelected.avatar_url}
                        size="md"
                        className="border-2 border-purple-400/50"
                      />
                      <div className="flex-1">
                        <p className="text-white font-bold">
                          {estudianteSelected.nombre}{' '}
                          {estudianteSelected.apellido}
                        </p>
                        <p className="text-gray-300 text-sm mt-1">
                          {observaciones}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getTipoIcon(tipoObservacion)}
                          <span className="text-xs text-gray-400 capitalize">
                            {tipoObservacion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-800/50 border-t border-white/10 p-4 flex items-center justify-between">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !estudianteSeleccionado ||
                    !observaciones.trim()
                  }
                  className={`px-8 py-3 bg-gradient-to-r ${getTipoColor(tipoObservacion)} hover:opacity-90 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-lg flex items-center gap-2`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      GUARDAR OBSERVACIÓN
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
