'use client';

import type { PersonaStatCardProps } from '../types/personas.types';

/**
 * PersonaStatCard - Card de estadística de personas
 */

export function PersonaStatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  onClick,
  isActive,
}: PersonaStatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all text-left w-full ${
        isActive
          ? 'bg-[var(--admin-accent-muted)] border-[var(--admin-accent)]'
          : 'bg-[var(--admin-surface-1)] border-[var(--admin-border)] hover:border-[var(--admin-border-accent)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--admin-text)]">{value}</p>
          <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
        </div>
      </div>
    </button>
  );
}

export default PersonaStatCard;
