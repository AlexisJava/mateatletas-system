'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Star,
  Clock,
  TrendingUp,
  Calendar,
  MessageSquare,
  Target,
  Award,
  ThumbsUp,
  AlertCircle,
  Minus,
  ClipboardList,
  UserCheck,
  Trophy,
  Flame,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/effects';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { toast } from '@/components/ui/Toast';
import {
  obtenerDetalleCompletoGrupo,
  type GrupoDetalleCompletoDto,
  type EstudianteConStatsDto,
  type ObservacionRecienteDto,
} from '@/lib/api/clase-grupos.api';
import TomarAsistenciaModal from './components/TomarAsistenciaModal';
import AgregarObservacionModal from './components/AgregarObservacionModal';
import AsignarPuntosModal from './components/AsignarPuntosModal';
import { StudentAvatar } from '@/components/ui/StudentAvatar';

/**
 * PÁGINA BRUTAL DE DETALLE DE GRUPO - Portal Docente
 * TODO lo que el docente necesita en UN SOLO LUGAR
 *
 * Incluye:
 * - Stats del grupo en tiempo real
 * - Lista de estudiantes con estadísticas individuales
 * - Observaciones recientes clasificadas
 * - Próxima clase con countdown
 * - Botón para tomar asistencia batch
 * - Botón para agregar observaciones
 * - Botón para asignar puntos
 */

