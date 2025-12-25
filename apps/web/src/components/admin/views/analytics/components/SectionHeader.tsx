'use client';

import type { SectionHeaderProps } from '../types/analytics.types';

/**
 * SectionHeader - Header de sección con icono
 */

export function SectionHeader({ icon: Icon, title, iconColor }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <h2 className="text-xl font-bold text-[var(--admin-text)]">{title}</h2>
    </div>
  );
}

export default SectionHeader;
