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
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as adminApi from '@/lib/api/admin.api';

interface ClaseDetalle {
  id: string;
  nombre: string;
  fecha_hora_inicio: string;
  duracion_minutos: number;
  cupo_maximo: number;
  estado: 'Programada' | 'Cancelada';
  descripcion?: string;
  docente: {
    id: string;
    nombre: string;
    apellido: string;
  };
  sector?: {
    id: string;
    nombre: string;
  };
  rutaCurricular?: {
    id: string;
    nombre: string;
  };
  inscripciones?: Array<{
    id: string;
    estudiante: {
      id: string;
      nombre: string;
      apellido: string;
      nivel_escolar: string;
    };
  }>;
  asistencias?: Array<{
    id: string;
    estudiante_id: string;
    asistio: boolean;
  }>;
}

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

export default function ClaseAulaPage() {
  const params = useParams();
  const router = useRouter();
  const claseId = params.id as string;

  const [clase, setClase] = useState<ClaseDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (claseId) {
      loadClase();
    }
  }, [claseId]);

  const loadClase = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.obtenerClase(claseId);
      setClase(data.data as ClaseDetalle);
    } catch (error) {
      console.error('Error cargando clase:', error);
      router.push('/admin/clases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.eliminarClase(claseId);
      router.push('/admin/clases');
    } catch (error) {
      console.error('Error eliminando clase:', error);
      alert('Error al eliminar la clase');
    }
  };

  const handleCancel = async () => {
    try {
      await adminApi.cancelarClase(claseId);
      await loadClase();
    } catch (error) {
      console.error('Error cancelando clase:', error);
      alert('Error al cancelar la clase');
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
  const totalInscritos = clase.inscripciones?.length || 0;
  const capacidadPorcentaje = clase.cupo_maximo > 0
    ? (totalInscritos / clase.cupo_maximo) * 100
    : 0;

  // Calcular asistencias usando el array de asistencias
  const asistencias = clase.asistencias?.filter(a => a.asistio === true).length || 0;
  const asistenciaPorcentaje = totalInscritos > 0
    ? (asistencias / totalInscritos) * 100
    : 0;

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
                  clase.estado === 'Programada'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {clase.estado}
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
                  <span className="text-white/70 text-sm font-medium">Fecha</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {format(new Date(clase.fecha_hora_inicio), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm font-medium">Horario</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {format(new Date(clase.fecha_hora_inicio), 'HH:mm', { locale: es })} hs
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
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg">
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
                {clase.inscripciones.map((inscripcion) => {
                  // Buscar si hay asistencia para este estudiante
                  const asistencia = clase.asistencias?.find(a => a.estudiante_id === inscripcion.estudiante.id);

                  return (
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
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {asistencia ? (
                          asistencia.asistio ? (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              Asistió
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm font-semibold">
                              <XCircle className="w-4 h-4" />
                              Ausente
                            </span>
                          )
                        ) : (
                          <span className="text-white/40 text-sm">Sin registro</span>
                        )}
                      </div>
                    </div>
                  );
                })}
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

              {/* Asistencia */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm font-medium">Asistencia</span>
                  <span className="text-white font-bold">{asistenciaPorcentaje.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${asistenciaPorcentaje}%` }}
                  />
                </div>
                <p className="text-white/50 text-xs mt-1">
                  {asistencias} de {totalInscritos} estudiantes asistieron
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="backdrop-blur-xl bg-white/[0.03] rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Acciones</h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 rounded-xl font-semibold transition-all">
                <Edit className="w-4 h-4" />
                Editar Clase
              </button>

              {clase.estado === 'Programada' && (
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 text-orange-300 rounded-xl font-semibold transition-all"
                >
                  <Ban className="w-4 h-4" />
                  Cancelar Clase
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 rounded-xl font-semibold transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Clase
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-900/95 to-teal-900/95 rounded-xl p-6 max-w-md w-full border border-red-500/50 shadow-2xl shadow-red-500/30">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Eliminar Clase</h2>
            <p className="text-white/70 mb-2">
              ¿Estás seguro de que deseas eliminar permanentemente esta clase?
            </p>
            <p className="text-purple-300 font-bold mb-3">
              {clase.nombre}
            </p>
            <p className="text-yellow-300/80 text-sm mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              ⚠️ Esta acción no se puede deshacer. Se eliminarán {totalInscritos} inscripciones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/40 font-semibold"
              >
                Sí, Eliminar
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 backdrop-blur-xl bg-emerald-500/[0.08] border border-emerald-500/30 text-white/90 py-2 px-4 rounded-lg hover:bg-emerald-500/20 transition-all font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
