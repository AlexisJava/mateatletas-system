'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrawlBackground } from './components/BrawlBackground'
import { BrawlHeader } from './components/BrawlHeader'
import { useAuthStore } from '@/store/auth.store'

// Tipos de vistas disponibles
type Vista =
  | 'hub'
  | 'entrenamientos'
  | 'juegos'
  | 'cursos'
  | 'progreso'

export default function GimnasioPage() {
  const [vistaActual, setVistaActual] = useState<Vista>('hub')
  const { user } = useAuthStore()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Cargar avatar del estudiante
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        console.log('🎮 [Gimnasio] Cargando avatar del estudiante...')
        const response = await fetch('/api/estudiante/mi-avatar', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('📦 [Gimnasio] Avatar data:', data)
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        console.error('❌ [Gimnasio] Error al cargar avatar:', error)
      }
    }

    loadAvatar()
  }, [])

  return (
    <BrawlBackground>
      {/* Header siempre visible */}
      <BrawlHeader
        nombre={user?.nombre || 'Estudiante'}
        nivel={user?.nivel_actual || 1}
        trofeos={user?.puntos_totales || 0}
        monedas={168}
        gemas={0}
        racha={3}
        avatarUrl={avatarUrl}
      />

      {/* Sistema de vistas con transiciones */}
      <AnimatePresence mode="wait">
        {vistaActual === 'hub' && (
          <div key="hub" className="min-h-screen pt-32 px-8 flex flex-col items-center justify-center">
            {/* Avatar 3D Grande - TU PERSONAJE */}
            {avatarUrl ? (
              <div className="mb-8">
                <h2 className="text-center text-white text-2xl font-bold mb-4" style={{ fontFamily: '"Lilita One", cursive' }}>
                  ¡Tu Atleta Mental!
                </h2>
                <div className="w-80 h-96 rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-2 shadow-2xl shadow-purple-500/50">
                  <div className="w-full h-full rounded-2xl bg-black/20 backdrop-blur-sm overflow-hidden border-4 border-white/20">
                    <iframe
                      src={`${avatarUrl}?scene=fullbody-portrait-v1&animation=idle`}
                      className="w-full h-full border-none"
                      title="Tu Avatar 3D"
                      allow="camera; microphone"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="w-80 h-96 rounded-3xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">👤</div>
                    <p className="font-bold">Cargando avatar...</p>
                  </div>
                </div>
              </div>
            )}

            <h1 className="text-white text-4xl font-bold text-center mb-4" style={{ fontFamily: '"Lilita One", cursive', textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
              Gimnasio Mental
            </h1>
            <p className="text-white/80 text-xl text-center max-w-2xl">
              Seleccioná una actividad para entrenar tu mente y ganar trofeos
            </p>
          </div>
        )}

        {vistaActual === 'entrenamientos' && (
          <div key="entrenamientos" className="min-h-screen pt-32 px-8">
            <h1 className="text-white text-4xl font-bold text-center">
              ENTRENAMIENTOS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'juegos' && (
          <div key="juegos" className="min-h-screen pt-32 px-8">
            <h1 className="text-white text-4xl font-bold text-center">
              JUEGOS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'cursos' && (
          <div key="cursos" className="min-h-screen pt-32 px-8">
            <h1 className="text-white text-4xl font-bold text-center">
              CURSOS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'progreso' && (
          <div key="progreso" className="min-h-screen pt-32 px-8">
            <h1 className="text-white text-4xl font-bold text-center">
              PROGRESO (proximamente)
            </h1>
          </div>
        )}
      </AnimatePresence>
    </BrawlBackground>
  )
}
