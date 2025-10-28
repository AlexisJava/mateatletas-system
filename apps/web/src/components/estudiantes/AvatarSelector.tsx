'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { AVATAR_GRADIENTS, getInitials } from '@/lib/avatar-gradients';

/**
 * Avatar Selector Component - Sistema de Gradientes
 *
 * Elegante y minimalista con gradientes modernos tipo Linear/Vercel.
 */

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentGradientId: number;
  onSelect: (gradientId: number) => Promise<void>;
  nombre: string;
  apellido: string;
}

export default function AvatarSelector({
  isOpen,
  onClose,
  currentGradientId,
  onSelect,
  nombre,
  apellido,
}: AvatarSelectorProps) {
  const [previewGradientId, setPreviewGradientId] = useState(currentGradientId);
  const [isSelecting, setIsSelecting] = useState(false);

  const initials = getInitials(nombre, apellido);
  const previewGradient = AVATAR_GRADIENTS.find(g => g.id === previewGradientId) || AVATAR_GRADIENTS[0];

  const handleSelect = async (gradientId: number) => {
    setIsSelecting(true);
    try {
      await onSelect(gradientId);
      onClose();
    } catch (error) {
      console.error('Error al seleccionar avatar:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSurprise = () => {
    const randomId = Math.floor(Math.random() * AVATAR_GRADIENTS.length);
    setPreviewGradientId(randomId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Elegí tu avatar
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Seleccioná un color que te represente
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 sm:p-8">

              {/* Left Panel - Preview grande */}
              <div className="lg:col-span-2 space-y-4">
                {/* Preview Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                  <motion.div
                    key={previewGradientId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
                    style={{
                      background: previewGradient.gradient,
                      color: previewGradient.textColor,
                    }}
                  >
                    <div className="text-6xl font-bold">
                      {initials}
                    </div>
                  </motion.div>
                </div>

                {/* Botón Sorpréndeme */}
                <motion.button
                  onClick={handleSurprise}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Sparkles className="w-5 h-5" />
                  Sorpréndeme
                </motion.button>

                {/* Nombre del gradiente */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">Estilo actual</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {previewGradient.name}
                  </p>
                </div>
              </div>

              {/* Right Panel - Grid de gradientes */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_GRADIENTS.map((gradient) => {
                    const isSelected = gradient.id === previewGradientId;
                    const isCurrent = gradient.id === currentGradientId;

                    return (
                      <motion.button
                        key={gradient.id}
                        onClick={() => setPreviewGradientId(gradient.id)}
                        onHoverStart={() => setPreviewGradientId(gradient.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`
                          relative p-3 rounded-xl border-2 transition-all
                          ${isSelected
                            ? 'border-blue-500 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {/* Badge "Actual" */}
                        {isCurrent && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                            Actual
                          </div>
                        )}

                        {/* Avatar Preview */}
                        <div
                          className="w-full aspect-square rounded-lg shadow-sm flex items-center justify-center font-bold text-xl mb-2"
                          style={{
                            background: gradient.gradient,
                            color: gradient.textColor,
                          }}
                        >
                          {initials}
                        </div>

                        {/* Nombre */}
                        <p className="text-xs font-medium text-gray-700 text-center">
                          {gradient.name}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Botones de acción */}
          <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSelecting}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <motion.button
              onClick={() => handleSelect(previewGradientId)}
              disabled={isSelecting || previewGradientId === currentGradientId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSelecting ? 'Guardando...' : 'Guardar'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
