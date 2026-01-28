'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * FilterTabs - Tabs de filtrado pill con íconos opcionales
 *
 * Extraído de "10. Pantalla de Juegos" → filterTabs (portal_estudiante.pen):
 *
 * Container:
 * - fill: #0A0A1A80 (fondo semi-transparente)
 * - gap: 12
 * - height: 50
 * - padding: [0, 32]
 * - width: fill_container
 *
 * Tab activo (tabAll):
 * - cornerRadius: 20 (pill)
 * - fill: linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)
 * - padding: [8, 16]
 * - text: Nunito 13px weight 700, fill #FFFFFF
 * - no icon
 *
 * Tab inactivo (tabMath, tabCode, etc.):
 * - cornerRadius: 20
 * - fill: #1E1E3A
 * - padding: [8, 16]
 * - gap: 6
 * - icon: lucide, 14x14, color específico por tab
 * - text: Nunito 13px weight 600, fill #FFFFFF
 *
 * Icons por tab:
 * - Matemáticas: calculator, #10B981
 * - Programación: code, #06B6D4
 * - Multijugador: users, #F59E0B
 * - Lógica: brain, #EC4899
 * - Velocidad: zap, #EF4444
 */

interface FilterTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  /** Gradiente del tab activo (default: purple gradient del diseño) */
  activeGradient?: string;
  className?: string;
}

export function FilterTabs({
  tabs,
  activeTabId,
  onTabChange,
  activeGradient = 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)',
  className = '',
}: FilterTabsProps): React.JSX.Element {
  return (
    <div
      className={`flex items-center gap-3 w-full px-8 ${className}`}
      style={{
        height: 50,
        backgroundColor: 'rgba(10, 10, 26, 0.5)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="
              inline-flex items-center gap-1.5
              rounded-[20px] px-4 py-2
              transition-all duration-200 ease-out
              hover:brightness-110
            "
            style={{
              background: isActive ? activeGradient : '#1E1E3A',
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 13,
              fontWeight: isActive ? 700 : 600,
              color: '#FFFFFF',
            }}
          >
            {Icon && !isActive && <Icon size={14} style={{ color: tab.iconColor ?? '#FFFFFF' }} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
