'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
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
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true)
  const hasLoadedAvatar = useRef(false)

  // Cargar avatar del estudiante (solo una vez)
  useEffect(() => {
    if (hasLoadedAvatar.current) return

    const loadAvatar = async () => {
      hasLoadedAvatar.current = true

      console.log('🔄 [GimnasioPage] Iniciando carga de avatar...')

      try {
        const response = await fetch('/api/estudiante/mi-avatar', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ [GimnasioPage] Avatar cargado:', data.avatar_url)
          setAvatarUrl(data.avatar_url)
        } else {
          console.warn('⚠️ [GimnasioPage] Response no OK:', response.status)
        }
      } catch (error) {
        console.error('❌ [GimnasioPage] Error al cargar avatar:', error)
      } finally {
        // Siempre marcamos como "cargado" aunque haya error
        setIsLoadingAvatar(false)
        console.log('✅ [GimnasioPage] Carga finalizada, isLoadingAvatar = false')
      }
    }

    loadAvatar()
  }, [])

  const handleNavigate = (vista: string) => {
    setVistaActual(vista as Vista)
  }

  // Loading screen mientras carga avatar
  if (isLoadingAvatar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
        <div className="text-center">
          <div className="text-9xl mb-6 animate-bounce">🧠</div>
          <p className="text-white text-3xl font-black mb-2">Cargando gimnasio...</p>
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mt-6" />
        </div>
      </div>
    )
  }

  return (
    <>
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
          <div key="entrenamientos" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              ENTRENAMIENTOS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'juegos' && (
          <div key="juegos" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              JUEGOS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'cursos' && (
          <div key="cursos" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              CURSOS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'progreso' && (
          <div key="progreso" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              PROGRESO (proximamente)
            </h1>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
