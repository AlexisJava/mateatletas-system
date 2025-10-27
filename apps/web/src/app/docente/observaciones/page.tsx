'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getObservacionesDocente, Observacion } from '@/lib/api/asistencia.api';
import { getDashboardDocente, EstudianteConFalta } from '@/lib/api/docentes.api';
import { LoadingSpinner } from '@/components/effects';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  Mail,
  Search,
  Calendar as CalendarIcon,
  User,
  MessageSquare,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function DocenteObservacionesPage() {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [estudiantesConFaltas, setEstudiantesConFaltas] = useState<EstudianteConFalta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [obsData, dashboardData] = await Promise.all([
        getObservacionesDocente({ limit: 100 }),
        getDashboardDocente(),
      ]);
      setObservaciones(obsData);
      setEstudiantesConFaltas(dashboardData.estudiantesConFaltas);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar observaciones
  const observacionesFiltradas = observaciones.filter((obs) => {
    const nombreCompleto = `${obs.estudiante.nombre} ${obs.estudiante.apellido}`.toLowerCase();
    const observacion = obs.observaciones?.toLowerCase() || '';
    const rutaNombre = obs.clase.rutaCurricular.nombre.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchSearch =
      nombreCompleto.includes(search) || observacion.includes(search) || rutaNombre.includes(search);

    const fechaClase = parseISO(obs.clase.fecha_hora_inicio);
    const matchFechaDesde = filtroFechaDesde
      ? fechaClase >= parseISO(filtroFechaDesde)
      : true;
    const matchFechaHasta = filtroFechaHasta
      ? fechaClase <= parseISO(filtroFechaHasta)
      : true;

    return matchSearch && matchFechaDesde && matchFechaHasta;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col gap-6 overflow-y-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Observaciones' }]} />

        {/* Header BRUTAL */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-12 h-12 text-yellow-400" />
            OBSERVACIONES
          </h1>
          <p className="text-purple-300 text-xl font-bold">
            {observacionesFiltradas.length} observaciones registradas
          </p>
        </motion.div>

        {/* ALERTA: ESTUDIANTES CON FALTAS - BRUTAL */}
        {estudiantesConFaltas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-red-400" />
              ESTUDIANTES CON FALTAS - REQUIEREN ATENCIÓN
            </h2>

            <div className="bg-red-900/20 backdrop-blur-md rounded-xl border border-red-400/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-white font-black">ESTUDIANTE</th>
                      <th className="px-4 py-3 text-left text-white font-black">GRUPO</th>
                      <th className="px-4 py-3 text-left text-white font-black">FALTAS</th>
                      <th className="px-4 py-3 text-left text-white font-black">TUTOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantesConFaltas.map((est) => (
                      <tr
                        key={est.id}
                        className="border-t border-red-400/30 hover:bg-red-900/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-white font-semibold">
                          {est.nombre} {est.apellido}
                        </td>
                        <td className="px-4 py-3 text-purple-300">{est.ultimo_grupo}</td>
                        <td className="px-4 py-3">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full font-black text-sm">
                            {est.faltas_consecutivas} faltas
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {est.tutor_email ? (
                            <button
                              onClick={() => window.open(`mailto:${est.tutor_email}`)}
                              className="flex items-center gap-2 text-blue-300 hover:text-blue-200 font-semibold transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              Contactar
                            </button>
                          ) : (
                            <span className="text-gray-400">Sin tutor</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* FILTROS BRUTALES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-white font-bold mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-yellow-400" />
                BUSCAR
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Estudiante, observación, ruta..."
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold"
              />
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-white font-bold mb-2 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-green-400" />
                DESDE
              </label>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-white font-bold mb-2 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                HASTA
              </label>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setFiltroFechaDesde('');
                setFiltroFechaHasta('');
              }}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 rounded-lg transition-all font-bold border border-white/10"
            >
              LIMPIAR FILTROS
            </button>
          </div>
        </motion.div>

        {/* LISTA DE OBSERVACIONES - BRUTAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {observacionesFiltradas.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-12 text-center border border-white/10">
              <MessageSquare className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <p className="text-white text-xl font-black">NO HAY OBSERVACIONES</p>
              <p className="text-purple-300 font-semibold mt-2">
                Las observaciones aparecerán aquí cuando las registres en las clases
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {observacionesFiltradas.map((obs) => (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    {/* Izquierda: Info del estudiante */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Avatar BRUTAL */}
                        {obs.estudiante.foto_url ? (
                          <img
                            src={obs.estudiante.foto_url}
                            alt={obs.estudiante.nombre}
                            className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl border-2 border-yellow-400">
                            {obs.estudiante.nombre.charAt(0)}
                          </div>
                        )}

                        {/* Nombre y fecha */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-white">
                            {obs.estudiante.nombre} {obs.estudiante.apellido}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-purple-300 font-semibold mt-1">
                            <span>
                              📅{' '}
                              {format(parseISO(obs.clase.fecha_hora_inicio), 'dd MMM yyyy', {
                                locale: es,
                              })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: obs.clase.rutaCurricular.color }}
                              />
                              {obs.clase.rutaCurricular.nombre}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Observación BRUTAL */}
                      <div className="bg-yellow-500/20 border-l-4 border-yellow-400 p-4 rounded backdrop-blur-sm">
                        <p className="text-white font-semibold italic text-lg">
                          &quot;{obs.observaciones}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Derecha: Estado */}
                    <div className="ml-6">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-black ${
                          obs.estado === 'Presente'
                            ? 'bg-green-500 text-white'
                            : obs.estado === 'Ausente'
                            ? 'bg-red-500 text-white'
                            : obs.estado === 'Justificado'
                            ? 'bg-blue-500 text-white'
                            : 'bg-yellow-500 text-black'
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
        </motion.div>
      </div>
    </div>
  );
}
