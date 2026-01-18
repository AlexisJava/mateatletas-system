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
  BookOpen,
  Video,
  Crown,
} from 'lucide-react';
import { useSuscripcionFamiliar, formatMonto } from '@/hooks/useSuscripcionFamiliar';
import {
  suscripcionFamiliarApi,
  type InscripcionActividadRequest,
  type AgregarInscripcionesResponse,
  type TierNombre,
} from '@/lib/api/suscripcion-familiar.api';
import {
  getClubsPorCasaMundo,
  type ClubConClaseGrupos,
  type ClaseGrupoInfo,
  type CasaTipo,
  type MundoTipo,
} from '@/lib/api/catalogo.api';
import { tutoresApi, type HijoInfo } from '@/lib/api/tutores.api';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS
// ============================================================================

// Usamos los tipos importados de catalogo.api
// type MundoSTEAM = MundoTipo;

interface SelectedActivity {
  estudianteId: string;
  estudianteNombre: string;
  productoId: string;
  productoNombre: string;
  claseGrupoId?: string;
  claseGrupoNombre?: string;
  /** Tier específico de esta inscripción (MODELO 2026) */
  tier: TierNombre;
  precio: number;
}

/** Información de tiers disponibles */
const TIERS_INFO: Array<{
  id: TierNombre;
  nombre: string;
  descripcion: string;
  precio: number;
  icon: typeof BookOpen;
  gradient: string;
  requiereHorario: boolean;
  /** Disponible para Clubs (productos con clases) */
  disponibleParaClubs: boolean;
}> = [
  {
    id: 'STEAM_LIBROS',
    nombre: 'STEAM Libros',
    descripcion: 'Material físico sin clases',
    precio: 40000,
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-600',
    requiereHorario: false,
    disponibleParaClubs: false, // Clubs tienen clases, libros no
  },
  {
    id: 'STEAM_ASINCRONICO',
    nombre: 'STEAM Asincrónico',
    descripcion: 'Videos grabados + ejercicios',
    precio: 65000,
    icon: Video,
    gradient: 'from-violet-500 to-purple-600',
    requiereHorario: false,
    disponibleParaClubs: true,
  },
  {
    id: 'STEAM_SINCRONICO',
    nombre: 'STEAM Sincrónico',
    descripcion: 'Clases en vivo con docente',
    precio: 95000,
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
    requiereHorario: true,
    disponibleParaClubs: true,
  },
];

// ============================================================================
// HELPERS - Cálculo de descuentos MODELO 2026
// ============================================================================

/**
 * Calcula el monto total con descuento del 10% aplicado a productos de MENOR VALOR
 *
 * REGLA: El descuento se aplica a los productos más baratos, no al segundo agregado.
 * - Primera inscripción (la más cara): precio completo
 * - Resto de inscripciones: precio - 10%
 */
