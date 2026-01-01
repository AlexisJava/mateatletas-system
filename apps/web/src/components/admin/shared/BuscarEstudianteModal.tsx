'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAllEstudiantes, type EstudianteAdmin } from '@/lib/api/admin.api';

interface BuscarEstudianteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (estudianteId: string) => void;
  excludeIds?: string[];
}

/**
 * BuscarEstudianteModal - Modal para buscar y seleccionar estudiante existente
 */
export function BuscarEstudianteModal({
  isOpen,
  onClose,
  onSelect,
  excludeIds = [],
}: BuscarEstudianteModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [estudiantes, setEstudiantes] = useState<EstudianteAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  // Ref para controlar el request actual y evitar race conditions
  const currentRequestRef = useRef<string | null>(null);

  // Efecto para buscar estudiantes cuando cambia la búsqueda o se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    // Generar ID único para este request
    const requestId = `search-${Date.now()}-${Math.random()}`;
    currentRequestRef.current = requestId;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getAllEstudiantes({
          search: searchQuery || undefined,
          limit: 20,
        });

        // Verificar que este request siga siendo el actual (evita race condition)
        if (currentRequestRef.current !== requestId) {
          return; // Request obsoleto, ignorar resultado
        }

        // Filtrar los ya inscriptos
        const filtrados = response.data.filter((e) => !excludeIds.includes(e.id));
        setEstudiantes(filtrados);
      } catch (error) {
        // Solo actualizar estado si el request sigue siendo actual
        if (currentRequestRef.current !== requestId) {
          return;
        }
        console.error('Error buscando estudiantes:', error);
        toast.error('Error al buscar estudiantes');
        setEstudiantes([]);
      } finally {
        // Solo actualizar loading si el request sigue siendo actual
        if (currentRequestRef.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup: invalidar el request anterior
    return () => {
      currentRequestRef.current = null;
    };
  }, [isOpen, searchQuery, excludeIds]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setEstudiantes([]);
    }
  }, [isOpen]);

  const handleSelect = async (estudiante: EstudianteAdmin) => {
    setIsSelecting(estudiante.id);
    try {
      await onSelect(estudiante.id);
    } finally {
      setIsSelecting(null);
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
              <Search className="w-5 h-5 text-[var(--admin-accent)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--admin-text)]">Buscar Estudiante</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[var(--admin-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, apellido..."
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
          ) : estudiantes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--admin-text-muted)]">
                {searchQuery ? 'No se encontraron estudiantes' : 'Escribe para buscar estudiantes'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {estudiantes.map((estudiante) => (
                <button
                  key={estudiante.id}
                  onClick={() => handleSelect(estudiante)}
                  disabled={isSelecting === estudiante.id}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)] transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--admin-accent-muted)] flex items-center justify-center">
                      <span className="text-sm font-medium text-[var(--admin-accent)]">
                        {estudiante.nombre.charAt(0)}
                        {estudiante.apellido.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[var(--admin-text)]">
                        {estudiante.nombre} {estudiante.apellido}
                      </p>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        {estudiante.edad} años
                        {estudiante.tutor && (
                          <>
                            {' '}
                            • Tutor: {estudiante.tutor.nombre} {estudiante.tutor.apellido}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  {isSelecting === estudiante.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--admin-accent)]" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-[var(--admin-text-muted)]" />
                  )}
                </button>
              ))}
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

export default BuscarEstudianteModal;
