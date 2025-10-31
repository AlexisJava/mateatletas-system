'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificacionApi, type DashboardData } from '@/lib/api/gamificacion.api';
import { estudiantesApi } from '@/lib/api/estudiantes.api';

interface MiGrupoViewProps {
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export function MiGrupoView({ estudiante }: MiGrupoViewProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [companeros, setCompaneros] = useState<Array<{ id: string; nombre: string; apellido: string; puntos: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del dashboard y compañeros
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [dashboardData, companerosData] = await Promise.all([
          gamificacionApi.getDashboard(estudiante.id),
          estudiantesApi.getMisCompaneros(),
        ]);
        setDashboard(dashboardData);
        setCompaneros(companerosData);
      } catch (error) {
        console.error('Error al cargar datos del grupo:', error);
      } finally {
        setLoading(false);
      }
    };

    if (estudiante.id) {
      cargarDatos();
    }
  }, [estudiante.id]);

  // Calcular datos del grupo
  const nombreGrupo = companeros.length > 0 ? 'Mi Grupo' : 'Sin Grupo';
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

      {/* Grid 2x2 - TODO VISIBLE SIN SCROLL */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6">
        {/* Card 1: Stats del grupo - TOP LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60
                     backdrop-blur-xl rounded-3xl p-8
                     border-2 border-white/20 flex flex-col items-center justify-center gap-6"
        >
          <div className="text-6xl">👥</div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2">
              {companeros.length > 0 ? nombreGrupo.toUpperCase() : 'SIN GRUPO'}
            </h2>
            <p className="text-cyan-300 text-xl font-bold">
              {companeros.length} {companeros.length === 1 ? 'compañero' : 'compañeros'}
            </p>
          </div>
        </motion.div>

        {/* Card 2: Puntos totales del grupo - TOP RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-purple-900/60 to-pink-900/60
                     backdrop-blur-xl rounded-3xl p-8
                     border-2 border-white/20 flex flex-col items-center justify-center gap-6"
        >
          <div className="text-6xl">💎</div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2">
              {companeros.reduce((sum, c) => sum + c.puntos, 0).toLocaleString()}
            </h2>
            <p className="text-purple-300 text-xl font-bold">PUNTOS DEL GRUPO</p>
            <p className="text-white/60 text-sm mt-2">Entre todos acumularon</p>
          </div>
        </motion.div>

        {/* Card 3: Tus puntos - BOTTOM LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20
                     backdrop-blur-xl rounded-3xl p-8
                     border-2 border-yellow-400/40 flex flex-col items-center justify-center gap-6"
        >
          <div className="text-6xl">🎯</div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-yellow-400 mb-2">
              {misPuntos.toLocaleString()}
            </h2>
            <p className="text-yellow-300 text-xl font-bold">TUS PUNTOS</p>
            <p className="text-white/60 text-sm mt-2">Tu aporte al equipo</p>
          </div>
        </motion.div>

        {/* Card 4: Tu racha - BOTTOM RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-orange-600/20 to-red-700/20
                     backdrop-blur-xl rounded-3xl p-8
                     border-2 border-orange-500/40 flex flex-col items-center justify-center gap-6"
        >
          <div className="text-6xl">🔥</div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-orange-400 mb-2">
              {rachaActual}
            </h2>
            <p className="text-orange-300 text-xl font-bold">
              {rachaActual === 1 ? 'DÍA DE RACHA' : 'DÍAS DE RACHA'}
            </p>
            <p className="text-white/60 text-sm mt-2">
              {rachaActual > 0 ? '¡Sigue así!' : 'Empieza hoy tu racha'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Banner: Compañeros si no hay grupo */}
      {companeros.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-900/40 backdrop-blur-xl rounded-2xl px-8 py-6
                     border-2 border-white/20 text-center"
        >
          <p className="text-white text-xl font-bold mb-2">📢 No estás inscrito en ningún grupo</p>
          <p className="text-white/70 text-lg">Habla con tu tutor para unirte a un grupo de estudio</p>
        </motion.div>
      )}
    </div>
  );
}
