'use client'

import { motion } from 'framer-motion'
import { X, Brain, Gamepad2, Zap, Star, Trophy, Target, Sparkles } from 'lucide-react'
import { useOverlayStack } from '../contexts/OverlayStackProvider'

interface ProximamenteViewProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  gradient?: string
}

export function ProximamenteView({
  title = 'ENTRENAMIENTOS',
  description = 'Cientos de juegos matemáticos para entrenar tu cerebro',
  icon = <Brain className="w-16 h-16" />,
  gradient = 'from-pink-500 via-rose-500 to-red-500',
}: ProximamenteViewProps) {
  const { pop } = useOverlayStack()

  const features = [
    { icon: <Gamepad2 className="w-5 h-5" />, title: 'Juegos Interactivos' },
    { icon: <Zap className="w-5 h-5" />, title: 'Entrenamiento Rápido' },
    { icon: <Star className="w-5 h-5" />, title: 'Sistema de Niveles' },
    { icon: <Trophy className="w-5 h-5" />, title: 'Competencias' },
    { icon: <Target className="w-5 h-5" />, title: 'Objetivos Personalizados' },
    { icon: <Sparkles className="w-5 h-5" />, title: 'Recompensas' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden flex flex-col">
      {/* Header - Fixed Height */}
      <header className="relative z-10 px-6 py-3 bg-black/30 backdrop-blur-sm border-b-2 border-white/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-r ${gradient}`}>
              {icon}
            </div>
            <div>
              <h1 className="text-white font-black text-xl uppercase tracking-wide">
                {title}
              </h1>
              <p className="text-white/70 text-xs">Próximamente disponible</p>
            </div>
          </div>

          <button
            onClick={() => pop()}
            className="w-10 h-10 rounded-xl bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content - Flex Grow, NO SCROLL */}
      <div className="flex-1 flex items-center justify-center px-8 py-6">
        <div className="max-w-6xl w-full">
          {/* Hero Section - Compacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {/* Animated brain icon - Más pequeño */}
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`p-6 rounded-full bg-gradient-to-r ${gradient}`}
                >
                  <Brain className="w-20 h-20 text-white" />
                </motion.div>

                {/* Floating particles - Reducidos */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-white rounded-full"
                    style={{
                      left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 80}%`,
                      top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 80}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Título - Más compacto */}
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
              PRÓXIMAMENTE
            </h2>
            <p className="text-xl text-purple-300 font-bold mb-3">
              {description}
            </p>
            <div className="inline-block px-5 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl">
              <p className="text-purple-300 font-mono text-sm">
                🚀 <span className="text-white font-black">200+ Juegos Matemáticos</span>
              </p>
            </div>
          </motion.div>

          {/* Features Grid - Compacto */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-xl p-3 hover:border-purple-500/50 hover:bg-white/10 transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center mb-2 mx-auto`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-white font-bold text-xs text-center">
                    {feature.title}
                  </h4>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section - Compacto */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-6 text-center"
          >
            <h3 className="text-xl font-black text-white mb-2">
              ¡Mantente atento!
            </h3>
            <p className="text-white/80 text-sm mb-4 max-w-2xl mx-auto">
              Estamos trabajando en crear la mejor experiencia de entrenamiento matemático.
              Mientras tanto, explorá las tareas asignadas y seguí ganando puntos.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white text-sm cursor-default"
              >
                🎮 Juegos Matemáticos
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-white text-sm cursor-default"
              >
                🏆 Competencias Semanales
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white text-sm cursor-default"
              >
                ⚡ Desafíos Diarios
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
