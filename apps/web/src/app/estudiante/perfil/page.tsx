'use client';

import { RecursosBar } from '@/components/gamificacion/RecursosBar';
import { RachaWidget } from '@/components/gamificacion/RachaWidget';
import { useRecursos, useHistorialRecursos } from '@/hooks/useRecursos';
import { useLogrosRecientes } from '@/hooks/useLogros';
import { LogroCard } from '@/components/gamificacion/LogroCard';
import { motion } from 'framer-motion';
import { formatearNumero } from '@/lib/utils/gamificacion.utils';
import { useAuthStore } from '@/store/auth.store';
import type { TransaccionRecurso, LogroEstudiante } from '@/types/gamificacion';

export default function PerfilPage() {
  const { user } = useAuthStore();
  const estudianteId = user?.id || '';

  const { data: recursos } = useRecursos(estudianteId);
  const { data: historial } = useHistorialRecursos(estudianteId);
  const { data: logrosRecientes } = useLogrosRecientes(estudianteId, 5);

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
          👤 Mi Perfil
        </h1>
        <p className="text-gray-400">
          Revisa tu progreso, recursos y logros
        </p>
      </motion.div>

      {/* Recursos */}
      <RecursosBar estudianteId={estudianteId} />

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estadísticas rápidas */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-white font-bold text-xl mb-4">
              📊 Tus Estadísticas
            </h2>

            {recursos && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-white">
                    {formatearNumero(recursos?.monedas_total ?? 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Monedas</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <div className="text-2xl font-bold text-white">
                    {formatearNumero(recursos?.xp_total ?? 0)}
                  </div>
                  <div className="text-gray-400 text-sm">XP Total</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-white">
                    {recursos?.nivel ?? 1}
                  </div>
                  <div className="text-gray-400 text-sm">Nivel</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="text-2xl font-bold text-white">
                    {Array.isArray(logrosRecientes) ? logrosRecientes.length : 0}
                  </div>
                  <div className="text-gray-400 text-sm">Logros</div>
                </div>
              </div>
            )}
          </div>

          {/* Historial de transacciones */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-white font-bold text-xl mb-4">
              📜 Historial Reciente
            </h2>

            {historial && Array.isArray(historial) && historial.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historial.slice(0, 20).map((transaccion: TransaccionRecurso) => (
                  <div
                    key={transaccion.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {transaccion.tipo_recurso === 'MONEDAS' ? '💰' : '⚡'}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {transaccion.razon
                            .replace('_', ' ')
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaccion.fecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold text-lg ${
                        transaccion.cantidad > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transaccion.cantidad > 0 ? '+' : ''}
                      {transaccion.cantidad}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No hay transacciones recientes
              </p>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Racha */}
          <RachaWidget estudianteId={estudianteId} />

          {/* Logros recientes */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-white font-bold text-xl mb-4">
              🏆 Logros Recientes
            </h2>

            {logrosRecientes && Array.isArray(logrosRecientes) && logrosRecientes.length > 0 ? (
              <div className="space-y-4">
                {logrosRecientes.map((logroEstudiante: LogroEstudiante) => (
                  <div key={logroEstudiante.id}>
                    <LogroCard
                      logro={logroEstudiante.logro}
                      desbloqueado={true}
                      fecha_desbloqueo={logroEstudiante.fecha_desbloqueo}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Sin logros aún
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
