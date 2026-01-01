'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Loader2, UserCheck, GraduationCap, UserMinus } from 'lucide-react';
import { getDocentes } from '@/lib/api/admin.api';
import type { DocenteFromSchema } from '@/lib/schemas/docente.schema';

interface AsignarDocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (docenteId: string | null) => Promise<void>;
  currentDocenteId?: string | null;
  currentDocenteNombre?: string | null;
}

/**
 * AsignarDocenteModal - Modal para asignar o cambiar docente de una comisión
 */
export function AsignarDocenteModal({
  isOpen,
  onClose,
  onSelect,
  currentDocenteId,
  currentDocenteNombre,
}: AsignarDocenteModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [docentes, setDocentes] = useState<DocenteFromSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Cargar docentes cuando se abre el modal
  const cargarDocentes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDocentes();
      setDocentes(response);
    } catch (error) {
      console.error('Error cargando docentes:', error);
      setDocentes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      cargarDocentes();
    }
  }, [isOpen, cargarDocentes]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setDocentes([]);
    }
  }, [isOpen]);

  // Filtrar docentes por búsqueda
  const docentesFiltrados = docentes.filter((docente) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nombreCompleto = `${docente.nombre} ${docente.apellido}`.toLowerCase();
    const email = docente.email.toLowerCase();
    return nombreCompleto.includes(query) || email.includes(query);
  });

  const handleSelect = async (docente: DocenteFromSchema) => {
    if (docente.id === currentDocenteId) {
      onClose();
      return;
    }

    setIsSelecting(docente.id);
    try {
      await onSelect(docente.id);
      onClose();
    } finally {
      setIsSelecting(null);
    }
  };

  const handleRemoveDocente = async () => {
    if (!currentDocenteId) return;

    setIsRemoving(true);
    try {
      await onSelect(null);
      onClose();
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[80vh] bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent-muted)] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[var(--admin-accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--admin-text)]">
                {currentDocenteId ? 'Cambiar Docente' : 'Asignar Docente'}
              </h2>
              {currentDocenteNombre && (
                <p className="text-sm text-[var(--admin-text-muted)]">
                  Actual: {currentDocenteNombre}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Botón quitar docente (si hay uno asignado) */}
        {currentDocenteId && (
          <div className="p-4 border-b border-[var(--admin-border)]">
            <button
              onClick={handleRemoveDocente}
              disabled={isRemoving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserMinus className="w-4 h-4" />
              )}
              Quitar docente asignado
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="p-4 border-b border-[var(--admin-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-accent)]" />
            </div>
          ) : docentesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--admin-text-muted)]">
                {searchQuery ? 'No se encontraron docentes' : 'No hay docentes disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {docentesFiltrados.map((docente) => {
                const isCurrentDocente = docente.id === currentDocenteId;

                return (
                  <button
                    key={docente.id}
                    onClick={() => handleSelect(docente)}
                    disabled={isSelecting === docente.id}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors disabled:opacity-50 ${
                      isCurrentDocente
                        ? 'bg-[var(--admin-accent-muted)] border-[var(--admin-accent)]'
                        : 'bg-[var(--admin-surface-2)] border-[var(--admin-border)] hover:border-[var(--admin-accent)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--admin-accent-muted)] flex items-center justify-center">
                        <span className="text-sm font-medium text-[var(--admin-accent)]">
                          {docente.nombre.charAt(0)}
                          {docente.apellido.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[var(--admin-text)]">
                          {docente.nombre} {docente.apellido}
                          {isCurrentDocente && (
                            <span className="ml-2 text-xs text-[var(--admin-accent)]">
                              (Actual)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          {docente.email}
                          {docente.titulo && <> • {docente.titulo}</>}
                        </p>
                      </div>
                    </div>
                    {isSelecting === docente.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[var(--admin-accent)]" />
                    ) : (
                      <UserCheck
                        className={`w-5 h-5 ${isCurrentDocente ? 'text-[var(--admin-accent)]' : 'text-[var(--admin-text-muted)]'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--admin-border)]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AsignarDocenteModal;
