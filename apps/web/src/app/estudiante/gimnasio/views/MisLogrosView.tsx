'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock } from 'lucide-react';
import { gamificacionApi, type Logro } from '@/lib/api/gamificacion.api';
import { useOverlayStack } from '../contexts/OverlayStackProvider';

interface MisLogrosViewProps {
  estudiante: {
    id: string;
    nombre: string;
  };
}

export function MisLogrosView({ estudiante }: MisLogrosViewProps) {
  const { pop } = useOverlayStack();
  const [logros, setLogros] = useState<Logro[]>([]);
  const [logroSeleccionado, setLogroSeleccionado] = useState<Logro | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'desbloqueados' | 'bloqueados'>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarLogros = async () => {
      try {
        setLoading(true);
        const data = await gamificacionApi.getLogros(estudiante.id);
        setLogros(data);
      } catch (error) {
        console.error('Error cargando logros:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarLogros();
  }, [estudiante.id]);

  const logrosFiltrados = logros.filter((logro) => {
    if (filtro === 'desbloqueados') return logro.desbloqueado;
    if (filtro === 'bloqueados') return !logro.desbloqueado;
    return true;
  });

  const totalDesbloqueados = logros.filter((l) => l.desbloqueado).length;
  const porcentajeCompletitud =
    logros.length > 0 ? Math.round((totalDesbloqueados / logros.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">MIS LOGROS</h1>
            <p className="text-sm text-white/60">
              {totalDesbloqueados} de {logros.length} desbloqueados ({porcentajeCompletitud}%)
            </p>
          </div>
        </div>
        <button
          onClick={pop}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 p-4 bg-black/10">
        {(['todos', 'desbloqueados', 'bloqueados'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
              filtro === f
                ? 'bg-white text-purple-900 shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {f === 'todos' && `Todos (${logros.length})`}
            {f === 'desbloqueados' && `Desbloqueados (${totalDesbloqueados})`}
            {f === 'bloqueados' && `Bloqueados (${logros.length - totalDesbloqueados})`}
          </button>
        ))}
      </div>

      {/* Grid de Logros */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Cargando logros...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {logrosFiltrados.map((logro) => (
              <LogroCard key={logro.id} logro={logro} onClick={() => setLogroSeleccionado(logro)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <AnimatePresence>
        {logroSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLogroSeleccionado(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-6 border-4 border-white/20 shadow-2xl"
            >
              <button
                onClick={() => setLogroSeleccionado(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="text-center space-y-4">
                <div
                  className={`text-7xl ${logroSeleccionado.desbloqueado ? '' : 'opacity-40 grayscale'}`}
                >
                  {logroSeleccionado.icono}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    {logroSeleccionado.nombre}
                  </h2>
                  <p className="text-white/70">{logroSeleccionado.descripcion}</p>
                </div>

                <div className="flex items-center justify-center gap-2 p-3 bg-white/10 rounded-xl">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-white">{logroSeleccionado.puntos} puntos</span>
                </div>

                {logroSeleccionado.desbloqueado && logroSeleccionado.fecha_desbloqueo && (
                  <div className="text-sm text-white/60">
                    Desbloqueado el{' '}
                    {new Date(logroSeleccionado.fecha_desbloqueo).toLocaleDateString('es-ES')}
                  </div>
                )}

                {!logroSeleccionado.desbloqueado && (
                  <div className="flex items-center gap-2 justify-center text-white/60 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Aún no desbloqueado</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LogroCardProps {
  logro: Logro;
  onClick: () => void;
}

function LogroCard({ logro, onClick }: LogroCardProps) {
  const categoriaColors: Record<string, string> = {
    inicio: 'from-green-500 to-emerald-600',
    asistencia: 'from-blue-500 to-cyan-600',
    progreso: 'from-orange-500 to-red-600',
    maestria: 'from-purple-500 to-pink-600',
    social: 'from-yellow-400 to-orange-500',
    racha: 'from-red-500 to-orange-600',
    elite: 'from-yellow-300 to-yellow-500',
  };

  const gradient = categoriaColors[logro.categoria] || 'from-gray-500 to-gray-600';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} border-4 border-white/20 shadow-xl transition-all ${
        !logro.desbloqueado ? 'opacity-60 grayscale' : ''
      }`}
    >
      {!logro.desbloqueado && (
        <div className="absolute top-2 right-2">
          <Lock className="w-5 h-5 text-white/80" />
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="text-5xl">{logro.icono}</div>
        <div>
          <h3 className="font-black text-white text-lg leading-tight">{logro.nombre}</h3>
          <p className="text-xs text-white/70 mt-1 line-clamp-2">{logro.descripcion}</p>
        </div>
        <div className="flex items-center justify-center gap-1 text-sm">
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span className="font-bold text-white">{logro.puntos}</span>
        </div>
      </div>

      {logro.desbloqueado && (
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
          <span className="text-white text-xl">✓</span>
        </div>
      )}
    </motion.button>
  );
}
