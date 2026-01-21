'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  X,
  Clock,
  Star,
  Save,
  Shield,
  Users,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
  Video,
  FileText,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import {
  docentesApi,
  EstudianteComision,
  HistorialAsistenciaResponse,
  HistorialPuntosComisionResponse,
  asistenciaApi,
  EstadoAsistencia,
} from '@/lib/api/docentes.api';
import { gamificacionApi, AccionPuntuable } from '@/lib/api/gamificacion.api';
import {
  observacionesApi,
  Observacion,
  TipoObservacion,
  PrioridadObservacion,
  EstadoObservacion,
} from '@/lib/api/observaciones.api';
import { toast } from '@/components/ui/Toast';

/**
 * Helper para obtener la fecha local en formato YYYY-MM-DD
 * Evita problemas de timezone con toISOString() que usa UTC
 */
const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Emojis por código de acción (fallback)
const ACCION_EMOJIS: Record<string, string> = {
  PARTICIPACION: '🙋',
  TAREA_COMPLETADA: '✅',
  QUIZ_APROBADO: '📝',
  AYUDA_COMPANERO: '🤝',
  BONUS: '⭐',
  LOGRO: '🏆',
  ASISTENCIA: '✓',
};

interface StudentListProps {
  comisionId: string;
  onBack?: () => void;
  onStartLiveClass?: (comisionId: string) => void;
}

interface ComisionInfo {
  nombre: string;
  casa: string;
  horario: string;
  inscritos: number;
  cupoMaximo: number;
}

interface MetricasData {
  asistenciaPromedio: number;
  totalEstudiantes: number;
  totalClases: number;
  totalPuntos: number;
}

