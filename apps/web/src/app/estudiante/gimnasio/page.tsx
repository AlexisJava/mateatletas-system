'use client'

import { useEffect, useRef, useState } from 'react'
import { HubView } from './views/HubView'
import { useAuthStore } from '@/store/auth.store'
import { OverlayStackProvider, useOverlayStack } from './contexts/OverlayStackProvider'
import { OverlayStackManager } from './components/OverlayStackManager'
import { DailyWelcomeModal } from './components/DailyWelcomeModal'
import { LandscapeOnlyGuard } from './components/LandscapeOnlyGuard'
import { useRachaAutomatica } from '@/hooks/useRachaAutomatica'

// Componente interno que usa el hook del overlay stack
function GimnasioContent({ avatarUrl }: { avatarUrl: string | null }) {
  const { user } = useAuthStore()
  const { stack } = useOverlayStack()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Cargar racha automáticamente y determinar si mostrar modal
  const { racha, loading: loadingRacha } = useRachaAutomatica(user?.sub || user?.id)

  // Ocultar HubView cuando hay overlays abiertos
  const showHub = stack.length === 0

  // Mostrar modal de bienvenida solo UNA VEZ por día
  useEffect(() => {
    if (!racha || loadingRacha || !user) return

    const hoy = new Date().toISOString().split('T')[0] ?? '' // YYYY-MM-DD
    const lastWelcomeDate = localStorage.getItem('lastWelcomeDate')

    // Mostrar modal si es un día diferente
    if (lastWelcomeDate !== hoy && hoy) {
      setShowWelcomeModal(true)
      localStorage.setItem('lastWelcomeDate', hoy)
    }
  }, [racha, loadingRacha, user])

  return (
    <>
      {/* Modal de bienvenida diaria */}
      {showWelcomeModal && racha && user && (
        <DailyWelcomeModal
          estudiante={{
            nombre: user.nombre || 'Estudiante',
            apellido: user.apellido || '',
          }}
          racha={racha}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

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
    return <GimnasioLoadingScreen />
  }

  return (
    <OverlayStackProvider>
      <LandscapeOnlyGuard>
        <GimnasioContent avatarUrl={avatarUrl} />
      </LandscapeOnlyGuard>
    </OverlayStackProvider>
  )
}

// Componente separado para el loading screen con manejo de hydration
function GimnasioLoadingScreen() {
  // Generate stars and particles only on client-side to prevent hydration mismatch
  const [stars, setStars] = useState<Array<{
    size: number
    left: number
    top: number
    duration: number
    delay: number
    opacity: number
  }>>([])

  const [particles, setParticles] = useState<Array<{
    left: number
    top: number
    duration: number
    delay: number
  }>>([])

  useEffect(() => {
    // Generate stars after mount (client-side only)
    const generatedStars = [...Array(200)].map(() => ({
      size: Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.8 + 0.2,
    }))
    setStars(generatedStars)

    // Generate particles after mount (client-side only)
    const generatedParticles = [...Array(50)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
    setParticles(generatedParticles)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-black">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* CAMPO DE ESTRELLAS - STARFIELD INFINITO */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* NEBULOSAS DE FONDO - EFECTO ESPACIAL */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="absolute inset-0">
          <div className="absolute w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px] -top-40 -left-40 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px] -bottom-20 -right-20 animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute w-[700px] h-[700px] rounded-full bg-cyan-600/10 blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* AGUJERO NEGRO CENTRAL - VÓRTICE */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[400px] h-[400px]">
            {/* Anillos del agujero negro */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`ring-${i}`}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: `rgba(100, 200, 255, ${0.3 - i * 0.03})`,
                  transform: `scale(${1 - i * 0.12})`,
                  animation: `blackHoleRing ${3 + i * 0.5}s linear infinite`,
                  animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                }}
              />
            ))}
            {/* Centro oscuro del agujero negro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-black border-4 border-blue-500/50 shadow-[0_0_80px_rgba(59,130,246,0.8)]" />
            </div>
          </div>
        </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PARTÍCULAS CÓSMICAS - POLVO ESTELAR */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-300/60 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `floatParticle ${particle.duration}s linear infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TEXTO PRINCIPAL - EFECTO HOLOGRÁFICO 3D */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative z-20 text-center px-8">
          {/* Logo MATEATLETAS con efecto 3D holográfico */}
          <div className="mb-12 relative py-8">
            {/* Texto principal con gradiente holográfico - SIN SOMBRA PARA EVITAR CORTES */}
            <h1 className="relative text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 whitespace-nowrap" style={{
              textShadow: '0 0 40px rgba(56, 189, 248, 0.8), 0 0 80px rgba(56, 189, 248, 0.4)',
              animation: 'holographicGlow 3s ease-in-out infinite'
            }}>
              MATEATLETAS
            </h1>

            {/* Líneas de escaneo holográfico */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="w-full h-1 bg-cyan-400/30 absolute" style={{ animation: 'scanLine 3s linear infinite' }} />
            </div>
          </div>

          {/* Subtítulo con efecto de máquina de escribir */}
          <div className="mb-8 h-8">
            <p className="text-cyan-300 text-2xl font-mono tracking-wider" style={{
              animation: 'typewriter 2s steps(40) infinite',
              textShadow: '0 0 10px rgba(103, 232, 249, 0.8)'
            }}>
              [ INICIANDO SISTEMA CUÁNTICO ]
            </p>
          </div>

          {/* Barra de progreso futurista */}
          <div className="w-[500px] mx-auto mb-8">
            <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden border border-cyan-500/30">
              {/* Barra de progreso con efecto warp */}
              <div className="h-full relative">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                  style={{ animation: 'warpProgress 2s ease-in-out infinite' }}
                />
                {/* Efecto de brillo que se mueve */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'shine 2s ease-in-out infinite' }} />
              </div>
            </div>
            {/* Indicadores de carga */}
            <div className="flex justify-between mt-2 text-cyan-400 text-xs font-mono">
              <span style={{ animation: 'blink 1s ease-in-out infinite' }}>◆ NEURAL NET</span>
              <span style={{ animation: 'blink 1s ease-in-out 0.3s infinite' }}>◆ QUANTUM CORE</span>
              <span style={{ animation: 'blink 1s ease-in-out 0.6s infinite' }}>◆ MATRIX READY</span>
            </div>
          </div>

          {/* Datos técnicos nerds */}
          <div className="grid grid-cols-3 gap-4 w-[600px] mx-auto text-xs font-mono text-cyan-400/60">
            <div className="border border-cyan-500/20 rounded p-2 backdrop-blur-sm">
              <div className="text-cyan-300">CONEXIÓN</div>
              <div className="text-green-400 animate-pulse">█████ 100%</div>
            </div>
            <div className="border border-cyan-500/20 rounded p-2 backdrop-blur-sm">
              <div className="text-cyan-300">LATENCIA</div>
              <div className="text-yellow-400">23ms</div>
            </div>
            <div className="border border-cyan-500/20 rounded p-2 backdrop-blur-sm">
              <div className="text-cyan-300">FPS</div>
              <div className="text-green-400">∞</div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ESTILOS DE ANIMACIÓN */}
        {/* ═══════════════════════════════════════════════════════ */}
        <style jsx>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes blackHoleRing {
            0% { transform: scale(1) rotate(0deg); opacity: 0.4; }
            50% { transform: scale(0.8) rotate(180deg); opacity: 0.2; }
            100% { transform: scale(1) rotate(360deg); opacity: 0.4; }
          }
          @keyframes floatParticle {
            0% { transform: translate(0, 0) scale(1); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translate(100vw, -100vh) scale(0.5); opacity: 0; }
          }
          @keyframes holographicGlow {
            0%, 100% { filter: brightness(1) contrast(1); }
            50% { filter: brightness(1.3) contrast(1.2); }
          }
          @keyframes scanLine {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          @keyframes typewriter {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes warpProgress {
            0% { width: 0%; transform: scaleX(1); }
            50% { width: 60%; transform: scaleX(1.1); }
            100% { width: 95%; transform: scaleX(1); }
          }
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
    </div>
  )
}
