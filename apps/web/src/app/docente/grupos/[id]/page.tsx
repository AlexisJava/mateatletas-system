'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import apiClient from '@/lib/axios';
import { LoadingSpinner } from '@/components/effects';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Star,
  Target,
  Video,
  TrendingUp,
} from 'lucide-react';

/**
 * T035 - Panel Detallado de Grupo (Vista Docente)
 * DISEÑO GLASSMORPHISM - Estilo Portal Docente
 */

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  avatar_url: string;
  equipo: {
    nombre: string;
    color: string;
  };
  estadisticas: {
    puntosToales: number; // typo intencional para mantener consistencia con mock
    clasesAsistidas: number;
    racha: number;
    nivelActual: number;
    participacion: number;
  };
}

interface Grupo {
  id: string;
  nombre: string;
  ruta_curricular: {
    nombre: string;
    color: string;
  };
  cupo_maximo: number;
  estudiantes: Estudiante[];
  estadisticasGrupo: {
    totalEstudiantes: number;
    asistenciaPromedio: number;
    puntosPromedio: number;
    participacionPromedio: number;
  };
}

export default function GrupoDetalladoPage() {
  const params = useParams();
  const router = useRouter();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'puntos' | 'asistencia' | 'participacion'>('nombre');

  const grupoId = params.id as string;

  useEffect(() => {
    const fetchGrupo = async () => {
      try {
        const response = await apiClient.get(`/grupos/${grupoId}`);
        setGrupo(response.data);
      } catch (error: any) {
        // Mock data
        const mockGrupo: Grupo = {
          id: grupoId,
          nombre: 'Grupo Alfa',
          ruta_curricular: {
            nombre: 'Álgebra Básica',
            color: '#8B5CF6'
          },
          cupo_maximo: 15,
          estudiantes: [
            {
              id: '1',
              nombre: 'Ana',
              apellido: 'García',
              email: 'ana@example.com',
              avatar_url: 'avataaars',
              equipo: { nombre: 'Equipo Rojo', color: '#EF4444' },
              estadisticas: {
                puntosToales: 850,
                clasesAsistidas: 12,
                racha: 5,
                nivelActual: 4,
                participacion: 92
              }
            },
            {
              id: '2',
              nombre: 'Carlos',
              apellido: 'López',
              email: 'carlos@example.com',
              avatar_url: 'bottts',
              equipo: { nombre: 'Equipo Azul', color: '#3B82F6' },
              estadisticas: {
                puntosToales: 720,
                clasesAsistidas: 11,
                racha: 3,
                nivelActual: 3,
                participacion: 85
              }
            },
            {
              id: '3',
              nombre: 'María',
              apellido: 'Rodríguez',
              email: 'maria@example.com',
              avatar_url: 'personas',
              equipo: { nombre: 'Equipo Verde', color: '#10B981' },
              estadisticas: {
                puntosToales: 950,
                clasesAsistidas: 13,
                racha: 7,
                nivelActual: 5,
                participacion: 95
              }
            },
            {
              id: '4',
              nombre: 'Juan',
              apellido: 'Martínez',
              email: 'juan@example.com',
              avatar_url: 'micah',
              equipo: { nombre: 'Equipo Amarillo', color: '#F59E0B' },
              estadisticas: {
                puntosToales: 680,
                clasesAsistidas: 10,
                racha: 2,
                nivelActual: 3,
                participacion: 78
              }
            },
            {
              id: '5',
              nombre: 'Laura',
              apellido: 'Fernández',
              email: 'laura@example.com',
              avatar_url: 'lorelei',
              equipo: { nombre: 'Equipo Rojo', color: '#EF4444' },
              estadisticas: {
                puntosToales: 810,
                clasesAsistidas: 12,
                racha: 4,
                nivelActual: 4,
                participacion: 88
              }
            }
          ],
          estadisticasGrupo: {
            totalEstudiantes: 5,
            asistenciaPromedio: 92,
            puntosPromedio: 802,
            participacionPromedio: 87.6
          }
        };
        setGrupo(mockGrupo);
      } finally {
        setIsLoading(false);
      }
    };

    if (grupoId) {
      fetchGrupo();
    }
  }, [grupoId]);

  const estudiantesOrdenados = grupo ? [...grupo.estudiantes].sort((a, b) => {
    switch (ordenarPor) {
      case 'puntos':
        return b.estadisticas.puntosToales - a.estadisticas.puntosToales;
      case 'asistencia':
        return b.estadisticas.clasesAsistidas - a.estadisticas.clasesAsistidas;
      case 'participacion':
        return b.estadisticas.participacion - a.estadisticas.participacion;
      case 'nombre':
      default:
        return a.nombre.localeCompare(b.nombre);
    }
  }) : [];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <LoadingSpinner size="lg" text="Cargando grupo..." />
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="glass-card-padded text-center">
          <h1 className="text-3xl font-bold text-indigo-900 dark:text-white mb-4">Grupo no encontrado</h1>
          <button
            onClick={() => router.push('/docente/dashboard')}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-4 overflow-hidden">

        {/* HEADER ÉPICO 10X - Glassmorphism Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex-shrink-0"
        >
          {/* Botón volver - Más elegante */}
          <motion.div
            className="mb-4"
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <button
              onClick={() => router.push('/docente/dashboard')}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-300 hover:text-indigo-900 dark:hover:text-white transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 group-hover:bg-purple-200/80 dark:group-hover:bg-purple-800/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Volver al Dashboard</span>
            </button>
          </motion.div>

          <div className="flex items-center gap-4 mb-5">
            {/* Icono del grupo - Con animación de pulso */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/60">
                <Users className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Info del grupo - Typography mejorada */}
            <div className="flex-1">
              <motion.h1
                className="text-3xl font-black text-indigo-900 dark:text-white bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {grupo.nombre}
              </motion.h1>
              <motion.div
                className="flex items-center gap-2 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                <p className="text-sm text-purple-600 dark:text-purple-300 font-bold">
                  {grupo.ruta_curricular.nombre}
                </p>
              </motion.div>
            </div>

            {/* Badge de cupo - Más destacado */}
            <motion.div
              className="glass-card-strong p-4"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <div className="text-xs text-purple-600 dark:text-purple-300 font-black uppercase tracking-wide">Estudiantes</div>
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {grupo.estudiantes.length}<span className="text-lg text-purple-400 dark:text-purple-500">/{grupo.cupo_maximo}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid - Cards con efectos premium */}
          <div className="grid grid-cols-4 gap-3">
            {/* Card 1 - Total Estudiantes */}
            <motion.div
              className="glass-card p-4 text-center group cursor-default relative overflow-hidden"
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-purple-500/50 group-hover:shadow-2xl group-hover:shadow-purple-500/70 transition-shadow">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-black text-indigo-900 dark:text-white mb-0.5">{grupo.estadisticasGrupo.totalEstudiantes}</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase tracking-wide">Total</div>
              </div>
            </motion.div>

            {/* Card 2 - Asistencia */}
            <motion.div
              className="glass-card p-4 text-center group cursor-default relative overflow-hidden"
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-green-500/50 group-hover:shadow-2xl group-hover:shadow-green-500/70 transition-shadow">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-0.5">{grupo.estadisticasGrupo.asistenciaPromedio}%</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase tracking-wide">Asistencia</div>
              </div>
            </motion.div>

            {/* Card 3 - Puntos */}
            <motion.div
              className="glass-card p-4 text-center group cursor-default relative overflow-hidden"
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-yellow-500/50 group-hover:shadow-2xl group-hover:shadow-yellow-500/70 transition-shadow">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-0.5">{grupo.estadisticasGrupo.puntosPromedio}</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase tracking-wide">Puntos Prom</div>
              </div>
            </motion.div>

            {/* Card 4 - Participación */}
            <motion.div
              className="glass-card p-4 text-center group cursor-default relative overflow-hidden"
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-pink-500/50 group-hover:shadow-2xl group-hover:shadow-pink-500/70 transition-shadow">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-black text-pink-600 dark:text-pink-400 mb-0.5">{grupo.estadisticasGrupo.participacionPromedio.toFixed(0)}%</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold uppercase tracking-wide">Participación</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* LISTA DE ESTUDIANTES - Cards finas horizontales */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Controles de ordenamiento - Más compactos */}
          <div className="flex items-center justify-between flex-shrink-0">
            <h2 className="text-base font-bold text-indigo-900 dark:text-white">
              Estudiantes ({grupo.estudiantes.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setOrdenarPor('nombre')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  ordenarPor === 'nombre'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                    : 'text-purple-600 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
                }`}
              >
                Nombre
              </button>
              <button
                onClick={() => setOrdenarPor('puntos')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  ordenarPor === 'puntos'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/40'
                    : 'text-purple-600 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
                }`}
              >
                Puntos
              </button>
              <button
                onClick={() => setOrdenarPor('participacion')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  ordenarPor === 'participacion'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/40'
                    : 'text-purple-600 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
                }`}
              >
                Particip
              </button>
            </div>
          </div>

          {/* Lista de estudiantes - Scroll interno si es necesario */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {estudiantesOrdenados.map((estudiante, index) => {
              const participacionColor =
                estudiante.estadisticas.participacion >= 90
                  ? 'text-green-600 dark:text-green-400'
                  : estudiante.estadisticas.participacion >= 75
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-orange-600 dark:text-orange-400';

              return (
                <motion.div
                  key={estudiante.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * index }}
                  className="glass-card p-3 hover-lift cursor-pointer"
                  onClick={() => router.push(`/docente/estudiantes/${estudiante.id}`)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar + Info básica - IZQUIERDA */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50">
                          <img
                            src={`https://api.dicebear.com/7.x/${estudiante.avatar_url}/svg?seed=${estudiante.id}`}
                            alt={estudiante.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white dark:border-indigo-950 shadow-md"
                          style={{ backgroundColor: estudiante.equipo.color }}
                        >
                          {estudiante.estadisticas.nivelActual}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-900 dark:text-white truncate">
                          {estudiante.nombre} {estudiante.apellido}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: estudiante.equipo.color }}
                          />
                          <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold truncate">
                            {estudiante.equipo.nombre}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats compactas - DERECHA */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Puntos */}
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-0.5">
                          <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold">Pts</span>
                        </div>
                        <div className="text-base font-black text-indigo-900 dark:text-white">{estudiante.estadisticas.puntosToales}</div>
                      </div>

                      <div className="w-px h-8 bg-purple-200/30 dark:bg-purple-700/30"></div>

                      {/* Clases */}
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-0.5">
                          <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold">Clases</span>
                        </div>
                        <div className="text-base font-black text-indigo-900 dark:text-white">{estudiante.estadisticas.clasesAsistidas}</div>
                      </div>

                      <div className="w-px h-8 bg-purple-200/30 dark:bg-purple-700/30"></div>

                      {/* Racha */}
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-0.5">
                          <TrendingUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold">Racha</span>
                        </div>
                        <div className="text-base font-black text-indigo-900 dark:text-white">{estudiante.estadisticas.racha}🔥</div>
                      </div>

                      <div className="w-px h-8 bg-purple-200/30 dark:bg-purple-700/30"></div>

                      {/* Participación */}
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-0.5">
                          <Target className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs text-purple-600 dark:text-purple-300 font-semibold">Part</span>
                        </div>
                        <div className={`text-base font-black ${participacionColor}`}>
                          {estudiante.estadisticas.participacion}%
                        </div>
                      </div>

                      {/* Flecha indicadora */}
                      <div className="ml-2">
                        <ArrowLeft className="w-4 h-4 text-purple-400 dark:text-purple-500 rotate-180" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* BOTÓN INICIAR CLASE - Compacto */}
        <div className="flex-shrink-0">
          <button
            onClick={() => alert('Funcionalidad próximamente: Iniciar clase en vivo')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span className="text-sm">Iniciar Clase en Vivo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
