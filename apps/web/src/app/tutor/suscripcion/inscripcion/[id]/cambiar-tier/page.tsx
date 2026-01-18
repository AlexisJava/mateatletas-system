'use client';

/**
 * Página para cambiar el tier de una inscripción específica
 * MODELO 2026: Cada inscripción puede tener su propio tier
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Video,
  Crown,
  Check,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  useSuscripcionFamiliar,
  formatMonto,
  formatTierNombre,
  type TierNombre,
  type InscripcionActividadDetalle,
} from '@/hooks/useSuscripcionFamiliar';
import toast from 'react-hot-toast';

// ============================================================================
// CONSTANTES
// ============================================================================

interface TierInfo {
  id: TierNombre;
  nombre: string;
  descripcion: string;
  precio: number;
  icon: typeof BookOpen;
  gradient: string;
}

const TIERS: TierInfo[] = [
  {
    id: 'STEAM_LIBROS',
    nombre: 'STEAM Libros',
    descripcion: 'Acceso a biblioteca digital completa',
    precio: 40000,
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'STEAM_ASINCRONICO',
    nombre: 'STEAM Asincrónico',
    descripcion: 'Clases grabadas + biblioteca',
    precio: 65000,
    icon: Video,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'STEAM_SINCRONICO',
    nombre: 'STEAM Sincrónico',
    descripcion: 'Clases en vivo + todo lo anterior',
    precio: 95000,
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600',
  },
];

const getTierIndex = (tier: TierNombre): number => TIERS.findIndex((t) => t.id === tier);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CambiarTierInscripcionPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const inscripcionId = params.id as string;

  const {
    suscripcion,
    isLoading: loadingSuscripcion,
    cambiarTierInscripcion,
    isChangingTierInscripcion,
    refetch,
  } = useSuscripcionFamiliar();

  const [selectedTier, setSelectedTier] = useState<TierNombre | null>(null);
  const [inscripcion, setInscripcion] = useState<InscripcionActividadDetalle | null>(null);

  // Buscar la inscripción cuando carga la suscripción
  useEffect(() => {
    if (suscripcion && inscripcionId) {
      const found = suscripcion.inscripciones.find((i) => i.id === inscripcionId);
      if (found) {
        setInscripcion(found);
        setSelectedTier(found.tier);
      }
    }
  }, [suscripcion, inscripcionId]);

  // Handler para cambiar tier
  const handleCambiarTier = async (): Promise<void> => {
    if (!selectedTier || !inscripcion || selectedTier === inscripcion.tier) return;

    try {
      await cambiarTierInscripcion(inscripcionId, { nuevoTier: selectedTier });
      toast.success('Plan actualizado correctamente');
      await refetch();
      router.push('/tutor/suscripcion');
    } catch {
      toast.error('Error al cambiar el plan. Intentá de nuevo.');
    }
  };

  // Es upgrade o downgrade
  const isUpgrade =
    inscripcion?.tier && selectedTier
      ? getTierIndex(selectedTier) > getTierIndex(inscripcion.tier)
      : false;

  // Loading
  if (loadingSuscripcion) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Sin suscripción o inscripción no encontrada
  if (!suscripcion || !inscripcion) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Inscripción no encontrada</h2>
          <p className="text-slate-400 mb-6">
            No pudimos encontrar la inscripción que querés modificar.
          </p>
          <button
            onClick={() => router.push('/tutor/suscripcion')}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
          >
            Volver a mi suscripción
          </button>
        </div>
      </div>
    );
  }

  const currentTier = inscripcion.tier ?? 'STEAM_LIBROS';

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
            <h1 className="text-2xl font-bold text-white">Cambiar Plan</h1>
            <p className="text-slate-400">
              {inscripcion.productoNombre} - {inscripcion.estudianteNombre}
            </p>
          </div>
        </div>

        {/* Info de la inscripción actual */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Plan actual
          </h3>
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${TIERS.find((t) => t.id === currentTier)?.gradient ?? 'from-cyan-500 to-blue-600'} rounded-xl flex items-center justify-center`}
            >
              {(() => {
                const TierIcon = TIERS.find((t) => t.id === currentTier)?.icon ?? BookOpen;
                return <TierIcon className="w-6 h-6 text-white" />;
              })()}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{formatTierNombre(currentTier)}</p>
              <p className="text-sm text-emerald-400">
                {formatMonto(inscripcion.precioConDescuento)}/mes
                {inscripcion.descuentoAplicado > 0 && (
                  <span className="text-amber-400 ml-2">(-{inscripcion.descuentoAplicado}%)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de planes */}
        <h3 className="text-lg font-semibold text-white mb-4">Elegí el nuevo plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = currentTier === tier.id;
            const isSelected = selectedTier === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => !isCurrent && setSelectedTier(tier.id)}
                disabled={isCurrent}
                className={`
                  relative p-6 rounded-2xl text-left transition-all
                  ${
                    isCurrent
                      ? 'bg-white/5 border-2 border-cyan-500/50 cursor-default'
                      : isSelected
                        ? 'bg-white/10 border-2 border-violet-500 scale-[1.02]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                {/* Badge de plan actual */}
                {isCurrent && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                    ACTUAL
                  </div>
                )}

                {/* Icono */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${tier.gradient}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-white mb-1">{tier.nombre}</h3>
                <p className="text-sm text-slate-400 mb-4">{tier.descripcion}</p>

                {/* Precio */}
                <div>
                  <span className="text-2xl font-bold text-white">{formatMonto(tier.precio)}</span>
                  <span className="text-slate-400 text-sm"> / mes</span>
                </div>

                {isSelected && !isCurrent && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Confirmación */}
        {selectedTier && selectedTier !== currentTier && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              {isUpgrade ? (
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-green-400" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {isUpgrade ? 'Upgrade' : 'Downgrade'} de plan
              </h3>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm">De</p>
                <p className="text-white font-medium">{formatTierNombre(currentTier)}</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-slate-500" />
              <div className="text-right">
                <p className="text-slate-400 text-sm">A</p>
                <p className="text-cyan-400 font-medium">{formatTierNombre(selectedTier)}</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              El cambio se aplicará inmediatamente. El nuevo monto se cobrará en tu próxima
              facturación.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTier(currentTier)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarTier}
                disabled={isChangingTierInscripcion}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                {isChangingTierInscripcion ? (
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
        )}
      </div>
    </div>
  );
}
