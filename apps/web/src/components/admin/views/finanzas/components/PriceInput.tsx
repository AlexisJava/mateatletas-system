'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * PriceInput - Input de precio con icono y símbolo $
 */

interface PriceInputProps {
  icon: LucideIcon;
  label: string;
  value: number;
  onChange: (value: number) => void;
  focusColor: string;
}

export function PriceInput({ icon: Icon, label, value, onChange, focusColor }: PriceInputProps) {
  return (
    <div>
      <label className="block text-xs text-[var(--admin-text-muted)] mb-1 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
          $
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className={`w-full pl-8 pr-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none ${focusColor}`}
        />
      </div>
    </div>
  );
}

export default PriceInput;
