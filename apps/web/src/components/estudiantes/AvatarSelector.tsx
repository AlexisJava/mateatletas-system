'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

/**
 * Avatar Selector Component
 *
 * Permite al estudiante elegir su avatar de entre varios estilos de Dicebear API.
 * Estilos disponibles: avataaars, adventurer, personas, lorelei, bottts, micah
 *
 * Props:
 * - isOpen: boolean - Controla si el modal está abierto
 * - onClose: () => void - Callback al cerrar el modal
 * - currentAvatar: string - Avatar actual del estudiante
 * - onSelect: (avatarStyle: string) => void - Callback al seleccionar un avatar
 * - studentId: string - ID del estudiante para generar el seed único
 */

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelect: (avatarStyle: string) => Promise<void>;
  studentId: string;
}

const avatarStyles = [
  { id: 'avataaars', name: 'Avataaars', description: 'Estilo cartoon clásico' },
  { id: 'adventurer', name: 'Aventurero', description: 'Personajes aventureros' },
  { id: 'personas', name: 'Personas', description: 'Estilo moderno y limpio' },
  { id: 'lorelei', name: 'Lorelei', description: 'Ilustración artística' },
  { id: 'bottts', name: 'Robots', description: 'Robots futuristas' },
  { id: 'micah', name: 'Micah', description: 'Estilo minimalista' },
  { id: 'pixel-art', name: 'Pixel Art', description: '8-bit retro' },
  { id: 'initials', name: 'Iniciales', description: 'Tus iniciales' },
];

export function AvatarSelector({
  isOpen,
  onClose,
  currentAvatar,
  onSelect,
  studentId,
}: AvatarSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState(currentAvatar || 'avataaars');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async () => {
    setIsLoading(true);
    try {
      await onSelect(selectedStyle);
      onClose();
    } catch (error) {
      console.error('Error al seleccionar avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                borderRadius: '24px',
                border: '6px solid #000',
                boxShadow: '12px 12px 0 0 rgba(0, 0, 0, 1)',
              }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 px-8 py-6 border-b-4 border-black bg-gradient-to-r from-cyan-500 to-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className="text-3xl font-bold text-white"
                      style={{ textShadow: '3px 3px 0 #000' }}
                    >
                      ELEGÍ TU AVATAR
                    </h2>
                    <p
                      className="text-white/90 font-semibold mt-1"
                      style={{ textShadow: '1px 1px 0 #000' }}
                    >
                      Personalizá tu perfil con un avatar único
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    style={{
                      border: '3px solid #000',
                      boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                    }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {avatarStyles.map((style) => {
                    const isSelected = selectedStyle === style.id;

                    return (
                      <motion.button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                        style={{
                          background: isSelected ? '#FFD700' : '#fff',
                          borderRadius: '16px',
                          border: '4px solid #000',
                          boxShadow: isSelected
                            ? '6px 6px 0 0 rgba(0, 0, 0, 1)'
                            : '4px 4px 0 0 rgba(0, 0, 0, 1)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Check Badge */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                            style={{
                              border: '3px solid #000',
                              boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 1)',
                            }}
                          >
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          </motion.div>
                        )}

                        {/* Avatar Preview */}
                        <div className="p-4">
                          <div
                            className="w-full aspect-square rounded-xl overflow-hidden mb-3"
                            style={{
                              border: '3px solid #000',
                              background: '#f0f0f0',
                            }}
                          >
                            <img
                              src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${studentId}`}
                              alt={style.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Style Name */}
                          <h3
                            className="text-base font-bold text-black mb-1"
                            style={{ textShadow: isSelected ? '1px 1px 0 rgba(0,0,0,0.1)' : 'none' }}
                          >
                            {style.name}
                          </h3>
                          <p className="text-xs text-black/70 font-semibold">
                            {style.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 px-8 py-6 border-t-4 border-black bg-gradient-to-r from-cyan-500 to-blue-500">
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 px-6 text-lg font-bold text-white rounded-xl transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '4px solid #000',
                      boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 1)',
                      textShadow: '2px 2px 0 #000',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSelect}
                    disabled={isLoading || selectedStyle === currentAvatar}
                    className="flex-1 py-4 px-6 text-lg font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: '4px solid #000',
                      boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 1)',
                      textShadow: '2px 2px 0 #000',
                    }}
                  >
                    {isLoading ? 'GUARDANDO...' : '¡CONFIRMAR!'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
