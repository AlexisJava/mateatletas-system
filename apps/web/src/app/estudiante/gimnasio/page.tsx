'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrawlBackground } from './components/BrawlBackground'
import { BrawlHeader } from './components/BrawlHeader'

// Tipos de vistas disponibles
type Vista =
  | 'hub'
  | 'entrenamientos'
  | 'juegos'
  | 'cursos'
  | 'progreso'

export default function GimnasioPage() {
  const [vistaActual, setVistaActual] = useState<Vista>('hub')

  // TODO: Cargar datos del estudiante
  // const { data: estudiante } = useEstudianteData()

  return (
    <BrawlBackground>
      {/* Header siempre visible */}
      <BrawlHeader
        nombre="Emmita"
        nivel={2}
        trofeos={45}
        monedas={168}
        gemas={0}
        racha={3}
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
