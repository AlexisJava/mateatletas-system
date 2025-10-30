'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Check, Play, Sparkles } from 'lucide-react'
import { AnimatedAvatar3D } from '@/components/3d/AnimatedAvatar3D'
import { useStudentAnimations } from '@/hooks/useStudentAnimations'
import { useOverlayStack } from '../contexts/OverlayStackProvider'

interface AnimacionesViewProps {
  estudiante: {
    id: string
    nombre: string
    puntos_totales: number
    avatar_url?: string | null
  }
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  idle: { label: 'Espera', emoji: '🧍', color: 'from-blue-500 to-cyan-500' },
  dance: { label: 'Bailes', emoji: '💃', color: 'from-pink-500 to-rose-500' },
  expression: { label: 'Expresiones', emoji: '😊', color: 'from-purple-500 to-violet-500' },
  locomotion: { label: 'Movimiento', emoji: '🏃', color: 'from-orange-500 to-amber-500' },
}

export function AnimacionesView({ estudiante }: AnimacionesViewProps) {
  const { popOverlay } = useOverlayStack()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [previewAnimation, setPreviewAnimation] = useState<any>(null)
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)

  const {
    availableAnimations,
    lockedAnimations,
    animationsByCategory,
    stats
  } = useStudentAnimations({
    studentPoints: estudiante.puntos_totales,
    unlockedAnimationIds: [], // TODO: Obtener del backend
  })

  const handleClose = () => {
    popOverlay()
  }

  // Filtrar animaciones según categoría seleccionada
  const displayAnimations = selectedCategory === 'all'
    ? [...availableAnimations, ...lockedAnimations]
    : [
        ...(animationsByCategory[selectedCategory] || []),
        ...lockedAnimations.filter(a => a.category === selectedCategory)
      ]

  const handleUnlockAnimation = async (animationId: string, cost: number) => {
    // TODO: Implementar llamada al backend
    console.log(`Desbloqueando animación ${animationId} por ${cost} puntos`)
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4 bg-black/30 backdrop-blur-sm border-b-2 border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-white font-black text-2xl uppercase tracking-wide">
                Mis Animaciones
              </h1>
              <p className="text-white/70 text-sm">
                {stats.available} desbloqueadas • {stats.locked} bloqueadas
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-12 h-12 rounded-xl bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Tabs de categorías */}
      <div className="px-6 py-4 bg-black/20">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
          <CategoryTab
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            label="Todas"
            emoji="✨"
            count={stats.total}
          />
          {Object.entries(CATEGORY_LABELS).map(([key, { label, emoji, color }]) => (
            <CategoryTab
              key={key}
              active={selectedCategory === key}
              onClick={() => setSelectedCategory(key)}
              label={label}
              emoji={emoji}
              count={stats.categories[key as keyof typeof stats.categories]}
              gradient={color}
            />
          ))}
        </div>
      </div>

      {/* Grid de animaciones */}
      <div className="px-6 py-8 overflow-y-auto h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayAnimations.map((animation) => {
            const isLocked = !availableAnimations.find(a => a.id === animation.id)
            const isSelected = selectedAnimation === animation.id

            return (
              <motion.div
                key={animation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <button
                  onClick={() => {
                    if (!isLocked) {
                      setSelectedAnimation(animation.id)
                      setPreviewAnimation(animation)
                    }
                  }}
                  className={`
                    w-full aspect-square rounded-2xl border-2 p-3
                    transition-all overflow-hidden relative
                    ${isLocked
                      ? 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500'
                        : 'bg-black/40 border-white/20 hover:border-white/40'
                    }
                  `}
                  disabled={isLocked}
                >
                  {/* Icono de categoría */}
                  <div className="absolute top-2 left-2 text-2xl">
                    {CATEGORY_LABELS[animation.category]?.emoji}
                  </div>

                  {/* Estado */}
                  <div className="absolute top-2 right-2">
                    {isLocked ? (
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    ) : isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : null}
                  </div>

                  {/* Nombre */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-xs text-center">
                      {animation.displayName}
                    </p>
                    {isLocked && (
                      <p className="text-yellow-400 font-black text-xs text-center mt-1">
                        {animation.requiredPoints} pts
                      </p>
                    )}
                  </div>

                  {/* Icono central de play para preview */}
                  {!isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white/80" />
                      </div>
                    </div>
                  )}
                </button>

                {/* Botón de desbloqueo para animaciones bloqueadas */}
                {isLocked && (
                  <button
                    onClick={() => handleUnlockAnimation(animation.id, animation.requiredPoints)}
                    disabled={estudiante.puntos_totales < animation.requiredPoints}
                    className={`
                      mt-2 w-full px-3 py-2 rounded-xl font-bold text-sm
                      transition-all border-2
                      ${estudiante.puntos_totales >= animation.requiredPoints
                        ? 'bg-yellow-500 border-yellow-600 text-black hover:bg-yellow-400'
                        : 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {estudiante.puntos_totales >= animation.requiredPoints
                      ? `Desbloquear (${animation.requiredPoints} pts)`
                      : 'Puntos insuficientes'
                    }
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Modal de preview */}
      <AnimatePresence>
        {previewAnimation && estudiante.avatar_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setPreviewAnimation(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-black text-2xl">
                    {previewAnimation.displayName}
                  </h2>
                  <p className="text-white/70 text-sm">{previewAnimation.description}</p>
                </div>
                <button
                  onClick={() => setPreviewAnimation(null)}
                  className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                <AnimatedAvatar3D
                  avatarUrl={estudiante.avatar_url}
                  animationUrl={previewAnimation.url}
                  width="100%"
                  height="100%"
                  enableControls
                />
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedAnimation(previewAnimation.id)
                    setPreviewAnimation(null)
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg hover:from-green-400 hover:to-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Usar esta animación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente auxiliar para tabs de categoría
function CategoryTab({
  active,
  onClick,
  label,
  emoji,
  count,
  gradient
}: {
  active: boolean
  onClick: () => void
  label: string
  emoji: string
  count: number
  gradient?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap
        transition-all border-2 flex items-center gap-2
        ${active
          ? `bg-gradient-to-r ${gradient || 'from-blue-500 to-purple-500'} border-white/30 text-white`
          : 'bg-black/30 border-white/10 text-white/70 hover:border-white/30'
        }
      `}
    >
      <span className="text-xl">{emoji}</span>
      <span>{label}</span>
      <span className={`
        px-2 py-0.5 rounded-full text-xs font-black
        ${active ? 'bg-black/30' : 'bg-white/10'}
      `}>
        {count}
      </span>
    </button>
  )
}
