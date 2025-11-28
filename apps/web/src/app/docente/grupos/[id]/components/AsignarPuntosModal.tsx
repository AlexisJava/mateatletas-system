'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, CheckCircle, Loader2, Sparkles, Award } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { StudentAvatar } from '@/components/ui/StudentAvatar';
import { gamificacionApi, type AccionPuntuable } from '@/lib/api/gamificacion.api';
import type { EstudianteConStatsDto } from '@/lib/api/clase-grupos.api';
import { isAxiosError } from 'axios';

interface AsignarPuntosModalProps {
  isOpen: boolean;
  onClose: () => void;
  claseGrupoId: string;
  estudiantes: EstudianteConStatsDto[];
  onSuccess: () => void;
}

export default function AsignarPuntosModal({
  isOpen,
  onClose,
  claseGrupoId,
  estudiantes,
  onSuccess,
}: AsignarPuntosModalProps) {
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<string | null>(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState<string | null>(null);
  const [acciones, setAcciones] = useState<AccionPuntuable[]>([]);
  const [contexto, setContexto] = useState('');
  const [isLoadingAcciones, setIsLoadingAcciones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar acciones puntuables al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadAcciones();
    }
  }, [isOpen]);

  const loadAcciones = async () => {
    try {
      setIsLoadingAcciones(true);
      const data = await gamificacionApi.getAcciones();
      setAcciones(data);
    } catch (error) {
      console.error('Error al cargar acciones:', error);
      toast.error('Error al cargar acciones puntuables');
    } finally {
      setIsLoadingAcciones(false);
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!estudianteSeleccionado) {
      toast.error('Debes seleccionar un estudiante');
      return;
    }

    if (!accionSeleccionada) {
      toast.error('Debes seleccionar una acción');
      return;
    }

    try {
      setIsSubmitting(true);

      await gamificacionApi.otorgarPuntos({
        estudianteId: estudianteSeleccionado,
        accionId: accionSeleccionada,
        claseId: claseGrupoId,
        contexto: contexto.trim() || undefined,
      });

      const accion = acciones.find((a) => a.id === accionSeleccionada);
      toast.success(`✅ ${accion?.puntos || 0} puntos asignados exitosamente`);

      // Reset form
      setEstudianteSeleccionado(null);
      setAccionSeleccionada(null);
      setContexto('');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al asignar puntos:', error);
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'Error al asignar puntos. Intenta nuevamente.',
        );
      } else {
        toast.error('Error al asignar puntos. Intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const estudianteSelected = estudiantes.find((e) => e.id === estudianteSeleccionado);
  const accionSelected = acciones.find((a) => a.id === accionSeleccionada);

  const getAccionIcon = (codigo: string | undefined) => {
    if (!codigo) return <Award className="w-5 h-5" />;

    const codigoLower = codigo.toLowerCase();
    if (codigoLower.includes('participacion') || codigoLower.includes('respuesta')) {
      return <Sparkles className="w-5 h-5" />;
    }
    if (codigoLower.includes('tarea') || codigoLower.includes('ejercicio')) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (codigoLower.includes('logro') || codigoLower.includes('excelente')) {
      return <Trophy className="w-5 h-5" />;
    }
    return <Award className="w-5 h-5" />;
  };

  const getAccionColor = (_puntos: number) => {
    // TODO: usar puntos para determinar color dinámicamente
    if (_puntos >= 100) return 'from-yellow-600 to-orange-600';
    if (_puntos >= 50) return 'from-purple-600 to-pink-600';
    if (_puntos >= 25) return 'from-blue-600 to-cyan-600';
    return 'from-green-600 to-emerald-600';
  };
  // Marcar como usado para evitar error TS6133
  void getAccionColor;

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
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">ASIGNAR PUNTOS</h2>
                    <p className="text-yellow-100 font-semibold">
                      Recompensar logros y participación
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
                {/* Selección de estudiante */}
                <div>
                  <label className="block text-white font-bold mb-3">Seleccionar Estudiante</label>
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-white/5 rounded-xl p-3 border border-white/10">
                    {estudiantes.map((estudiante) => (
                      <button
                        key={estudiante.id}
                        onClick={() => setEstudianteSeleccionado(estudiante.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          estudianteSeleccionado === estudiante.id
                            ? 'bg-yellow-600 shadow-lg shadow-yellow-600/50'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {/* Avatar */}
                        <StudentAvatar
                          nombre={estudiante.nombre}
                          apellido={estudiante.apellido}
                          avatar_url={estudiante.avatar_url}
                          size="md"
                          className="border-2 border-yellow-400/50"
                        />

                        <div className="flex-1 text-left">
                          <p className="text-white font-bold">
                            {estudiante.nombre} {estudiante.apellido}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-yellow-400 font-bold">
                              {estudiante.stats?.puntosTotal || 0} puntos
                            </span>
                          </div>
                        </div>

                        {estudianteSeleccionado === estudiante.id && (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selección de acción */}
                <div>
                  <label className="block text-white font-bold mb-3">
                    Seleccionar Acción Puntuable
                  </label>
                  {isLoadingAcciones ? (
                    <div className="bg-white/5 rounded-xl p-8 flex items-center justify-center border border-white/10">
                      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2 bg-white/5 rounded-xl p-3 border border-white/10">
                      {acciones.map((accion) => (
                        <button
                          key={accion.id}
                          onClick={() => setAccionSeleccionada(accion.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            accionSeleccionada === accion.id
                              ? 'bg-yellow-600 shadow-lg shadow-yellow-600/50'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getAccionIcon(accion.codigo)}
                          </div>

                          <div className="flex-1 text-left">
                            <p className="text-white font-bold">{accion.nombre}</p>
                            <p className="text-xs text-gray-400">{accion.descripcion}</p>
                          </div>

                          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-300" />
                            <span className="text-white font-black">+{accion.puntos}</span>
                          </div>

                          {accionSeleccionada === accion.id && (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campo de contexto opcional */}
                <div>
                  <label className="block text-white font-bold mb-3">Contexto (opcional)</label>
                  <textarea
                    value={contexto}
                    onChange={(e) => setContexto(e.target.value)}
                    placeholder="Ej: Excelente resolución del problema de geometría, demostró gran creatividad..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Agrega una nota sobre por qué se asignan estos puntos
                  </p>
                </div>

                {/* Preview */}
                {estudianteSelected && accionSelected && (
                  <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 rounded-xl p-4">
                    <p className="text-yellow-400 text-sm font-bold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Vista Previa
                    </p>
                    <div className="flex items-start gap-3">
                      <StudentAvatar
                        nombre={estudianteSelected.nombre}
                        apellido={estudianteSelected.apellido}
                        avatar_url={estudianteSelected.avatar_url}
                        size="lg"
                        className="border-2 border-yellow-400/50"
                      />
                      <div className="flex-1">
                        <p className="text-white font-bold">
                          {estudianteSelected.nombre} {estudianteSelected.apellido}
                        </p>
                        <p className="text-yellow-300 font-bold mt-1">
                          +{accionSelected.puntos} puntos por "{accionSelected.nombre}"
                        </p>
                        {contexto && <p className="text-gray-300 text-sm mt-2">{contexto}</p>}
                        <div className="flex items-center gap-2 mt-3 bg-white/10 rounded-lg px-3 py-2 w-fit">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-black">
                            Nuevo total:{' '}
                            {(estudianteSelected.stats?.puntosTotal || 0) + accionSelected.puntos}{' '}
                            puntos
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
                    !accionSeleccionada ||
                    isLoadingAcciones
                  }
                  className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5" />
                      ASIGNAR PUNTOS
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
