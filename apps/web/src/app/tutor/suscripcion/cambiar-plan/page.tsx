'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Video,
  Users,
  Check,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useSuscripcionFamiliar, formatMonto } from '@/hooks/useSuscripcionFamiliar';
import {
  suscripcionFamiliarApi,
  type TierNombre,
  type CambiarTierResponse,
} from '@/lib/api/suscripcion-familiar.api';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

interface TierInfo {
  nombre: TierNombre;
  label: string;
  descripcion: string;
  precio: number;
  features: string[];
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

const TIERS: TierInfo[] = [
  {
    nombre: 'STEAM_LIBROS',
    label: 'Libros',
    descripcion: 'Acceso a biblioteca digital completa',
    precio: 40000,
    features: [
      'Biblioteca digital completa',
      'Material de estudio descargable',
      'Ejercicios interactivos',
      'Acceso desde cualquier dispositivo',
    ],
    icon: <BookOpen className="w-6 h-6" />,
    color: 'cyan',
    bgGradient: 'from-cyan-500/20 to-cyan-600/10',
  },
  {
    nombre: 'STEAM_ASINCRONICO',
    label: 'Asincrónico',
    descripcion: 'Clases grabadas + biblioteca',
    precio: 65000,
    features: [
      'Todo lo del plan Libros',
      'Clases grabadas de alta calidad',
      'Videos explicativos por tema',
      'Resolución de ejercicios en video',
    ],
    icon: <Video className="w-6 h-6" />,
    color: 'violet',
    bgGradient: 'from-violet-500/20 to-violet-600/10',
  },
  {
    nombre: 'STEAM_SINCRONICO',
    label: 'Sincrónico',
    descripcion: 'Clases en vivo + todo lo anterior',
    precio: 95000,
    features: [
      'Todo lo del plan Asincrónico',
      'Clases en vivo con docentes',
      'Grupos reducidos (máx. 12 estudiantes)',
      'Soporte prioritario',
    ],
    icon: <Users className="w-6 h-6" />,
    color: 'amber',
    bgGradient: 'from-amber-500/20 to-amber-600/10',
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CambiarPlanPage(): React.ReactElement {
  const router = useRouter();
  const { suscripcion, isLoading, refetch } = useSuscripcionFamiliar();
  const [selectedTier, setSelectedTier] = useState<TierNombre | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState<CambiarTierResponse | null>(null);

  // Verificar si el tier está seleccionado actualmente
  const isCurrentTier = (tier: TierNombre): boolean => suscripcion?.tier === tier;

  // Calcular si es upgrade o downgrade
  const getTierIndex = (tier: TierNombre): number => TIERS.findIndex((t) => t.nombre === tier);

  const isUpgrade = (tier: TierNombre): boolean => {
    if (!suscripcion) return false;
    return getTierIndex(tier) > getTierIndex(suscripcion.tier);
  };

  // Handler para cambiar tier
  const handleCambiarTier = async (): Promise<void> => {
    if (!selectedTier || selectedTier === suscripcion?.tier) return;

    setIsSubmitting(true);
    try {
      const response = await suscripcionFamiliarApi.cambiarTier({
        nuevoTier: selectedTier,
      });
      setResultado(response);
      toast.success('Plan actualizado correctamente');
      await refetch();
    } catch (error) {
      console.error('Error al cambiar tier:', error);
      toast.error('Error al cambiar el plan. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Sin suscripción activa
  if (!suscripcion) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sin suscripción activa</h2>
          <p className="text-slate-400 mb-6">
            Necesitás tener una suscripción activa para cambiar de plan.
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
    const wasUpgrade = getTierIndex(resultado.nuevoTier) > getTierIndex(resultado.tierAnterior);

    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Plan actualizado!</h2>
          <p className="text-slate-400 mb-6">Tu suscripción fue modificada correctamente.</p>

          {/* Resumen del cambio */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Plan anterior</span>
              <span className="text-white">{resultado.tierAnterior.replace('STEAM_', '')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Nuevo plan</span>
              <span className="text-cyan-400 font-medium">
                {resultado.nuevoTier.replace('STEAM_', '')}
              </span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-slate-400">Nuevo monto mensual</span>
              <span className="text-white font-bold">
                {formatMonto(resultado.nuevoMontoMensual)}
              </span>
            </div>
            {resultado.diferenciaMonto !== 0 && (
              <div className="flex items-center justify-center gap-2 text-sm">
                {wasUpgrade ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">
                      +{formatMonto(resultado.diferenciaMonto)} / mes
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">
                      -{formatMonto(Math.abs(resultado.diferenciaMonto))} / mes
                    </span>
                  </>
                )}
              </div>
            )}
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
            <h1 className="text-2xl font-bold text-white">Cambiar Plan</h1>
            <p className="text-slate-400">
              Plan actual:{' '}
              <span className="text-cyan-400">{suscripcion.tier.replace('STEAM_', '')}</span>
            </p>
          </div>
        </div>

        {/* Grid de planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {TIERS.map((tier) => {
            const isCurrent = isCurrentTier(tier.nombre);
            const isSelected = selectedTier === tier.nombre;
            const upgrade = isUpgrade(tier.nombre);

            return (
              <button
                key={tier.nombre}
                onClick={() => !isCurrent && setSelectedTier(tier.nombre)}
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

                {/* Badge de upgrade/downgrade */}
                {!isCurrent && selectedTier === tier.nombre && (
                  <div
                    className={`absolute -top-3 right-4 px-3 py-1 text-white text-xs font-bold rounded-full ${
                      upgrade ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                  >
                    {upgrade ? 'UPGRADE' : 'DOWNGRADE'}
                  </div>
                )}

                {/* Icono */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${tier.bgGradient}`}
                >
                  <div className={`text-${tier.color}-400`}>{tier.icon}</div>
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-white mb-1">{tier.label}</h3>
                <p className="text-sm text-slate-400 mb-4">{tier.descripcion}</p>

                {/* Precio */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-white">{formatMonto(tier.precio)}</span>
                  <span className="text-slate-400 text-sm"> / mes</span>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Confirmación */}
        {selectedTier && selectedTier !== suscripcion.tier && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Confirmar cambio</h3>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm">Cambiarás de</p>
                <p className="text-white font-medium">{suscripcion.tier.replace('STEAM_', '')}</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-slate-500" />
              <div className="text-right">
                <p className="text-slate-400 text-sm">a</p>
                <p className="text-cyan-400 font-medium">{selectedTier.replace('STEAM_', '')}</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              El cambio se aplicará inmediatamente. El nuevo monto se cobrará en tu próxima
              facturación.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTier(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarTier}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
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
        )}
      </div>
    </div>
  );
}
