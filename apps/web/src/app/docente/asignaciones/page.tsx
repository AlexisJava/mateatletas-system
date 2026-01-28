'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { planificacionesApi, type Asignacion } from '@/lib/api/docentes.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
  Calendar,
  Eye,
  ClipboardList,
  Loader2,
} from 'lucide-react';

export default function DocenteAsignacionesPage(): React.ReactNode {
  const router = useRouter();
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await planificacionesApi.getMisAsignaciones();
      setAsignaciones(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar asignaciones'));
    } finally {
      setIsLoading(false);
    }
  };

  const getProgresoAsignacion = (asignacion: Asignacion) => {
    const totalClases = asignacion.clases.length;
    const clasesActivas = asignacion.estadosClases.filter(
      (e) => e.teoriaActiva || e.practicaActiva,
    ).length;
    return totalClases > 0 ? (clasesActivas / totalClases) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadAsignaciones}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Asignaciones</h1>
          <p className="text-gray-400 mt-1">Gestiona las planificaciones asignadas a tus grupos</p>
        </div>
        <button
          onClick={loadAsignaciones}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Asignaciones</span>
          </div>
          <p className="text-xl font-bold text-white">{asignaciones.length}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total clases</span>
          </div>
          <p className="text-xl font-bold text-white">
            {asignaciones.reduce((sum, a) => sum + a.clases.length, 0)}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Clases activas</span>
          </div>
          <p className="text-xl font-bold text-white">
            {asignaciones.reduce(
              (sum, a) =>
                sum + a.estadosClases.filter((e) => e.teoriaActiva || e.practicaActiva).length,
              0,
            )}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Grupos</span>
          </div>
          <p className="text-xl font-bold text-white">
            {new Set(asignaciones.map((a) => a.claseGrupo.id)).size}
          </p>
        </div>
      </div>

      {/* Lista de Asignaciones */}
      {asignaciones.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Sin asignaciones</h3>
          <p className="text-gray-400">No tienes planificaciones asignadas a tus grupos todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {asignaciones.map((asignacion) => {
            const progreso = getProgresoAsignacion(asignacion);
            const clasesActivas = asignacion.estadosClases.filter(
              (e) => e.teoriaActiva || e.practicaActiva,
            ).length;

            return (
              <div
                key={asignacion.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {asignacion.planificacion.titulo}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Grupo: {asignacion.claseGrupo.nombre}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progreso de activación</span>
                        <span className="text-white">
                          {clasesActivas}/{asignacion.clases.length} clases
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => router.push(`/docente/asignaciones/${asignacion.id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Progreso
                    </button>
                    <button
                      onClick={() => router.push(`/docente/asignaciones/${asignacion.id}/tareas`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Tareas
                    </button>
                  </div>
                </div>

                {/* Preview de clases */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {asignacion.estadosClases.slice(0, 8).map((estado) => {
                      const isActive = estado.teoriaActiva || estado.practicaActiva;
                      return (
                        <div
                          key={estado.clase.id}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                            isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          Clase {estado.clase.numero}
                        </div>
                      );
                    })}
                    {asignacion.estadosClases.length > 8 && (
                      <div className="px-2 py-1 rounded-lg text-xs bg-white/5 text-gray-400">
                        +{asignacion.estadosClases.length - 8} más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
