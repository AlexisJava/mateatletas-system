'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  BarChart3,
  Edit,
  Ban,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  BookOpen,
  FileText,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as adminApi from '@/lib/api/admin.api';
import axios from '@/lib/axios';

interface ClaseDetalle {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  anio_lectivo: number;
  cupo_maximo: number;
  nivel?: string | null;
  activo: boolean;
  grupo_id: string;
  docente: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string | null;
  };
  sector?: {
    id: string;
    nombre: string;
    color?: string;
  } | null;
  rutaCurricular?: {
    id: string;
    nombre: string;
    color?: string;
    descripcion?: string | null;
  } | null;
  inscripciones?: Array<{
    id: string;
    estudiante_id: string;
    fecha_inscripcion: string;
    estudiante: {
      id: string;
      nombre: string;
      apellido: string;
      edad?: number | null;
      nivel_escolar?: string | null;
    };
    tutor?: {
      id: string;
      nombre: string;
      apellido: string;
      email: string;
      telefono?: string | null;
    };
  }>;
  total_inscriptos?: number;
  total_asistencias?: number;
  cupos_disponibles?: number;
}

const DIA_SEMANA_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

const SECTOR_COLORS = {
  'Matemática': {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: '🧮',
  },
  'Programación': {
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: '💻',
  },
  'Ciencias': {
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: '🔬',
  },
} as const;

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad?: number | null;
  nivel_escolar?: string | null;
}

