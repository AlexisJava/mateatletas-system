'use client';

import { useState } from 'react';
import { useProgresoLogros } from '@/hooks/useLogros';
import { LogroCard } from './LogroCard';
import { getEmojiCategoria } from '@/lib/utils/gamificacion.utils';
import { motion } from 'framer-motion';

interface ListaLogrosProps {
  estudianteId: string;
}

export function ListaLogros({ estudianteId }: ListaLogrosProps) {
  const { data: progreso, isLoading } = useProgresoLogros(estudianteId);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [soloDesbloqueados, setSoloDesbloqueados] = useState(false);

  if (isLoading || !progreso) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  const categoriasMap = progreso.por_categoria ?? {};
  const categorias = Object.keys(categoriasMap);
  const logrosAMostrar = categoriaActiva
    ? (categoriasMap[categoriaActiva]?.logros ?? [])
    : Object.values(categoriasMap).flatMap((cat) => cat.logros ?? []);

  const logrosFiltrados = soloDesbloqueados
    ? logrosAMostrar.filter((l) => l.logro.desbloqueado)
    : logrosAMostrar;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setCategoriaActiva(null)}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            categoriaActiva === null
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Todos ({progreso.total_logros})
        </button>

        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => setCategoriaActiva(categoria)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              categoriaActiva === categoria
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {getEmojiCategoria(categoria)}{' '}
            {categoria.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} (
            {categoriasMap[categoria]?.desbloqueados ?? 0}/{categoriasMap[categoria]?.total ?? 0})
          </button>
        ))}

        <button
          onClick={() => setSoloDesbloqueados(!soloDesbloqueados)}
          className={`ml-auto px-4 py-2 rounded-xl font-semibold transition-all ${
            soloDesbloqueados
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {soloDesbloqueados ? '✓ ' : ''}Solo desbloqueados
        </button>
      </div>

      {/* Estadísticas */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Tu Progreso</h3>
            <p className="text-white/80">
              Has desbloqueado {progreso.logros_desbloqueados} de {progreso.total_logros} logros
            </p>
          </div>
          <div className="text-6xl font-black">{progreso.porcentaje}%</div>
        </div>
        <div className="mt-4 h-4 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progreso.porcentaje}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Grid de logros */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {logrosFiltrados.map((logro) => (
          <motion.div key={logro.id} layout>
            <LogroCard
              logro={logro.logro}
              desbloqueado={logro.logro.desbloqueado}
              fecha_desbloqueo={logro.fecha_desbloqueo}
            />
          </motion.div>
        ))}
      </motion.div>

      {logrosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay logros para mostrar con estos filtros</p>
        </div>
      )}
    </div>
  );
}
