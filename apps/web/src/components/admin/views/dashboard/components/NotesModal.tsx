'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { NotesModalProps } from '../types/dashboard.types';

/**
 * NotesModal - Modal para editar notas del día
 *
 * Modal con textarea y botones de cancelar/guardar.
 * Las notas se persisten en localStorage desde DashboardView.
 */

export function NotesModal({ isOpen, onClose, notes, onSave }: NotesModalProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleSave = () => {
    setSaving(true);
    onSave(localNotes);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Notas del día</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Escribe tus notas aquí..."
            className="w-full h-48 p-4 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] resize-none focus:outline-none focus:border-[var(--admin-accent)] transition-colors"
          />
        </div>
        <div className="flex gap-3 p-4 border-t border-[var(--admin-border)]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotesModal;