export const StudentList: React.FC<StudentListProps> = ({
  comisionId,
  onBack,
  onStartLiveClass,
}) => {
  const [activeTab, setActiveTab] = useState<
    'students' | 'attendance' | 'observations' | 'metrics' | 'puntos'
  >('students');

  // API Data States
  const [estudiantes, setEstudiantes] = useState<EstudianteComision[]>([]);
  const [comisionInfo, setComisionInfo] = useState<ComisionInfo | null>(null);
  const [metricas, setMetricas] = useState<MetricasData | null>(null);
  const [historialAsistencia, setHistorialAsistencia] =
    useState<HistorialAsistenciaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetricas, setIsLoadingMetricas] = useState(false);
  const [isLoadingAsistencia, setIsLoadingAsistencia] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Puntos Modal States
  const [puntosModalOpen, setPuntosModalOpen] = useState(false);
  const [currentStudentForPuntos, setCurrentStudentForPuntos] = useState<EstudianteComision | null>(
    null,
  );
  const [accionesPuntuables, setAccionesPuntuables] = useState<AccionPuntuable[]>([]);
  const [isLoadingAcciones, setIsLoadingAcciones] = useState(false);
  const [selectedAccionId, setSelectedAccionId] = useState<string | null>(null);
  const [puntosContexto, setPuntosContexto] = useState('');
  const [isSubmittingPuntos, setIsSubmittingPuntos] = useState(false);

  // Observation Modal States
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [currentStudentForObs, setCurrentStudentForObs] = useState<EstudianteComision | null>(null);
  const [newObservation, setNewObservation] = useState('');
  const [obsTipo, setObsTipo] = useState<TipoObservacion>('Academica');
  const [obsPrioridad, setObsPrioridad] = useState<PrioridadObservacion>('Baja');
  const [obsFechaEvento, setObsFechaEvento] = useState<string>(getLocalDateString());
  const [isSubmittingObs, setIsSubmittingObs] = useState(false);

  // Observaciones Tab States
  const [observacionesData, setObservacionesData] = useState<Observacion[]>([]);
  const [isLoadingObservaciones, setIsLoadingObservaciones] = useState(false);
  const [observacionesLoaded, setObservacionesLoaded] = useState(false);

  // Observation Detail Modal States
  const [selectedObservacion, setSelectedObservacion] = useState<Observacion | null>(null);
  const [obsDetailModalOpen, setObsDetailModalOpen] = useState(false);
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState('');
  const [isSubmittingSeguimiento, setIsSubmittingSeguimiento] = useState(false);
  const [isChangingEstado, setIsChangingEstado] = useState(false);

  // Attendance Tab States (for marking attendance today)
  const [attendanceStates, setAttendanceStates] = useState<Record<string, EstadoAsistencia>>({});
  const [attendanceObservations, setAttendanceObservations] = useState<Record<string, string>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState<string>(getLocalDateString());
  const [attendanceMode, setAttendanceMode] = useState<'take' | 'history'>('take');

  // Puntos Tab States (historial de XP)
  const [historialPuntos, setHistorialPuntos] = useState<HistorialPuntosComisionResponse | null>(
    null,
  );
  const [isLoadingPuntos, setIsLoadingPuntos] = useState(false);

  // Cargar datos de la comisión y estudiantes
  useEffect(() => {
    const fetchData = async () => {
      if (!comisionId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [detalleRes, estudiantesRes] = await Promise.all([
          docentesApi.getComisionDetalle(comisionId),
          docentesApi.getEstudiantesComision(comisionId),
        ]);

        setComisionInfo({
          nombre: detalleRes.nombre,
          casa: detalleRes.casa?.nombre || 'Sin casa',
          horario: detalleRes.horario || 'Sin horario',
          inscritos: detalleRes.estudiantes?.length || 0,
          cupoMaximo: detalleRes.cupoMaximo || 20,
        });

        setEstudiantes(estudiantesRes.estudiantes || []);
      } catch (err) {
        console.error('Error al cargar datos de comisión:', err);
        setError('Error al cargar los datos. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [comisionId]);

  // Cargar métricas cuando se abre el tab
  useEffect(() => {
    if (activeTab === 'metrics' && !metricas) {
      const fetchMetricas = async () => {
        setIsLoadingMetricas(true);
        try {
          const res = await docentesApi.getMetricasComision(comisionId);
          setMetricas({
            asistenciaPromedio: res.asistenciaPromedio,
            totalEstudiantes: res.totalEstudiantes,
            totalClases: res.totalClases,
            totalPuntos: res.totalPuntos,
          });
        } catch (err) {
          console.error('Error al cargar métricas:', err);
        } finally {
          setIsLoadingMetricas(false);
        }
      };
      fetchMetricas();
    }
  }, [activeTab, comisionId, metricas]);

  // Cargar historial de asistencia cuando se abre el tab
  useEffect(() => {
    if (activeTab === 'attendance' && !historialAsistencia) {
      const fetchAsistencia = async () => {
        setIsLoadingAsistencia(true);
        try {
          const res = await docentesApi.getHistorialAsistencia(comisionId);
          setHistorialAsistencia(res);
        } catch (err) {
          console.error('Error al cargar historial de asistencia:', err);
        } finally {
          setIsLoadingAsistencia(false);
        }
      };
      fetchAsistencia();
    }
  }, [activeTab, comisionId, historialAsistencia]);

  // Cargar observaciones cuando se abre el tab
  useEffect(() => {
    if (activeTab === 'observations' && !observacionesLoaded) {
      const fetchObservaciones = async () => {
        setIsLoadingObservaciones(true);
        try {
          const res = await observacionesApi.listar({ comisionId, limit: 50 });
          setObservacionesData(res.data ?? []);
          setObservacionesLoaded(true);
        } catch (err) {
          console.error('Error al cargar observaciones:', err);
          setObservacionesData([]);
          setObservacionesLoaded(true);
        } finally {
          setIsLoadingObservaciones(false);
        }
      };
      fetchObservaciones();
    }
  }, [activeTab, comisionId, observacionesLoaded]);

  // Cargar historial de puntos cuando se abre el tab
  useEffect(() => {
    if (activeTab === 'puntos' && !historialPuntos) {
      const fetchPuntos = async () => {
        setIsLoadingPuntos(true);
        try {
          const res = await docentesApi.getHistorialPuntosComision(comisionId);
          setHistorialPuntos(res);
        } catch (err) {
          console.error('Error al cargar historial de puntos:', err);
        } finally {
          setIsLoadingPuntos(false);
        }
      };
      fetchPuntos();
    }
  }, [activeTab, comisionId, historialPuntos]);

  // Abrir modal de puntos - cargar acciones del backend
  const openPuntosModal = async (student: EstudianteComision) => {
    setCurrentStudentForPuntos(student);
    setSelectedAccionId(null);
    setPuntosContexto('');
    setPuntosModalOpen(true);

    // Cargar acciones si no están cacheadas
    if (accionesPuntuables.length === 0) {
      setIsLoadingAcciones(true);
      try {
        const acciones = await gamificacionApi.getAcciones();
        // Filtrar solo acciones activas
        setAccionesPuntuables(acciones.filter((a) => a.activo));
      } catch (err) {
        console.error('Error al cargar acciones puntuables:', err);
        toast.error('Error al cargar acciones disponibles');
      } finally {
        setIsLoadingAcciones(false);
      }
    }
  };

  // Otorgar puntos usando el ID de la acción
  const handleOtorgarPuntos = async () => {
    if (!currentStudentForPuntos || !selectedAccionId) return;

    const accion = accionesPuntuables.find((a) => a.id === selectedAccionId);
    if (!accion) return;

    setIsSubmittingPuntos(true);
    try {
      await gamificacionApi.otorgarPuntos({
        estudianteId: currentStudentForPuntos.id,
        accionId: selectedAccionId,
        contexto: puntosContexto || undefined,
      });

      // Obtener emoji basado en código o nombre
      const codigo = (accion.codigo || accion.nombre).toUpperCase();
      const emoji = ACCION_EMOJIS[codigo] || '⭐';

      toast.success(`${emoji} +${accion.puntos} XP para ${currentStudentForPuntos.nombre}`);

      // Actualizar XP local
      setEstudiantes((prev) =>
        prev.map((s) =>
          s.id === currentStudentForPuntos.id
            ? { ...s, stats: { ...s.stats, xpTotal: s.stats.xpTotal + accion.puntos } }
            : s,
        ),
      );

      setPuntosModalOpen(false);
    } catch (err) {
      console.error('Error al otorgar puntos:', err);
      toast.error('Error al otorgar puntos');
    } finally {
      setIsSubmittingPuntos(false);
    }
  };

  const openObsModal = (student: EstudianteComision) => {
    setCurrentStudentForObs(student);
    setNewObservation('');
    setObsTipo('Academica');
    setObsPrioridad('Baja');
    setObsFechaEvento(getLocalDateString());
    setObsModalOpen(true);
  };

  const saveObservation = async () => {
    if (!currentStudentForObs || !newObservation.trim()) return;

    // Validación: mínimo 10 caracteres
    if (newObservation.trim().length < 10) {
      toast.error('La observación debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmittingObs(true);

    const payload = {
      estudianteIds: [currentStudentForObs.id],
      comisionId,
      contenido: newObservation.trim(),
      fechaEvento: obsFechaEvento,
      tipo: obsTipo,
      prioridad: obsPrioridad,
    };

    try {
      await observacionesApi.crear(payload);

      toast.success(`Observación guardada para ${currentStudentForObs.nombre}`);
      setObsModalOpen(false);
      // Invalidar cache de observaciones para forzar recarga
      setObservacionesData([]);
      setObservacionesLoaded(false);
    } catch (err: unknown) {
      // Extraer mensaje de error del backend si existe
      const axiosError = err as { response?: { data?: { message?: string | string[] } } };
      const errorMessage = axiosError?.response?.data?.message || 'Error al guardar la observación';
      const displayMessage = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      toast.error(displayMessage);
    } finally {
      setIsSubmittingObs(false);
    }
  };

  // Abrir modal de detalle de observación
  const openObsDetailModal = (obs: Observacion) => {
    setSelectedObservacion(obs);
    setNuevoSeguimiento('');
    setObsDetailModalOpen(true);
  };

  // Agregar seguimiento a una observación
  const handleAgregarSeguimiento = async () => {
    if (!selectedObservacion || !nuevoSeguimiento.trim()) return;

    setIsSubmittingSeguimiento(true);
    try {
      const updated = await observacionesApi.agregarSeguimiento(selectedObservacion.id, {
        contenido: nuevoSeguimiento.trim(),
      });

      // Actualizar la observación en el estado local
      setObservacionesData((prev) => prev.map((obs) => (obs.id === updated.id ? updated : obs)));
      setSelectedObservacion(updated);
      setNuevoSeguimiento('');
      toast.success('Seguimiento agregado');
    } catch (err) {
      console.error('Error al agregar seguimiento:', err);
      toast.error('Error al agregar seguimiento');
    } finally {
      setIsSubmittingSeguimiento(false);
    }
  };

  // Cambiar estado de una observación
  const handleCambiarEstado = async (nuevoEstado: EstadoObservacion) => {
    if (!selectedObservacion || selectedObservacion.estado === nuevoEstado) return;

    setIsChangingEstado(true);
    try {
      const updated = await observacionesApi.cambiarEstado(selectedObservacion.id, {
        estado: nuevoEstado,
      });

      // Actualizar la observación en el estado local
      setObservacionesData((prev) => prev.map((obs) => (obs.id === updated.id ? updated : obs)));
      setSelectedObservacion(updated);
      toast.success(`Estado cambiado a ${nuevoEstado}`);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error('Error al cambiar estado');
    } finally {
      setIsChangingEstado(false);
    }
  };

  // Filtrar estudiantes por búsqueda
  const filteredStudents = estudiantes.filter((s) => {
    const fullName = `${s.nombre} ${s.apellido}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Helper para obtener color de casa
  const getCasaColor = (casaNombre: string) => {
    const upper = casaNombre.toUpperCase();
    if (upper.includes('QUANTUM'))
      return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/20' };
    if (upper.includes('VERTEX'))
      return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' };
    if (upper.includes('PULSAR'))
      return { text: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/20' };
    return { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/20' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mb-4" />
        <p className="text-slate-400">Cargando estudiantes...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
          >
            Volver
          </button>
        )}
      </div>
    );
  }

  const casaTheme = getCasaColor(comisionInfo?.casa || '');

  // Renderizar tab Métricas
  const renderMetricsTab = () => {
    if (isLoadingMetricas) {
      return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-purple-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Estudiantes</span>
            </div>
            <span className="text-2xl font-bold text-white">{metricas?.totalEstudiantes || 0}</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-cyan-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Clases Dadas</span>
            </div>
            <span className="text-2xl font-bold text-white">{metricas?.totalClases || 0}</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Asistencia</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {metricas?.asistenciaPromedio || 0}%
            </span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">XP Otorgados</span>
            </div>
            <span className="text-2xl font-bold text-white">{metricas?.totalPuntos || 0}</span>
          </div>
        </div>

        {/* Top estudiantes por XP */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="text-amber-400" size={16} />
            Top Estudiantes por XP
          </h3>
          <div className="space-y-2">
            {[...estudiantes]
              .sort((a, b) => b.stats.xpTotal - a.stats.xpTotal)
              .slice(0, 5)
              .map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-400'
                        : idx === 1
                          ? 'bg-slate-400/20 text-slate-300'
                          : idx === 2
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-slate-700/50 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm text-white">
                    {student.nombre} {student.apellido}
                  </span>
                  <span className="text-sm font-bold text-amber-400">
                    {student.stats.xpTotal} XP
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  // Render del tab de Puntos (historial de XP)
  const renderPuntosTab = () => {
    if (isLoadingPuntos) {
      return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      );
    }

    if (!historialPuntos || historialPuntos.puntos.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
          <Trophy size={48} className="opacity-20" />
          <p>No hay puntos otorgados aún</p>
        </div>
      );
    }

    // Agrupar puntos por tipo de acción para el mini gráfico
    const puntosPorTipo = historialPuntos.puntos.reduce(
      (acc, p) => {
        acc[p.tipoAccion] = (acc[p.tipoAccion] || 0) + p.puntos;
        return acc;
      },
      {} as Record<string, number>,
    );
    const tiposOrdenados = Object.entries(puntosPorTipo).sort((a, b) => b[1] - a[1]);
    const maxPuntosTipo = Math.max(...Object.values(puntosPorTipo));

    return (
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Total XP</span>
            </div>
            <span className="text-3xl font-bold text-amber-400">
              {historialPuntos.totalPuntos.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-purple-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase">Acciones</span>
            </div>
            <span className="text-3xl font-bold text-white">{historialPuntos.totalRegistros}</span>
          </div>
        </div>

        {/* Mini gráfico de barras por tipo */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            XP por Tipo de Acción
          </h3>
          <div className="space-y-3">
            {tiposOrdenados.map(([tipo, puntos]) => {
              const porcentaje = (puntos / maxPuntosTipo) * 100;
              const emoji = ACCION_EMOJIS[tipo] || '⭐';
              return (
                <div key={tipo} className="flex items-center gap-3">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs text-slate-400 w-28 truncate">{tipo}</span>
                  <div className="flex-1 h-6 bg-slate-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500/80 to-amber-400 rounded-lg transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-amber-400 w-16 text-right">
                    {puntos} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historial de puntos recientes */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Últimos Puntos Otorgados
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {historialPuntos.puntos.slice(0, 20).map((punto) => {
              const fecha = new Date(punto.fechaOtorgado);
              const emoji = ACCION_EMOJIS[punto.tipoAccion] || '⭐';
              return (
                <div
                  key={punto.id}
                  className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50"
                >
                  <span className="text-xl">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {punto.estudianteNombre}
                      </span>
                      <span className="text-xs text-slate-500">{punto.tipoAccion}</span>
                    </div>
                    {punto.contexto && (
                      <p className="text-xs text-slate-500 truncate">{punto.contexto}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-400">+{punto.puntos} XP</span>
                    <p className="text-xs text-slate-500">
                      {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Iniciar clase en vivo - navega a la pestaña de clases en vivo
  const handleIniciarClase = () => {
    if (onStartLiveClass) {
      onStartLiveClass(comisionId);
    }
  };

  // Helper para color de prioridad
  const getPrioridadColor = (prioridad: PrioridadObservacion) => {
    switch (prioridad) {
      case 'Urgente':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Alta':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Media':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Helper para color de tipo
  const getTipoColor = (tipo: TipoObservacion) => {
    switch (tipo) {
      case 'Incidente':
        return 'bg-red-500/20 text-red-400';
      case 'Conductual':
        return 'bg-orange-500/20 text-orange-400';
      case 'Logro':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Asistencia':
        return 'bg-cyan-500/20 text-cyan-400';
      default:
        return 'bg-indigo-500/20 text-indigo-400';
    }
  };

  // Renderizar tab Observaciones con datos de la API
  const renderObservationsTab = () => {
    if (isLoadingObservaciones) {
      return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      );
    }

    if (observacionesData.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
          <FileText size={48} className="opacity-20" />
          <p>No hay observaciones registradas</p>
          <p className="text-xs text-slate-600">
            Usa el botón de observación en cada estudiante para agregar una
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full">
        {observacionesData.map((obs) => {
          const fecha = new Date(obs.fechaEvento);
          const estudiantesNombres = obs.estudiantes
            .map((e) => `${e.estudiante.nombre} ${e.estudiante.apellido}`)
            .join(', ');

          return (
            <button
              key={obs.id}
              onClick={() => openObsDetailModal(obs)}
              className={`w-full text-left bg-slate-900/40 border rounded-xl p-4 hover:bg-slate-800/40 transition-all cursor-pointer ${
                obs.prioridad === 'Urgente'
                  ? 'border-red-500/30 hover:border-red-500/50'
                  : obs.prioridad === 'Alta'
                    ? 'border-orange-500/30 hover:border-orange-500/50'
                    : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex-1">
                  <span className="text-sm font-bold text-white">{estudiantesNombres}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTipoColor(obs.tipo)}`}
                    >
                      {obs.tipo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPrioridadColor(obs.prioridad)}`}
                    >
                      {obs.prioridad}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        obs.estado === 'Resuelta' || obs.estado === 'Cerrada'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : obs.estado === 'EnSeguimiento'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {obs.estado}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {fecha.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-2">{obs.contenido}</p>
              {/* Mostrar conteo de seguimientos: usa _count de la lista o length del array */}
              {((obs._count?.seguimientos ?? 0) > 0 ||
                (obs.seguimientos && obs.seguimientos.length > 0)) && (
                <div className="mt-3 pt-3 border-t border-slate-800/50">
                  <span className="text-xs text-slate-500 font-semibold">
                    {obs._count?.seguimientos ?? obs.seguimientos?.length ?? 0} seguimiento(s)
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Handler para guardar asistencia
  const handleSaveAttendance = async () => {
    // Verificar que todos tengan un estado asignado
    const estudiantesConEstado = Object.keys(attendanceStates);
    if (estudiantesConEstado.length === 0) {
      toast.error('Marca la asistencia de al menos un estudiante');
      return;
    }

    setIsSavingAttendance(true);
    try {
      const asistencias = Object.entries(attendanceStates).map(([estudianteId, estado]) => ({
        estudianteId,
        estado,
        observacion: attendanceObservations[estudianteId] || undefined,
      }));

      await asistenciaApi.tomarAsistenciaComision({
        comisionId,
        fecha: attendanceDate,
        asistencias,
      });

      toast.success('Asistencia guardada exitosamente');

      // Limpiar estados y recargar historial
      setAttendanceStates({});
      setAttendanceObservations({});
      setHistorialAsistencia(null); // Forzar recarga
      setAttendanceMode('history');
    } catch (err) {
      console.error('Error al guardar asistencia:', err);
      toast.error('Error al guardar la asistencia');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Renderizar tab Asistencia con modos: tomar asistencia y ver historial
  const renderAttendanceTab = () => {
    if (isLoadingAsistencia && attendanceMode === 'history') {
      return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      );
    }

    // Modo: Tomar asistencia
    if (attendanceMode === 'take') {
      const marcados = Object.keys(attendanceStates).length;

      return (
        <div className="h-full flex flex-col">
          {/* Header con fecha y acciones */}
          <div className="p-4 border-b border-slate-800/50 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-500">
                {marcados}/{estudiantes.length} marcados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAttendanceMode('history')}
                className="px-3 py-2 text-xs bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Ver Historial
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={isSavingAttendance || marcados === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                {isSavingAttendance ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Guardar Asistencia
              </button>
            </div>
          </div>

          {/* Lista de estudiantes para marcar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {estudiantes.map((student) => {
              const estado = attendanceStates[student.id];
              const observacion = attendanceObservations[student.id] || '';

              return (
                <div
                  key={student.id}
                  className={`bg-slate-900/40 border rounded-xl p-3 transition-all ${
                    estado === 'Presente'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : estado === 'Ausente'
                        ? 'border-red-500/30 bg-red-500/5'
                        : estado === 'Justificado'
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {student.nombre.charAt(0)}
                        {student.apellido.charAt(0)}
                      </span>
                    </div>

                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white truncate block">
                        {student.nombre} {student.apellido}
                      </span>
                    </div>

                    {/* Botones de estado */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setAttendanceStates((prev) => ({ ...prev, [student.id]: 'Presente' }))
                        }
                        className={`p-2 rounded-lg transition-all ${
                          estado === 'Presente'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                        }`}
                        title="Presente"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setAttendanceStates((prev) => ({ ...prev, [student.id]: 'Ausente' }))
                        }
                        className={`p-2 rounded-lg transition-all ${
                          estado === 'Ausente'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                        }`}
                        title="Ausente"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setAttendanceStates((prev) => ({ ...prev, [student.id]: 'Justificado' }))
                        }
                        className={`p-2 rounded-lg transition-all ${
                          estado === 'Justificado'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400'
                        }`}
                        title="Justificado"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Campo de observación (visible si hay estado) */}
                  {estado && (
                    <div className="mt-2 pl-13">
                      <input
                        type="text"
                        value={observacion}
                        onChange={(e) =>
                          setAttendanceObservations((prev) => ({
                            ...prev,
                            [student.id]: e.target.value,
                          }))
                        }
                        placeholder="Observación (opcional)"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Modo: Ver historial
    if (!historialAsistencia || historialAsistencia.fechas.length === 0) {
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-800/50">
            <button
              onClick={() => setAttendanceMode('take')}
              className="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Tomar Asistencia
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
            <Calendar size={48} className="opacity-20" />
            <p>No hay registros de asistencia</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-800/50">
          <button
            onClick={() => setAttendanceMode('take')}
            className="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Tomar Asistencia
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {historialAsistencia.fechas.map((fechaData) => {
            const fecha = new Date(fechaData.fecha);
            const presentes = fechaData.asistencias.filter((a) => a.estado === 'Presente').length;
            const ausentes = fechaData.asistencias.filter((a) => a.estado === 'Ausente').length;
            const total = fechaData.asistencias.length;

            return (
              <div
                key={fechaData.fecha}
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" />
                    <span className="text-sm font-bold text-white">
                      {fecha.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle size={12} /> {presentes}
                    </span>
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle size={12} /> {ausentes}
                    </span>
                    <span className="text-slate-500">
                      {total > 0 ? Math.round((presentes / total) * 100) : 0}% asistencia
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {fechaData.asistencias.map((asistencia) => (
                    <div
                      key={asistencia.estudianteId}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        asistencia.estado === 'Presente'
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : asistencia.estado === 'Ausente'
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      {asistencia.estado === 'Presente' ? (
                        <CheckCircle size={12} className="text-emerald-400" />
                      ) : asistencia.estado === 'Ausente' ? (
                        <XCircle size={12} className="text-red-400" />
                      ) : (
                        <AlertCircle size={12} className="text-amber-400" />
                      )}
                      <span className="text-slate-300 truncate">{asistencia.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden relative">
      {/* Commission Header */}
      <div className="bg-slate-950/40 border-b border-slate-800/50 p-6 pb-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="mt-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {comisionInfo?.nombre || 'Cargando...'}
                </h2>
                <div
                  className={`px-2 py-0.5 rounded border ${casaTheme.bg} ${casaTheme.border} ${casaTheme.text} text-[10px] font-bold tracking-wide flex items-center gap-1`}
                >
                  <Shield size={10} fill="currentColor" /> {comisionInfo?.casa}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {comisionInfo?.horario}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {estudiantes.length}/{comisionInfo?.cupoMaximo} Inscritos
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleIniciarClase}
            disabled={!onStartLiveClass}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Video size={18} />
            INICIAR CLASE
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'students', label: 'Estudiantes', icon: Users },
            { id: 'attendance', label: 'Asistencia', icon: Calendar },
            { id: 'observations', label: 'Observaciones', icon: MessageSquare },
            { id: 'puntos', label: 'Puntos', icon: Zap },
            { id: 'metrics', label: 'Métricas', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/20 overflow-hidden">
        {activeTab === 'students' && (
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="p-4 flex justify-between items-center">
              <div className="relative group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all w-64"
                />
              </div>
              <div className="text-xs font-bold text-slate-500">
                {filteredStudents.length} Alumnos
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredStudents.map((student) => {
                const studentCasaTheme = student.casa
                  ? getCasaColor(student.casa.nombre)
                  : {
                      text: 'text-slate-400',
                      bg: 'bg-slate-500/20',
                      border: 'border-slate-500/20',
                    };

                return (
                  <div
                    key={student.id}
                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {student.nombre.charAt(0)}
                            {student.apellido.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white truncate">
                            {student.nombre} {student.apellido}
                          </h4>
                          {student.casa && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${studentCasaTheme.bg} ${studentCasaTheme.border} ${studentCasaTheme.text}`}
                            >
                              {student.casa.nombre}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            {student.stats.asistenciaPorcentaje}% Asist.
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            {student.stats.xpTotal} XP
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span>
                            Racha: {student.stats.rachaActual}{' '}
                            {student.stats.rachaActual > 0 && (
                              <span className="text-orange-500">🔥</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPuntosModal(student)}
                          className="p-2 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-slate-400 rounded-xl transition-colors"
                          title="Otorgar Puntos"
                        >
                          <Star size={18} />
                        </button>
                        <button
                          onClick={() => openObsModal(student)}
                          className="p-2 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 rounded-xl transition-colors"
                          title="Agregar Observación"
                        >
                          <MessageSquare size={18} />
                        </button>
                        {student.tutor?.telefono && (
                          <a
                            href={`https://wa.me/${student.tutor.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-800 hover:bg-green-500/20 hover:text-green-400 text-slate-400 rounded-xl transition-colors"
                            title={`Contactar tutor: ${student.tutor.nombre}`}
                          >
                            <Mail size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  {searchQuery ? (
                    <p>No se encontraron alumnos con &quot;{searchQuery}&quot;</p>
                  ) : (
                    <p>No hay estudiantes inscritos en esta comisión.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && renderAttendanceTab()}

        {activeTab === 'puntos' && renderPuntosTab()}

        {activeTab === 'metrics' && renderMetricsTab()}

        {activeTab === 'observations' && renderObservationsTab()}
      </div>

      {/* Modal Otorgar Puntos */}
      {puntosModalOpen && currentStudentForPuntos && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Otorgar Puntos</h3>
                <p className="text-sm text-slate-400">
                  a {currentStudentForPuntos.nombre} {currentStudentForPuntos.apellido}
                </p>
              </div>
              <button
                onClick={() => setPuntosModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {isLoadingAcciones ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              ) : accionesPuntuables.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No hay acciones puntuables configuradas</p>
                </div>
              ) : (
                accionesPuntuables.map((accion) => {
                  const codigo = (accion.codigo || accion.nombre).toUpperCase();
                  const emoji = ACCION_EMOJIS[codigo] || '⭐';
                  return (
                    <button
                      key={accion.id}
                      onClick={() => setSelectedAccionId(accion.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedAccionId === accion.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-white'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{accion.nombre}</span>
                          {accion.descripcion && (
                            <span className="text-xs text-slate-500">{accion.descripcion}</span>
                          )}
                        </div>
                      </span>
                      <span className="text-sm font-bold text-amber-400">+{accion.puntos} XP</span>
                    </button>
                  );
                })
              )}
            </div>

            <input
              type="text"
              value={puntosContexto}
              onChange={(e) => setPuntosContexto(e.target.value)}
              placeholder="Contexto adicional (opcional)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 mb-4"
            />

            <button
              onClick={handleOtorgarPuntos}
              disabled={!selectedAccionId || isSubmittingPuntos}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {isSubmittingPuntos ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Star size={18} />
              )}
              Otorgar Puntos
            </button>
          </div>
        </div>
      )}

      {/* Observation Modal */}
      {obsModalOpen && currentStudentForObs && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Nueva Observación</h3>
                <p className="text-sm text-slate-400">
                  para {currentStudentForObs.nombre} {currentStudentForObs.apellido}
                </p>
              </div>
              <button
                onClick={() => setObsModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tipo y Prioridad */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                <select
                  value={obsTipo}
                  onChange={(e) => setObsTipo(e.target.value as TipoObservacion)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Academica">Académica</option>
                  <option value="Conductual">Conductual</option>
                  <option value="Asistencia">Asistencia</option>
                  <option value="Logro">Logro</option>
                  <option value="Incidente">Incidente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Prioridad</label>
                <select
                  value={obsPrioridad}
                  onChange={(e) => setObsPrioridad(e.target.value as PrioridadObservacion)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
            </div>

            {/* Fecha del evento */}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">Fecha del evento</label>
              <input
                type="date"
                value={obsFechaEvento}
                onChange={(e) => setObsFechaEvento(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Contenido */}
            <textarea
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              placeholder="Describe la observación..."
              className="w-full h-28 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
              autoFocus
            />

            <button
              onClick={saveObservation}
              disabled={isSubmittingObs || !newObservation.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              {isSubmittingObs ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Guardar Observación
            </button>
          </div>
        </div>
      )}

      {/* Observation Detail Modal */}
      {obsDetailModalOpen && selectedObservacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    selectedObservacion.tipo === 'Logro'
                      ? 'bg-emerald-500/20'
                      : selectedObservacion.tipo === 'Incidente'
                        ? 'bg-red-500/20'
                        : selectedObservacion.tipo === 'Conductual'
                          ? 'bg-amber-500/20'
                          : 'bg-blue-500/20'
                  }`}
                >
                  {selectedObservacion.tipo === 'Logro' ? (
                    <Trophy size={20} className="text-emerald-400" />
                  ) : selectedObservacion.tipo === 'Incidente' ? (
                    <AlertTriangle size={20} className="text-red-400" />
                  ) : (
                    <FileText size={20} className="text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Detalle de Observación</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedObservacion.fechaEvento).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setObsDetailModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Info básica */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedObservacion.tipo === 'Logro'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : selectedObservacion.tipo === 'Incidente'
                        ? 'bg-red-500/20 text-red-400'
                        : selectedObservacion.tipo === 'Conductual'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {selectedObservacion.tipo}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedObservacion.prioridad === 'Urgente'
                      ? 'bg-red-500/20 text-red-400'
                      : selectedObservacion.prioridad === 'Alta'
                        ? 'bg-orange-500/20 text-orange-400'
                        : selectedObservacion.prioridad === 'Media'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  Prioridad: {selectedObservacion.prioridad}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedObservacion.estado === 'Abierta'
                      ? 'bg-blue-500/20 text-blue-400'
                      : selectedObservacion.estado === 'EnSeguimiento'
                        ? 'bg-amber-500/20 text-amber-400'
                        : selectedObservacion.estado === 'Resuelta'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {selectedObservacion.estado === 'EnSeguimiento'
                    ? 'En Seguimiento'
                    : selectedObservacion.estado}
                </span>
              </div>

              {/* Estudiantes involucrados */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                  Estudiantes ({selectedObservacion.estudiantes.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedObservacion.estudiantes.map((e) => (
                    <span
                      key={e.estudiante.id}
                      className="px-2 py-1 bg-slate-700 rounded-lg text-sm text-white"
                    >
                      {e.estudiante.nombre} {e.estudiante.apellido}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contenido de la observación */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Contenido</h4>
                <p className="text-sm text-white whitespace-pre-wrap">
                  {selectedObservacion.contenido}
                </p>
              </div>

              {/* Seguimientos */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                  Seguimientos ({selectedObservacion.seguimientos?.length || 0})
                </h4>
                {selectedObservacion.seguimientos && selectedObservacion.seguimientos.length > 0 ? (
                  <div className="space-y-3">
                    {selectedObservacion.seguimientos.map((seg) => (
                      <div key={seg.id} className="border-l-2 border-indigo-500 pl-3 py-1">
                        <p className="text-sm text-white">{seg.contenido}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(seg.createdAt).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Sin seguimientos aún</p>
                )}

                {/* Agregar nuevo seguimiento */}
                {selectedObservacion.estado !== 'Cerrada' && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <textarea
                      value={nuevoSeguimiento}
                      onChange={(e) => setNuevoSeguimiento(e.target.value)}
                      placeholder="Agregar seguimiento..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:border-indigo-500"
                      rows={2}
                    />
                    <button
                      onClick={handleAgregarSeguimiento}
                      disabled={isSubmittingSeguimiento || !nuevoSeguimiento.trim()}
                      className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm rounded-lg flex items-center gap-2 transition-all"
                    >
                      {isSubmittingSeguimiento ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <MessageSquare size={14} />
                      )}
                      Agregar Seguimiento
                    </button>
                  </div>
                )}
              </div>

              {/* Cambiar Estado */}
              {selectedObservacion.estado !== 'Cerrada' && (
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">Cambiar Estado</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedObservacion.estado === 'Abierta' && (
                      <button
                        onClick={() => handleCambiarEstado('EnSeguimiento')}
                        disabled={isChangingEstado}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white text-sm rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        {isChangingEstado ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Clock size={14} />
                        )}
                        Iniciar Seguimiento
                      </button>
                    )}
                    {(selectedObservacion.estado === 'Abierta' ||
                      selectedObservacion.estado === 'EnSeguimiento') && (
                      <button
                        onClick={() => handleCambiarEstado('Resuelta')}
                        disabled={isChangingEstado}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        {isChangingEstado ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Marcar Resuelta
                      </button>
                    )}
                    {selectedObservacion.estado === 'Resuelta' && (
                      <button
                        onClick={() => handleCambiarEstado('Cerrada')}
                        disabled={isChangingEstado}
                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-white text-sm rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        {isChangingEstado ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        Cerrar Observación
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={() => setObsDetailModalOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
