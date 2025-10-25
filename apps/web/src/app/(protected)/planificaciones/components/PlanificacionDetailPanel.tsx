'use client';

import { useEffect, useState } from 'react';
import {
  usePlanificacionesStore,
} from '@/stores/planificaciones.store';
import {
  ComponenteActividad,
  CreateActividadRequest,
  EstadoPlanificacion,
} from '@/types/planificacion.types';
import {
  X,
  Loader2,
  Trash2,
  PlusCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';

interface PlanificacionDetailPanelProps {
  planificacionId: string | null;
  onClose: () => void;
}

const COMPONENTES: ComponenteActividad[] = ['juego', 'video', 'pdf', 'ejercicio'];

const ESTADO_ACTIONS: { label: string; estado: EstadoPlanificacion; description: string }[] = [
  { label: 'Marcar como borrador', estado: 'BORRADOR', description: 'Mantener en edición' },
  { label: 'Publicar', estado: 'PUBLICADA', description: 'Hacer visible para docentes' },
  { label: 'Archivar', estado: 'ARCHIVADA', description: 'Ocultar y guardar historial' },
];

export const PlanificacionDetailPanel: React.FC<PlanificacionDetailPanelProps> = ({
  planificacionId,
  onClose,
}) => {
  const {
    detalle,
    isLoadingDetalle,
    isSubmitting,
    fetchPlanificacionById,
    updatePlanificacion,
    deletePlanificacion,
    addActividad,
    deleteActividad,
    clearMessages,
    resetDetalle,
    error,
    success,
  } = usePlanificacionesStore();

  const [actividadForm, setActividadForm] = useState<Omit<CreateActividadRequest, 'props'>>({
    semana: 1,
    componente: 'juego',
    descripcion: '',
    orden: 1,
  });

  useEffect(() => {
    if (planificacionId) {
      fetchPlanificacionById(planificacionId);
    }
  }, [planificacionId, fetchPlanificacionById]);

  useEffect(() => {
    if (detalle && planificacionId === detalle.id) {
      setActividadForm((prev) => ({
        ...prev,
        orden: detalle.actividades.length + 1,
      }));
    }
  }, [detalle, planificacionId]);

  if (!planificacionId) {
    return null;
  }

  const handleClose = () => {
    clearMessages();
    resetDetalle();
    onClose();
  };

  const handleStatusChange = async (estado: EstadoPlanificacion) => {
    if (!detalle || detalle.estado === estado) return;
    await updatePlanificacion(detalle.id, { estado });
  };

  const handleDeletePlanificacion = async () => {
    if (!detalle) return;
    if (!confirm('¿Eliminar esta planificación? Esta acción no se puede deshacer.')) return;
    const removed = await deletePlanificacion(detalle.id);
    if (removed) {
      handleClose();
    }
  };

  const handleActividadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!detalle) return;

    if (!actividadForm.descripcion.trim()) {
      alert('La descripción de la actividad es obligatoria');
      return;
    }

    await addActividad(detalle.id, {
      semana: actividadForm.semana,
      componente: actividadForm.componente,
      descripcion: actividadForm.descripcion.trim(),
      orden: actividadForm.orden,
      props: {},
    });

    setActividadForm((prev) => ({
      ...prev,
      descripcion: '',
      semana: 1,
    }));
  };

  const handleDeleteActividad = async (actividadId: string) => {
    if (!detalle) return;
    if (!confirm('¿Eliminar esta actividad?')) return;
    await deleteActividad(detalle.id, actividadId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">Detalle de planificación</p>
            <h2 className="text-2xl font-semibold text-white">{detalle?.titulo || 'Planificación'}</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {(error || success) && (
          <div className="mb-4 space-y-2">
            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        {isLoadingDetalle && (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-white/70">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Cargando detalle...</p>
          </div>
        )}

        {!isLoadingDetalle && !detalle && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
            No se encontró la planificación seleccionada.
          </div>
        )}

        {detalle && (
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/60">Información general</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-white/80">
                  <div>
                    <p className="text-white/50 text-xs uppercase">Grupo</p>
                    <p className="font-semibold text-white">{detalle.grupo?.codigo || detalle.codigo_grupo}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase">Período</p>
                    <p className="font-semibold text-white">
                      {detalle.mes.toString().padStart(2, '0')}/{detalle.anio}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase">Actividades</p>
                    <p className="font-semibold text-white">{detalle.total_actividades}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase">Asignaciones</p>
                    <p className="font-semibold text-white">{detalle.total_asignaciones}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white/80">Acciones rápidas</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {ESTADO_ACTIONS.map((action) => (
                    <button
                      key={action.estado}
                      onClick={() => handleStatusChange(action.estado)}
                      disabled={isSubmitting || detalle.estado === action.estado}
                      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        detalle.estado === action.estado
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                        {action.label}
                      </span>
                      <span className="text-xs text-white/50">{action.description}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleDeletePlanificacion}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar planificación
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/80">Actividades ({detalle.actividades.length})</h3>
              </div>

              <form
                onSubmit={handleActividadSubmit}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
              >
                <p className="text-xs uppercase text-white/50 font-semibold">Agregar actividad</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-white/50">
                    Semana
                    <input
                      type="number"
                      min={1}
                      max={4}
                      value={actividadForm.semana}
                      onChange={(event) =>
                        setActividadForm((prev) => ({ ...prev, semana: Number(event.target.value) }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-400 focus:outline-none"
                    />
                  </label>
                  <label className="text-xs font-semibold text-white/50">
                    Orden
                    <input
                      type="number"
                      min={1}
                      value={actividadForm.orden}
                      onChange={(event) =>
                        setActividadForm((prev) => ({ ...prev, orden: Number(event.target.value) }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-400 focus:outline-none"
                    />
                  </label>
                  <label className="text-xs font-semibold text-white/50">
                    Componente
                    <select
                      value={actividadForm.componente}
                      onChange={(event) =>
                        setActividadForm((prev) => ({
                          ...prev,
                          componente: event.target.value as ComponenteActividad,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-400 focus:outline-none"
                    >
                      {COMPONENTES.map((componente) => (
                        <option key={componente} value={componente} className="text-slate-900">
                          {componente}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-white/50 sm:col-span-2">
                    Descripción
                    <textarea
                      value={actividadForm.descripcion}
                      onChange={(event) =>
                        setActividadForm((prev) => ({ ...prev, descripcion: event.target.value }))
                      }
                      className="mt-1 h-20 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-400 focus:outline-none"
                      placeholder="Describe la actividad para la semana seleccionada"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl border border-pink-500/40 bg-pink-500/20 px-4 py-2 text-sm font-semibold text-pink-100 hover:bg-pink-500/30 disabled:opacity-60"
                >
                  <PlusCircle className="h-4 w-4" />
                  Agregar actividad
                </button>
              </form>

              <div className="space-y-3">
                {detalle.actividades.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
                    Aún no hay actividades registradas.
                  </div>
                )}
                {detalle.actividades.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="text-white font-semibold">
                        Semana {actividad.semana} · Orden {actividad.orden}
                      </p>
                      <p className="text-xs text-white/50 uppercase">{actividad.componente}</p>
                      <p className="mt-2 text-sm text-white/70">{actividad.descripcion}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteActividad(actividad.id)}
                      disabled={isSubmitting}
                      className="rounded-full border border-red-500/30 bg-red-500/10 p-2 text-red-200 hover:bg-red-500/20"
                      aria-label="Eliminar actividad"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 text-sm text-white/70">
              <h3 className="text-sm font-semibold text-white/80">Notas</h3>
              <p>
                {detalle.notas_docentes
                  ? detalle.notas_docentes
                  : 'No hay notas para docentes registradas.'}
              </p>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-white/40">Objetivos de aprendizaje</p>
                <ul className="mt-3 space-y-2 text-sm text-white/70 list-disc list-inside">
                  {detalle.objetivos_aprendizaje.length > 0 ? (
                    detalle.objetivos_aprendizaje.map((objetivo, index) => (
                      <li key={`${objetivo}-${index}`}>{objetivo}</li>
                    ))
                  ) : (
                    <li className="list-none text-white/50">Sin objetivos cargados.</li>
                  )}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <p className="text-xs uppercase text-white/40">Acceso directo</p>
              <button
                onClick={() => {
                  if (!detalle) return;
                  const url = `/admin/planificaciones/${detalle.id}`;
                  void navigator.clipboard.writeText(window.location.origin + url);
                  alert('Enlace copiado al portapapeles');
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                <Send className="h-4 w-4" />
                Copiar enlace de administración
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
