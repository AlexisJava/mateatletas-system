'use client';

import { Settings, Gamepad2, Sparkles, Crown, UserMinus } from 'lucide-react';
import { formatCurrency } from '@/lib/constants/admin-mock-data';
import type { TierConfig } from '../types/finance.types';

/**
 * TierConfigPanel - Panel de configuración de tiers STEAM
 *
 * Muestra los precios actuales y botón para editar.
 */

interface TierConfigPanelProps {
  config: TierConfig;
  onEdit: () => void;
}

export function TierConfigPanel({ config, onEdit }: TierConfigPanelProps) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[var(--status-info)]" />
          Tiers STEAM 2026
        </h3>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-[var(--status-info)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Editar
        </button>
      </div>

      <div className="space-y-3">
        <TierCard
          icon={Gamepad2}
          name="STEAM Libros"
          description="Plataforma completa"
          price={config.precioSteamLibros}
          gradientFrom="cyan-500"
          gradientTo="blue-500"
          textColor="text-cyan-400"
        />
        <TierCard
          icon={Sparkles}
          name="STEAM Asincronico"
          description="Todo + clases grabadas"
          price={config.precioSteamAsincronico}
          gradientFrom="violet-500"
          gradientTo="purple-500"
          textColor="text-violet-400"
        />
        <TierCard
          icon={Crown}
          name="STEAM Sincronico"
          description="Todo + clases en vivo"
          price={config.precioSteamSincronico}
          gradientFrom="amber-500"
          gradientTo="orange-500"
          textColor="text-amber-400"
        />

        {/* Descuento Familiar */}
        <div className="pt-3 border-t border-[var(--admin-border)]">
          <div className="flex items-center justify-between p-3 bg-[var(--admin-surface-2)] rounded-lg">
            <div className="flex items-center gap-2">
              <UserMinus className="w-4 h-4 text-[var(--admin-text-muted)]" />
              <span className="text-sm text-[var(--admin-text-muted)]">
                2do hermano en adelante
              </span>
            </div>
            <span className="font-bold text-[var(--status-success)]">
              {config.descuentoSegundoHermano}% OFF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for tier cards
interface TierCardProps {
  icon: typeof Gamepad2;
  name: string;
  description: string;
  price: number;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
}

function TierCard({
  icon: Icon,
  name,
  description,
  price,
  gradientFrom,
  gradientTo,
  textColor,
}: TierCardProps) {
  return (
    <div
      className={`p-4 bg-gradient-to-r from-${gradientFrom}/10 to-${gradientTo}/10 rounded-xl border border-${gradientFrom}/20`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 bg-gradient-to-br from-${gradientFrom} to-${gradientTo} rounded-lg flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-[var(--admin-text)]">{name}</span>
            <p className="text-xs text-[var(--admin-text-muted)]">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xl font-bold ${textColor}`}>{formatCurrency(price)}</span>
          <span className="text-[var(--admin-text-muted)] text-sm">/mes</span>
        </div>
      </div>
    </div>
  );
}

export default TierConfigPanel;
