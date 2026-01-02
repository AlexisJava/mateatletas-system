'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

/**
 * BibliotecaTab - Tab de analytics de biblioteca
 *
 * Nota: El sistema de biblioteca/contenidos educativos aún no tiene
 * endpoints de analytics implementados en el backend.
 * Mostrar placeholder hasta que se implemente.
 */

export function BibliotecaTab() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={BookOpen} title="Analytics de Biblioteca" iconColor="#f59e0b" />

      {/* Coming Soon Placeholder */}
      <div className="p-8 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-[var(--status-warning-muted)] flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-[var(--status-warning)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--admin-text)] mb-2">Próximamente</h3>
          <p className="text-[var(--admin-text-muted)] max-w-md">
            El módulo de analytics de biblioteca está en desarrollo. Pronto podrás ver estadísticas
            de lectura, contenidos más populares, y progreso de estudiantes.
          </p>
          <div className="mt-6 flex gap-3">
            <div className="px-4 py-2 rounded-lg bg-[var(--admin-surface-2)] text-sm text-[var(--admin-text-muted)]">
              Tendencias de lectura
            </div>
            <div className="px-4 py-2 rounded-lg bg-[var(--admin-surface-2)] text-sm text-[var(--admin-text-muted)]">
              Top contenidos
            </div>
            <div className="px-4 py-2 rounded-lg bg-[var(--admin-surface-2)] text-sm text-[var(--admin-text-muted)]">
              Distribución por tier
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BibliotecaTab;
