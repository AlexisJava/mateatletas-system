'use client'

import { useEffect, useRef, useState } from 'react'
import { HubView } from './views/HubView'
import { useAuthStore } from '@/store/auth.store'
import { OverlayStackProvider, useOverlayStack } from './contexts/OverlayStackProvider'
import { OverlayStackManager } from './components/OverlayStackManager'

// Componente interno que usa el hook del overlay stack
function GimnasioContent({ avatarUrl }: { avatarUrl: string | null }) {
  const { user } = useAuthStore()
  const { stack } = useOverlayStack()

  // Ocultar HubView cuando hay overlays abiertos
  const showHub = stack.length === 0

  return (
    <>
      {/* Dashboard principal - SOLO visible cuando NO hay overlays */}
      {showHub && (
        <div className="h-screen overflow-hidden">
          {user && (
            <HubView
              onNavigate={() => {}} // Ya no se usa, todo es con overlays
              estudiante={{
                nombre: user.nombre || 'Estudiante',
                apellido: user.apellido || '',
                nivel_actual: user.nivel_actual || 1,
                puntos_totales: user.puntos_totales || 0,
                avatar_url: avatarUrl,
                id: user.sub || user.id || ''
              }}
            />
          )}
        </div>
      )}

      {/* Sistema de overlay stack */}
      <OverlayStackManager />
    </>
  )
}

export default function GimnasioPage() {
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
    <OverlayStackProvider>
      <GimnasioContent avatarUrl={avatarUrl} />
    </OverlayStackProvider>
  )
}
