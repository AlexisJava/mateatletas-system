import { motion } from 'framer-motion';
import { Sparkles, LayoutGrid, List } from 'lucide-react';
import { ESTADO_CLASE, type EstadoClase } from '@/types/clases.types';
import { ViewMode } from '../hooks/useMisClases';

interface ClasesFiltersProps {
  filtroEstado: EstadoClase | 'Todas';
  setFiltroEstado: (estado: EstadoClase | 'Todas') => void;
  mostrarClasesPasadas: boolean;
  toggleMostrarClasesPasadas: () => void;
  clasesFiltradas: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function ClasesFilters({
  filtroEstado,
  setFiltroEstado,
  mostrarClasesPasadas,
  toggleMostrarClasesPasadas,
  clasesFiltradas,
  viewMode,
  setViewMode,
}: ClasesFiltersProps) {
  return (
    <>
      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-indigo-900 dark:text-white">Mis Clases</h1>
          <p className="text-purple-600 dark:text-purple-300 mt-1 font-medium">
            Gestiona y organiza todas tus clases
          </p>
        </div>

        <div className="flex items-center gap-2 glass-card p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
              viewMode === 'card'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                : 'text-indigo-900 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                : 'text-indigo-900 dark:text-purple-200 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </motion.div>

      {/* Filtros y controles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filtro por estado */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-bold text-indigo-900 dark:text-white">
              Filtrar:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoClase | 'Todas')}
              className="px-4 py-2 bg-white/60 dark:bg-indigo-900/60 border border-purple-200/50 dark:border-purple-700/50 rounded-xl text-sm font-semibold text-indigo-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Todas">Todas las clases</option>
              <option value={ESTADO_CLASE.Programada}>Programadas</option>
              <option value={ESTADO_CLASE.Cancelada}>Canceladas</option>
            </select>
          </div>

          {/* Toggle clases pasadas */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={mostrarClasesPasadas}
              onChange={toggleMostrarClasesPasadas}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <span className="text-sm font-semibold text-indigo-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              Mostrar clases pasadas
            </span>
          </label>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300 font-semibold">
          <Sparkles className="w-4 h-4" />
          {clasesFiltradas} clase(s) encontrada(s)
        </div>
      </motion.div>
    </>
  );
}
