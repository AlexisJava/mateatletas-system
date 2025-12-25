'use client';

import { Home, BookOpen, Activity } from 'lucide-react';
import type { AnalyticsTabId } from '../types/analytics.types';

/**
 * AnalyticsTabNav - Navegación de tabs de analytics
 */

interface AnalyticsTabNavProps {
  activeTab: AnalyticsTabId;
  onTabChange: (tab: AnalyticsTabId) => void;
}

const TABS = [
  { id: 'casas' as const, label: 'Casas', icon: Home },
  { id: 'biblioteca' as const, label: 'Biblioteca', icon: BookOpen },
  { id: 'retencion' as const, label: 'Retencion', icon: Activity },
];

export function AnalyticsTabNav({ activeTab, onTabChange }: AnalyticsTabNavProps) {
  return (
    <div className="flex gap-2 p-1 bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)] w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === tab.id
              ? 'bg-[var(--admin-accent)] text-black'
              : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default AnalyticsTabNav;
