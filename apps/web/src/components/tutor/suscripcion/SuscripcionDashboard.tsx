'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  ArrowLeft,
  CreditCard,
  Users,
  Calendar,
  Shield,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Zap,
  Crown,
  BookOpen,
  Video,
  Rocket,
} from 'lucide-react';
import { SuscripcionSkeleton } from '../skeletons/SuscripcionSkeleton';
import {
  useSuscripcionFamiliar,
  formatTierNombre,
  formatEstadoSuscripcion,
  formatMonto,
  type SuscripcionFamiliarDetalle,
  type InscripcionActividadDetalle,
  type TierNombre,
  type EstadoSuscripcionFamiliar,
} from '@/hooks/useSuscripcionFamiliar';

// ============================================================================
// SUBCOMPONENTES - Estado sin suscripción
// ============================================================================

function NoSuscripcionView(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Icono animado */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-violet-500/30 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comenzá tu viaje STEAM</h2>
        <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
          Suscribite al plan familiar y desbloqueá todas las actividades educativas para tus hijos.
        </p>

        {/* Cards de beneficios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Acceso a Libros</h3>
            <p className="text-sm text-slate-500">Biblioteca digital completa</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Clases en Vivo</h3>
            <p className="text-sm text-slate-500">Con docentes expertos</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Rocket className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">10% Descuento</h3>
            <p className="text-sm text-slate-500">Desde la 2da actividad</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/tutor/suscripcion/nueva')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
        >
          <Zap className="w-6 h-6" />
          Crear Suscripción
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTES - Vista con suscripción
// ============================================================================

interface EstadoBadgeProps {
  estado: EstadoSuscripcionFamiliar;
}

function EstadoBadge({ estado }: EstadoBadgeProps): React.ReactElement {
  // MODELO 2026: Estados sincronizados con MercadoPago PreApproval
  const config: Record<
    EstadoSuscripcionFamiliar,
    { bg: string; text: string; icon: typeof CheckCircle2 }
  > = {
    AUTHORIZED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
    PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
    PAUSED: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    CANCELLED: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: XCircle },
  };

  // Fallback for unknown states
  const fallback = { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertCircle };
  const { bg, text, icon: Icon } = config[estado] ?? fallback;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${bg} rounded-full`}>
      <Icon className={`w-4 h-4 ${text}`} />
      <span className={`text-sm font-semibold ${text}`}>{formatEstadoSuscripcion(estado)}</span>
    </div>
  );
}

interface InscripcionCardProps {
  inscripcion: InscripcionActividadDetalle;
  onChangeTier: () => void;
}

/**
 * Card de inscripción que muestra el tier individual y permite cambiarlo
 * MODELO 2026: Cada inscripción puede tener un tier diferente
 */
function InscripcionCard({ inscripcion, onChangeTier }: InscripcionCardProps): React.ReactElement {
  const tierConfig: Record<TierNombre, { gradient: string; icon: typeof Star }> = {
    STEAM_LIBROS: { gradient: 'from-cyan-500 to-blue-600', icon: BookOpen },
    STEAM_ASINCRONICO: { gradient: 'from-violet-500 to-purple-600', icon: Video },
    STEAM_SINCRONICO: { gradient: 'from-amber-500 to-orange-600', icon: Crown },
  };

  const tier = inscripcion.tier ?? 'STEAM_LIBROS';
  const config = tierConfig[tier];
  const TierIcon = config.icon;

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
      <div
        className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center shrink-0`}
      >
        <TierIcon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{inscripcion.productoNombre}</p>
        {inscripcion.claseGrupoNombre && (
          <p className="text-sm text-slate-500">Grupo: {inscripcion.claseGrupoNombre}</p>
        )}
        <button
          onClick={onChangeTier}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-1 flex items-center gap-1"
        >
          <span className="px-2 py-0.5 bg-white/5 rounded-full">{formatTierNombre(tier)}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="text-right shrink-0">
        <p className="text-emerald-400 font-semibold">
          {formatMonto(inscripcion.precioConDescuento)}
        </p>
        {inscripcion.descuentoAplicado > 0 && (
          <p className="text-xs text-amber-400">-{inscripcion.descuentoAplicado}% dto</p>
        )}
        {inscripcion.esMasCara && <p className="text-xs text-slate-500">Sin descuento</p>}
      </div>
    </div>
  );
}

interface TierBadgeProps {
  tier: TierNombre;
  size?: 'sm' | 'lg';
}

function TierBadge({ tier, size = 'sm' }: TierBadgeProps): React.ReactElement {
  const config: Record<TierNombre, { gradient: string; icon: typeof Star }> = {
    STEAM_LIBROS: { gradient: 'from-cyan-500 to-blue-600', icon: BookOpen },
    STEAM_ASINCRONICO: { gradient: 'from-violet-500 to-purple-600', icon: Video },
    STEAM_SINCRONICO: { gradient: 'from-amber-500 to-orange-600', icon: Crown },
  };

  const { gradient, icon: Icon } = config[tier];
  const isLarge = size === 'lg';

  return (
    <div
      className={`inline-flex items-center gap-2 ${isLarge ? 'px-4 py-2' : 'px-3 py-1.5'} bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}
    >
      <Icon className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
      <span className={`${isLarge ? 'text-base' : 'text-sm'} font-bold text-white`}>
        {formatTierNombre(tier)}
      </span>
    </div>
  );
}

interface SuscripcionActivaViewProps {
  suscripcion: SuscripcionFamiliarDetalle;
}

