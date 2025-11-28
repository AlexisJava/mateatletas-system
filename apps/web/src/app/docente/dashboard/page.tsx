'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Users, BookOpen, TrendingUp, Calendar, GraduationCap } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/effects';
import { useAuthStore } from '@/store/auth.store';
import {
  docentesApi,
  ClaseDelDia,
  GrupoResumen,
  EstudianteConFalta,
  StatsResumen,
} from '@/lib/api/docentes.api';

/**
 * Dashboard Docente BRUTAL
 * Información CONCRETA y ACCIONABLE
 * Nada de ambigüedades
 */

export default function DocenteDashboardBrutal() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [clasesHoy, setClasesHoy] = useState<ClaseDelDia[]>([]);
  const [misGrupos, setMisGrupos] = useState<GrupoResumen[]>([]);
  const [, setEstudiantesConFaltas] = useState<EstudianteConFalta[]>([]); // TODO: mostrar en sección de alertas
  const [stats, setStats] = useState<StatsResumen | null>(null);
  const [greeting, setGreeting] = useState('Bienvenido');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  // Fetch data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await docentesApi.getDashboard();
      setClasesHoy(response.clasesHoy);
      setMisGrupos(response.misGrupos);
      setEstudiantesConFaltas(response.estudiantesConFaltas);
      setStats(response.stats);
    } catch (error) {
      console.error('Error al cargar el dashboard:', error);
      toast.error('Error al cargar el dashboard');
      setClasesHoy([]);
      setMisGrupos([]);
      setEstudiantesConFaltas([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getDiaSemanaLabel = (dia: string) => {
    const dias: Record<string, string> = {
      LUNES: 'Lunes',
      MARTES: 'Martes',
      MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves',
      VIERNES: 'Viernes',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
    };
    return dias[dia] || dia;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full px-8 h-full flex flex-col gap-6 overflow-y-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-2">
            {greeting}, {user?.nombre || 'Docente'}! 👋
          </h1>
          <p className="text-purple-300 font-semibold text-base">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </motion.div>

        {/* TU CLASE DE HOY - BRUTAL */}
        {clasesHoy.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-400" />
              TU CLASE DE HOY
            </h2>

            {clasesHoy.map((clase) => (
              <div
                key={clase.id}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">{clase.nombre}</h3>
                    <p className="text-purple-200 font-bold text-base">
                      {clase.hora_inicio} - {clase.hora_fin}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-yellow-300">
                      {clase.estudiantes.length}
                    </p>
                    <p className="text-purple-200 font-bold text-sm">estudiantes</p>
                  </div>
                </div>

                {/* Lista de estudiantes BRUTAL */}
                {clase.estudiantes.length > 0 && (
                  <div>
                    <p className="text-white font-bold mb-3">TUS ESTUDIANTES HOY:</p>
                    <div className="flex flex-wrap gap-2">
                      {clase.estudiantes.map((est) => (
                        <div
                          key={est.id}
                          className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold hover:bg-white/30 transition-all cursor-pointer"
                        >
                          {est.nombre} {est.apellido}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => router.push(`/docente/grupos/${clase.grupo_id}`)}
                  className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black py-3 rounded-xl transition-all hover:scale-[1.02] shadow-lg"
                >
                  VER DETALLES DEL GRUPO
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* TUS 7 GRUPOS - BRUTAL */}
        {misGrupos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-green-400" />
              TUS {misGrupos.length} GRUPOS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {misGrupos.map((grupo) => (
                <motion.div
                  key={grupo.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-green-400/70 hover:bg-white/10 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                  onClick={() => router.push(`/docente/grupos/${grupo.id}`)}
                >
                  <h3 className="text-white font-bold text-base mb-2">{grupo.nombre}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300 font-semibold">
                      {getDiaSemanaLabel(grupo.dia_semana)} {grupo.hora_inicio}
                    </span>
                    <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full font-black">
                      <Users className="w-4 h-4" />
                      {grupo.estudiantesActivos}/{grupo.cupo_maximo}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STATS BRUTALES */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10 shadow-lg hover:bg-white/10 transition-all">
              <Calendar className="w-7 h-7 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{stats.clasesEstaSemana}</p>
              <p className="text-purple-300 font-bold text-sm">Clases Esta Semana</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10 shadow-lg hover:bg-white/10 transition-all">
              <Users className="w-7 h-7 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{stats.estudiantesTotal}</p>
              <p className="text-purple-300 font-bold text-sm">Total Estudiantes</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10 shadow-lg hover:bg-white/10 transition-all">
              <TrendingUp className="w-7 h-7 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{stats.asistenciaPromedio}%</p>
              <p className="text-purple-300 font-bold text-sm">Asistencia Promedio</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center border border-white/10 shadow-lg hover:bg-white/10 transition-all">
              <BookOpen className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{stats.observacionesPendientes}</p>
              <p className="text-purple-300 font-bold text-sm">Observaciones Pendientes</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
