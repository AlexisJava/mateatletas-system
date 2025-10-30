'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface StatData {
  id: string;
  emoji: string;
  value: string;
  label: string;
  gradient: string;
  detalles: {
    titulo: string;
    items: string[];
  };
}

const STATS_DATA: StatData[] = [
  {
    id: 'monedas',
    emoji: '💰',
    value: '168',
    label: 'MONEDAS',
    gradient: 'from-yellow-400 to-orange-500',
    detalles: {
      titulo: 'Tus Monedas',
      items: [
        'Ganadas esta semana: +45',
        'Ganadas este mes: +168',
        'Total histórico: 523',
        'Próxima recompensa: 200 monedas',
      ]
    }
  },
  {
    id: 'dias',
    emoji: '📅',
    value: '12',
    label: 'DÍAS ESTE MES',
    gradient: 'from-blue-500 to-cyan-400',
    detalles: {
      titulo: 'Días Estudiados',
      items: [
        'Este mes: 12 días',
        'Mes pasado: 8 días',
        'Mejor mes: 15 días (Junio)',
        'Promedio: 10 días/mes',
      ]
    }
  },
  {
    id: 'racha',
    emoji: '🔥',
    value: '3',
    label: 'DÍAS DE RACHA',
    gradient: 'from-orange-500 to-red-600',
    detalles: {
      titulo: 'Racha Actual',
      items: [
        'Racha actual: 3 días',
        'Mejor racha: 7 días',
        'No pierdas la racha de hoy!',
        'Bonus racha 7 días: +100 pts',
      ]
    }
  },
  {
    id: 'nivel',
    emoji: '⭐',
    value: '1',
    label: 'NIVEL',
    gradient: 'from-purple-500 to-pink-600',
    detalles: {
      titulo: 'Tu Nivel',
      items: [
        'Nivel actual: 1',
        'XP para nivel 2: 450/1000',
        'Falta: 550 XP',
        'Siguiente recompensa: Avatar especial',
      ]
    }
  },
  {
    id: 'algebra',
    emoji: '🎯',
    value: '85%',
    label: 'ÁLGEBRA',
    gradient: 'from-green-500 to-emerald-600',
    detalles: {
      titulo: 'Dominio de Álgebra',
      items: [
        'Progreso: 85%',
        'Temas completados: 17/20',
        'Próximo tema: Ecuaciones cuadráticas',
        'Tiempo invertido: 5.2 horas',
      ]
    }
  },
  {
    id: 'logros',
    emoji: '🏆',
    value: '12',
    label: 'LOGROS',
    gradient: 'from-amber-500 to-yellow-600',
    detalles: {
      titulo: 'Tus Logros',
      items: [
        'Desbloqueados: 12/50',
        'Último logro: Maestro de Tablas',
        'Próximo: Racha de 7 días',
        'Logros legendarios: 0/5',
      ]
    }
  },
];

interface MiProgresoViewProps {
  estudiante: {
    nombre: string;
    puntos_totales?: number;
  };
}

export function MiProgresoView({ estudiante }: MiProgresoViewProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const selectedData = STATS_DATA.find(s => s.id === selectedCard);

  return (
    <div className="w-full h-full p-8 flex flex-col">

      {/* Header fijo */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-white/20
                       flex items-center justify-center text-3xl">
          📊
        </div>
        <h1 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
          MI PROGRESO
        </h1>
      </div>

      {/* Grid 3x2 FIJO - sin animaciones */}
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-6">
        {STATS_DATA.map((stat) => (
          <button
            key={stat.id}
            onClick={() => setSelectedCard(stat.id)}
            className={`
              bg-gradient-to-br ${stat.gradient}
              rounded-3xl p-8
              flex flex-col items-center justify-center
              shadow-xl
              border-4
              hover:scale-[1.02] active:scale-[0.98]
              transition-transform duration-150
              ${selectedCard === stat.id
                ? 'border-white ring-4 ring-white/50'
                : 'border-white/20'
              }
            `}
          >
            {/* Emoji */}
            <div className="text-6xl mb-4">
              {stat.emoji}
            </div>

            {/* Valor */}
            <div className="text-5xl font-black text-white mb-2">
              {stat.value}
            </div>

            {/* Label */}
            <div className="text-lg font-bold text-white/80 uppercase text-center">
              {stat.label}
            </div>
          </button>
        ))}
      </div>

      {/* Modal overlay ENCIMA - solo fade */}
      <AnimatePresence>
        {selectedCard && selectedData && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedCard(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal centrado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-8 pointer-events-none"
            >
              <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl
                           rounded-3xl p-8 border-2 border-white/20
                           pointer-events-auto">
                {/* Header del modal */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-16 h-16 rounded-2xl
                      bg-gradient-to-br ${selectedData.gradient}
                      flex items-center justify-center text-4xl
                      shadow-xl
                    `}>
                      {selectedData.emoji}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">
                        {selectedData.detalles.titulo}
                      </h2>
                      <p className="text-lg text-white/70 font-bold">
                        {selectedData.label}
                      </p>
                    </div>
                  </div>

                  {/* Botón cerrar */}
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="w-10 h-10 rounded-xl bg-white/10
                               hover:bg-white/20 flex items-center justify-center
                               transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Lista de detalles */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedData.detalles.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-5
                                 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white/50" />
                        <p className="text-white text-lg font-medium">
                          {item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