function SuscripcionActivaView({ suscripcion }: SuscripcionActivaViewProps): React.ReactElement {
  const router = useRouter();
  const [expandedHijo, setExpandedHijo] = useState<string | null>(null);

  // Agrupar inscripciones por estudiante
  const inscripcionesPorEstudiante = suscripcion.inscripciones.reduce(
    (acc, inscripcion) => {
      const key = inscripcion.estudianteId;
      if (!acc[key]) {
        acc[key] = {
          id: inscripcion.estudianteId,
          nombre: inscripcion.estudianteNombre,
          inscripciones: [],
        };
      }
      acc[key].inscripciones.push(inscripcion);
      return acc;
    },
    {} as Record<
      string,
      {
        id: string;
        nombre: string;
        inscripciones: typeof suscripcion.inscripciones;
      }
    >,
  );

  const estudiantes = Object.values(inscripcionesPorEstudiante);

  // Calcular fecha de próximo cobro
  // Si no hay fecha del backend, estimar el 1ro del mes siguiente
  const calcularFechaProximoCobro = (): string => {
    if (suscripcion.fechaProximoCobro) {
      return new Date(suscripcion.fechaProximoCobro).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
    // Estimar: primer día del mes siguiente
    const hoy = new Date();
    const primeroDeMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    return primeroDeMesSiguiente.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };
  const fechaProximoCobro = calcularFechaProximoCobro();

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Card Principal - Resumen */}
        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-cyan-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Header con estado */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mi Suscripción</h2>
                <EstadoBadge estado={suscripcion.estado} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-400">Monto Mensual</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatMonto(suscripcion.montoMensual)}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-400">Próximo Cobro</span>
                </div>
                <p className="text-lg font-semibold text-cyan-400">{fechaProximoCobro}</p>
              </div>

              <div className="bg-white/5 backdrop-blur border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-slate-400">Estudiantes</span>
                </div>
                <p className="text-2xl font-bold text-violet-400">
                  {suscripcion.cantidadEstudiantes}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-400">Actividades</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">
                  {suscripcion.cantidadActividades}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inscripciones por Estudiante */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Actividades por Estudiante</h3>
              </div>
              <button
                onClick={() => router.push('/tutor/suscripcion/agregar')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Agregar Actividad
              </button>
            </div>
          </div>

          {/* Lista de estudiantes */}
          <div className="divide-y divide-white/5">
            {estudiantes.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">No hay actividades inscritas</p>
                <button
                  onClick={() => router.push('/tutor/suscripcion/agregar')}
                  className="mt-4 px-6 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold transition-all"
                >
                  Agregar primera actividad
                </button>
              </div>
            ) : (
              estudiantes.map((estudiante) => (
                <div key={estudiante.id} className="border-b border-white/5 last:border-b-0">
                  {/* Header del estudiante - clickeable */}
                  <button
                    onClick={() =>
                      setExpandedHijo(expandedHijo === estudiante.id ? null : estudiante.id)
                    }
                    className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                      {estudiante.nombre.split(' ')[0]?.[0] ?? '?'}
                      {estudiante.nombre.split(' ')[1]?.[0] ?? ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{estudiante.nombre}</p>
                      <p className="text-sm text-slate-500">
                        {estudiante.inscripciones.length} actividad
                        {estudiante.inscripciones.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-600 transition-transform ${expandedHijo === estudiante.id ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {/* Actividades expandidas */}
                  {expandedHijo === estudiante.id && (
                    <div className="px-5 pb-5 space-y-3">
                      {estudiante.inscripciones.map((inscripcion) => (
                        <InscripcionCard
                          key={inscripcion.id}
                          inscripcion={inscripcion}
                          onChangeTier={() => {
                            // TODO: Abrir modal para cambiar tier
                            router.push(
                              `/tutor/suscripcion/inscripcion/${inscripcion.id}/cambiar-tier`,
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/tutor/suscripcion/agregar')}
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-slate-900/80 to-violet-900/20 backdrop-blur-xl border border-violet-500/20 rounded-2xl text-left hover:border-violet-500/40 transition-all group"
          >
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white group-hover:text-violet-300 transition-colors">
                Agregar Actividad
              </h4>
              <p className="text-sm text-slate-500">Cada actividad puede tener su propio plan</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400" />
          </button>

          <button
            onClick={() => router.push('/tutor/suscripcion/gestionar')}
            className="flex items-center gap-4 p-5 bg-gradient-to-r from-slate-900/80 to-cyan-900/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-left hover:border-cyan-500/40 transition-all group"
          >
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                Gestionar Suscripción
              </h4>
              <p className="text-sm text-slate-500">Pausar, cancelar u otras opciones</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function SuscripcionDashboard(): React.ReactElement {
  const router = useRouter();
  const { user } = useAuthStore();
  const { suscripcion, isLoading, error, hasSuscripcion } = useSuscripcionFamiliar();

  // Loading state
  if (isLoading) {
    return <SuscripcionSkeleton userName={user?.nombre ?? 'Tutor'} />;
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a12]">
        <Header userName={user?.nombre ?? 'Tutor'} onBack={() => router.push('/tutor/dashboard')} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <Header userName={user?.nombre ?? 'Tutor'} onBack={() => router.push('/tutor/dashboard')} />

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {hasSuscripcion && suscripcion ? (
          <SuscripcionActivaView suscripcion={suscripcion} />
        ) : (
          <NoSuscripcionView />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface HeaderProps {
  userName: string;
  onBack: () => void;
}

function Header({ userName, onBack }: HeaderProps): React.ReactElement {
  return (
    <header className="h-16 shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 flex items-center justify-between relative z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Suscripción Familiar</h1>
          <p className="text-xs text-slate-500">Gestiona tu plan</p>
        </div>
      </div>

      <span className="text-slate-400 text-sm hidden sm:block">
        <span className="font-semibold text-white">{userName}</span>
      </span>
    </header>
  );
}

export default SuscripcionDashboard;
