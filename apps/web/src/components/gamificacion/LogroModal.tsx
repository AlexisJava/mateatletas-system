'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Logro } from '@/types/gamificacion';
import { getColorRareza } from '@/lib/utils/gamificacion.utils';
import { X } from 'lucide-react';

interface LogroModalProps {
  logro: Logro;
  desbloqueado: boolean;
  fecha_desbloqueo?: Date | string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LogroModal({
  logro,
  desbloqueado,
  fecha_desbloqueo,
  isOpen,
  onClose,
}: LogroModalProps) {
  const rareza = (logro.rareza ?? 'comun') as 'comun' | 'raro' | 'epico' | 'legendario';
  const colores = getColorRareza(rareza);
  const monedas = logro.monedas_recompensa ?? 0;
  const xp = logro.xp_recompensa ?? 0;
  const esSecreto = Boolean(logro.secreto);
  const fecha = fecha_desbloqueo ? new Date(fecha_desbloqueo) : null;

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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="relative bg-gray-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Header con gradiente */}
              <div
                className={`relative p-6 bg-gradient-to-br ${colores.gradient} ${
                  !desbloqueado && 'opacity-50 grayscale'
                }`}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <motion.div
                    className="text-8xl mb-4"
                    animate={
                      desbloqueado
                        ? {
                            rotate: [0, -15, 15, -15, 0],
                            scale: [1, 1.1, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    {desbloqueado ? logro.icono : '🔒'}
                  </motion.div>

                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                    <span className="text-white font-bold uppercase text-sm">
                      {rareza}
                    </span>
                  </div>

                  <h2 className="text-white font-black text-3xl mb-2">
                    {esSecreto && !desbloqueado ? '???' : logro.nombre}
                  </h2>

                  {logro.titulo && desbloqueado && (
                    <p className="text-yellow-300 font-semibold text-lg">
                      🏅 Título: {logro.titulo}
                    </p>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Descripción */}
                <div>
                  <h3 className="text-white font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-300">
                    {esSecreto && !desbloqueado
                      ? 'Este es un logro secreto. ¡Sigue jugando para descubrirlo!'
                      : logro.descripcion}
                  </p>
                </div>

                {/* Recompensas */}
                {desbloqueado && (monedas > 0 || xp > 0) && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">Recompensas</h3>
                    <div className="flex gap-3">
                      {monedas > 0 && (
                        <div className="flex-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-center">
                          <div className="text-3xl mb-1">💰</div>
                          <p className="text-white font-bold text-xl">
                            +{monedas}
                          </p>
                          <p className="text-white/80 text-sm">Monedas</p>
                        </div>
                      )}
                      {xp > 0 && (
                        <div className="flex-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl p-4 text-center">
                          <div className="text-3xl mb-1">⚡</div>
                          <p className="text-white font-bold text-xl">
                            +{xp}
                          </p>
                          <p className="text-white/80 text-sm">XP</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Extras */}
                {logro.extras && Object.keys(logro.extras).length > 0 && desbloqueado && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">Extras</h3>
                    <ul className="space-y-2">
                      {Object.entries(logro.extras).map(([key, value], index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-gray-300"
                        >
                          <span className="text-green-400 mt-1">✓</span>
                          <span>
                            <strong>{key}:</strong> {JSON.stringify(value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fecha desbloqueo */}
                {desbloqueado && fecha && (
                  <div className="text-center pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm">
                      Desbloqueado el{' '}
                      {fecha.toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
