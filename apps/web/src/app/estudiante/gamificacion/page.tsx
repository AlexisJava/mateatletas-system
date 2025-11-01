'use client';

import { RecursosBar } from '@/components/gamificacion/RecursosBar';
import { RachaWidget } from '@/components/gamificacion/RachaWidget';
import { ListaLogros } from '@/components/gamificacion/ListaLogros';
import { useLogrosRecientes } from '@/hooks/useLogros';
import { LogroCard } from '@/components/gamificacion/LogroCard';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function GamificacionPage() {
  const { user } = useAuthStore();
  const estudianteId = user?.id || '';

  const { data: logrosRecientes } = useLogrosRecientes(estudianteId, 3);

  if (!user || !estudianteId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black text-white mb-2">
          🏆 Tu Gamificación
        </h1>
        <p className="text-gray-400">
          Completa ejercicios, desbloquea logros y canjea cursos increíbles
        </p>
      </motion.div>

      {/* Recursos Bar */}
      <RecursosBar estudianteId={estudianteId} />

      {/* Grid de widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Racha */}
        <div className="lg:col-span-1">
          <RachaWidget estudianteId={estudianteId} />
        </div>

        {/* Logros recientes */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">
                🎉 Logros Recientes
              </h2>
              <Link
                href="/estudiante/gamificacion/logros"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
              >
                Ver todos →
              </Link>
            </div>

            {logrosRecientes && Array.isArray(logrosRecientes) && logrosRecientes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {logrosRecientes.map((logroEstudiante) => {
                  if (!logroEstudiante.logro) {
                    return null;
                  }
                  const fecha = logroEstudiante.fecha_desbloqueo
                    ? new Date(logroEstudiante.fecha_desbloqueo)
                    : null;
                  return (
                    <LogroCard
                      key={logroEstudiante.id}
                      logro={logroEstudiante.logro}
                      desbloqueado={true}
                      fecha_desbloqueo={fecha}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  Aún no has desbloqueado ningún logro
                </p>
                <Link
                  href="/estudiante/gimnasio"
                  className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  ¡Empieza a entrenar!
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA a tienda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white text-center"
      >
        <h2 className="text-3xl font-black mb-2">
          🎁 ¿Listo para canjear?
        </h2>
        <p className="text-white/90 mb-6">
          Usa tus monedas para desbloquear cursos increíbles de ciencia,
          programación, robótica y más
        </p>
        <Link
          href="/estudiante/gimnasio"
          className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl"
        >
          Ir al Hub 🎮
        </Link>
      </motion.div>

      {/* Todos los logros */}
      <div>
        <h2 className="text-white font-bold text-2xl mb-6">
          🎯 Todos los Logros
        </h2>
        <ListaLogros estudianteId={estudianteId} />
      </div>
    </div>
  );
}
