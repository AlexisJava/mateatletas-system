'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  tutoresApi,
  type EstadoVeranoResponse,
  type EstudianteVerano,
  type DecisionVerano,
} from '@/lib/api/tutores.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  ArrowLeft,
  Sun,
  Calendar,
  Users,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Palmtree,
  Play,
  Pause,
} from 'lucide-react';

export default function TutorVeranoPage(): React.ReactNode {
  const router = useRouter();
  const [estadoVerano, setEstadoVerano] = useState<EstadoVeranoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadEstadoVerano = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tutoresApi.getEstadoVerano();
      setEstadoVerano(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar estado de verano'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstadoVerano();
  }, [loadEstadoVerano]);

  const handleDecidir = async (estudianteId: string, decision: DecisionVerano) => {
    if (loadingEstudiantes.has(estudianteId)) return;

    const confirmMessages: Record<DecisionVerano, string> = {
      COLONIA: '¿Inscribir a Colonia de Verano? Se cobrará matrícula de $40.000.',
      CONTINUIDAD: '¿Continuar con acceso asincrónico durante el verano?',
      BAJA: '¿Dar de baja la suscripción? Esta acción pausará el acceso.',
    };

    if (!confirm(confirmMessages[decision])) return;

    try {
      setLoadingEstudiantes((prev) => new Set(prev).add(estudianteId));
      const response = await tutoresApi.decidirVerano({ estudianteId, decision });
      alert(response.mensaje);
      await loadEstadoVerano();
    } catch (err) {
      alert(getErrorMessage(err, 'Error al procesar decisión'));
    } finally {
      setLoadingEstudiantes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(estudianteId);
        return newSet;
      });
    }
  };

  const handleSolicitarColonia = async (estudianteId: string) => {
    if (loadingEstudiantes.has(estudianteId)) return;
    if (!confirm('¿Solicitar cambio a Colonia? Se cobrará matrícula de $40.000 si hay cupo.'))
      return;

    try {
      setLoadingEstudiantes((prev) => new Set(prev).add(estudianteId));
      const response = await tutoresApi.solicitarColonia({ estudianteId });
      alert(response.mensaje);
      await loadEstadoVerano();
    } catch (err) {
      alert(getErrorMessage(err, 'Error al solicitar Colonia'));
    } finally {
      setLoadingEstudiantes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(estudianteId);
        return newSet;
      });
    }
  };

  const handleCancelarColonia = async (estudianteId: string) => {
    if (loadingEstudiantes.has(estudianteId)) return;
    if (
      !confirm(
        '¿Cancelar Colonia y volver a Continuidad? ATENCIÓN: Perderá la matrícula de $40.000 (no reembolsable).',
      )
    )
      return;

    try {
      setLoadingEstudiantes((prev) => new Set(prev).add(estudianteId));
      const response = await tutoresApi.cancelarColonia({
        estudianteId,
        confirmaPerderMatricula: true,
      });
      alert(response.mensaje);
      await loadEstadoVerano();
    } catch (err) {
      alert(getErrorMessage(err, 'Error al cancelar Colonia'));
    } finally {
      setLoadingEstudiantes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(estudianteId);
        return newSet;
      });
    }
  };

  const getDecisionBadge = (decision: string | null) => {
    switch (decision) {
      case 'COLONIA':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-orange-500/20 text-orange-400">
            <Palmtree className="w-4 h-4" />
            Colonia
          </span>
        );
      case 'CONTINUIDAD':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-green-500/20 text-green-400">
            <Play className="w-4 h-4" />
            Continuidad
          </span>
        );
      case 'BAJA':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-red-500/20 text-red-400">
            <Pause className="w-4 h-4" />
            Baja
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-yellow-500/20 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            Sin decidir
          </span>
        );
    }
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
            onClick={loadEstadoVerano}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!estadoVerano) return null;

  const estudiantesSinDecidir = estadoVerano.estudiantes.filter((e) => !e.decision).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/tutor/dashboard')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sun className="w-7 h-7 text-orange-400" />
            Decisiones de Verano
          </h1>
          <p className="text-gray-400 mt-1">
            Configura el acceso de tus hijos durante el período de verano
          </p>
        </div>
        <button
          onClick={loadEstadoVerano}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Status Banner */}
      <div
        className={`mb-8 p-4 rounded-xl border ${
          estadoVerano.puedeDecidir
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {estadoVerano.puedeDecidir ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-yellow-400" />
          )}
          <div>
            <p className={estadoVerano.puedeDecidir ? 'text-green-400' : 'text-yellow-400'}>
              {estadoVerano.puedeDecidir
                ? 'Período de decisión activo'
                : 'Fuera del período de decisión'}
            </p>
            <p className="text-sm text-gray-400">
              Fecha límite:{' '}
              {new Date(estadoVerano.fechaLimite).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">Total Hijos</span>
          </div>
          <p className="text-2xl font-bold text-white">{estadoVerano.estudiantes.length}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">Sin Decidir</span>
          </div>
          <p className="text-2xl font-bold text-white">{estudiantesSinDecidir}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-gray-400">Días Restantes</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {Math.max(
              0,
              Math.ceil(
                (new Date(estadoVerano.fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              ),
            )}
          </p>
        </div>
      </div>

      {/* Students List */}
      <h2 className="text-xl font-semibold text-white mb-4">Estado por Hijo</h2>

      <div className="space-y-4">
        {estadoVerano.estudiantes.map((estudiante) => {
          const isProcessing = loadingEstudiantes.has(estudiante.id);
          return (
            <div
              key={estudiante.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{estudiante.nombre}</h3>
                    <p className="text-sm text-gray-400">
                      {estudiante.cuposColoniaDisponibles > 0
                        ? `${estudiante.cuposColoniaDisponibles} cupos disponibles para Colonia`
                        : 'Sin cupos disponibles para Colonia'}
                    </p>
                  </div>
                </div>

                {getDecisionBadge(estudiante.decision)}
              </div>

              {/* Actions */}
              {estadoVerano.puedeDecidir && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {!estudiante.decision ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleDecidir(estudiante.id, 'COLONIA')}
                        disabled={isProcessing || estudiante.cuposColoniaDisponibles === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg text-orange-400 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Palmtree className="w-4 h-4" />
                        )}
                        Colonia ($40k matrícula)
                      </button>
                      <button
                        onClick={() => handleDecidir(estudiante.id, 'CONTINUIDAD')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Continuidad (asincrónico)
                      </button>
                      <button
                        onClick={() => handleDecidir(estudiante.id, 'BAJA')}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                        Dar de Baja
                      </button>
                    </div>
                  ) : estudiante.decision === 'CONTINUIDAD' ? (
                    <button
                      onClick={() => handleSolicitarColonia(estudiante.id)}
                      disabled={isProcessing || estudiante.cuposColoniaDisponibles === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg text-orange-400 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Palmtree className="w-4 h-4" />
                      )}
                      Cambiar a Colonia
                    </button>
                  ) : estudiante.decision === 'COLONIA' ? (
                    <button
                      onClick={() => handleCancelarColonia(estudiante.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Cancelar Colonia (pierde matrícula)
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Información sobre las opciones</h3>
        <div className="space-y-4 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <Palmtree className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Colonia de Verano</p>
              <p>
                Clases sincrónicas durante enero. Matrícula de $40.000 (no reembolsable). Cupos
                limitados.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Play className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Continuidad</p>
              <p>Acceso asincrónico a todo el contenido durante el verano. Sin costo adicional.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Pause className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Baja</p>
              <p>Pausa la suscripción durante el verano. Se puede reactivar en marzo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
