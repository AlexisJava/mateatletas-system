'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import type { FeedItem } from '@/lib/api/estudiantes.api';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Emojis disponibles para felicitaciones
 * 👏 APLAUSOS - Felicitación general
 * 🔥 FUEGO - Muy impresionante
 * 💪 FUERZA - Buen esfuerzo
 * 🚀 COHETE - Excelente logro
 */
const EMOJIS_FELICITACION = [
  { emoji: '👏', label: 'Aplausos' },
  { emoji: '🔥', label: 'Fuego' },
  { emoji: '💪', label: 'Fuerza' },
  { emoji: '🚀', label: 'Cohete' },
];

/**
 * Genera un mensaje amigable según el tipo de actividad
 */
function getMensajeLogro(actividad: FeedItem): string {
  const metadata = actividad.metadata as Record<string, unknown>;

  switch (actividad.tipo) {
    case 'NIVEL_SUBIDO': {
      const nivel = metadata?.nivelNuevo ?? '?';
      return `🎮 ¡Subió al Nivel ${nivel}!`;
    }
    case 'RACHA_EXTENDIDA': {
      const dias = metadata?.rachaActual ?? '?';
      return `🔥 ¡Racha de ${dias} días!`;
    }
    case 'LOGRO_DESBLOQUEADO': {
      const nombre = metadata?.logroNombre ?? 'un logro';
      return `🏆 ¡Desbloqueó: ${nombre}!`;
    }
    case 'TAREA_COMPLETADA':
      return '✅ ¡Completó una tarea!';
    case 'TAREA_PERFECTA':
      return '💯 ¡Tarea perfecta!';
    case 'CLASE_COMPLETADA':
      return '📚 ¡Completó una clase!';
    case 'LECCION_COMPLETADA':
      return '📖 ¡Terminó una lección!';
    case 'PLANIFICACION_COMPLETADA':
      return '🎯 ¡Completó toda la planificación!';
    default:
      return actividad.mensaje;
  }
}

/**
 * Lanza confeti con los colores de Mateatletas
 */
function lanzarConfeti() {
  // Confeti desde el centro
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6, x: 0.5 },
    colors: ['#10B981', '#FBBF24', '#FFFFFF', '#06B6D4', '#8B5CF6'],
  });
}

interface ModalFelicitacionProps {
  actividad: FeedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReaction: (actividadId: string, emoji: string) => Promise<void>;
  reaccionesRestantes: number;
}

export function ModalFelicitacion({
  actividad,
  isOpen,
  onClose,
  onReaction,
  reaccionesRestantes,
}: ModalFelicitacionProps) {
  const { user } = useAuthStore();
  const [loadingEmoji, setLoadingEmoji] = useState<string | null>(null);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Limpiar error al abrir modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Click fuera para cerrar
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!actividad || loadingEmoji) return;

    // Verificar si ya no tiene reacciones disponibles
    if (reaccionesRestantes <= 0 && !userHasReacted(emoji)) {
      setError('Ya usaste tus 5 felicitaciones de hoy');
      return;
    }

    setLoadingEmoji(emoji);
    setAnimatingEmoji(emoji);
    setError(null);

    try {
      const wasReacted = userHasReacted(emoji);
      await onReaction(actividad.id, emoji);

      // Si es una nueva reacción (no quitar), lanzar confeti
      if (!wasReacted) {
        lanzarConfeti();
      }
    } catch (err) {
      // Manejar error 429 (límite alcanzado)
      if (err instanceof Error && err.message.includes('429')) {
        setError('Ya usaste tus 5 felicitaciones de hoy');
      } else {
        setError('Error al enviar felicitación');
      }
    } finally {
      setLoadingEmoji(null);
      setTimeout(() => setAnimatingEmoji(null), 300);
    }
  };

  const userHasReacted = (emoji: string): boolean => {
    if (!actividad || !user?.id) return false;
    const reaction = actividad.reacciones.find((r) => r.emoji === emoji);
    return reaction?.estudiantesIds.includes(user.id) ?? false;
  };

  const getReactionCount = (emoji: string): number => {
    if (!actividad) return 0;
    const reaction = actividad.reacciones.find((r) => r.emoji === emoji);
    return reaction?.count ?? 0;
  };

  if (!actividad) return null;

  const mensajeLogro = getMensajeLogro(actividad);
  const sinReacciones = reaccionesRestantes <= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Efecto de glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Header con botón cerrar */}
            <div className="relative flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold">Felicitar</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Contenido */}
            <div className="relative p-6 space-y-6">
              {/* Info del estudiante y logro */}
              <div className="text-center space-y-4">
                {/* Avatar grande centrado */}
                <div
                  className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                  }}
                >
                  {actividad.estudiante.nombre.charAt(0).toUpperCase()}
                </div>

                {/* Nombre */}
                <p className="text-white font-bold text-xl">
                  {actividad.estudiante.nombre} {actividad.estudiante.apellido}
                </p>

                {/* Mensaje del logro destacado */}
                <div className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10">
                  <p className="text-white font-semibold text-lg">{mensajeLogro}</p>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-white/10" />

              {/* Botones de emojis */}
              <div className="space-y-3">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider text-center">
                  ¡Felicitalo!
                </p>

                <div className="grid grid-cols-4 gap-3">
                  {EMOJIS_FELICITACION.map(({ emoji, label }) => {
                    const hasReacted = userHasReacted(emoji);
                    const count = getReactionCount(emoji);
                    const isLoading = loadingEmoji === emoji;
                    const isAnimating = animatingEmoji === emoji;
                    const isDisabled = sinReacciones && !hasReacted;

                    return (
                      <motion.button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        disabled={isLoading || isDisabled}
                        whileTap={{ scale: 0.9 }}
                        animate={
                          isAnimating
                            ? {
                                scale: [1, 1.2, 1],
                                transition: { duration: 0.3 },
                              }
                            : {}
                        }
                        className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                          hasReacted
                            ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                            : isDisabled
                              ? 'bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'
                              : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                        ) : (
                          <span className="text-3xl">{emoji}</span>
                        )}
                        <span className="text-white/60 text-[10px] font-medium">{label}</span>
                        {count > 0 && (
                          <span
                            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              hasReacted ? 'bg-cyan-500 text-white' : 'bg-white/20 text-white/80'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-2 px-3 rounded-lg bg-red-500/20 border border-red-500/30"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Contador de reacciones restantes */}
              <div className="text-center space-y-1">
                <p
                  className={`text-sm font-medium ${sinReacciones ? 'text-orange-400' : 'text-white/60'}`}
                >
                  {sinReacciones
                    ? 'Sin felicitaciones disponibles hoy'
                    : `Te quedan ${reaccionesRestantes} felicitaciones hoy`}
                </p>

                {/* Total de reacciones recibidas */}
                {actividad.totalReacciones > 0 && (
                  <p className="text-white/40 text-xs">
                    Ya reaccionaron: {actividad.totalReacciones}{' '}
                    {actividad.totalReacciones === 1 ? 'compañero' : 'compañeros'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ModalFelicitacion;
