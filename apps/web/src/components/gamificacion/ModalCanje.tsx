'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Sparkles, DollarSign, Coins } from 'lucide-react';
import { CursoCatalogo } from './CursoCard';

interface ModalCanjeProps {
  isOpen: boolean;
  onClose: () => void;
  curso: CursoCatalogo | null;
  nivelActual: number;
  monedasActuales: number;
  onConfirmar: () => void;
  loading?: boolean;
}

/**
 * ModalCanje - Modal de confirmación para canjear un curso
 *
 * Features:
 * - Full-screen backdrop con blur
 * - Animaciones de entrada/salida con Framer Motion
 * - Información detallada del curso
 * - Advertencias si faltan requisitos
 * - Resumen de costo en monedas + USD
 * - Explicación del sistema de 3 pagos
 * - Botones de acción (Cancelar / Confirmar)
 * - Estado de loading durante la solicitud
 */
export function ModalCanje({
  isOpen,
  onClose,
  curso,
  nivelActual,
  monedasActuales,
  onConfirmar,
  loading = false,
}: ModalCanjeProps) {
  if (!curso) return null;

  const cumpleNivel = nivelActual >= curso.nivel_requerido;
  const cumpleMonedas = monedasActuales >= curso.precio_monedas;
  const puedeConfirmar = cumpleNivel && cumpleMonedas && !loading;

  const getCategoriaEmoji = (categoria: string): string => {
    const emojis: Record<string, string> = {
      ciencia: '🔬',
      programacion: '💻',
      robotica: '🤖',
      matematicas: '📐',
      diseno: '🎨',
      arte: '🖌️',
    };
    return emojis[categoria] || '📚';
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{getCategoriaEmoji(curso.categoria)}</div>
                  <div>
                    <h2 className="text-white font-black text-3xl mb-1">{curso.titulo}</h2>
                    <p className="text-gray-400 text-sm">
                      {curso.categoria.charAt(0).toUpperCase() + curso.categoria.slice(1)} •{' '}
                      {curso.duracion_clases} clases
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Descripción */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                <p className="text-gray-300 leading-relaxed">{curso.descripcion}</p>
              </div>

              {/* Requisitos */}
              <div className="space-y-3 mb-6">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    cumpleNivel
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <div className="text-2xl">{cumpleNivel ? '✅' : '❌'}</div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">
                      Nivel Requerido: {curso.nivel_requerido}
                    </p>
                    <p className={`text-sm ${cumpleNivel ? 'text-green-400' : 'text-red-400'}`}>
                      Tu nivel actual: {nivelActual}
                      {!cumpleNivel &&
                        ` (Te faltan ${curso.nivel_requerido - nivelActual} niveles)`}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    cumpleMonedas
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <div className="text-2xl">{cumpleMonedas ? '✅' : '❌'}</div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">
                      Monedas Requeridas: {curso.precio_monedas.toLocaleString('es-AR')}
                    </p>
                    <p className={`text-sm ${cumpleMonedas ? 'text-green-400' : 'text-red-400'}`}>
                      Tus monedas: {monedasActuales.toLocaleString('es-AR')}
                      {!cumpleMonedas &&
                        ` (Te faltan ${(curso.precio_monedas - monedasActuales).toLocaleString('es-AR')})`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sistema de pago */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 mb-6 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-bold text-lg">Sistema de Pago Flexible</h3>
                </div>

                <p className="text-gray-300 text-sm mb-4">
                  Cuando solicites este curso, tu tutor/padre podrá elegir entre 3 opciones:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Padre paga todo (${curso.precio_usd} USD)
                      </p>
                      <p className="text-gray-400 text-xs">
                        No gastas monedas, tu padre/madre paga el 100% en USD
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Mitad y mitad ({(curso.precio_monedas / 2).toLocaleString('es-AR')} monedas
                        + ${curso.precio_usd / 2} USD)
                      </p>
                      <p className="text-gray-400 text-xs">
                        Gastas el 50% en monedas, tu padre/madre paga el 50% en USD
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg">
                    <Coins className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Hijo paga todo ({curso.precio_monedas.toLocaleString('es-AR')} monedas)
                      </p>
                      <p className="text-gray-400 text-xs">
                        Gastas el 100% en monedas, tu padre/madre no paga nada
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-xs">
                      <strong>Importante:</strong> Al confirmar, enviarás una solicitud de canje a
                      tu tutor/padre. Ellos decidirán la opción de pago y aprobarán o rechazarán la
                      solicitud. ¡No gastas monedas hasta que sea aprobado!
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirmar}
                  disabled={!puedeConfirmar}
                  className={`flex-1 font-bold py-4 rounded-xl transition-all ${
                    puedeConfirmar
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Enviando solicitud...
                    </span>
                  ) : (
                    '¡Solicitar Canje!'
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
