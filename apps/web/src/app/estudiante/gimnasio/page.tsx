'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrawlBackground } from './components/BrawlBackground'
import { BrawlHeader } from './components/BrawlHeader'
import { HubView } from './views/HubView'
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

  const handleNavigate = (vista: string) => {
    setVistaActual(vista as Vista)
  }

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
        {vistaActual === 'hub' && user && (
          <HubView
            onNavigate={handleNavigate}
            estudiante={{
              nombre: user.nombre || 'Estudiante',
              apellido: user.apellido || '',
              nivel_actual: user.nivel_actual || 1,
              puntos_totales: user.puntos_totales || 0,
              avatar_url: avatarUrl
            }}
          />
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