export default function GrupoDetalleCompletoPage() {
  const params = useParams();
  const router = useRouter();
  const [grupo, setGrupo] = useState<GrupoDetalleCompletoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ordenarPor, setOrdenarPor] = useState<
    'nombre' | 'puntos' | 'asistencia' | 'clases'
  >('nombre');
  const [mostrarModalAsistencia, setMostrarModalAsistencia] = useState(false);
  const [mostrarModalObservacion, setMostrarModalObservacion] = useState(false);
  const [mostrarModalPuntos, setMostrarModalPuntos] = useState(false);

  const claseGrupoId = params.id as string;

  useEffect(() => {
    fetchGrupoDetalle();
  }, [claseGrupoId]);

  const fetchGrupoDetalle = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerDetalleCompletoGrupo(claseGrupoId);
      setGrupo(data);
    } catch (error) {
      console.error('Error al cargar grupo:', error);
      toast.error('Error al cargar el grupo');
      setGrupo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Ordenar estudiantes
  const estudiantesOrdenados = grupo
    ? [...grupo.estudiantes].sort((a, b) => {
        switch (ordenarPor) {
          case 'puntos':
            return b.stats.puntosTotal - a.stats.puntosTotal;
          case 'asistencia':
            return (
              b.stats.porcentajeAsistencia - a.stats.porcentajeAsistencia
            );
          case 'clases':
            return b.stats.clasesAsistidas - a.stats.clasesAsistidas;
          case 'nombre':
          default:
            return a.nombre.localeCompare(b.nombre);
        }
      })
    : [];

  // Clasificar observaciones
  const observacionesPositivas = grupo
    ? grupo.observacionesRecientes.filter((o) => o.tipo === 'positiva')
    : [];
  const observacionesAtencion = grupo
    ? grupo.observacionesRecientes.filter((o) => o.tipo === 'atencion')
    : [];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando grupo..." />
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-4">
            Grupo no encontrado
          </h1>
          <button
            onClick={() => router.push('/docente/dashboard')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full px-8 h-full flex flex-col gap-6 overflow-y-auto pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/docente/dashboard' },
            { label: grupo.nombre },
          ]}
        />

        {/* HEADER BRUTAL */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Botón volver */}
          <button
            onClick={() => router.push('/docente/dashboard')}
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-4 font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Dashboard
          </button>

          {/* Título + Info básica */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                {grupo.nombre}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-purple-300 font-bold text-lg">
                  {grupo.dia_semana} • {grupo.hora_inicio} - {grupo.hora_fin}
                </p>
                {grupo.rutaCurricular && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          grupo.rutaCurricular.color || '#8B5CF6',
                      }}
                    />
                    <span className="text-purple-200 font-semibold">
                      {grupo.rutaCurricular.nombre}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Badge de cupo */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-purple-300" />
                <span className="text-purple-300 font-bold text-sm">
                  ESTUDIANTES
                </span>
              </div>
              <div className="text-4xl font-black text-white">
                {grupo.estudiantes.length}
                <span className="text-lg text-purple-400">
                  /{grupo.cupo_maximo}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid BRUTAL */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Estudiantes */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-purple-600/80 to-indigo-700/80 backdrop-blur-md rounded-xl p-4 border border-purple-400/50 shadow-lg"
            >
              <Users className="w-8 h-8 text-purple-200 mb-2" />
              <p className="text-3xl font-black text-white">
                {grupo.stats.totalEstudiantes}
              </p>
              <p className="text-purple-200 font-bold text-sm">
                Total Estudiantes
              </p>
            </motion.div>

            {/* Asistencia Promedio */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-green-600/80 to-emerald-700/80 backdrop-blur-md rounded-xl p-4 border border-green-400/50 shadow-lg"
            >
              <CheckCircle className="w-8 h-8 text-green-200 mb-2" />
              <p className="text-3xl font-black text-white">
                {grupo.stats.asistenciaPromedio}%
              </p>
              <p className="text-green-200 font-bold text-sm">
                Asistencia Promedio
              </p>
            </motion.div>

            {/* Puntos Promedio */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-yellow-600/80 to-orange-700/80 backdrop-blur-md rounded-xl p-4 border border-yellow-400/50 shadow-lg"
            >
              <Star className="w-8 h-8 text-yellow-200 mb-2" />
              <p className="text-3xl font-black text-white">
                {grupo.stats.puntosPromedio}
              </p>
              <p className="text-yellow-200 font-bold text-sm">
                Puntos Promedio
              </p>
            </motion.div>

            {/* Próxima Clase */}
            {grupo.proximaClase && (
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-blue-600/80 to-cyan-700/80 backdrop-blur-md rounded-xl p-4 border border-blue-400/50 shadow-lg"
              >
                <Clock className="w-8 h-8 text-blue-200 mb-2" />
                <p className="text-xl font-black text-white">
                  {grupo.proximaClase.fecha}
                </p>
                <p className="text-blue-200 font-bold text-sm">
                  {grupo.proximaClase.hora}
                  {grupo.proximaClase.minutosParaEmpezar !== null &&
                    ` (en ${grupo.proximaClase.minutosParaEmpezar} min)`}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ACCIONES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={() => setMostrarModalAsistencia(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
          >
            <UserCheck className="w-5 h-5" />
            TOMAR ASISTENCIA
          </button>

          <button
            onClick={() => setMostrarModalObservacion(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            AGREGAR OBSERVACIÓN
          </button>

          <button
            onClick={() => setMostrarModalPuntos(true)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            ASIGNAR PUNTOS
          </button>
        </motion.div>

        {/* OBSERVACIONES RECIENTES */}
        {grupo.observacionesRecientes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              OBSERVACIONES RECIENTES
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Observaciones Positivas */}
              {observacionesPositivas.length > 0 && (
                <div className="bg-green-600/20 backdrop-blur-md rounded-xl p-4 border border-green-400/50">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-black">
                      POSITIVAS ({observacionesPositivas.length})
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {observacionesPositivas.slice(0, 5).map((obs) => (
                      <div
                        key={obs.id}
                        className="bg-white/10 rounded-lg p-3 flex items-start gap-2"
                      >
                        <StudentAvatar
                          nombre={obs.estudiante.nombre}
                          apellido={obs.estudiante.apellido}
                          avatar_url={obs.estudiante.avatar_url}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm mb-1">
                            {obs.estudiante.nombre} {obs.estudiante.apellido}
                          </p>
                          <p className="text-green-200 text-xs">
                            {obs.observacion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observaciones de Atención */}
              {observacionesAtencion.length > 0 && (
                <div className="bg-orange-600/20 backdrop-blur-md rounded-xl p-4 border border-orange-400/50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-black">
                      REQUIEREN ATENCIÓN ({observacionesAtencion.length})
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {observacionesAtencion.slice(0, 5).map((obs) => (
                      <div
                        key={obs.id}
                        className="bg-white/10 rounded-lg p-3 flex items-start gap-2"
                      >
                        <StudentAvatar
                          nombre={obs.estudiante.nombre}
                          apellido={obs.estudiante.apellido}
                          avatar_url={obs.estudiante.avatar_url}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm mb-1">
                            {obs.estudiante.nombre} {obs.estudiante.apellido}
                          </p>
                          <p className="text-orange-200 text-xs">
                            {obs.observacion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* LISTA DE ESTUDIANTES BRUTAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header con filtros */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              ESTUDIANTES ({grupo.estudiantes.length})
            </h2>

            {/* Botones de ordenamiento */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrdenarPor('nombre')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  ordenarPor === 'nombre'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                Nombre
              </button>
              <button
                onClick={() => setOrdenarPor('puntos')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  ordenarPor === 'puntos'
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                Puntos
              </button>
              <button
                onClick={() => setOrdenarPor('asistencia')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  ordenarPor === 'asistencia'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                Asistencia
              </button>
              <button
                onClick={() => setOrdenarPor('clases')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  ordenarPor === 'clases'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                Clases
              </button>
            </div>
          </div>

          {/* Lista de estudiantes */}
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {estudiantesOrdenados.map((estudiante, index) => (
                <motion.div
                  key={estudiante.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.02 * index }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-lg"
                  onClick={() =>
                    toast(
                      `Detalles de ${estudiante.nombre} ${estudiante.apellido}`,
                      { icon: '👤' }
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    {/* Info del estudiante */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="relative">
                        <StudentAvatar
                          nombre={estudiante.nombre}
                          apellido={estudiante.apellido}
                          avatar_url={estudiante.avatar_url}
                          size="lg"
                          className="border-2 border-purple-400/50"
                        />
                      </div>

                      {/* Nombre + Equipo */}
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">
                          {estudiante.nombre} {estudiante.apellido}
                        </h3>
                        {estudiante.equipo && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: estudiante.equipo.color,
                              }}
                            />
                            <span className="text-purple-300 font-semibold text-sm">
                              {estudiante.equipo.nombre}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats BRUTALES */}
                    <div className="flex items-center gap-6">
                      {/* Puntos */}
                      <div className="text-center">
                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <p className="text-2xl font-black text-white">
                          {estudiante.stats.puntosTotal}
                        </p>
                        <p className="text-purple-300 font-bold text-xs">
                          Puntos
                        </p>
                      </div>

                      {/* Asistencia */}
                      <div className="text-center">
                        <CheckCircle
                          className={`w-5 h-5 mx-auto mb-1 ${
                            estudiante.stats.porcentajeAsistencia >= 80
                              ? 'text-green-400'
                              : estudiante.stats.porcentajeAsistencia >= 60
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}
                        />
                        <p
                          className={`text-2xl font-black ${
                            estudiante.stats.porcentajeAsistencia >= 80
                              ? 'text-green-400'
                              : estudiante.stats.porcentajeAsistencia >= 60
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}
                        >
                          {estudiante.stats.porcentajeAsistencia}%
                        </p>
                        <p className="text-purple-300 font-bold text-xs">
                          Asistencia
                        </p>
                      </div>

                      {/* Clases Asistidas */}
                      <div className="text-center">
                        <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-2xl font-black text-white">
                          {estudiante.stats.clasesAsistidas}
                        </p>
                        <p className="text-purple-300 font-bold text-xs">
                          Clases
                        </p>
                      </div>

                      {/* Última Asistencia */}
                      {estudiante.stats.ultimaAsistencia && (
                        <div className="text-center">
                          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                          <p className="text-sm font-bold text-white">
                            {new Date(
                              estudiante.stats.ultimaAsistencia,
                            ).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                          <p className="text-purple-300 font-bold text-xs">
                            Última clase
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Modales */}
        {grupo && (
          <>
            {/* Modal de Tomar Asistencia */}
            <TomarAsistenciaModal
              isOpen={mostrarModalAsistencia}
              onClose={() => setMostrarModalAsistencia(false)}
              claseGrupoId={claseGrupoId}
              estudiantes={grupo.estudiantes}
              onSuccess={() => {
                // Recargar datos del grupo después de guardar asistencia
                fetchGrupoDetalle();
              }}
            />

            {/* Modal de Agregar Observación */}
            <AgregarObservacionModal
              isOpen={mostrarModalObservacion}
              onClose={() => setMostrarModalObservacion(false)}
              claseGrupoId={claseGrupoId}
              estudiantes={grupo.estudiantes}
              onSuccess={() => {
                // Recargar datos del grupo después de agregar observación
                fetchGrupoDetalle();
              }}
            />

            {/* Modal de Asignar Puntos */}
            <AsignarPuntosModal
              isOpen={mostrarModalPuntos}
              onClose={() => setMostrarModalPuntos(false)}
              claseGrupoId={claseGrupoId}
              estudiantes={grupo.estudiantes}
              onSuccess={() => {
                // Recargar datos del grupo después de asignar puntos
                fetchGrupoDetalle();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
