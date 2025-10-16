'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getObservacionesDocente, Observacion } from '@/lib/api/asistencia.api';
import { LoadingSpinner } from '@/components/effects';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export default function DocenteObservacionesPage() {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estudianteId: '',
    fechaDesde: '',
    fechaHasta: '',
    limit: 50,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObservacion, setSelectedObservacion] = useState<Observacion | null>(null);

  // Fetch observaciones
  useEffect(() => {
    fetchObservaciones();
  }, [filtros]);

  const fetchObservaciones = async () => {
    try {
      setIsLoading(true);
      const data = await getObservacionesDocente({
        ...filtros,
        estudianteId: filtros.estudianteId || undefined,
        fechaDesde: filtros.fechaDesde || undefined,
        fechaHasta: filtros.fechaHasta || undefined,
      });
      setObservaciones(data);
    } catch (error) {
      console.error('Error al cargar observaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar observaciones por término de búsqueda
  const observacionesFiltradas = observaciones?.filter((obs) => {
    const nombreCompleto = `${obs.estudiante.nombre} ${obs.estudiante.apellido}`.toLowerCase();
    const observacion = obs.observaciones?.toLowerCase() || '';
    const rutaNombre = obs.clase.rutaCurricular.nombre.toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      nombreCompleto.includes(search) ||
      observacion.includes(search) ||
      rutaNombre.includes(search)
    );
  }) || [];

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estudianteId: '',
      fechaDesde: '',
      fechaHasta: '',
      limit: 50,
    });
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div {...fadeIn}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-indigo-900 dark:text-white">Mis Observaciones</h1>
          <p className="text-purple-600 dark:text-purple-300 mt-1">
            {observacionesFiltradas.length} observaciones registradas
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="glass-card-strong p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del estudiante, observación, ruta..."
                className="w-full px-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                className="w-full px-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                className="w-full px-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 glass-card text-indigo-900 dark:text-white hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              onClick={fetchObservaciones}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
            >
              Aplicar filtros
            </button>
          </div>
        </div>

        {/* Lista de observaciones */}
        <div className="glass-card-strong overflow-hidden">
          {observacionesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-purple-300 dark:text-purple-700 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-indigo-900 dark:text-white text-lg font-semibold">No hay observaciones registradas</p>
              <p className="text-purple-600 dark:text-purple-300 text-sm mt-1">
                Las observaciones aparecerán aquí cuando las registres en las clases
              </p>
            </div>
          ) : (
            <div className="divide-y divide-purple-200/20 dark:divide-purple-700/20">
              {observacionesFiltradas.map((obs) => (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedObservacion(obs)}
                >
                  <div className="flex justify-between items-start">
                    {/* Izquierda: Info del estudiante y observación */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Avatar */}
                        {obs.estudiante.foto_url ? (
                          <img
                            src={obs.estudiante.foto_url}
                            alt={obs.estudiante.nombre}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f7b801] flex items-center justify-center text-white font-bold text-lg">
                            {obs.estudiante.nombre.charAt(0)}
                          </div>
                        )}

                        {/* Nombre y fecha */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-indigo-900 dark:text-white">
                            {obs.estudiante.nombre} {obs.estudiante.apellido}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-purple-600 dark:text-purple-300">
                            <span>
                              📅{' '}
                              {format(parseISO(obs.clase.fecha_hora_inicio), 'dd MMM yyyy', {
                                locale: es,
                              })}
                            </span>
                            <span>•</span>
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: obs.clase.rutaCurricular.color }}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: obs.clase.rutaCurricular.color }}
                              />
                              {obs.clase.rutaCurricular.nombre}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Observación */}
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <p className="text-sm text-gray-700 italic">
                          "{obs.observaciones}"
                        </p>
                      </div>
                    </div>

                    {/* Derecha: Estado */}
                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          obs.estado === 'Presente'
                            ? 'bg-green-100 text-green-800'
                            : obs.estado === 'Ausente'
                            ? 'bg-red-100 text-red-800'
                            : obs.estado === 'Justificado'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {obs.estado}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de observación seleccionada */}
        <AnimatePresence>
          {selectedObservacion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedObservacion(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
              >
                <div className="p-6">
                  {/* Header del modal */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      {selectedObservacion.estudiante.foto_url ? (
                        <img
                          src={selectedObservacion.estudiante.foto_url}
                          alt={selectedObservacion.estudiante.nombre}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f7b801] flex items-center justify-center text-white font-bold text-2xl">
                          {selectedObservacion.estudiante.nombre.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedObservacion.estudiante.nombre}{' '}
                          {selectedObservacion.estudiante.apellido}
                        </h2>
                        <p className="text-gray-600">
                          {format(
                            parseISO(selectedObservacion.clase.fecha_hora_inicio),
                            "EEEE d 'de' MMMM, yyyy",
                            { locale: es }
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedObservacion(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="space-y-4">
                    {/* Ruta curricular */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ruta Curricular
                      </label>
                      <div
                        className="flex items-center gap-2 px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: selectedObservacion.clase.rutaCurricular.color + '20',
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: selectedObservacion.clase.rutaCurricular.color,
                          }}
                        />
                        <span className="font-medium">
                          {selectedObservacion.clase.rutaCurricular.nombre}
                        </span>
                      </div>
                    </div>

                    {/* Estado de asistencia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado de Asistencia
                      </label>
                      <span
                        className={`inline-block px-4 py-2 rounded-lg font-medium ${
                          selectedObservacion.estado === 'Presente'
                            ? 'bg-green-100 text-green-800'
                            : selectedObservacion.estado === 'Ausente'
                            ? 'bg-red-100 text-red-800'
                            : selectedObservacion.estado === 'Justificado'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedObservacion.estado}
                      </span>
                    </div>

                    {/* Observación */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observación
                      </label>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <p className="text-gray-700">{selectedObservacion.observacion}</p>
                      </div>
                    </div>

                    {/* Fecha de registro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registrada el
                      </label>
                      <p className="text-gray-600">
                        {format(
                          parseISO(selectedObservacion.createdAt),
                          "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-6 flex justify-end gap-3">
                    <a
                      href={`/docente/clases/${selectedObservacion.clase_id}/asistencia`}
                      className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors"
                    >
                      Ver clase completa
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
