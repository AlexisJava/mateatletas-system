'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getObservacionesDocente, Observacion } from '@/lib/api/asistencia.api';
import {
  docentesApi,
  type EstudianteTopPuntos,
  type EstudianteAsistenciaPerfecta,
  type EstudianteSinTareas,
  type GrupoRanking,
} from '@/lib/api/docentes.api';
import { LoadingSpinner } from '@/components/effects';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  Mail,
  Search,
  Calendar as CalendarIcon,
  MessageSquare,
  Trophy,
  TrendingUp,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Award,
  Target,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StudentAvatar } from '@/components/ui/StudentAvatar';

interface EstudianteConFalta {
  id: string;
  nombre: string;
  apellido: string;
  faltas_consecutivas: number;
  ultimo_grupo: string;
  tutor_email: string | null;
}

export default function DocenteObservacionesPage() {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [estudiantesConFaltas, setEstudiantesConFaltas] = useState<EstudianteConFalta[]>([]);

  // DATOS REALES del nuevo endpoint
  const [topEstudiantes, setTopEstudiantes] = useState<EstudianteTopPuntos[]>([]);
  const [estudiantesAsistenciaPerfecta, setEstudiantesAsistenciaPerfecta] = useState<
    EstudianteAsistenciaPerfecta[]
  >([]);
  const [estudiantesSinTareas, setEstudiantesSinTareas] = useState<EstudianteSinTareas[]>([]);
  const [rankingGrupos, setRankingGrupos] = useState<GrupoRanking[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  // Stats generales
  const [totalObservaciones, setTotalObservaciones] = useState(0);
  const [totalPresentes, setTotalPresentes] = useState(0);
  const [totalAusentes, setTotalAusentes] = useState(0);
  const [porcentajeAsistencia, setPorcentajeAsistencia] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch observaciones reales
      const obsData = await getObservacionesDocente({ limit: 100 });
      setObservaciones(obsData);

      // Fetch dashboard data (incluye estudiantes con faltas)
      const dashboardData = await docentesApi.getDashboard();
      setEstudiantesConFaltas(dashboardData.estudiantesConFaltas || []);

      // Calcular stats de asistencia
      const presentes = obsData.filter((o) => o.estado === 'Presente').length;
      const ausentes = obsData.filter((o) => o.estado === 'Ausente').length;
      const total = obsData.length;

      setTotalObservaciones(total);
      setTotalPresentes(presentes);
      setTotalAusentes(ausentes);
      setPorcentajeAsistencia(total > 0 ? Math.round((presentes / total) * 100) : 0);

      // ==================== DATOS REALES DEL NUEVO ENDPOINT ====================
      const estadisticasCompletas = await docentesApi.getEstadisticasCompletas();
      setTopEstudiantes(estadisticasCompletas.topEstudiantesPorPuntos);
      setEstudiantesAsistenciaPerfecta(estadisticasCompletas.estudiantesAsistenciaPerfecta);
      setEstudiantesSinTareas(estadisticasCompletas.estudiantesSinTareas);
      setRankingGrupos(estadisticasCompletas.rankingGruposPorPuntos);
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
      nombreCompleto.includes(search) ||
      observacion.includes(search) ||
      rutaNombre.includes(search);

    const fechaClase = parseISO(obs.clase.fecha_hora_inicio);
    const matchFechaDesde = filtroFechaDesde ? fechaClase >= parseISO(filtroFechaDesde) : true;
    const matchFechaHasta = filtroFechaHasta ? fechaClase <= parseISO(filtroFechaHasta) : true;

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-yellow-400" />
            OBSERVACIONES & ESTADÍSTICAS
          </h1>
          <p className="text-purple-300 text-base font-bold">
            Seguimiento completo de tus estudiantes - TODO CON DATOS REALES
          </p>
        </motion.div>

        {/* STATS BRUTALES - 4 CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-4 gap-4"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-7 h-7 text-purple-400" />
              <p className="text-3xl font-black text-white">{totalObservaciones}</p>
            </div>
            <p className="text-purple-300 font-bold text-sm">Total Registros</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-7 h-7 text-green-400" />
              <p className="text-3xl font-black text-white">{totalPresentes}</p>
            </div>
            <p className="text-purple-300 font-bold text-sm">Presentes</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-7 h-7 text-red-400" />
              <p className="text-3xl font-black text-white">{totalAusentes}</p>
            </div>
            <p className="text-purple-300 font-bold text-sm">Ausentes</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-7 h-7 text-blue-400" />
              <p className="text-3xl font-black text-white">{porcentajeAsistencia}%</p>
            </div>
            <p className="text-purple-300 font-bold text-sm">Asistencia Promedio</p>
          </div>
        </motion.div>

        {/* TOP 10 ESTUDIANTES POR PUNTOS - DATOS REALES */}
        {topEstudiantes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              🏆 TOP 10 ESTUDIANTES - RANKING POR PUNTOS (GAMIFICACIÓN)
            </h2>

            <div className="grid grid-cols-5 gap-4">
              {topEstudiantes.slice(0, 10).map((est, idx) => (
                <div
                  key={est.id}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/10 transition-all text-center"
                >
                  {/* Avatar */}
                  <StudentAvatar
                    avatar_url={est.foto_url}
                    nombre={est.nombre}
                    apellido={est.apellido}
                    className="w-16 h-16 mx-auto mb-3 border-3 border-yellow-400"
                  />

                  {/* Rank Badge */}
                  <div className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full font-black text-xs mb-2 inline-block">
                    #{idx + 1}
                  </div>

                  <h3 className="text-white font-bold text-sm mb-2">
                    {est.nombre} {est.apellido}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <Star className="w-4 h-4 text-yellow-300" />
                      <span className="text-white font-semibold">{est.puntos_totales} pts</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-white font-semibold">
                        {est.porcentaje_asistencia}% asist.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ESTUDIANTES CON ASISTENCIA PERFECTA - DATOS REALES */}
        {estudiantesAsistenciaPerfecta.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-400" />✅ ESTUDIANTES CON ASISTENCIA PERFECTA
              (100%)
            </h2>

            <div className="grid grid-cols-5 gap-4">
              {estudiantesAsistenciaPerfecta.map((est) => (
                <div
                  key={est.estudiante_id}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/10 transition-all text-center"
                >
                  <StudentAvatar
                    avatar_url={est.foto_url}
                    nombre={est.nombre}
                    apellido={est.apellido}
                    className="w-16 h-16 mx-auto mb-3 border-3 border-green-400"
                  />

                  <h3 className="text-white font-bold text-sm mb-2">
                    {est.nombre} {est.apellido}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-white font-semibold">
                        {est.presentes}/{est.total_asistencias} clases
                      </span>
                    </div>
                    <div className="text-xs text-purple-300">
                      {est.grupos.map((g) => g.nombre).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ESTUDIANTES SIN TAREAS/PLANIFICACIONES - DATOS REALES */}
        {estudiantesSinTareas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-400" />
              ⚠️ ESTUDIANTES SIN PLANIFICACIONES ASIGNADAS
            </h2>

            <div className="grid grid-cols-6 gap-4">
              {estudiantesSinTareas.map((est) => (
                <div
                  key={est.id}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/10 transition-all text-center"
                >
                  <StudentAvatar
                    avatar_url={est.foto_url}
                    nombre={est.nombre}
                    apellido={est.apellido}
                    className="w-14 h-14 mx-auto mb-2 border-2 border-orange-400"
                  />

                  <h3 className="text-white font-bold text-xs">
                    {est.nombre} {est.apellido}
                  </h3>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* RANKING DE GRUPOS POR PUNTOS - DATOS REALES */}
        {rankingGrupos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              📊 RANKING DE GRUPOS POR PUNTOS TOTALES
            </h2>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-white/5 backdrop-blur-xl">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-bold text-sm">#</th>
                    <th className="px-4 py-3 text-left text-white font-bold text-sm">GRUPO</th>
                    <th className="px-4 py-3 text-center text-white font-bold text-sm">
                      ESTUDIANTES
                    </th>
                    <th className="px-4 py-3 text-center text-white font-bold text-sm">
                      PUNTOS TOTALES
                    </th>
                    <th className="px-4 py-3 text-center text-white font-bold text-sm">
                      ASISTENCIA %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankingGrupos.map((grupo, idx) => (
                    <tr
                      key={grupo.grupo_id}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`font-black text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-white'}`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-bold text-sm">{grupo.nombre}</p>
                          <p className="text-purple-300 text-xs">{grupo.codigo}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white font-semibold text-sm">
                          {grupo.estudiantes_activos}/{grupo.cupo_maximo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-black text-sm">
                          {grupo.puntos_totales} pts
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-sm ${
                            grupo.asistencia_promedio >= 80
                              ? 'bg-green-600 text-white'
                              : grupo.asistencia_promedio >= 60
                                ? 'bg-yellow-600 text-white'
                                : 'bg-red-600 text-white'
                          }`}
                        >
                          {grupo.asistencia_promedio}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ALERTA: ESTUDIANTES CON FALTAS - DATOS REALES */}
        {estudiantesConFaltas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              ⚠️ ESTUDIANTES CON FALTAS - REQUIEREN ATENCIÓN
            </h2>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 backdrop-blur-xl">
                    <tr>
                      <th className="px-4 py-3 text-left text-white font-bold text-sm">
                        ESTUDIANTE
                      </th>
                      <th className="px-4 py-3 text-left text-white font-bold text-sm">GRUPO</th>
                      <th className="px-4 py-3 text-left text-white font-bold text-sm">FALTAS</th>
                      <th className="px-4 py-3 text-left text-white font-bold text-sm">TUTOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantesConFaltas.map((est) => (
                      <tr
                        key={est.id}
                        className="border-t border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-white font-semibold text-sm">
                          {est.nombre} {est.apellido}
                        </td>
                        <td className="px-4 py-3 text-purple-300 text-sm">{est.ultimo_grupo}</td>
                        <td className="px-4 py-3">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs">
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
          transition={{ delay: 0.35 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-lg"
        >
          <h2 className="text-lg font-black text-white mb-4">🔍 FILTROS DE BÚSQUEDA</h2>

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
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all font-bold shadow-lg"
            >
              RECARGAR DATOS
            </button>
          </div>
        </motion.div>

        {/* LISTA DE OBSERVACIONES - DATOS REALES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            📝 HISTORIAL DE OBSERVACIONES ({observacionesFiltradas.length})
          </h2>

          {observacionesFiltradas.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-12 text-center border border-white/10 shadow-lg">
              <MessageSquare className="w-12 h-12 mx-auto text-purple-400 mb-4" />
              <p className="text-white text-lg font-black">NO HAY OBSERVACIONES</p>
              <p className="text-purple-300 font-semibold text-sm mt-2">
                {searchTerm || filtroFechaDesde || filtroFechaHasta
                  ? 'No se encontraron observaciones con los filtros aplicados'
                  : 'Las observaciones aparecerán aquí cuando las registres en las clases'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {observacionesFiltradas.map((obs) => (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    {/* Izquierda: Info del estudiante */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        {/* Avatar */}
                        <StudentAvatar
                          avatar_url={obs.estudiante.foto_url}
                          nombre={obs.estudiante.nombre}
                          apellido={obs.estudiante.apellido}
                          className="w-12 h-12 border-2 border-yellow-400"
                        />

                        {/* Nombre y fecha */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">
                            {obs.estudiante.nombre} {obs.estudiante.apellido}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-purple-300 font-semibold mt-1">
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

                      {/* Observación */}
                      {obs.observaciones && (
                        <div className="bg-white/5 backdrop-blur-xl border-l-4 border-yellow-400 p-3 rounded">
                          <p className="text-white font-semibold italic text-sm">
                            &quot;{obs.observaciones}&quot;
                          </p>
                        </div>
                      )}
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
