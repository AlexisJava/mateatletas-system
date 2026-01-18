'use client';

import { Check, CheckCircle2, BookOpen, Video, Crown } from 'lucide-react';
import { TIERS_CONFIG, formatMonto, type TierNombre } from '@mateatletas/contracts';

interface TierStepProps {
  readonly selectedTier: TierNombre | null;
  readonly onSelectTier: (tier: TierNombre) => void;
  readonly productoNombre?: string;
}

/** Configuración extendida de tiers para UI del wizard */
const TIERS_UI = [
  {
    id: 'STEAM_LIBROS' as const,
    nombre: TIERS_CONFIG.STEAM_LIBROS.nombre,
    precio: TIERS_CONFIG.STEAM_LIBROS.precio,
    descripcion: 'Acceso a la plataforma completa sin clases',
    beneficios: [
      'Microlecciones interactivas',
      'Juegos educativos',
      'Ejercicios y desafíos',
      'Progreso gamificado',
    ],
    icon: BookOpen,
    gradient: TIERS_CONFIG.STEAM_LIBROS.gradient,
    popular: false,
    requiereHorario: false,
  },
  {
    id: 'STEAM_ASINCRONICO' as const,
    nombre: TIERS_CONFIG.STEAM_ASINCRONICO.nombre,
    precio: TIERS_CONFIG.STEAM_ASINCRONICO.precio,
    descripcion: 'Todo + clases grabadas para ver cuando quieras',
    beneficios: [
      'Todo de STEAM Libros',
      'Clases grabadas HD',
      'Material descargable',
      'Soporte por chat',
    ],
    icon: Video,
    gradient: TIERS_CONFIG.STEAM_ASINCRONICO.gradient,
    popular: true,
    requiereHorario: false,
  },
  {
    id: 'STEAM_SINCRONICO' as const,
    nombre: TIERS_CONFIG.STEAM_SINCRONICO.nombre,
    precio: TIERS_CONFIG.STEAM_SINCRONICO.precio,
    descripcion: 'Todo + clases en vivo con docente',
    beneficios: [
      'Todo de STEAM Asincrónico',
      'Clases en vivo semanales',
      'Grupos reducidos (max 8)',
      'Seguimiento personalizado',
    ],
    icon: Crown,
    gradient: TIERS_CONFIG.STEAM_SINCRONICO.gradient,
    popular: false,
    requiereHorario: true,
  },
] as const;

/**
 * Paso 3: Selección de tier/plan de suscripción
 */
export function TierStep({
  selectedTier,
  onSelectTier,
  productoNombre,
}: TierStepProps): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Elegí el plan para esta actividad</h2>
      <p className="text-slate-400 mb-8">
        {productoNombre ? (
          <>
            Seleccioná el plan para <span className="text-cyan-400">{productoNombre}</span>. Cada
            actividad puede tener su propio plan.
          </>
        ) : (
          'Cada actividad puede tener un plan diferente. Podés cambiarlo en cualquier momento.'
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS_UI.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTier === tier.id}
            onSelect={() => onSelectTier(tier.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TierCardProps {
  readonly tier: (typeof TIERS_UI)[number];
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

/**
 * Card de tier/plan seleccionable
 */
function TierCard({ tier, isSelected, onSelect }: TierCardProps): React.ReactElement {
  const Icon = tier.icon;

  return (
    <button
      onClick={onSelect}
      className={`relative p-6 rounded-2xl border text-left transition-all ${
        isSelected
          ? 'bg-white/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full">
            Popular
          </span>
        </div>
      )}

      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1">{tier.nombre}</h3>
      <p className="text-2xl font-bold text-emerald-400 mb-2">
        {formatMonto(tier.precio)}
        <span className="text-sm text-slate-400 font-normal">/mes</span>
      </p>
      <p className="text-sm text-slate-400 mb-4">{tier.descripcion}</p>

      <ul className="space-y-2">
        {tier.beneficios.map((beneficio, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            {beneficio}
          </li>
        ))}
      </ul>

      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </button>
  );
}

/** Re-export para acceder a la config de tiers desde el wizard */
export { TIERS_UI };
