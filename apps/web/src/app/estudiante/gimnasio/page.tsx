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
          <div key="hub" className="min-h-screen pt-32 px-8">
            <h1 className="text-white text-4xl font-bold text-center">
              HUB - Vista principal (proximamente)
            </h1>
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
