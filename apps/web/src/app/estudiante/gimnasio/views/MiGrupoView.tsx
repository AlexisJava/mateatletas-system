'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificacionApi, type DashboardData } from '@/lib/api/gamificacion.api';

interface MiGrupoViewProps {
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export function MiGrupoView({ estudiante }: MiGrupoViewProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del dashboard (incluye info del equipo)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const data = await gamificacionApi.getDashboard(estudiante.id);
        setDashboard(data);
      } catch (error) {
        console.error('Error al cargar datos del equipo:', error);
      } finally {
        setLoading(false);
      }
    };

    if (estudiante.id) {
      cargarDatos();
    }
  }, [estudiante.id]);

  // Calcular datos del equipo
  const nombreEquipo = dashboard?.estudiante.equipo.nombre || 'Equipo Fénix';
  // const _colorEquipo = dashboard?.estudiante.equipo.color || '#FF6B00'; // TODO: usar para tema del equipo
  const misPuntos = dashboard?.stats.puntosToales || 0;
  const clasesAsistidas = dashboard?.stats.clasesAsistidas || 0;
  const rachaActual = dashboard?.stats.racha || 0;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/60 text-2xl font-bold">Cargando equipo...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl bg-white/20
                       flex items-center justify-center text-3xl"
        >
          🔥
        </div>
        <h1 className="text-5xl font-black text-white font-[family-name:var(--font-lilita)]">
          MI EQUIPO
        </h1>
      </div>

      {/* Grid 3 columnas - LAYOUT HORIZONTAL */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* COLUMNA 1: Info del equipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col items-center justify-center gap-4"
        >
          <div
            className="w-20 h-20 rounded-2xl
                         bg-gradient-to-br from-yellow-400 to-orange-500
                         flex items-center justify-center text-5xl
                         border-4 border-white/30 shadow-xl"
          >
            🔥
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">{nombreEquipo.toUpperCase()}</h2>
            <p className="text-white/70 text-lg font-bold">{clasesAsistidas} clases asistidas</p>
            <p className="text-white/70 text-lg font-bold">🔥 Racha de {rachaActual} días</p>
          </div>
        </motion.div>

        {/* COLUMNA 2: Ranking del equipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🏆</span>
            <h3 className="text-2xl font-black text-white">RANKING DEL EQUIPO</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {dashboard?.equipoRanking && dashboard.equipoRanking.length > 0 ? (
              dashboard.equipoRanking.slice(0, 5).map((miembro: any, index: number) => (
                <div
                  key={miembro.id || index}
                  className={`bg-white/5 rounded-xl p-3 border flex items-center justify-between ${
                    miembro.id === estudiante.id ? 'border-yellow-400/50 bg-yellow-400/10' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black text-white/60">#{index + 1}</div>
                    <div>
                      <p className="text-white font-bold">
                        {miembro.nombre} {miembro.apellido}
                        {miembro.id === estudiante.id && ' (Tú)'}
                      </p>
                      <p className="text-white/70 text-sm">{miembro.puntos?.toLocaleString() || 0} pts</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/50 text-center py-8">
                <p>No hay datos del ranking</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* COLUMNA 3: Estadísticas del equipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">📊</span>
              <h3 className="text-2xl font-black text-white">ESTADÍSTICAS</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/70 text-sm mb-1">Puntos totales del equipo</p>
                <p className="text-white font-black text-2xl">
                  {dashboard?.equipoRanking
                    ?.reduce((sum: number, m: any) => sum + (m.puntos || 0), 0)
                    .toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/70 text-sm mb-1">Integrantes activos</p>
                <p className="text-white font-black text-2xl">
                  {dashboard?.equipoRanking?.length || 0}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/70 text-sm mb-1">Tu racha actual</p>
                <p className="text-white font-black text-2xl">
                  {rachaActual} {rachaActual === 1 ? 'día' : 'días'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Banner inferior: Mis puntos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-blue-900/60 backdrop-blur-xl rounded-2xl px-8 py-4
                   border-2 border-white/20 flex items-center justify-between"
      >
        <p className="text-white text-xl font-bold">🏆 Tus puntos totales</p>
        <div className="text-yellow-400 text-3xl font-black">{misPuntos.toLocaleString()} pts</div>
      </motion.div>
    </div>
  );
}