export default function ClaseAulaPage() {
  const params = useParams();
  const router = useRouter();
  const claseId = params.id as string;

  const [clase, setClase] = useState<ClaseDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<Estudiante[]>([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<string[]>([]);
  const [isLoadingEstudiantes, setIsLoadingEstudiantes] = useState(false);
  const [estudianteParaRemover, setEstudianteParaRemover] = useState<{ id: string; nombre: string; apellido: string } | null>(null);
  const [planificaciones, setPlanificaciones] = useState<Array<{ id: string; mes: number; anio: number; titulo: string; estado: string }>>([]);
  const [estudianteConObservaciones, setEstudianteConObservaciones] = useState<string | null>(null);
  const [observacionesEstudiante, setObservacionesEstudiante] = useState<Array<{ fecha: string; observaciones?: string; feedback?: string; estado: string }>>([]);

  useEffect(() => {
    if (claseId) {
      loadClase();
    }
  }, [claseId]);

  const loadClase = async () => {
    try {
      setIsLoading(true);
      // Usar el endpoint correcto para ClaseGrupo
      const payload: any = await axios.get(`/admin/clase-grupos/${claseId}`);
      const data =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data: ClaseDetalle }).data
          : (payload as ClaseDetalle);
      setClase(data);

      // Cargar planificaciones del grupo pedagógico
      if (data.grupo_id) {
        await loadPlanificaciones(data.grupo_id, data.anio_lectivo);
      }
    } catch (error) {
      console.error('Error cargando clase:', error);
      router.push('/admin/clases');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlanificaciones = async (grupoId: string, anioLectivo: number) => {
    try {
      // Buscar planificaciones por grupo_id usando el endpoint de grupos
      const payload: any = await axios.get(`/grupos/${grupoId}/planificaciones`, {
        params: {
          anio: anioLectivo,
        }
      });
      const data =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data: unknown }).data
          : payload;
      const planes = Array.isArray(data)
        ? data
        : (data as { data?: typeof planificaciones }).data ?? [];
      setPlanificaciones(planes);
    } catch (error) {
      console.error('Error cargando planificaciones:', error);
      // Si el endpoint no existe aún, simplemente no mostrar plan ificaciones
      setPlanificaciones([]);
    }
  };

  const loadEstudiantesDisponibles = async () => {
    try {
      setIsLoadingEstudiantes(true);
      const payload: any = await axios.get('/estudiantes');
      const data =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data: Estudiante[] }).data
          : payload;
      const estudiantes = Array.isArray(data) ? data : [];

      // Filtrar estudiantes que ya están inscritos
      const estudiantesYaInscritos = clase?.inscripciones?.map(i => i.estudiante_id) || [];
      const disponibles = estudiantes.filter((est: Estudiante) => !estudiantesYaInscritos.includes(est.id));

      setEstudiantesDisponibles(disponibles);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setIsLoadingEstudiantes(false);
    }
  };

  const handleAbrirModalAgregar = () => {
    setShowAgregarModal(true);
    setEstudiantesSeleccionados([]);
    loadEstudiantesDisponibles();
  };

  const handleAgregarEstudiantes = async () => {
    if (estudiantesSeleccionados.length === 0) return;

    try {
      await axios.post(`/admin/clase-grupos/${claseId}/estudiantes`, {
        estudiantes_ids: estudiantesSeleccionados,
      });

      // Recargar la clase para mostrar los cambios
      await loadClase();
      setShowAgregarModal(false);
      setEstudiantesSeleccionados([]);
    } catch (error: any) {
      console.error('Error agregando estudiantes:', error);
      alert(error.response?.data?.message || 'Error al agregar estudiantes');
    }
  };

  const handleRemoverEstudiante = async (estudianteId: string) => {
    try {
      await axios.delete(`/admin/clase-grupos/${claseId}/estudiantes/${estudianteId}`);

      // Recargar la clase para mostrar los cambios
      await loadClase();
      setEstudianteParaRemover(null);
    } catch (error: any) {
      console.error('Error removiendo estudiante:', error);
      alert(error.response?.data?.message || 'Error al remover estudiante');
    }
  };

  const toggleEstudiante = (estudianteId: string) => {
    setEstudiantesSeleccionados(prev =>
      prev.includes(estudianteId)
        ? prev.filter(id => id !== estudianteId)
        : [...prev, estudianteId]
    );
  };

  const handleVerObservaciones = async (estudianteId: string) => {
    try {
      const payload: any = await axios.get(`/admin/clase-grupos/${claseId}/asistencias/historial`, {
        params: { estudiante_id: estudianteId }
      });
      const data =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data: { asistencias?: unknown[] } }).data
          : payload;
      const asistenciasData = Array.isArray(data)
        ? data
        : ((data as { asistencias?: unknown[]; data?: { asistencias?: unknown[] } }).asistencias ??
           (data as { data?: { asistencias?: unknown[] } }).data?.asistencias ??
           []);

      setObservacionesEstudiante(asistenciasData.map((a: { fecha: string; observaciones?: string; feedback?: string; estado: string }) => ({
        fecha: a.fecha,
        observaciones: a.observaciones,
        feedback: a.feedback,
        estado: a.estado,
      })));
      setEstudianteConObservaciones(estudianteId);
    } catch (error) {
      console.error('Error cargando observaciones:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (!clase) {
    return null;
  }

  const sectorNombre = (clase.sector?.nombre || clase.rutaCurricular?.nombre || 'Matemática') as keyof typeof SECTOR_COLORS;
  const sectorConfig = SECTOR_COLORS[sectorNombre] || SECTOR_COLORS['Matemática'];
  const totalInscritos = clase.total_inscriptos || clase.inscripciones?.length || 0;
  const capacidadPorcentaje = clase.cupo_maximo > 0
    ? (totalInscritos / clase.cupo_maximo) * 100
    : 0;

  // Total de asistencias registradas (no porcentaje, sino total de registros)
  const totalAsistenciasRegistradas = clase.total_asistencias || 0;

  return (
    <div className="min-h-screen p-8">
      {/* Header con botón volver */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/clases')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver a Clases</span>
        </button>

        {/* Info principal de la clase */}
        <div className={`backdrop-blur-xl bg-gradient-to-r ${sectorConfig.gradient} rounded-2xl p-8 border border-white/20 shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 text-9xl opacity-10 select-none -mt-8 -mr-8">
            {sectorConfig.icon}
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-4xl shadow-lg">
                    {sectorConfig.icon}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white mb-1">
                      {clase.nombre}
                    </h1>
                    <p className="text-white/80 text-lg font-semibold">
                      {sectorNombre}
                    </p>
                  </div>
                </div>

                {clase.descripcion && (
                  <p className="text-white/90 text-base max-w-2xl mt-4">
                    {clase.descripcion}
                  </p>
                )}
              </div>

              <span
                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex-shrink-0 ${
                  clase.tipo === 'GRUPO_REGULAR'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {clase.tipo === 'GRUPO_REGULAR' ? 'Grupo Regular' : 'Curso Temporal'}
              </span>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm font-medium">Docente</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {clase.docente.nombre} {clase.docente.apellido}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm font-medium">Día</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {DIA_SEMANA_LABELS[clase.dia_semana] || clase.dia_semana}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm font-medium">Horario</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {clase.hora_inicio} - {clase.hora_fin}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm font-medium">Capacidad</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {totalInscritos} / {clase.cupo_maximo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-3 gap-6">
        {/* Columna principal - Estudiantes */}
        <div className="col-span-2 space-y-6">
          {/* Estudiantes inscritos */}
          <div className="backdrop-blur-xl bg-white/[0.03] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-6 h-6" />
                Estudiantes Inscritos
              </h2>
              <button
                onClick={handleAbrirModalAgregar}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                Agregar Estudiante
              </button>
            </div>

            {!clase.inscripciones || clase.inscripciones.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">No hay estudiantes inscritos aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clase.inscripciones.map((inscripcion) => (
                  <div
                    key={inscripcion.id}
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${sectorConfig.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {inscripcion.estudiante.nombre[0]}{inscripcion.estudiante.apellido[0]}
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">
                          {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                        </p>
                        <p className="text-white/50 text-sm">
                          {inscripcion.estudiante.nivel_escolar}
                          {inscripcion.estudiante.edad && ` • ${inscripcion.estudiante.edad} años`}
                        </p>
                        {inscripcion.tutor && (
                          <p className="text-white/40 text-xs mt-1">
                            Tutor: {inscripcion.tutor.nombre} {inscripcion.tutor.apellido}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-white/40 text-xs">
                          Inscripto: {new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleVerObservaciones(inscripcion.estudiante_id)}
                        className="p-2 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all"
                        title="Ver observaciones"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEstudianteParaRemover({
                          id: inscripcion.estudiante_id,
                          nombre: inscripcion.estudiante.nombre,
                          apellido: inscripcion.estudiante.apellido
                        })}
                        className="p-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                        title="Remover estudiante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Planificaciones */}
          <div className="backdrop-blur-xl bg-white/[0.03] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                Planificaciones Mensuales
              </h2>
            </div>

            {planificaciones.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">No hay planificaciones para este grupo</p>
                <p className="text-white/30 text-sm mt-2">
                  Las planificaciones se heredan del grupo pedagógico {clase.codigo}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {planificaciones.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {plan.mes}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">
                          {plan.titulo}
                        </p>
                        <p className="text-white/50 text-xs mt-1">
                          {plan.anio}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                          plan.estado === 'PUBLICADA'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {plan.estado === 'PUBLICADA' ? 'Publicada' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral - Estadísticas y Acciones */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="backdrop-blur-xl bg-white/[0.03] rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estadísticas
            </h3>

            <div className="space-y-6">
              {/* Capacidad */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm font-medium">Ocupación</span>
                  <span className="text-white font-bold">{capacidadPorcentaje.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      capacidadPorcentaje >= 90
                        ? 'from-red-500 to-rose-500'
                        : capacidadPorcentaje >= 75
                        ? 'from-orange-500 to-amber-500'
                        : 'from-green-500 to-emerald-500'
                    } transition-all duration-500`}
                    style={{ width: `${capacidadPorcentaje}%` }}
                  />
                </div>
                <p className="text-white/50 text-xs mt-1">
                  {totalInscritos} de {clase.cupo_maximo} cupos ocupados
                </p>
              </div>

              {/* Asistencias Totales */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm font-medium">Asistencias</span>
                  <span className="text-white font-bold">{totalAsistenciasRegistradas}</span>
                </div>
                <p className="text-white/50 text-xs mt-1">
                  Registros totales de asistencia
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="backdrop-blur-xl bg-white/[0.03] rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Acciones</h3>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/clases')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300 rounded-xl font-semibold transition-all"
              >
                <Edit className="w-4 h-4" />
                Editar Horario
              </button>

              <button
                onClick={() => router.push('/admin/clases')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 rounded-xl font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Agregar Estudiantes */}
      {showAgregarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Agregar Estudiantes</h2>
              <p className="text-white/60 text-sm mt-1">
                Selecciona los estudiantes que deseas inscribir en este horario
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {isLoadingEstudiantes ? (
                <div className="text-center py-8">
                  <p className="text-white/60">Cargando estudiantes...</p>
                </div>
              ) : estudiantesDisponibles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60">No hay estudiantes disponibles para inscribir</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {estudiantesDisponibles.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      onClick={() => toggleEstudiante(estudiante.id)}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                        estudiantesSeleccionados.includes(estudiante.id)
                          ? 'bg-emerald-500/20 border-emerald-500/50'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          estudiantesSeleccionados.includes(estudiante.id)
                            ? 'bg-emerald-500'
                            : 'bg-white/10'
                        }`}>
                          {estudiante.nombre[0]}{estudiante.apellido[0]}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {estudiante.nombre} {estudiante.apellido}
                          </p>
                          <p className="text-white/50 text-sm">
                            {estudiante.nivel_escolar}
                            {estudiante.edad && ` • ${estudiante.edad} años`}
                          </p>
                        </div>
                      </div>
                      {estudiantesSeleccionados.includes(estudiante.id) && (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-sm">
                {estudiantesSeleccionados.length} estudiante(s) seleccionado(s)
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAgregarModal(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAgregarEstudiantes}
                  disabled={estudiantesSeleccionados.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar {estudiantesSeleccionados.length > 0 && `(${estudiantesSeleccionados.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Remover Estudiante */}
      {estudianteParaRemover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Ban className="w-6 h-6 text-red-400" />
                Confirmar Eliminación
              </h2>
            </div>

            <div className="p-6">
              <p className="text-white/80 mb-4">
                ¿Estás seguro de que deseas remover a{' '}
                <span className="font-bold text-white">
                  {estudianteParaRemover.nombre} {estudianteParaRemover.apellido}
                </span>{' '}
                de este horario?
              </p>
              <p className="text-red-400 text-sm">
                Esta acción no se puede deshacer. El estudiante será desinscrito del horario.
              </p>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setEstudianteParaRemover(null)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoverEstudiante(estudianteParaRemover.id)}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 rounded-xl font-semibold transition-all"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Observaciones del Estudiante */}
      {estudianteConObservaciones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Observaciones del Estudiante
                </h2>
                <button
                  onClick={() => setEstudianteConObservaciones(null)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              {clase?.inscripciones && (() => {
                const estudiante = clase.inscripciones.find(i => i.estudiante_id === estudianteConObservaciones)?.estudiante;
                return estudiante ? (
                  <p className="text-white/70 mt-2">
                    {estudiante.nombre} {estudiante.apellido}
                  </p>
                ) : null;
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {observacionesEstudiante.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-lg">No hay observaciones registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {observacionesEstudiante.map((obs, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white/[0.02] border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                          {new Date(obs.fecha).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          obs.estado === 'Presente'
                            ? 'bg-green-500/20 text-green-300'
                            : obs.estado === 'Ausente'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {obs.estado}
                        </span>
                      </div>
                      {obs.observaciones && (
                        <div className="mt-2">
                          <p className="text-white/50 text-sm mb-1">Observaciones:</p>
                          <p className="text-white">{obs.observaciones}</p>
                        </div>
                      )}
                      {obs.feedback && (
                        <div className="mt-2">
                          <p className="text-white/50 text-sm mb-1">Feedback:</p>
                          <p className="text-white">{obs.feedback}</p>
                        </div>
                      )}
                      {!obs.observaciones && !obs.feedback && (
                        <p className="text-white/30 text-sm italic">Sin observaciones para esta fecha</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setEstudianteConObservaciones(null)}
                className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
