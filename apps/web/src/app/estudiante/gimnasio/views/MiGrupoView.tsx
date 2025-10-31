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
            <h2 className="text-3xl font-black text-white mb-2">{nombreGrupo.toUpperCase()}</h2>
            <p className="text-white/70 text-lg font-bold">{clasesAsistidas} clases asistidas</p>
            <p className="text-white/70 text-lg font-bold">🔥 Racha de {rachaActual} días</p>
          </div>
        </motion.div>

        {/* COLUMNA 2: Ranking del grupo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6
                     border-2 border-white/20 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🏆</span>
            <h3 className="text-2xl font-black text-white">RANKING DEL GRUPO</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {companeros.length > 0 ? (
              companeros.slice(0, 10).map((companero, index) => (
                <div
                  key={companero.id}
                  className={`bg-white/5 rounded-xl p-3 border flex items-center justify-between ${
                    companero.id === estudiante.id ? 'border-yellow-400/50 bg-yellow-400/10' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black text-white/60">#{index + 1}</div>
                    <div>
                      <p className="text-white font-bold">
                        {companero.nombre} {companero.apellido}
                        {companero.id === estudiante.id && ' (Tú)'}
                      </p>
                      <p className="text-white/70 text-sm">{companero.puntos.toLocaleString()} pts</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/50 text-center py-8">
                <p>No estás inscrito en ningún grupo</p>
                <p className="text-sm mt-2">Habla con tu tutor para inscribirte</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* COLUMNA 3: Estadísticas del grupo */}
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
                <p className="text-white/70 text-sm mb-1">Puntos totales del grupo</p>
                <p className="text-white font-black text-2xl">
                  {companeros.reduce((sum, c) => sum + c.puntos, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/70 text-sm mb-1">Compañeros en el grupo</p>
                <p className="text-white font-black text-2xl">
                  {companeros.length}
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
