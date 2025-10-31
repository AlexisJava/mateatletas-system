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

      // Delay mínimo de 2 segundos para mostrar el loading épico
      const startTime = Date.now()

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
        // Calcular tiempo transcurrido y esperar mínimo 2 segundos
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, 2000 - elapsedTime)

        setTimeout(() => {
          setIsLoadingAvatar(false)
          console.log('✅ [GimnasioPage] Carga finalizada, isLoadingAvatar = false')
        }, remainingTime)
      }
    }

    loadAvatar()
  }, [])

  // Loading screen mientras carga avatar
  if (isLoadingAvatar) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
        {/* Fondo animado con círculos de energía */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Partículas matemáticas flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          {['∑', 'π', '∫', '√', 'α', 'β', 'θ', '∞', '≠', '≈', '±', '÷', '×', 'Δ', 'Ω'].map((symbol, i) => (
            <div
              key={symbol + i}
              className="absolute text-white/20 font-bold text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `mathFloat ${Math.random() * 8 + 4}s linear infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center">
          {/* Logo MATEATLETAS con animación épica */}
          <div className="mb-8 relative">
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse">
              {'MATEATLETAS'.split('').map((letter, i) => (
                <span
                  key={i}
                  className="inline-block"
                  style={{
                    animation: `letterBounce 0.6s ease-in-out ${i * 0.1}s infinite`,
                    textShadow: '0 0 30px rgba(251, 191, 36, 0.8)',
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* Anillo de energía rotando */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-[600px] h-[600px] border-4 border-yellow-400/30 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute w-[550px] h-[550px] border-4 border-orange-400/20 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              <div className="absolute w-[500px] h-[500px] border-4 border-red-400/10 rounded-full animate-spin" style={{ animationDuration: '5s' }} />
            </div>
          </div>

          {/* Texto de carga */}
          <p className="text-white text-2xl font-bold mb-6 animate-pulse">
            Preparando tu gimnasio matemático...
          </p>

          {/* Barra de progreso épica */}
          <div className="w-96 h-3 bg-white/10 rounded-full overflow-hidden mx-auto backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"
              style={{
                animation: 'progressBar 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Sparkles animados */}
          <div className="mt-8 flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="text-4xl"
                style={{
                  animation: `sparkle 1.5s ease-in-out ${i * 0.2}s infinite`,
                }}
              >
                ✨
              </div>
            ))}
          </div>
        </div>

        {/* Estilos de animación inline */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(-50px) scale(1.1); opacity: 0.6; }
          }
          @keyframes mathFloat {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.4; }
            90% { opacity: 0.4; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
          }
          @keyframes letterBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.2); }
          }
          @keyframes progressBar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
            50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <OverlayStackProvider>
      <GimnasioContent avatarUrl={avatarUrl} />
    </OverlayStackProvider>
  )
}
