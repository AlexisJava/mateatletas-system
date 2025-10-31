'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { gamificacionApi } from '@/lib/api/gamificacion.api';

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

interface MiProgresoViewProps {
  estudiante: {
    id: string;
    nombre: string;
    puntos_totales?: number;
  };
}

export function MiProgresoView({ estudiante }: MiProgresoViewProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos reales del backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar datos en paralelo
        const [dashboard, recursos, racha, logros, progresoLogros] = await Promise.all([
          gamificacionApi.getDashboard(estudiante.id),
          gamificacionApi.obtenerRecursos(estudiante.id),
          gamificacionApi.obtenerRacha(estudiante.id),
          gamificacionApi.obtenerMisLogrosV2(estudiante.id),
          gamificacionApi.obtenerProgresoV2(estudiante.id),
        ]);

        // Calcular días estudiados este mes (aproximación desde asistencias)
        const diasEsteMes = dashboard.stats.clasesAsistidas || 0;

        // Calcular logros desbloqueados
        const logrosDesbloqueados = logros.filter((l) => l.desbloqueado).length;
        const totalLogros = logros.length;

        // Obtener mejor racha
        const mejorRacha = racha.record_personal || racha.dias_consecutivos;

        // Construir estadísticas dinámicas
        const stats: StatData[] = [
          {
            id: 'monedas',
            emoji: '💰',
            value: recursos.monedas.toString(),
            label: 'MONEDAS',
            gradient: 'from-yellow-400 to-orange-500',
            detalles: {
              titulo: 'Tus Monedas',
              items: [
                `Total acumulado: ${recursos.monedas} monedas`,
                `Canjealas por cursos en la tienda`,
                `Gana más monedas completando actividades`,
                `Cada logro te da monedas extra`,
              ],
            },
          },
          {
            id: 'dias',
            emoji: '📅',
            value: diasEsteMes.toString(),
            label: 'CLASES ASISTIDAS',
            gradient: 'from-blue-500 to-cyan-400',
            detalles: {
              titulo: 'Asistencia a Clases',
              items: [
                `Total clases asistidas: ${dashboard.stats.clasesAsistidas}`,
                `Clases totales disponibles: ${dashboard.stats.clasesTotales}`,
                `Asiste regularmente para mantener tu racha`,
                `La asistencia te da puntos automáticos`,
              ],
            },
          },
          {
            id: 'racha',
            emoji: '🔥',
            value: racha.dias_consecutivos.toString(),
            label: 'DÍAS DE RACHA',
            gradient: 'from-orange-500 to-red-600',
            detalles: {
              titulo: 'Racha Actual',
              items: [
                `Racha actual: ${racha.dias_consecutivos} ${racha.dias_consecutivos === 1 ? 'día' : 'días'}`,
                `Mejor racha: ${mejorRacha} ${mejorRacha === 1 ? 'día' : 'días'}`,
                `${racha.dias_consecutivos > 0 ? '¡No pierdas tu racha!' : 'Comienza una racha estudiando hoy'}`,
                `Bonus por racha de 7 días: +100 pts`,
              ],
            },
          },
          {
            id: 'nivel',
            emoji: '⭐',
            value: recursos.nivel.toString(),
            label: 'NIVEL',
            gradient: 'from-purple-500 to-pink-600',
            detalles: {
              titulo: 'Tu Nivel',
              items: [
                `Nivel actual: ${recursos.nivel}`,
                `XP actual: ${recursos.xp} XP`,
                `XP para siguiente nivel: ${recursos.xp_siguiente_nivel} XP`,
                `Falta: ${Math.max(0, recursos.xp_siguiente_nivel - recursos.xp)} XP`,
              ],
            },
          },
          {
            id: 'puntos',
            emoji: '🎯',
            value: dashboard.stats.puntosToales.toLocaleString(),
            label: 'PUNTOS TOTALES',
            gradient: 'from-green-500 to-emerald-600',
            detalles: {
              titulo: 'Puntos Acumulados',
              items: [
                `Total: ${dashboard.stats.puntosToales.toLocaleString()} puntos`,
                `Gana puntos con ejercicios y asistencia`,
                `Compite con tu equipo en el ranking`,
                `Usa puntos para canjear en la tienda`,
              ],
            },
          },
          {
            id: 'logros',
            emoji: '🏆',
            value: `${logrosDesbloqueados}/${totalLogros}`,
            label: 'LOGROS',
            gradient: 'from-amber-500 to-yellow-600',
            detalles: {
              titulo: 'Tus Logros',
              items: [
                `Desbloqueados: ${logrosDesbloqueados}/${totalLogros}`,
                `Progreso: ${progresoLogros.porcentaje.toFixed(0)}%`,
                `${logrosDesbloqueados > 0 ? `Último: ${logros.find((l) => l.desbloqueado)?.nombre || 'N/A'}` : 'Aún no has desbloqueado ninguno'}`,
                `Cada logro te da XP y monedas`,
              ],
            },
          },
        ];

        setStatsData(stats);
      } catch (error) {
        console.error('Error al cargar datos de progreso:', error);
        // Fallback a datos mínimos
        setStatsData([
          {
            id: 'error',
            emoji: '⚠️',
            value: 'Error',
            label: 'NO DISPONIBLE',
            gradient: 'from-red-500 to-red-600',
            detalles: {
              titulo: 'Error al cargar',
              items: ['No se pudieron cargar los datos', 'Intenta recargar la página'],
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (estudiante.id) {
      cargarDatos();
    }
  }, [estudiante.id]);

  const selectedData = statsData.find((s) => s.id === selectedCard);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/60 text-2xl font-bold">Cargando progreso...</div>
      </div>
    );
  }

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
        {statsData.map((stat) => (
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
