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
      className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] hover:bg-[var(--admin-surface-2)] transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-muted)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[var(--admin-accent)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--admin-text)] group-hover:text-[var(--admin-accent)] transition-colors">
          {label}
        </p>
        <p className="text-xs text-[var(--admin-text-muted)]">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--admin-text-disabled)] group-hover:text-[var(--admin-accent)] group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export default QuickAction;