function calcularMontoConDescuento(
  inscripcionesExistentes: Array<{ precioBase: number }>,
  actividadesNuevas: SelectedActivity[],
): {
  montoTotal: number;
  montoNuevasConDescuento: number;
  detalleNuevas: Array<{ precio: number; conDescuento: number }>;
} {
  // Combinar todos los precios (existentes + nuevos)
  const preciosExistentes = inscripcionesExistentes.map((i) => i.precioBase);
  const preciosNuevos = actividadesNuevas.map((a) => a.precio);
  const todosPrecio = [...preciosExistentes, ...preciosNuevos];

  // Si hay 0 o 1 inscripción, no hay descuento
  if (todosPrecio.length <= 1) {
    const montoTotal = todosPrecio.reduce((sum, p) => sum + p, 0);
    return {
      montoTotal,
      montoNuevasConDescuento: preciosNuevos.reduce((sum, p) => sum + p, 0),
      detalleNuevas: actividadesNuevas.map((a) => ({ precio: a.precio, conDescuento: a.precio })),
    };
  }

  // Ordenar por precio DESCENDENTE (mayor primero)
  const todosOrdenados = [...todosPrecio].sort((a, b) => b - a);

  // Calcular monto: primero a precio completo, resto con 10% descuento
  const montoTotal = todosOrdenados.reduce((sum, precio, idx) => {
    if (idx === 0) return sum + precio; // El más caro: sin descuento
    return sum + precio * 0.9; // Resto: -10%
  }, 0);

  // Calcular detalle para las nuevas actividades
  // Necesitamos saber qué posición ocupan en el ranking total
  const detalleNuevas = actividadesNuevas.map((a) => {
    // Contar cuántos precios son >= al precio de esta actividad
    const posicion = todosPrecio.filter((p) => p > a.precio).length;
    const conDescuento = posicion === 0 ? a.precio : a.precio * 0.9;
    return { precio: a.precio, conDescuento: Math.round(conDescuento) };
  });

  const montoNuevasConDescuento = detalleNuevas.reduce((sum, d) => sum + d.conDescuento, 0);

  return { montoTotal: Math.round(montoTotal), montoNuevasConDescuento, detalleNuevas };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AgregarActividadPage(): React.ReactElement {
  const router = useRouter();
  const { suscripcion, isLoading: loadingSuscripcion, refetch } = useSuscripcionFamiliar();

  // Estados del wizard
  // MODELO 2026: Agregamos paso de selección de tier
  const [step, setStep] = useState<'estudiante' | 'producto' | 'tier' | 'horario' | 'confirmar'>(
    'estudiante',
  );
  const [hijos, setHijos] = useState<HijoInfo[]>([]);
  const [loadingHijos, setLoadingHijos] = useState(true);

  // Selecciones
  const [selectedEstudiante, setSelectedEstudiante] = useState<HijoInfo | null>(null);
  const [selectedMundo, setSelectedMundo] = useState<MundoTipo | null>(null);
  const [clubes, setClubes] = useState<ClubConClaseGrupos[]>([]);
  const [loadingClubes, setLoadingClubes] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ClubConClaseGrupos | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierNombre | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<ClaseGrupoInfo | null>(null);

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
        const casa = (selectedEstudiante.casa as CasaTipo) || 'QUANTUM';
        console.log('[DEBUG] Buscando clubs:', {
          casa,
          mundo: selectedMundo,
          estudianteCasa: selectedEstudiante.casa,
        });
        const result = await getClubsPorCasaMundo(casa, selectedMundo);
        console.log(
          '[DEBUG] Clubs encontrados:',
          result.length,
          result.map((c) => c.nombre),
        );
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
  // MODELO 2026: Cada actividad tiene su propio tier
  const handleAgregarActividad = (): void => {
    if (!selectedEstudiante || !selectedClub || !selectedTier) return;

    // Para tier sincrónico necesita grupo
    if (selectedTier === 'STEAM_SINCRONICO' && !selectedGrupo) {
      toast.error('Debés seleccionar un horario para el plan Sincrónico');
      return;
    }

    const tierInfo = TIERS_INFO.find((t) => t.id === selectedTier);

    const nuevaActividad: SelectedActivity = {
      estudianteId: selectedEstudiante.id,
      estudianteNombre: `${selectedEstudiante.nombre} ${selectedEstudiante.apellido}`,
      productoId: selectedClub.id,
      productoNombre: selectedClub.nombre,
      claseGrupoId: selectedGrupo?.id,
      claseGrupoNombre: selectedGrupo
        ? `${selectedGrupo.dia_semana} ${selectedGrupo.hora_inicio}`
        : undefined,
      tier: selectedTier,
      precio: tierInfo?.precio ?? 0,
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
    setSelectedTier(null);
    setSelectedGrupo(null);
    setClubes([]);
    setStep('estudiante');
  };

  // Quitar actividad de la lista
  const handleQuitarActividad = (index: number): void => {
    setActividades(actividades.filter((_, i) => i !== index));
  };

  // Confirmar y enviar
  // MODELO 2026: Cada inscripción tiene su propio tier
  const handleConfirmar = async (): Promise<void> => {
    if (actividades.length === 0) return;

    setIsSubmitting(true);
    try {
      const inscripciones: InscripcionActividadRequest[] = actividades.map((a) => ({
        estudianteId: a.estudianteId,
        productoId: a.productoId,
        claseGrupoId: a.claseGrupoId,
        tier: a.tier, // MODELO 2026: tier por inscripción
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
    <div className="h-screen bg-[#0a0a12] overflow-hidden flex flex-col">
      {/* Fondo ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header fijo */}
      <div className="relative z-10 px-4 py-4 border-b border-white/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Agregar Actividad</h1>
            <p className="text-slate-400 text-sm">Sumá nuevas actividades a tu suscripción</p>
          </div>
        </div>
      </div>

      {/* Contenido con scroll */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 py-4 flex gap-4">
          {/* Panel izquierdo: Selección - con scroll interno */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                  {(['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'] as MundoTipo[]).map((mundo) => (
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
                              // MODELO 2026: Ir al paso de selección de tier
                              setStep('tier');
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
                              <p className="text-slate-400 text-sm">{club.descripcion ?? ''}</p>
                            </div>
                            <div className="text-right">
                              {inscripto ? (
                                <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                                  Ya inscripto
                                </span>
                              ) : (
                                <span className="text-slate-400 text-sm">Elegí plan →</span>
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

            {/* Step 3: Seleccionar tier (MODELO 2026) */}
            {selectedClub && step === 'tier' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  3. Elegí el plan para esta actividad
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Cada actividad puede tener su propio plan. El descuento del 10% se aplica a los
                  productos de menor valor.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Filtrar tiers: Clubs solo permiten Asincrónico y Sincrónico */}
                  {TIERS_INFO.filter((t) => t.disponibleParaClubs).map((tier) => {
                    const TierIcon = tier.icon;
                    const isSelected = selectedTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => {
                          setSelectedTier(tier.id);
                          // Si es sincrónico y hay grupos, ir al paso de horario
                          if (tier.requiereHorario && selectedClub.claseGrupos.length > 0) {
                            setStep('horario');
                          }
                        }}
                        className={`p-4 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br ' + tier.gradient + ' border-2 border-white/30'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                            isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + tier.gradient
                          }`}
                        >
                          <TierIcon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-medium text-sm">{tier.nombre}</p>
                        <p className="text-slate-500 text-xs mb-2">{tier.descripcion}</p>
                        <p className="text-lg font-bold text-white">
                          {formatMonto(tier.precio)}
                          <span className="text-xs text-slate-300 font-normal">/mes</span>
                        </p>
                        {tier.requiereHorario && (
                          <p className="text-xs text-amber-300 mt-1">Incluye clases en vivo</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Seleccionar horario (solo para sincrónico) */}
            {selectedClub && selectedTier === 'STEAM_SINCRONICO' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  4. Seleccionar Horario
                </h3>
                <div className="space-y-3">
                  {selectedClub.claseGrupos.map((grupo) => (
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
                            {grupo.dia_semana} {grupo.hora_inicio} - {grupo.hora_fin}
                          </p>
                          {grupo.docente && (
                            <p className="text-slate-400 text-sm">
                              Prof. {grupo.docente.nombre} {grupo.docente.apellido}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <UsersIcon className="w-4 h-4" />
                          {grupo.cupo_maximo} cupos
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón agregar - MODELO 2026: requiere tier seleccionado */}
            {selectedClub &&
              selectedTier &&
              (selectedTier !== 'STEAM_SINCRONICO' || selectedGrupo) && (
                <button
                  onClick={handleAgregarActividad}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar a la lista
                </button>
              )}
          </div>

          {/* Panel derecho: Resumen - ancho fijo, sin scroll */}
          <div className="w-80 flex-shrink-0 flex flex-col">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col h-full max-h-full overflow-hidden">
              <h3 className="text-base font-semibold text-white mb-3 flex-shrink-0">
                Actividades a agregar
              </h3>

              {actividades.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-slate-400 text-sm text-center">
                    Seleccioná actividades para agregar
                  </p>
                </div>
              ) : (
                <>
                  {/* Lista con scroll interno */}
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
                    {actividades.map((act, idx) => {
                      const tierInfo = TIERS_INFO.find((t) => t.id === act.tier);
                      const tieneDescuento = (suscripcion?.inscripciones?.length ?? 0) > 0;
                      const precioFinal = tieneDescuento
                        ? Math.round(act.precio * 0.9)
                        : act.precio;

                      return (
                        <div key={idx} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {act.productoNombre}
                              </p>
                              <p className="text-slate-400 text-xs">{act.estudianteNombre}</p>
                              <p className="text-xs text-slate-500">{tierInfo?.nombre}</p>
                            </div>
                            <button
                              onClick={() => handleQuitarActividad(idx)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-slate-400 text-xs">Vas a pagar</span>
                            <div className="text-right">
                              {tieneDescuento && (
                                <span className="text-slate-500 text-xs line-through mr-1">
                                  {formatMonto(act.precio)}
                                </span>
                              )}
                              <span className="text-emerald-400 font-bold">
                                {formatMonto(precioFinal)}
                              </span>
                              <span className="text-slate-400 text-xs">/mes</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botón confirmar fijo abajo */}
                  <button
                    onClick={handleConfirmar}
                    disabled={isSubmitting || actividades.length === 0}
                    className="flex-shrink-0 w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
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
