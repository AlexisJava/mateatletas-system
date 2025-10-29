'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { BookOpen, Gamepad2, TrendingUp, Trophy, Users, Settings } from 'lucide-react'

interface HubViewProps {
  onNavigate: (vista: string) => void
  estudiante: {
    nombre: string
    apellido: string
    nivel_actual: number
    puntos_totales: number
    avatar_url?: string | null
  }
}

// Avatar de ejemplo para fallback
const AVATAR_EJEMPLO = 'https://demo.readyplayer.me/avatar?frameApi&clearCache&url=https://models.readyplayer.me/64bfa16f0e72c63d7c3934a6.glb'

// Helper: Generar URL del viewer público
const getAvatarViewerUrl = (url: string | undefined): string | null => {
  if (!url) return null

  console.log('🔧 [HubView] Avatar URL original:', url)

  // Extraer el ID del avatar
  let avatarId = ''

  // Caso 1: URL completa con .glb
  if (url.includes('.glb')) {
    const match = url.match(/([a-zA-Z0-9]{24,})\.glb/i)
    if (match) {
      avatarId = match[1]
    }
  }
  // Caso 2: URL sin .glb pero con ID
  else {
    const match = url.match(/([a-zA-Z0-9]{24,})/i)
    if (match) {
      avatarId = match[1]
    }
  }

  if (!avatarId) {
    console.error('❌ [HubView] No se pudo extraer ID del avatar de:', url)
    return null
  }

  console.log('✅ [HubView] Avatar ID extraído:', avatarId)

  // Usar el viewer público de Ready Player Me con subdomain
  const subdomain = process.env.NEXT_PUBLIC_RPM_SUBDOMAIN || 'demo'
  const viewerUrl = `https://${subdomain}.readyplayer.me/avatar?frameApi&clearCache&url=https://models.readyplayer.me/${avatarId}.glb`

  console.log('✅ [HubView] Viewer URL generada:', viewerUrl)

  return viewerUrl
}

export function HubView({ onNavigate, estudiante }: HubViewProps) {
  // Debug: Ver qué URL tiene el estudiante
  useEffect(() => {
    console.log('🎮 [HubView] Avatar URL del estudiante:', estudiante.avatar_url)
    console.log('🎮 [HubView] Tiene avatar?', !!estudiante.avatar_url)

    const viewerUrl = getAvatarViewerUrl(estudiante.avatar_url)
    console.log('🎮 [HubView] Viewer URL procesada:', viewerUrl)
  }, [estudiante.avatar_url])

  const avatarViewerUrl = getAvatarViewerUrl(estudiante.avatar_url)
  return (
    <motion.div
      key="hub"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pt-24"
    >
      {/* Layout principal */}
      <div className="h-full flex">

        {/* ═══════════════════════════════════════ */}
        {/* MENÚ LATERAL IZQUIERDO                  */}
        {/* ═══════════════════════════════════════ */}
        <div className="w-32 flex flex-col gap-3 p-4">

          <MenuButton
            icon={<BookOpen className="w-8 h-8" />}
            label="CURSOS"
            onClick={() => onNavigate('cursos')}
          />

          <MenuButton
            icon={<Gamepad2 className="w-8 h-8" />}
            label="JUEGOS"
            badge={3}
            onClick={() => onNavigate('juegos')}
          />

          <MenuButton
            icon={<TrendingUp className="w-8 h-8" />}
            label="PROGRESO"
            onClick={() => onNavigate('progreso')}
          />

        </div>

        {/* ═══════════════════════════════════════ */}
        {/* CENTRO - AVATAR GIGANTE                 */}
        {/* ═══════════════════════════════════════ */}
        <div className="flex-1 flex flex-col items-center justify-between py-8">

          {/* Avatar 3D GIGANTE */}
          <div className="flex-1 flex items-center justify-center w-full max-w-2xl">
            {(avatarViewerUrl || AVATAR_EJEMPLO) ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Sombra proyectada */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-16 bg-black/30 rounded-full blur-2xl" />

                {/* Avatar 3D renderizado (SOLO VISUALIZACIÓN) */}
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    key={estudiante.avatar_url}
                    src={avatarViewerUrl || AVATAR_EJEMPLO}
                    className="w-full h-full"
                    allow="camera; microphone"
                    style={{
                      border: 'none',
                      pointerEvents: 'none',
                      minHeight: '600px'
                    }}
                    loading="eager"
                    title="Avatar 3D"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-9xl mb-4 animate-bounce">🧠</div>
                <p className="text-white/60 font-bold text-2xl">Cargando atleta...</p>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* FOOTER - CARDS DE ACCIÓN                */}
          {/* ═══════════════════════════════════════ */}
          <div className="w-full max-w-5xl px-8 flex gap-4 items-end">

            {/* Card izquierda: Racha */}
            <div className="flex-none w-48 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 border-2 border-black shadow-[0_6px_0_rgba(0,0,0,0.3)]">
              <div className="text-4xl mb-2">🔥</div>
              <p className="text-white/80 text-sm font-bold uppercase">Racha</p>
              <p className="text-white text-3xl font-black">3 días</p>
            </div>

            {/* Card centro: Entrenamiento activo */}
            <div className="flex-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 border-2 border-black shadow-[0_6px_0_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-4">
                <div className="text-5xl">⚡</div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-bold uppercase mb-1">Entrena hoy</p>
                  <p className="text-white text-2xl font-black">Multiplicaciones - Nivel 3</p>
                </div>
                <div className="bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm">
                  En progreso
                </div>
              </div>
            </div>

            {/* Card derecha: Botón PLAY gigante */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('entrenamientos')}
              className="flex-none w-56 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-8 border-2 border-black shadow-[0_8px_0_rgba(0,0,0,0.3)] group"
            >
              <p
                className="text-5xl font-black text-white uppercase leading-tight"
                style={{
                  textShadow: '3px 3px 0px rgba(0,0,0,0.4)',
                  fontFamily: '"Lilita One", cursive'
                }}
              >
                JUGAR
              </p>
              <p className="text-white/80 text-sm font-bold mt-2">Comenzar entrenamiento</p>
            </motion.button>

          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* MENÚ LATERAL DERECHO                    */}
        {/* ═══════════════════════════════════════ */}
        <div className="w-32 flex flex-col gap-3 p-4">

          <MenuButton
            icon={<Trophy className="w-8 h-8" />}
            label="LOGROS"
            onClick={() => onNavigate('progreso')}
          />

          <MenuButton
            icon={<Users className="w-8 h-8" />}
            label="RANKING"
            onClick={() => onNavigate('progreso')}
          />

          <MenuButton
            icon={<Settings className="w-8 h-8" />}
            label="CONFIG"
            onClick={() => {}}
          />

        </div>

      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════
// COMPONENTE: MenuButton
// ═══════════════════════════════════════════════════

interface MenuButtonProps {
  icon: React.ReactNode
  label: string
  badge?: number
  onClick: () => void
}

function MenuButton({ icon, label, badge, onClick }: MenuButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, x: 4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 border-2 border-gray-700 shadow-[0_4px_0_rgba(0,0,0,0.4)] hover:border-yellow-400 transition-colors group"
    >
      {/* Badge de notificación */}
      {badge && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
          <span className="text-white text-xs font-black">{badge}</span>
        </div>
      )}

      {/* Icono */}
      <div className="text-white mb-2 group-hover:text-yellow-400 transition-colors">
        {icon}
      </div>

      {/* Label */}
      <p className="text-white text-[10px] font-black uppercase leading-tight group-hover:text-yellow-400 transition-colors">
        {label}
      </p>
    </motion.button>
  )
}
