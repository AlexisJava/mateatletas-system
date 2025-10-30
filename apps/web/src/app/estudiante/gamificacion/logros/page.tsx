'use client';

import { ListaLogros } from '@/components/gamificacion/ListaLogros';
import { useProgresoLogros } from '@/hooks/useLogros';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function LogrosPage() {
  const { user } = useAuthStore();
  const estudianteId = user?.id || '';

  const { data: progreso } = useProgresoLogros(estudianteId);

  if (!user || !estudianteId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 space-y-8">
      {/* Breadcrumb */}
      <Link
        href="/estudiante/gamificacion"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Gamificación
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black text-white mb-2">
          🏆 Colección de Logros
        </h1>
        <p className="text-gray-400">
          Desbloquea todos los logros completando desafíos y entrenando
        </p>
      </motion.div>

      {/* Estadísticas globales */}
      {progreso && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold mb-1">
              {progreso.logros_desbloqueados}
            </div>
            <div className="text-white/80 text-sm">Logros Desbloqueados</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold mb-1">{progreso.porcentaje}%</div>
            <div className="text-white/80 text-sm">Completitud</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-3xl font-bold mb-1">
              {progreso.total_logros - progreso.logros_desbloqueados}
            </div>
            <div className="text-white/80 text-sm">Por Desbloquear</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-6 text-white"
          >
            <div className="text-4xl mb-2">🎭</div>
            <div className="text-3xl font-bold mb-1">
              {Object.values(progreso.por_categoria).reduce(
                (acc, cat) => acc + cat.logros.filter((l) => l.secreto && l.desbloqueado).length,
                0
              )}
            </div>
            <div className="text-white/80 text-sm">Secretos Encontrados</div>
          </motion.div>
        </div>
      )}

      {/* Lista de logros */}
      <ListaLogros estudianteId={estudianteId} />
    </div>
  );
}
