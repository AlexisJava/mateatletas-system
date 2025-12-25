'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

/**
 * ColoniaHighlight - Banner destacado de Colonia 2026
 *
 * Promociona las inscripciones de la colonia de verano.
 */

export function ColoniaHighlight() {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--admin-accent-muted)] to-[var(--status-info-muted)] border border-[var(--admin-border-accent)]">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--admin-accent)] flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-black" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Colonia de Verano 2026</h3>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
            Inscripciones abiertas para Enero y Febrero. Gestiona las inscripciones, tiers y pagos
            desde el panel de productos.
          </p>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-[var(--admin-accent)] hover:underline"
          >
            Ver productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ColoniaHighlight;
