'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { HubView } from './views/HubView'
import { MiProgresoView } from './views/MiProgresoView'
import { MiGrupoView } from './views/MiGrupoView'
import { useAuthStore } from '@/store/auth.store'

// Tipos de vistas disponibles
type Vista =
  | 'hub'
  | 'entrenamientos'
  | 'mis-cursos'
  | 'mis-logros'
  | 'tienda'
  | 'mi-grupo'
  | 'mi-progreso'
  | 'notificaciones'
  | 'ajustes'

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

        {vistaActual === 'mi-progreso' && user && (
          <MiProgresoView
            key="mi-progreso"
            estudiante={{
              nombre: user.nombre || 'Estudiante',
              puntos_totales: user.puntos_totales || 0,
            }}
          />
        )}

        {vistaActual === 'mi-grupo' && user && (
          <MiGrupoView
            key="mi-grupo"
            estudiante={{
              nombre: user.nombre || 'Estudiante',
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

        {vistaActual === 'mis-cursos' && (
          <div key="mis-cursos" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              MIS CURSOS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'mis-logros' && (
          <div key="mis-logros" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              MIS LOGROS (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'tienda' && (
          <div key="tienda" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              TIENDA (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'notificaciones' && (
          <div key="notificaciones" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              NOTIFICACIONES (proximamente)
            </h1>
          </div>
        )}

        {vistaActual === 'ajustes' && (
          <div key="ajustes" className="min-h-screen pt-32 px-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600">
            <h1 className="text-white text-4xl font-bold text-center">
              AJUSTES (proximamente)
            </h1>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
