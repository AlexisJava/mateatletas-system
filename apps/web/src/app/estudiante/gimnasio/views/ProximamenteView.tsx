'use client'

import { motion } from 'framer-motion'
import { X, Brain, Gamepad2, Zap, Star, Trophy, Target, Sparkles } from 'lucide-react'
import { useOverlayStack } from '../contexts/OverlayStackProvider'

interface ProximamenteViewProps {
  title: string
  description: string
  icon?: React.ReactNode
  gradient?: string
}

export function ProximamenteView({
  title = 'ENTRENAMIENTOS',
  description = 'Cientos de juegos matemáticos para entrenar tu cerebro',
  icon = <Brain className="w-20 h-20" />,
  gradient = 'from-pink-500 via-rose-500 to-red-500',
}: ProximamenteViewProps) {
  const { pop } = useOverlayStack()

  const features = [
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: 'Juegos Interactivos',
      description: 'Desafíos matemáticos en formato de juego',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Entrenamiento Rápido',
      description: 'Sesiones de 5-10 minutos diarias',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Sistema de Niveles',
      description: 'Avanza de principiante a experto',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Competencias',
      description: 'Compite con otros estudiantes',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Objetivos Personalizados',
      description: 'Adapta el entrenamiento a tu ritmo',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Recompensas',
      description: 'Gana puntos y desbloquea contenido',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Header */}
      <header className="relative z-10 px-6 py-4 bg-black/30 backdrop-blur-sm border-b-2 border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${gradient}`}>
              {icon}
            </div>
            <div>
              <h1 className="text-white font-black text-2xl uppercase tracking-wide">
                {title}
              </h1>
              <p className="text-white/70 text-sm">Próximamente disponible</p>
            </div>
          </div>

          <button
            onClick={() => pop()}
            className="w-12 h-12 rounded-xl bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Animated brain icon */}
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
                  className={`p-8 rounded-full bg-gradient-to-r ${gradient}`}
                >
                  <Brain className="w-32 h-32 text-white" />
                </motion.div>

                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 100}%`,
                      top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 100}%`,
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

            <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
              PRÓXIMAMENTE
            </h2>
            <p className="text-2xl text-purple-300 font-bold mb-6">
              {description}
            </p>
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl">
              <p className="text-purple-300 font-mono text-lg">
                🚀 Lanzamiento estimado: <span className="text-white font-black">Próximamente</span>
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="mb-12">
            <h3 className="text-3xl font-black text-white text-center mb-8">
              ¿Qué encontrarás?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-white/10 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-white/70 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-3xl p-8 text-center"
          >
            <h3 className="text-2xl font-black text-white mb-4">
              ¡Mantente atento!
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Estamos trabajando en crear la mejor experiencia de entrenamiento matemático.
              Mientras tanto, puedes explorar las tareas asignadas y seguir ganando puntos.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white cursor-default"
              >
                🎮 +200 Juegos Matemáticos
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-white cursor-default"
              >
                🏆 Competencias Semanales
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white cursor-default"
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
