'use client'

import { Trophy, Coins, Gem, Flame } from 'lucide-react'
import { RPM_CONFIG } from '@/lib/ready-player-me.config'

interface BrawlHeaderProps {
  nombre: string
  nivel: number
  trofeos: number
  monedas: number
  gemas: number
  racha: number
  avatarUrl?: string | null
}

export function BrawlHeader({ nombre, nivel, trofeos, monedas, gemas, racha, avatarUrl }: BrawlHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">

        {/* Lado izquierdo: Avatar + nombre */}
        <div className="flex items-center gap-3">
          {/* Avatar 3D o placeholder */}
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-black flex items-center justify-center shadow-[2px_3px_0_rgba(0,0,0,0.4),4px_6px_12px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            {avatarUrl ? (
              <iframe
                src={RPM_CONFIG.getQuickViewUrl(avatarUrl, 'halfbody')}
                className="w-full h-full border-none scale-150"
                title={`Avatar de ${nombre}`}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
              />
            ) : (
              <span className="text-2xl font-black text-white">
                {nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info del jugador */}
          <div className="bg-gray-800/90 rounded-xl px-4 py-2 border-2 border-black shadow-[2px_3px_0_rgba(0,0,0,0.4),4px_6px_12px_rgba(0,0,0,0.2)]">
            <p
              className="text-white font-black text-sm uppercase tracking-wide"
              style={{
                textShadow: '1px 1px 0px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
                fontFamily: '"Lilita One", cursive'
              }}
            >
              {nombre}
            </p>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-xs">{trofeos}</span>
            </div>
          </div>
        </div>

        {/* Lado derecho: Stats */}
        <div className="flex items-center gap-3">

          {/* Monedas */}
          <StatBadge
            icon={<Coins className="w-5 h-5" />}
            value={monedas}
            color="bg-gradient-to-br from-yellow-400 to-yellow-600"
          />

          {/* Gemas */}
          <StatBadge
            icon={<Gem className="w-5 h-5" />}
            value={gemas}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
          />

          {/* Racha */}
          <StatBadge
            icon={<Flame className="w-5 h-5" />}
            value={`${racha} ${racha === 1 ? 'día' : 'días'}`}
            color="bg-gradient-to-br from-red-400 to-red-600"
          />

          {/* Menú hamburguesa */}
          <button
            className="w-14 h-14 bg-gray-800/90 rounded-xl border-2 border-black shadow-[2px_3px_0_rgba(0,0,0,0.4),4px_6px_12px_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,0.4),3px_4px_8px_rgba(0,0,0,0.15)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center"
          >
            <div className="space-y-1.5">
              <div className="w-6 h-1 bg-white rounded"></div>
              <div className="w-6 h-1 bg-white rounded"></div>
              <div className="w-6 h-1 bg-white rounded"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para badges de stats
function StatBadge({ icon, value, color }: { icon: React.ReactNode; value: number | string; color: string }) {
  return (
    <div className={`${color} rounded-xl px-4 py-2 border-2 border-black shadow-[2px_3px_0_rgba(0,0,0,0.4),4px_6px_12px_rgba(0,0,0,0.2)] flex items-center gap-2`}>
      <div className="text-white">{icon}</div>
      <span
        className="text-white font-black text-lg"
        style={{
          textShadow: '1px 1px 0px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
          fontFamily: '"Lilita One", cursive'
        }}
      >
        {value}
      </span>
    </div>
  )
}
