'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { QuickActionProps } from '../types/dashboard.types';

/**
 * QuickAction - Enlace de acción rápida
 *
 * Tarjeta clickeable con icono, título y descripción.
 */

export function QuickAction({ href, label, description, icon: Icon }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] hover:bg-[var(--admin-accent-muted)] transition-all duration-200"
    >
      <div className="w-9 h-9 rounded-lg bg-[var(--admin-accent-muted)] group-hover:bg-[var(--admin-accent)] flex items-center justify-center flex-shrink-0 transition-colors">
        <Icon className="w-4 h-4 text-[var(--admin-accent)] group-hover:text-black transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--admin-text)] group-hover:text-[var(--admin-accent)] transition-colors truncate">
          {label}
        </p>
        <p className="text-xs text-[var(--admin-text-muted)] truncate">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--admin-text-disabled)] group-hover:text-[var(--admin-accent)] group-hover:translate-x-1 transition-all flex-shrink-0" />
    </Link>
  );
}

export default QuickAction;
