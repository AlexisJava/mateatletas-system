'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Check,
  XCircle,
  Trash2,
  PauseCircle,
  PlayCircle,
  Settings,
  CreditCard,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  useSuscripcionFamiliar,
  formatMonto,
  formatEstadoSuscripcion,
} from '@/hooks/useSuscripcionFamiliar';
import {
  suscripcionFamiliarApi,
  type BajaInscripcionesResponse,
  type CancelarSuscripcionResponse,
  type HorarioDisponible,
  type InscripcionActividadDetalle,
} from '@/lib/api/suscripcion-familiar.api';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS
// ============================================================================

type ModalType = 'cancelar' | 'baja' | 'pausar' | 'cambiarHorario' | null;

/** Días de la semana para formato de horario */
const DIAS_SEMANA: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

/** Formatear hora de HH:MM:SS a HH:MM */
function formatHora(hora: string): string {
  return hora.slice(0, 5);
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function GestionarSuscripcionPage(): React.ReactElement {
  const router = useRouter();
  const { suscripcion, isLoading, refetch } = useSuscripcionFamiliar();

  // Estados
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [selectedInscripciones, setSelectedInscripciones] = useState<string[]>([]);
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultadoBaja, setResultadoBaja] = useState<BajaInscripcionesResponse | null>(null);
  const [resultadoCancelacion, setResultadoCancelacion] =
    useState<CancelarSuscripcionResponse | null>(null);

  // Estados para cambiar horario
  const [inscripcionParaCambio, setInscripcionParaCambio] =
    useState<InscripcionActividadDetalle | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);

  // Toggle inscripción para baja
  const toggleInscripcion = (id: string): void => {
    setSelectedInscripciones((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Handler para dar de baja inscripciones
  const handleBajaInscripciones = async (): Promise<void> => {
    if (selectedInscripciones.length === 0 || !motivo.trim()) {
      toast.error('Seleccioná al menos una inscripción y escribí un motivo');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await suscripcionFamiliarApi.bajaInscripciones({
        inscripcionIds: selectedInscripciones,
        motivo: motivo.trim(),
      });
      setResultadoBaja(response);
      toast.success('Inscripciones dadas de baja');
      await refetch();
    } catch {
      toast.error('Error al procesar la baja');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para cancelar suscripción
  const handleCancelarSuscripcion = async (): Promise<void> => {
    if (!motivo.trim()) {
      toast.error('Por favor indicá el motivo de la cancelación');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await suscripcionFamiliarApi.cancelarSuscripcion({
        motivo: motivo.trim(),
      });
      setResultadoCancelacion(response);
      toast.success('Suscripción cancelada');
      await refetch();
    } catch {
      toast.error('Error al cancelar la suscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para pausar suscripción
  const handlePausarSuscripcion = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      await suscripcionFamiliarApi.pausarSuscripcion({
        motivo: motivo.trim() || undefined,
      });
      toast.success('Suscripción pausada exitosamente');
      setModalOpen(null);
      setMotivo('');
      await refetch();
    } catch {
      toast.error('Error al pausar la suscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para reactivar suscripción
  const handleReactivarSuscripcion = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      await suscripcionFamiliarApi.reactivarSuscripcion();
      toast.success('Suscripción reactivada exitosamente');
      await refetch();
    } catch {
      toast.error('Error al reactivar la suscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de cambiar horario y cargar horarios disponibles
  const handleOpenCambiarHorario = useCallback(
    async (inscripcion: InscripcionActividadDetalle): Promise<void> => {
      setInscripcionParaCambio(inscripcion);
      setSelectedHorario(null);
      setModalOpen('cambiarHorario');
      setLoadingHorarios(true);

      try {
        const horarios = await suscripcionFamiliarApi.getHorariosDisponibles(
          inscripcion.productoId,
          inscripcion.claseGrupoId ?? undefined,
        );
        setHorariosDisponibles(horarios);
      } catch {
        toast.error('Error al cargar los horarios disponibles');
        setHorariosDisponibles([]);
      } finally {
        setLoadingHorarios(false);
      }
    },
    [],
  );

  // Handler para confirmar cambio de horario
  const handleConfirmarCambioHorario = async (): Promise<void> => {
    if (!inscripcionParaCambio || !selectedHorario) {
      toast.error('Seleccioná un horario');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await suscripcionFamiliarApi.cambiarHorario(
        inscripcionParaCambio.id,
        selectedHorario,
      );
      toast.success(`Horario cambiado a ${response.nuevoHorarioNombre}`);
      setModalOpen(null);
      setInscripcionParaCambio(null);
      setSelectedHorario(null);
      await refetch();
    } catch {
      toast.error('Error al cambiar el horario');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Sin suscripción
  if (!suscripcion) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sin suscripción activa</h2>
          <p className="text-slate-400 mb-6">No tenés una suscripción para gestionar.</p>
          <button
            onClick={() => router.push('/tutor/suscripcion/nueva')}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
          >
            Crear Suscripción
          </button>
        </div>
      </div>
    );
  }

  // Resultado de cancelación
  if (resultadoCancelacion) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Suscripción cancelada</h2>
          <p className="text-slate-400 mb-6">{resultadoCancelacion.mensaje}</p>
          <p className="text-sm text-slate-500 mb-6">
            Fecha de cancelación:{' '}
            {new Date(resultadoCancelacion.fechaCancelacion).toLocaleDateString('es-AR')}
          </p>
          <button
            onClick={() => router.push('/tutor/dashboard')}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  // Resultado de baja de inscripciones
  if (resultadoBaja) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Inscripciones dadas de baja</h2>
          <p className="text-slate-400 mb-6">
            Se dieron de baja {resultadoBaja.inscripcionesBaja.length} inscripción(es).
          </p>

          <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Monto anterior</span>
              <span className="text-white">{formatMonto(resultadoBaja.montoAnterior)}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-slate-400">Nuevo monto mensual</span>
              <span className="text-white font-bold">
                {formatMonto(resultadoBaja.nuevoMontoMensual)}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/tutor/suscripcion')}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
          >
            Volver a mi suscripción
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Fondo ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Gestionar Suscripción</h1>
            <p className="text-slate-400">Administrá tu plan familiar</p>
          </div>
        </div>

        {/* Info de suscripción */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Plan {suscripcion.tier.replace('STEAM_', '')}
                </h2>
                <p
                  className={`text-sm ${
                    suscripcion.estado === 'AUTHORIZED' ? 'text-green-400' : 'text-amber-400'
                  }`}
                >
                  {formatEstadoSuscripcion(suscripcion.estado)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {formatMonto(suscripcion.montoMensual)}
              </p>
              <p className="text-sm text-slate-400">por mes</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{suscripcion.cantidadEstudiantes}</p>
              <p className="text-xs text-slate-400">Estudiantes</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Settings className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{suscripcion.cantidadActividades}</p>
              <p className="text-xs text-slate-400">Actividades</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Calendar className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-white">
                {suscripcion.fechaProximoCobro
                  ? new Date(suscripcion.fechaProximoCobro).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                    })
                  : '-'}
              </p>
              <p className="text-xs text-slate-400">Próximo cobro</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          {/* Pausar suscripción - solo visible cuando está AUTHORIZED */}
          {suscripcion.estado === 'AUTHORIZED' && (
            <button
              onClick={() => setModalOpen('pausar')}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <PauseCircle className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Pausar suscripción</h3>
                  <p className="text-sm text-slate-400">
                    Pausá temporalmente tu plan y los cobros automáticos
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          )}

          {/* Reactivar suscripción - solo visible cuando está PAUSED */}
          {suscripcion.estado === 'PAUSED' && (
            <button
              onClick={handleReactivarSuscripcion}
              disabled={isSubmitting}
              className="w-full bg-green-500/10 backdrop-blur-xl border border-green-500/20 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                  ) : (
                    <PlayCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-green-400 font-medium">Reactivar suscripción</h3>
                  <p className="text-sm text-slate-400">
                    Reactivá tu plan y volvé a tener acceso completo
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-400 transition-colors" />
            </button>
          )}

          {/* Dar de baja inscripciones - solo cuando hay inscripciones activas */}
          {suscripcion.inscripciones.filter((i) => i.estado === 'ACTIVA').length > 0 && (
            <button
              onClick={() => setModalOpen('baja')}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Dar de baja actividades</h3>
                  <p className="text-sm text-slate-400">Eliminá actividades de tu suscripción</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          )}

          {/* Cancelar suscripción - solo cuando no está cancelada */}
          {suscripcion.estado !== 'CANCELLED' && (
            <button
              onClick={() => setModalOpen('cancelar')}
              className="w-full bg-red-500/10 backdrop-blur-xl border border-red-500/20 hover:bg-red-500/20 rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-red-400 font-medium">Cancelar suscripción</h3>
                  <p className="text-sm text-slate-400">Cancelá completamente tu plan familiar</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
            </button>
          )}
        </div>

        {/* Sección de inscripciones activas con opción de cambiar horario */}
        {suscripcion.inscripciones.filter((i) => i.estado === 'ACTIVA' && i.claseGrupoId).length >
          0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Tus actividades con horario
            </h2>
            <div className="space-y-3">
              {suscripcion.inscripciones
                .filter((i) => i.estado === 'ACTIVA' && i.claseGrupoId)
                .map((inscripcion) => (
                  <div
                    key={inscripcion.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{inscripcion.productoNombre}</p>
                      <p className="text-sm text-slate-400">
                        {inscripcion.estudianteNombre}
                        {inscripcion.claseGrupoNombre && (
                          <span className="text-cyan-400"> • {inscripcion.claseGrupoNombre}</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenCambiarHorario(inscripcion)}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm font-medium transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Cambiar horario
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de baja de inscripciones */}
      {modalOpen === 'baja' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(null)}
          />
          <div className="relative bg-[#12121a] border border-white/10 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Dar de baja actividades</h3>
            <p className="text-slate-400 text-sm mb-6">
              Seleccioná las inscripciones que querés dar de baja. El cambio se aplicará al próximo
              período de facturación.
            </p>

            {/* Lista de inscripciones */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {suscripcion.inscripciones
                .filter((i) => i.estado === 'ACTIVA')
                .map((inscripcion) => (
                  <label
                    key={inscripcion.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedInscripciones.includes(inscripcion.id)
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInscripciones.includes(inscripcion.id)}
                      onChange={() => toggleInscripcion(inscripcion.id)}
                      className="w-5 h-5 rounded border-slate-500 text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{inscripcion.productoNombre}</p>
                      <p className="text-slate-400 text-xs">
                        {inscripcion.estudianteNombre}
                        {inscripcion.claseGrupoNombre && ` • ${inscripcion.claseGrupoNombre}`}
                      </p>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {formatMonto(inscripcion.precioConDescuento)}
                    </span>
                  </label>
                ))}
            </div>

            {/* Motivo */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">Motivo de la baja</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Contanos por qué das de baja estas actividades..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500"
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalOpen(null);
                  setSelectedInscripciones([]);
                  setMotivo('');
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBajaInscripciones}
                disabled={isSubmitting || selectedInscripciones.length === 0}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Confirmar baja (${selectedInscripciones.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelar suscripción */}
      {modalOpen === 'cancelar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(null)}
          />
          <div className="relative bg-[#12121a] border border-white/10 rounded-3xl p-6 max-w-lg w-full">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              ¿Cancelar suscripción?
            </h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Esta acción cancelará tu suscripción familiar completamente. Perderás acceso a todas
              las actividades al finalizar el período actual.
            </p>

            {/* Motivo */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">Motivo de la cancelación</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ayudanos a mejorar contándonos por qué cancelás..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-red-500"
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalOpen(null);
                  setMotivo('');
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                Mantener suscripción
              </button>
              <button
                onClick={handleCancelarSuscripcion}
                disabled={isSubmitting || !motivo.trim()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Sí, cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pausar suscripción */}
      {modalOpen === 'pausar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalOpen(null)}
          />
          <div className="relative bg-[#12121a] border border-white/10 rounded-3xl p-6 max-w-lg w-full">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PauseCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">¿Pausar suscripción?</h3>
            <p className="text-slate-400 text-sm text-center mb-4">Al pausar tu suscripción:</p>

            {/* Información sobre lo que implica pausar */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">
                    Se pausarán los cobros automáticos de MercadoPago
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">
                    Todas las inscripciones activas quedarán pausadas
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">Podés reactivar en cualquier momento</span>
                </li>
              </ul>
            </div>

            {/* Motivo opcional */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Motivo de la pausa (opcional)
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Contanos por qué pausás tu suscripción..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500"
                rows={2}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalOpen(null);
                  setMotivo('');
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handlePausarSuscripcion}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Sí, pausar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambiar horario */}
      {modalOpen === 'cambiarHorario' && inscripcionParaCambio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setModalOpen(null);
              setInscripcionParaCambio(null);
              setSelectedHorario(null);
            }}
          />
          <div className="relative bg-[#12121a] border border-white/10 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Cambiar horario</h3>
            <p className="text-slate-400 text-sm text-center mb-2">
              {inscripcionParaCambio.productoNombre}
            </p>
            <p className="text-cyan-400 text-sm text-center mb-6">
              {inscripcionParaCambio.estudianteNombre} •{' '}
              {inscripcionParaCambio.claseGrupoNombre ?? 'Sin horario actual'}
            </p>

            {/* Lista de horarios disponibles */}
            {loadingHorarios ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                <p className="text-slate-400 text-sm">Cargando horarios disponibles...</p>
              </div>
            ) : horariosDisponibles.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center mb-6">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-400 text-sm">No hay otros horarios disponibles</p>
                <p className="text-slate-400 text-xs mt-1">
                  Todos los grupos están llenos o no hay alternativas.
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {horariosDisponibles.map((horario) => (
                  <label
                    key={horario.id}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      selectedHorario === horario.id
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    } ${horario.cuposDisponibles === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="horario"
                      checked={selectedHorario === horario.id}
                      onChange={() => setSelectedHorario(horario.id)}
                      disabled={horario.cuposDisponibles === 0}
                      className="w-5 h-5 text-cyan-500 focus:ring-cyan-500 border-slate-500"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{horario.nombre}</p>
                      <p className="text-slate-400 text-sm">
                        {DIAS_SEMANA[horario.diaSemana] ?? horario.diaSemana} •{' '}
                        {formatHora(horario.horaInicio)} - {formatHora(horario.horaFin)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        horario.cuposDisponibles > 3
                          ? 'bg-green-500/20 text-green-400'
                          : horario.cuposDisponibles > 0
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {horario.cuposDisponibles > 0
                        ? `${horario.cuposDisponibles} cupos`
                        : 'Completo'}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalOpen(null);
                  setInscripcionParaCambio(null);
                  setSelectedHorario(null);
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarCambioHorario}
                disabled={isSubmitting || !selectedHorario || horariosDisponibles.length === 0}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar cambio'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
