'use client'

import { useState, useEffect, useRef } from 'react'
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
  const hasLoadedAvatar = useRef(false)

  // Cargar avatar del estudiante (solo una vez)
  useEffect(() => {
    if (hasLoadedAvatar.current) return

    const loadAvatar = async () => {
      hasLoadedAvatar.current = true

      try {
        const response = await fetch('/api/estudiante/mi-avatar', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        console.error('Error al cargar avatar:', error)
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
            {/* Avatar 3D Grande - TU PERSONAJE ANIMADO */}
            {avatarUrl ? (
              <div className="mb-8">
                <h2 className="text-center text-white text-2xl font-bold mb-4" style={{ fontFamily: '"Lilita One", cursive' }}>
                  ¡Tu Atleta Mental!
                </h2>
                <div className="w-96 h-[32rem] rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-2 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all">
                  <div className="w-full h-full rounded-2xl bg-black/20 backdrop-blur-sm overflow-hidden border-4 border-white/20">
                    <iframe
                      src={`https://models.readyplayer.me/${avatarUrl.split('/').pop()}?scene=fullbody-portrait-v1-transparent&meshLod=1`}
                      className="w-full h-full border-none scale-110"
                      title="Tu Avatar 3D"
                      allow="camera; microphone"
                      sandbox="allow-scripts allow-same-origin"
                      loading="lazy"
                      style={{
                        background: 'transparent',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      // TODO: Cambiar animación
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm transition-all"
                  >
                    Saludar 👋
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all"
                  >
                    Celebrar 🎉
                  </button>
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
