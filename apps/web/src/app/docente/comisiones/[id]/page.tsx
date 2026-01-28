'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Video,
  RefreshCw,
  Radio,
  Play,
  ClipboardList,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui';
import apiClient from '@/lib/axios';
import { livekitApi, type EstadoClase } from '@/lib/api/livekit.api';
import {
  docentesApi,
  type HistorialAsistenciaResponse,
  type HistorialPuntosComisionResponse,
} from '@/lib/api/docentes.api';

type TabType = 'info' | 'asistencia' | 'puntos';

interface EstudianteInscrito {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  estado: string;
}

interface ComisionDetalle {
  id: string;
  nombre: string;
  descripcion: string | null;
  producto: {
    id: string;
    nombre: string;
    tipo: string;
  };
  casa: {
    id: string;
    nombre: string;
    emoji: string;
  } | null;
  horario: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  cupoMaximo: number | null;
  activo: boolean;
  estudiantes: EstudianteInscrito[];
  // LiveKit
  estadoClase?: EstadoClase;
}

export default function ComisionDetallePage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();
  const comisionId = params.id as string;

  const [comision, setComision] = useState<ComisionDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoClase, setEstadoClase] = useState<EstadoClase>('Programada');
  const [isLoadingLiveKit, setIsLoadingLiveKit] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Historial data
  const [historialAsistencia, setHistorialAsistencia] =
    useState<HistorialAsistenciaResponse | null>(null);
  const [historialPuntos, setHistorialPuntos] = useState<HistorialPuntosComisionResponse | null>(
    null,
  );
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);

  useEffect(() => {
    if (comisionId) {
      fetchComision();
      fetchEstadoClase();
    }
  }, [comisionId]);

  const fetchEstadoClase = async () => {
    try {
      const estado = await livekitApi.obtenerEstadoComision(comisionId);
      setEstadoClase(estado.estadoClase);
    } catch (error) {
      console.error('Error al obtener estado de clase:', error);
    }
  };

  const handleIniciarClase = async () => {
    setIsLoadingLiveKit(true);
    try {
      await livekitApi.iniciarClaseComision(comisionId);
      const tokenData = await livekitApi.getTokenDocente({ comisionId });

      // Navegar a la página de clase en vivo
      const params = new URLSearchParams({
        token: tokenData.token,
        ws: tokenData.wsUrl,
        room: tokenData.roomName,
        title: comision?.nombre || 'Clase en Vivo',
        comisionId: comisionId,
      });
      router.push(`/docente/clase-en-vivo?${params.toString()}`);
    } catch (error) {
      console.error('Error al iniciar clase:', error);
      toast.error(error instanceof Error ? error.message : 'Error al iniciar clase');
    } finally {
      setIsLoadingLiveKit(false);
    }
  };

  const handleEntrarAula = async () => {
    setIsLoadingLiveKit(true);
    try {
      const tokenData = await livekitApi.getTokenDocente({ comisionId });

      // Navegar a la página de clase en vivo (sin iniciar, ya está en vivo)
      const params = new URLSearchParams({
        token: tokenData.token,
        ws: tokenData.wsUrl,
        room: tokenData.roomName,
        title: comision?.nombre || 'Clase en Vivo',
        comisionId: comisionId,
      });
      router.push(`/docente/clase-en-vivo?${params.toString()}`);
    } catch (error) {
      console.error('Error al entrar al aula:', error);
      toast.error(error instanceof Error ? error.message : 'Error al entrar al aula');
    } finally {
      setIsLoadingLiveKit(false);
    }
  };

  const fetchComision = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<ComisionDetalle>(`/docentes/me/comisiones/${comisionId}`);
      setComision(data);
    } catch (error) {
      console.error('Error al cargar la comisión:', error);
      toast.error('Error al cargar los detalles de la comisión');
      router.push('/docente/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistorialAsistencia = useCallback(async () => {
    if (!comisionId) return;
    try {
      setIsLoadingHistorial(true);
      const data = await docentesApi.getHistorialAsistencia(comisionId);
      setHistorialAsistencia(data);
    } catch (error) {
      console.error('Error al cargar historial de asistencia:', error);
      toast.error('Error al cargar el historial de asistencia');
    } finally {
      setIsLoadingHistorial(false);
    }
  }, [comisionId]);

  const fetchHistorialPuntos = useCallback(async () => {
    if (!comisionId) return;
    try {
      setIsLoadingHistorial(true);
      const data = await docentesApi.getHistorialPuntosComision(comisionId);
      setHistorialPuntos(data);
    } catch (error) {
      console.error('Error al cargar historial de puntos:', error);
      toast.error('Error al cargar el historial de puntos');
    } finally {
      setIsLoadingHistorial(false);
    }
  }, [comisionId]);

  // Fetch historial data when tab changes
  useEffect(() => {
    if (activeTab === 'asistencia' && !historialAsistencia) {
      fetchHistorialAsistencia();
    } else if (activeTab === 'puntos' && !historialPuntos) {
      fetchHistorialPuntos();
    }
  }, [
    activeTab,
    historialAsistencia,
    historialPuntos,
    fetchHistorialAsistencia,
    fetchHistorialPuntos,
  ]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando comisión..." />
      </div>
    );
  }

  if (!comision) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-purple-300">Comisión no encontrada</p>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No definida';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full px-8 h-full flex flex-col gap-6 overflow-y-auto pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/docente/dashboard' },
            { label: 'Comisiones' },
            { label: comision.nombre },
          ]}
        />

        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/docente/dashboard')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white">{comision.nombre}</h1>
              {comision.casa && (
                <span className="text-3xl" title={comision.casa.nombre}>
                  {comision.casa.emoji}
                </span>
              )}
            </div>
            <p className="text-purple-300">{comision.producto.nombre}</p>
          </div>
        </div>

        {/* Panel de Clase en Vivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl p-5 border border-indigo-500/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  estadoClase === 'EnVivo'
                    ? 'bg-red-500/20 border border-red-500/50'
                    : estadoClase === 'Finalizada'
                      ? 'bg-gray-500/20 border border-gray-500/50'
                      : 'bg-green-500/20 border border-green-500/50'
                }`}
              >
                {estadoClase === 'EnVivo' ? (
                  <Radio className="w-6 h-6 text-red-400 animate-pulse" />
                ) : (
                  <Video className="w-6 h-6 text-green-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clase en Vivo</h3>
                <p className="text-sm text-purple-300">
                  Estado:{' '}
                  <span
                    className={`font-bold ${
                      estadoClase === 'EnVivo'
                        ? 'text-red-400'
                        : estadoClase === 'Finalizada'
                          ? 'text-gray-400'
                          : 'text-green-400'
                    }`}
                  >
                    {estadoClase}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón Iniciar Clase - Solo si está Programada */}
              {estadoClase === 'Programada' && (
                <button
                  onClick={handleIniciarClase}
                  disabled={isLoadingLiveKit}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {isLoadingLiveKit ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  Iniciar Clase
                </button>
              )}

              {/* Botón Iniciar Clase - Cuando está Finalizada o Cancelada (ahora es idempotente) */}
              {(estadoClase === 'Finalizada' || estadoClase === 'Cancelada') && (
                <button
                  onClick={handleIniciarClase}
                  disabled={isLoadingLiveKit}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {isLoadingLiveKit ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  Iniciar Clase
                </button>
              )}

              {/* Botón Entrar al Aula - Cuando está En Vivo */}
              {estadoClase === 'EnVivo' && (
                <>
                  <button
                    onClick={handleEntrarAula}
                    disabled={isLoadingLiveKit}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 animate-pulse"
                  >
                    {isLoadingLiveKit ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Video className="w-5 h-5" />
                    )}
                    Entrar al Aula
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 font-bold">EN VIVO</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-black text-white">
              {comision.estudiantes.length}
              {comision.cupoMaximo && `/${comision.cupoMaximo}`}
            </p>
            <p className="text-purple-300 text-sm">Estudiantes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Calendar className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm font-bold text-white">{formatDate(comision.fechaInicio)}</p>
            <p className="text-purple-300 text-sm">Fecha Inicio</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Calendar className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-sm font-bold text-white">{formatDate(comision.fechaFin)}</p>
            <p className="text-purple-300 text-sm">Fecha Fin</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
          >
            <Clock className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-sm font-bold text-white">{comision.horario || 'No definido'}</p>
            <p className="text-purple-300 text-sm">Horario</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'info'
                ? 'bg-white/10 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Información
          </button>
          <button
            onClick={() => setActiveTab('asistencia')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'asistencia'
                ? 'bg-white/10 text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Historial Asistencia
          </button>
          <button
            onClick={() => setActiveTab('puntos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'puntos'
                ? 'bg-white/10 text-white border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Historial Puntos
          </button>
        </div>

        {/* Tab Content: Información */}
        {activeTab === 'info' && (
          <>
            {/* Descripción */}
            {comision.descripcion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
              >
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Descripción
                </h2>
                <p className="text-purple-200">{comision.descripcion}</p>
              </motion.div>
            )}

            {/* Lista de Estudiantes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                ESTUDIANTES INSCRITOS ({comision.estudiantes.length})
              </h2>

              {comision.estudiantes.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center">
                  <p className="text-purple-300">No hay estudiantes inscritos en esta comisión</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {comision.estudiantes.map((estudiante, index) => (
                    <motion.div
                      key={estudiante.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">
                            {estudiante.nombre} {estudiante.apellido}
                          </p>
                          {estudiante.email && (
                            <p className="text-purple-300 text-sm">{estudiante.email}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            estudiante.estado === 'Confirmada'
                              ? 'bg-green-500/20 text-green-400'
                              : estudiante.estado === 'Pendiente'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {estudiante.estado}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Tab Content: Historial Asistencia */}
        {activeTab === 'asistencia' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {isLoadingHistorial ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Cargando historial..." />
              </div>
            ) : !historialAsistencia || historialAsistencia.fechas.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center">
                <ClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-purple-300">No hay registros de asistencia</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historialAsistencia.fechas.map((fechaData) => (
                  <div
                    key={fechaData.fecha}
                    className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-400" />
                        {new Date(fechaData.fecha).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h3>
                    </div>
                    <div className="p-4 space-y-2">
                      {fechaData.asistencias.map((asist) => (
                        <div
                          key={asist.estudianteId}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <span className="text-white">{asist.nombre}</span>
                          <div className="flex items-center gap-2">
                            {asist.observacion && (
                              <span className="text-xs text-gray-400 max-w-[150px] truncate">
                                {asist.observacion}
                              </span>
                            )}
                            <span
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                asist.estado === 'Presente'
                                  ? 'bg-green-500/20 text-green-400'
                                  : asist.estado === 'Justificado'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {asist.estado === 'Presente' && <CheckCircle className="w-3 h-3" />}
                              {asist.estado === 'Ausente' && <XCircle className="w-3 h-3" />}
                              {asist.estado === 'Justificado' && (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {asist.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab Content: Historial Puntos */}
        {activeTab === 'puntos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {isLoadingHistorial ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Cargando historial..." />
              </div>
            ) : !historialPuntos || historialPuntos.puntos.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center">
                <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-purple-300">No hay puntos otorgados</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Total Puntos</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {historialPuntos.totalPuntos.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-400 text-sm">Total Registros</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {historialPuntos.totalRegistros}
                    </p>
                  </div>
                </div>

                {/* Puntos List */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                    <h3 className="text-white font-bold">Historial de Puntos</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {historialPuntos.puntos.map((punto) => (
                      <div
                        key={punto.id}
                        className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{punto.estudianteNombre}</p>
                          <p className="text-sm text-gray-400">{punto.tipoAccion}</p>
                          {punto.contexto && (
                            <p className="text-xs text-gray-500 mt-1">{punto.contexto}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${punto.puntos >= 0 ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {punto.puntos >= 0 ? '+' : ''}
                            {punto.puntos}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(punto.fechaOtorgado).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
