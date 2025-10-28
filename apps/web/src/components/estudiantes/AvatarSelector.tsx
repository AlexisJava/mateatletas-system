'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, User, Bot, Gamepad2, Palette } from 'lucide-react';

/**
 * Avatar Selector Component - Apple-inspired UX
 *
 * Elegante, minimalista y con microinteracciones sutiles.
 * Cada animación tiene un propósito claro.
 */

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelect: (_avatarStyle: string) => Promise<void>;
  studentId: string;
}

// Categorías organizadas con iconos
const categories = [
  {
    id: 'personas',
    name: 'Personas',
    icon: User,
    styles: [
      { id: 'avataaars', name: 'Avataaars', description: 'Clásico' },
      { id: 'adventurer', name: 'Aventurero', description: 'Moderno' },
      { id: 'personas', name: 'Personas', description: 'Elegante' },
      { id: 'micah', name: 'Micah', description: 'Minimal' },
    ],
  },
  {
    id: 'robots',
    name: 'Robots',
    icon: Bot,
    styles: [
      { id: 'bottts', name: 'Bottts', description: 'Futurista' },
      { id: 'bottts-neutral', name: 'Neutral', description: 'Limpio' },
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: Gamepad2,
    styles: [
      { id: 'pixel-art', name: 'Pixel Art', description: '8-bit' },
      { id: 'pixel-art-neutral', name: 'Retro', description: 'Arcade' },
    ],
  },
  {
    id: 'artistico',
    name: 'Artístico',
    icon: Palette,
    styles: [
      { id: 'lorelei', name: 'Lorelei', description: 'Ilustrado' },
      { id: 'initials', name: 'Iniciales', description: 'Minimalista' },
    ],
  },
];

// Helper: Extraer el estilo del avatar desde URL o usar directamente
const extractAvatarStyle = (avatar: string): string => {
  if (!avatar) return 'avataaars';

  // Si es una URL completa, extraer el estilo
  if (avatar.includes('dicebear.com')) {
    const match = avatar.match(/\/7\.x\/([^/]+)\//);
    return match ? match[1] : 'avataaars';
  }

  // Si ya es solo el estilo, devolverlo
  return avatar;
};

export function AvatarSelector({
  isOpen,
  onClose,
  currentAvatar,
  onSelect,
  studentId,
}: AvatarSelectorProps) {
  const initialStyle = extractAvatarStyle(currentAvatar);
  const [selectedCategory, setSelectedCategory] = useState('personas');
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [previewStyle, setPreviewStyle] = useState(initialStyle);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const style = extractAvatarStyle(currentAvatar);
      setSelectedStyle(style);
      setPreviewStyle(style);
      // Detectar categoría inicial
      for (const cat of categories) {
        if (cat.styles.some((s) => s.id === style)) {
          setSelectedCategory(cat.id);
          break;
        }
      }
    }
  }, [isOpen, currentAvatar]);

  const handleSelect = async () => {
    if (selectedStyle === currentAvatar) return;

    setIsLoading(true);
    try {
      await onSelect(selectedStyle);
      onClose();
    } catch (error: unknown) {
      console.error('Error al seleccionar avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomize = () => {
    const allStyles = categories.flatMap((cat) => cat.styles);
    const randomStyle = allStyles[Math.floor(Math.random() * allStyles.length)];
    setSelectedStyle(randomStyle.id);
    setPreviewStyle(randomStyle.id);

    // Encontrar y cambiar a la categoría correcta
    for (const cat of categories) {
      if (cat.styles.some((s) => s.id === randomStyle.id)) {
        setSelectedCategory(cat.id);
        break;
      }
    }
  };

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);
  const hasChanged = selectedStyle !== extractAvatarStyle(currentAvatar);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - Sutil y elegante */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal - Minimalista, tipo Apple */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} // Ease out expo
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

              {/* Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Elegí tu avatar
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Personalizá tu perfil
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
                        key={previewStyle}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-lg"
                      >
                        <Image
                          src={`https://api.dicebear.com/7.x/${previewStyle}/svg?seed=${studentId}`}
                          alt="Preview"
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover"
                          priority
                        />
                      </motion.div>
                    </div>

                    {/* Botón Sorpréndeme */}
                    <button
                      onClick={handleRandomize}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Sorpréndeme
                    </button>
                  </div>

                  {/* Right Panel - Categorías y Grid */}
                  <div className="lg:col-span-3 space-y-6">

                    {/* Tabs de Categorías */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.id;

                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`
                              relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all
                              ${isActive
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            <Icon className="w-4 h-4" />
                            {category.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Grid de Avatares */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                      >
                        {currentCategory?.styles.map((style) => {
                          const isSelected = selectedStyle === style.id;
                          const isCurrent = currentAvatar === style.id;

                          return (
                            <motion.button
                              key={style.id}
                              onClick={() => {
                                setSelectedStyle(style.id);
                                setPreviewStyle(style.id);
                              }}
                              onHoverStart={() => setPreviewStyle(style.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`
                                relative p-4 rounded-xl border-2 transition-all
                                ${isSelected
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }
                              `}
                            >
                              {/* Badge "Actual" */}
                              {isCurrent && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                  Actual
                                </div>
                              )}

                              {/* Avatar Thumbnail */}
                              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
                                <Image
                                  src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${studentId}`}
                                  alt={style.name}
                                  fill
                                  sizes="(max-width: 640px) 50vw, 20vw"
                                  className="object-cover"
                                />
                              </div>

                              {/* Info */}
                              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                                {style.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {style.description}
                              </p>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 sm:px-8 py-5 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSelect}
                  disabled={isLoading || !hasChanged}
                  className={`
                    flex-1 py-2.5 px-6 font-semibold rounded-xl transition-all
                    ${hasChanged && !isLoading
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isLoading ? 'Guardando...' : hasChanged ? 'Guardar cambios' : 'Sin cambios'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
