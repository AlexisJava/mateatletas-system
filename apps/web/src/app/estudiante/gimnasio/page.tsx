'use client'

import { useState } from 'react'
import { BrawlBackground } from '@/components/estudiante/BrawlBackground'
import { BrawlHeader } from '@/components/estudiante/BrawlHeader'
import { Flame, Zap, BookOpen, Trophy } from 'lucide-react'

export default function GimnasioPage() {
  // URL del avatar (hardcoded por ahora - después viene de BD)
  const [avatarUrl] = useState('https://models.readyplayer.me/6606e809d72bffc6fa17e84f.glb')

  return (
    <BrawlBackground>
      {/* Header */}
      <BrawlHeader
        nombre="Emmita"
        nivel={2}
        trofeos={45}
        monedas={168}
        gemas={0}
        racha={3}
      />

      <div className="min-h-screen pt-32 pb-12 px-8">
        <div className="max-w-6xl mx-auto">

          {/* Sección Avatar + Info */}
          <div className="flex flex-col items-center mb-12">

            {/* Avatar 3D con Ready Player Me */}
            <div className="relative w-80 h-80 mb-8">
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-orange-500/20 border-2 border-white/30 shadow-[0_8px_0_rgba(0,0,0,0.2),0_12px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm overflow-hidden">
                {/* Avatar 3D */}
                <iframe
                  src={`${avatarUrl}?scene=fullbody-portrait-v1&camera=portrait`}
                  className="w-full h-full"
                  allow="camera; microphone"
                  style={{ border: 'none' }}
                />
              </div>

              {/* Badge de nivel */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full border-2 border-black shadow-[0_6px_0_rgba(0,0,0,0.3)] flex flex-col items-center justify-center">
                <span className="text-xs text-white/80 font-bold uppercase" style={{ fontSize: '10px' }}>Nivel</span>
                <span
                  className="text-3xl font-black text-white leading-none"
                  style={{
                    textShadow: '2px 2px 0px rgba(0,0,0,0.4)',
                    fontFamily: '"Lilita One", cursive'
                  }}
                >
                  2
                </span>
              </div>
            </div>

            {/* Nombre */}
            <h2
              className="text-6xl font-black text-white mb-4"
              style={{
                textShadow: '4px 4px 0px rgba(0,0,0,0.3)',
                fontFamily: '"Lilita One", cursive'
              }}
            >
              EMMITA
            </h2>

            {/* Badge título */}
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 px-8 py-3 rounded-2xl border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.3)]">
              <p
                className="text-xl font-black text-white uppercase"
                style={{
                  textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                  fontFamily: '"Lilita One", cursive'
                }}
              >
                ⚡ ATLETA MENTAL ⚡
              </p>
            </div>
          </div>

          {/* Grid de acciones rápidas */}
          <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Card: Entrenamiento activo */}
            <ActionCard
              icon={<Flame className="w-12 h-12" />}
              title="ENTRENAMIENTO ACTIVO"
              subtitle="Continuar donde lo dejaste"
              gradient="from-red-500 to-orange-500"
              onClick={() => alert('Ir a entrenamiento')}
            />

            {/* Card: Juegos rápidos */}
            <ActionCard
              icon={<Zap className="w-12 h-12" />}
              title="JUEGOS RÁPIDOS"
              subtitle="Desafíos de 10 minutos"
              gradient="from-yellow-400 to-yellow-600"
              onClick={() => alert('Ir a juegos')}
            />

            {/* Card: Mis cursos */}
            <ActionCard
              icon={<BookOpen className="w-12 h-12" />}
              title="MIS CURSOS"
              subtitle="Aprende a tu ritmo"
              gradient="from-blue-500 to-purple-500"
              onClick={() => alert('Ir a cursos')}
            />

            {/* Card: Progreso */}
            <ActionCard
              icon={<Trophy className="w-12 h-12" />}
              title="MI PROGRESO"
              subtitle="Logros y ranking"
              gradient="from-purple-500 to-pink-500"
              onClick={() => alert('Ver progreso')}
            />
          </div>

        </div>
      </div>
    </BrawlBackground>
  )
}

// Componente de card de acción
function ActionCard({
  icon,
  title,
  subtitle,
  gradient,
  onClick
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  gradient: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 border-2 border-black shadow-[0_6px_0_rgba(0,0,0,0.3),0_10px_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_4px_0_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.15)] group-hover:translate-y-1 group-active:translate-y-2 group-active:shadow-[0_2px_0_rgba(0,0,0,0.3)] transition-all duration-100`}>

        {/* Icono */}
        <div className="text-white mb-4">
          {icon}
        </div>

        {/* Título */}
        <h3
          className="text-2xl font-black text-white mb-2 text-left uppercase"
          style={{
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
            fontFamily: '"Lilita One", cursive'
          }}
        >
          {title}
        </h3>

        {/* Subtítulo */}
        <p className="text-white/90 text-sm font-bold text-left">
          {subtitle}
        </p>

        {/* Brillo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
    </button>
  )
}
