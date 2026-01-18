'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  User,
  Loader2,
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Users as UsersIcon,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useSuscripcionFamiliar, formatMonto } from '@/hooks/useSuscripcionFamiliar';
import {
  suscripcionFamiliarApi,
  type InscripcionActividadRequest,
  type AgregarInscripcionesResponse,
} from '@/lib/api/suscripcion-familiar.api';
import { catalogoApi, type ClubConGrupos, type ClaseGrupoDisponible } from '@/lib/api/catalogo.api';
import { tutoresApi, type HijoInfo } from '@/lib/api/tutores.api';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS
// ============================================================================

type MundoSTEAM = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';

interface SelectedActivity {
  estudianteId: string;
  estudianteNombre: string;
  productoId: string;
  productoNombre: string;
  claseGrupoId?: string;
  claseGrupoNombre?: string;
  precio: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AgregarActividadPage(): React.ReactElement {
  const router = useRouter();
  const { suscripcion, isLoading: loadingSuscripcion, refetch } = useSuscripcionFamiliar();

  // Estados del wizard
  const [step, setStep] = useState<'estudiante' | 'producto' | 'horario' | 'confirmar'>(
    'estudiante',
  );
  const [hijos, setHijos] = useState<HijoInfo[]>([]);
  const [loadingHijos, setLoadingHijos] = useState(true);

  // Selecciones
  const [selectedEstudiante, setSelectedEstudiante] = useState<HijoInfo | null>(null);
  const [selectedMundo, setSelectedMundo] = useState<MundoSTEAM | null>(null);
  const [clubes, setClubes] = useState<ClubConGrupos[]>([]);
  const [loadingClubes, setLoadingClubes] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ClubConGrupos | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<ClaseGrupoDisponible | null>(null);

  // Actividades a agregar
  const [actividades, setActividades] = useState<SelectedActivity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState<AgregarInscripcionesResponse | null>(null);

  // Cargar hijos al montar
  useEffect(() => {
    const loadHijos = async (): Promise<void> => {
      try {
        const dashboard = await tutoresApi.getDashboardResumen();
        setHijos(dashboard.hijos);
      } catch (error) {
        console.error('Error cargando hijos:', error);
        toast.error('Error al cargar los estudiantes');
      } finally {
        setLoadingHijos(false);
      }
    };
    loadHijos();
  }, []);

  // Cargar clubes cuando se selecciona estudiante y mundo
  useEffect(() => {
    if (!selectedEstudiante || !selectedMundo) return;

    const loadClubes = async (): Promise<void> => {
      setLoadingClubes(true);
      try {
        const casa = selectedEstudiante.casa || 'QUANTUM';
        const result = await catalogoApi.getClubesByCasaYMundo(casa, selectedMundo);
        setClubes(result);
      } catch (error) {
        console.error('Error cargando clubes:', error);
        toast.error('Error al cargar las actividades');
      } finally {
        setLoadingClubes(false);
      }
    };
    loadClubes();
  }, [selectedEstudiante, selectedMundo]);

  // Verificar si el estudiante ya tiene la actividad
  const yaInscripto = (productoId: string, estudianteId: string): boolean => {
    // Verificar en suscripción existente
    const enSuscripcion = suscripcion?.inscripciones.some(
      (i) => i.productoId === productoId && i.estudianteId === estudianteId,
    );
    // Verificar en actividades a agregar
    const enPendientes = actividades.some(
      (a) => a.productoId === productoId && a.estudianteId === estudianteId,
    );
    return enSuscripcion || enPendientes;
  };

  // Handler para agregar actividad a la lista
  const handleAgregarActividad = (): void => {
    if (!selectedEstudiante || !selectedClub) return;

    // Para tier sincrónico necesita grupo
    if (suscripcion?.tier === 'STEAM_SINCRONICO' && !selectedGrupo) {
      toast.error('Debés seleccionar un horario para el plan Sincrónico');
      return;
    }

    const nuevaActividad: SelectedActivity = {
      estudianteId: selectedEstudiante.id,
      estudianteNombre: `${selectedEstudiante.nombre} ${selectedEstudiante.apellido}`,
      productoId: selectedClub.id,
      productoNombre: selectedClub.nombre,
      claseGrupoId: selectedGrupo?.id,
      claseGrupoNombre: selectedGrupo
        ? `${selectedGrupo.diaSemana} ${selectedGrupo.horaInicio}`
        : undefined,
      precio: selectedClub.precioMensual,
    };

    setActividades([...actividades, nuevaActividad]);
    resetSelections();
    toast.success('Actividad agregada');
  };

  // Resetear selecciones para agregar otra
  const resetSelections = (): void => {
    setSelectedEstudiante(null);
    setSelectedMundo(null);
    setSelectedClub(null);
    setSelectedGrupo(null);
    setClubes([]);
    setStep('estudiante');
  };

  // Quitar actividad de la lista
  const handleQuitarActividad = (index: number): void => {
    setActividades(actividades.filter((_, i) => i !== index));
  };

  // Confirmar y enviar
  const handleConfirmar = async (): Promise<void> => {
    if (actividades.length === 0) return;

    setIsSubmitting(true);
    try {
      const inscripciones: InscripcionActividadRequest[] = actividades.map((a) => ({
        estudianteId: a.estudianteId,
        productoId: a.productoId,
        claseGrupoId: a.claseGrupoId,
      }));

      const response = await suscripcionFamiliarApi.agregarInscripciones({ inscripciones });
      setResultado(response);
      toast.success('Actividades agregadas correctamente');
      await refetch();
    } catch (error) {
      console.error('Error agregando actividades:', error);
      toast.error('Error al agregar las actividades');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (loadingSuscripcion || loadingHijos) {
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
          <p className="text-slate-400 mb-6">
            Necesitás una suscripción activa para agregar actividades.
          </p>
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

  // Resultado exitoso
  if (resultado) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Actividades agregadas!</h2>
          <p className="text-slate-400 mb-6">
            Se agregaron {resultado.inscripcionesCreadas.length} actividad(es) a tu suscripción.
          </p>

          <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Monto anterior</span>
              <span className="text-white">{formatMonto(resultado.montoAnterior)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Diferencia</span>
              <span className="text-amber-400">+{formatMonto(resultado.diferenciaMonto)}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-slate-400">Nuevo monto mensual</span>
              <span className="text-white font-bold">
                {formatMonto(resultado.nuevoMontoMensual)}
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Agregar Actividad</h1>
            <p className="text-slate-400">Sumá nuevas actividades a tu suscripción</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Selección */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Seleccionar estudiante */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                1. Seleccionar Estudiante
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hijos.map((hijo) => (
                  <button
                    key={hijo.id}
                    onClick={() => {
                      setSelectedEstudiante(hijo);
                      setStep('producto');
                    }}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedEstudiante?.id === hijo.id
                        ? 'bg-cyan-500/20 border-2 border-cyan-500'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold mb-2">
                      {hijo.nombre[0]}
                    </div>
                    <p className="text-white font-medium text-sm">{hijo.nombre}</p>
                    <p className="text-slate-400 text-xs">{hijo.casa || 'Sin casa'}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Seleccionar mundo y producto */}
            {selectedEstudiante && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  2. Seleccionar Actividad
                </h3>

                {/* Mundos */}
                <div className="flex gap-3 mb-4">
                  {(['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'] as MundoSTEAM[]).map((mundo) => (
                    <button
                      key={mundo}
                      onClick={() => setSelectedMundo(mundo)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedMundo === mundo
                          ? 'bg-violet-500 text-white'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {mundo.charAt(0) + mundo.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Lista de clubes */}
                {loadingClubes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                  </div>
                ) : clubes.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clubes.map((club) => {
                      const inscripto = yaInscripto(club.id, selectedEstudiante.id);
                      return (
                        <button
                          key={club.id}
                          onClick={() => {
                            if (!inscripto) {
                              setSelectedClub(club);
                              setStep('horario');
                            }
                          }}
                          disabled={inscripto}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            inscripto
                              ? 'bg-white/5 opacity-50 cursor-not-allowed'
                              : selectedClub?.id === club.id
                                ? 'bg-violet-500/20 border-2 border-violet-500'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{club.nombre}</p>
                              <p className="text-slate-400 text-sm">{club.descripcionCorta}</p>
                            </div>
                            <div className="text-right">
                              {inscripto ? (
                                <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                                  Ya inscripto
                                </span>
                              ) : (
                                <span className="text-cyan-400 font-medium">
                                  {formatMonto(club.precioMensual)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : selectedMundo ? (
                  <p className="text-slate-400 text-center py-4">
                    No hay actividades disponibles para esta selección
                  </p>
                ) : null}
              </div>
            )}

            {/* Step 3: Seleccionar horario (solo para sincrónico) */}
            {selectedClub && suscripcion.tier === 'STEAM_SINCRONICO' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  3. Seleccionar Horario
                </h3>
                <div className="space-y-3">
                  {selectedClub.grupos.map((grupo) => (
                    <button
                      key={grupo.id}
                      onClick={() => setSelectedGrupo(grupo)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedGrupo?.id === grupo.id
                          ? 'bg-amber-500/20 border-2 border-amber-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {grupo.diaSemana} {grupo.horaInicio} - {grupo.horaFin}
                          </p>
                          <p className="text-slate-400 text-sm">Prof. {grupo.docenteNombre}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <UsersIcon className="w-4 h-4" />
                          {grupo.cupoDisponible} cupos
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón agregar */}
            {selectedClub && (suscripcion.tier !== 'STEAM_SINCRONICO' || selectedGrupo) && (
              <button
                onClick={handleAgregarActividad}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar a la lista
              </button>
            )}
          </div>

          {/* Panel derecho: Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Actividades a agregar</h3>

              {actividades.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">
                  Seleccioná actividades para agregar a tu suscripción
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {actividades.map((act, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {act.productoNombre}
                          </p>
                          <p className="text-slate-400 text-xs truncate">
                            {act.estudianteNombre}
                            {act.claseGrupoNombre && ` • ${act.claseGrupoNombre}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleQuitarActividad(idx)}
                          className="ml-2 p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Monto actual</span>
                      <span className="text-white">{formatMonto(suscripcion.montoMensual)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Actividades nuevas</span>
                      <span className="text-amber-400">
                        +{formatMonto(actividades.reduce((sum, a) => sum + a.precio, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-white">Nuevo total estimado</span>
                      <span className="text-cyan-400">
                        {formatMonto(
                          suscripcion.montoMensual +
                            actividades.reduce((sum, a) => sum + a.precio, 0),
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmar}
                    disabled={isSubmitting || actividades.length === 0}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Confirmar ({actividades.length})
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
