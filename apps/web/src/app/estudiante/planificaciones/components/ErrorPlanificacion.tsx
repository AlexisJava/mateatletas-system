/**
 * Error state para planificaciones
 */

'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { BackButton } from './BackButton';

export interface ErrorPlanificacionProps {
  /**
   * Mensaje de error
   */
  error: Error;

  /**
   * Código que se intentó cargar
   */
  codigo: string;

  /**
   * Callback para reintentar
   */
  onRetry?: () => void;
}

export function ErrorPlanificacion({ error, codigo, onRetry }: ErrorPlanificacionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center p-8">
      <BackButton />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/50"
      >
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-white text-3xl font-black text-center mb-4">
          No pudimos cargar esta aventura
        </h1>

        {/* Mensaje de error */}
        <div className="bg-black/30 rounded-2xl p-4 mb-6 border border-red-500/30">
          <p className="text-red-300 text-sm font-mono">{error.message}</p>
          <p className="text-white/50 text-xs mt-2">
            Código: <code className="bg-white/10 px-2 py-1 rounded">{codigo}</code>
          </p>
        </div>

        {/* Sugerencias */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6">
          <p className="text-white text-sm font-bold mb-2">Posibles soluciones:</p>
          <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
            <li>Verifica que el código de la planificación sea correcto</li>
            <li>Intenta recargar la página</li>
            <li>Si el problema persiste, contacta con soporte</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          {onRetry && (
            <motion.button
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl transition-colors"
            >
              Reintentar
            </motion.button>
          )}
          <motion.button
            onClick={() => (window.location.href = '/estudiante/gimnasio')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl transition-colors"
          >
            Volver al Gimnasio
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
