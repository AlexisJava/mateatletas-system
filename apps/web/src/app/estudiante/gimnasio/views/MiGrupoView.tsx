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
  const [companeros, setCompaneros] = useState<
    Array<{ id: string; nombre: string; apellido: string; puntos: number }>
  >([]);
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
  const _clasesAsistidas = dashboard?.stats.clasesAsistidas || 0;
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

      {/* Layout: Lista de compañeros + Stats */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* COLUMNA IZQUIERDA: Lista de compañeros (60%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-[3] bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col min-h-0"
        >
          {/* Header FIJO del grupo */}
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <span className="text-4xl">👥</span>
            <div>
              <h2 className="text-3xl font-black text-white">
                {companeros.length > 0 ? nombreGrupo.toUpperCase() : 'SIN GRUPO'}
              </h2>
              <p className="text-cyan-300 text-sm font-bold">
                {companeros.length} {companeros.length === 1 ? 'compañero' : 'compañeros'} en tu
                grupo
              </p>
            </div>
          </div>

          {/* CONTENEDOR con scroll - LISTA VERTICAL de compañeros */}
          {companeros.length > 0 ? (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
              <div className="flex flex-col gap-3">
                {/* Mostrar TODOS los compañeros */}
                {companeros.map((companero) => {
                  const esTu = companero.id === estudiante.id;
                  return (
                    <div
                      key={companero.id}
                      className={`
                      rounded-2xl p-4 border-2 flex items-center gap-4
                      ${
                        esTu
                          ? 'bg-yellow-400/20 border-yellow-400/60 shadow-lg'
                          : 'bg-white/5 border-white/10'
                      }
                    `}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                        👤
                      </div>

                      {/* Info del compañero */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-black text-lg ${esTu ? 'text-yellow-300' : 'text-white'} truncate`}
                        >
                          {companero.nombre} {companero.apellido}
                        </p>
                        <p className="text-cyan-400 text-xs font-medium">
                          {companero.puntos.toLocaleString()} puntos
                        </p>
                      </div>

                      {/* Badge "TÚ" */}
                      {esTu && (
                        <div className="flex-shrink-0 px-3 py-1 bg-yellow-400/40 text-yellow-200 text-xs font-black rounded-full">
                          TÚ
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/50">
                <div className="text-6xl mb-4">📢</div>
                <p className="text-xl font-bold mb-2">No estás inscrito en ningún grupo</p>
                <p className="text-sm">Habla con tu tutor para unirte a un grupo de estudio</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* COLUMNA DERECHA: Stats del grupo (40%) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-[2] flex flex-col gap-4"
        >
          {/* Card: Puntos del grupo */}
          <div
            className="flex-1 bg-gradient-to-br from-purple-900/60 to-pink-900/60
                          backdrop-blur-xl rounded-3xl p-4
                          border-2 border-white/20 flex flex-col items-center justify-center gap-2"
          >
            <div className="text-4xl">💎</div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-white mb-1">
                {companeros.reduce((sum, c) => sum + c.puntos, 0).toLocaleString()}
              </h3>
              <p className="text-purple-300 text-sm font-bold">PUNTOS DEL GRUPO</p>
              <p className="text-white/60 text-xs mt-1">Entre todos</p>
            </div>
          </div>

          {/* Card: Tus puntos */}
          <div
            className="flex-1 bg-gradient-to-br from-yellow-500/20 to-orange-600/20
                          backdrop-blur-xl rounded-3xl p-4
                          border-2 border-yellow-400/40 flex flex-col items-center justify-center gap-2"
          >
            <div className="text-4xl">🎯</div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-yellow-400 mb-1">
                {misPuntos.toLocaleString()}
              </h3>
              <p className="text-yellow-300 text-sm font-bold">TUS PUNTOS</p>
              <p className="text-white/60 text-xs mt-1">Tu aporte</p>
            </div>
          </div>

          {/* Card: Tu racha */}
          <div
            className="flex-1 bg-gradient-to-br from-orange-600/20 to-red-700/20
                          backdrop-blur-xl rounded-3xl p-4
                          border-2 border-orange-500/40 flex flex-col items-center justify-center gap-2"
          >
            <div className="text-4xl">🔥</div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-orange-400 mb-1">{rachaActual}</h3>
              <p className="text-orange-300 text-sm font-bold">
                {rachaActual === 1 ? 'DÍA' : 'DÍAS'}
              </p>
              <p className="text-white/60 text-xs mt-1">Racha</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
