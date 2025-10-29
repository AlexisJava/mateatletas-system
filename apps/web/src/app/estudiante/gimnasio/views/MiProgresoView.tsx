'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

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
  const [showHint, setShowHint] = useState(true);

  const selectedData = STATS_DATA.find(s => s.id === selectedCard);

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    setShowHint(false);
  };

  return (
    <div className="w-full h-full p-8 flex flex-col">

      {/* Header fijo */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20
                         flex items-center justify-center text-3xl">
            📊
          </div>
          <h1 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
            MI PROGRESO
          </h1>
        </div>

        {/* Hint inicial */}
        <AnimatePresence>
          {showHint && !selectedCard && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm
                         px-6 py-3 rounded-2xl border-2 border-white/20"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl"
              >
                👆
              </motion.div>
              <p className="text-white text-lg font-bold">
                ¡Toca una card para ver más!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Layout con CSS Grid puro - SIN Framer Motion layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">

        {/* COLUMNA CARDS - CSS Grid nativo */}
        <div
          className={`
            grid gap-4
            transition-all duration-300 ease-out
            ${selectedCard
              ? 'grid-cols-2 w-[30%]'
              : 'grid-cols-3 grid-rows-2 flex-1'
            }
          `}
        >
          {STATS_DATA.map((stat) => (
            <button
              key={stat.id}
              onClick={() => handleCardClick(stat.id)}
              className={`
                bg-gradient-to-br ${stat.gradient}
                rounded-3xl p-6
                flex flex-col items-center justify-center
                shadow-xl
                border-4
                transition-all duration-300 ease-out
                hover:scale-105 active:scale-95
                ${selectedCard === stat.id
                  ? 'border-white ring-4 ring-white/50'
                  : 'border-white/20'
                }
              `}
            >
              {/* Emoji */}
              <div className={`
                transition-all duration-300 ease-out
                ${selectedCard ? 'text-4xl' : 'text-6xl'}
              `}>
                {stat.emoji}
              </div>

              {/* Valor */}
              <div className={`
                font-black text-white
                transition-all duration-300 ease-out
                ${selectedCard ? 'text-3xl mt-2' : 'text-5xl mt-4'}
              `}>
                {stat.value}
              </div>

              {/* Label */}
              <div className={`
                font-bold text-white/80 uppercase text-center
                transition-all duration-300 ease-out
                ${selectedCard ? 'text-xs mt-1' : 'text-lg mt-2'}
              `}>
                {stat.label}
              </div>
            </button>
          ))}
        </div>

        {/* COLUMNA DERECHA - Panel de detalle */}
        <AnimatePresence mode="wait">
          {selectedCard && selectedData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 bg-white/10 backdrop-blur-xl
                         rounded-3xl p-8 border-2 border-white/20
                         flex flex-col"
            >
              {/* Header del panel */}
              <div className="flex items-center justify-between mb-8">
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
                    <h2 className="text-4xl font-black text-white">
                      {selectedData.detalles.titulo}
                    </h2>
                    <p className="text-xl text-white/70 font-bold">
                      {selectedData.label}
                    </p>
                  </div>
                </div>

                {/* Botón cerrar panel */}
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-12 h-12 rounded-xl bg-white/10
                             hover:bg-white/20 flex items-center justify-center
                             transition-all hover:scale-110 active:scale-90"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Lista de detalles */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {selectedData.detalles.items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6
                               border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/50" />
                      <p className="text-white text-xl font-medium">
                        {item}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
