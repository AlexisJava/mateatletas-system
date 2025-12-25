'use client';

import { Activity } from 'lucide-react';

/**
 * NotesButton - Botón para abrir modal de notas
 *
 * Muestra acceso rápido a las notas del día.
 */

interface NotesButtonProps {
  hasNotes: boolean;
  onClick: () => void;
}

export function NotesButton({ hasNotes, onClick }: NotesButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--status-info-muted)] flex items-center justify-center">
          <Activity className="w-5 h-5 text-[var(--status-info)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--admin-text)]">Notas del día</p>
          <p className="text-xs text-[var(--admin-text-muted)]">
            {hasNotes ? 'Editar notas' : 'Agregar notas'}
          </p>
        </div>
      </div>
    </button>
  );
}

export default NotesButton;
