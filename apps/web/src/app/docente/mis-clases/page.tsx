'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui';
import { useMisClases } from './hooks/useMisClases';
import {
  ClasesFilters,
  ClasesList,
  CancelClaseModal,
} from './components';

/**
 * Mis Clases - Portal Docente v2.0
 *
 * Diseño Premium con:
 * - Agrupación inteligente por fecha
 * - Quick Actions contextuales
 * - Card/List view toggle
 * - Breadcrumbs de navegación
 * - Animaciones fluidas
 * - Información contextual (asistencia, observaciones, materiales)
 */
export default function MisClasesPage() {
  const {
    clasesFiltradas,
    clasesAgrupadas,
    claseACancelar,
    filtroEstado,
    viewMode,
    mostrarClasesPasadas,
    isLoading,
    isLoadingAction,
    error,
    setClaseACancelar,
    setFiltroEstado,
    setViewMode,
    toggleMostrarClasesPasadas,
    handleCancelar,
    handleIniciarClase,
    handleEnviarRecordatorio,
    formatFecha,
    getEstadoColor,
    puedeCancelar,
    puedeRegistrarAsistencia,
  } = useMisClases();

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Mis Clases' }]} />

      {/* Header & Filters */}
      <ClasesFilters
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
        mostrarClasesPasadas={mostrarClasesPasadas}
        toggleMostrarClasesPasadas={toggleMostrarClasesPasadas}
        clasesFiltradas={clasesFiltradas.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-4 border-l-4 border-red-500"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de clases agrupadas */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 dark:border-purple-400 border-t-transparent"></div>
          <p className="text-purple-600 dark:text-purple-300 mt-4 font-semibold">
            Cargando clases...
          </p>
        </motion.div>
      ) : clasesFiltradas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-indigo-900 dark:text-white">No hay clases</h3>
          <p className="text-purple-600 dark:text-purple-300 mt-2 font-medium">
            {filtroEstado === 'Todas'
              ? 'No tienes clases programadas'
              : `No tienes clases con estado "${filtroEstado}"`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Grupo: Hoy */}
          {clasesAgrupadas.hoy.length > 0 && (
            <ClasesList
              title="Hoy"
              icon="🔥"
              clases={clasesAgrupadas.hoy}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
            />
          )}

          {/* Grupo: Próximos 7 días */}
          {clasesAgrupadas.proximosSieteDias.length > 0 && (
            <ClasesList
              title="Próximos 7 días"
              icon="📅"
              clases={clasesAgrupadas.proximosSieteDias}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
            />
          )}

          {/* Grupo: Futuras */}
          {clasesAgrupadas.futuras.length > 0 && (
            <ClasesList
              title="Clases Futuras"
              icon="⏰"
              clases={clasesAgrupadas.futuras}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
            />
          )}

          {/* Grupo: Pasadas (solo si está activado) */}
          {mostrarClasesPasadas && clasesAgrupadas.pasadas.length > 0 && (
            <ClasesList
              title="Clases Pasadas"
              icon="📚"
              clases={clasesAgrupadas.pasadas}
              viewMode={viewMode}
              onIniciarClase={handleIniciarClase}
              onEnviarRecordatorio={handleEnviarRecordatorio}
              onCancelar={(id) => setClaseACancelar(id)}
              puedeCancelar={puedeCancelar}
              puedeRegistrarAsistencia={puedeRegistrarAsistencia}
              getEstadoColor={getEstadoColor}
              formatFecha={formatFecha}
            />
          )}
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      <CancelClaseModal
        isOpen={!!claseACancelar}
        onClose={() => setClaseACancelar(null)}
        onConfirm={() => claseACancelar && handleCancelar(claseACancelar)}
        isLoading={isLoadingAction}
      />
    </div>
  );
}
