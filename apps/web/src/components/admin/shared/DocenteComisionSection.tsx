'use client';

import { useState, useCallback } from 'react';
import { GraduationCap, Edit3, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateComision, type Comision } from '@/lib/api/admin.api';
import { AsignarDocenteModal } from './AsignarDocenteModal';

interface DocenteComisionSectionProps {
  comision: Comision;
  onRefresh: () => void;
}

/**
 * DocenteComisionSection - Sección para gestionar el docente de una comisión
 */
export function DocenteComisionSection({ comision, onRefresh }: DocenteComisionSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const docente = comision.docente;
  const docenteNombre = docente ? `${docente.nombre} ${docente.apellido}` : null;

  const handleAsignarDocente = useCallback(
    async (docenteId: string | null) => {
      setIsUpdating(true);
      try {
        await updateComision(comision.id, { docente_id: docenteId });
        onRefresh();
        toast.success(docenteId ? 'Docente asignado exitosamente' : 'Docente removido');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al actualizar docente');
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [comision.id, onRefresh],
  );

  return (
    <div className="p-4 rounded-xl bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent-muted)] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[var(--admin-accent)]" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--admin-text)]">Docente Asignado</h3>
            {docente ? (
              <div className="flex items-center gap-2">
                <p className="text-sm text-[var(--admin-text)]">
                  {docente.nombre} {docente.apellido}
                </p>
                {docente.email && (
                  <span className="text-xs text-[var(--admin-text-muted)]">({docente.email})</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--admin-text-muted)]">Sin docente asignado</p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isUpdating}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            docente
              ? 'border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-1)]'
              : 'bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)]'
          } disabled:opacity-50`}
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : docente ? (
            <>
              <Edit3 className="w-4 h-4" />
              Cambiar
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Asignar
            </>
          )}
        </button>
      </div>

      <AsignarDocenteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAsignarDocente}
        currentDocenteId={docente?.id}
        currentDocenteNombre={docenteNombre}
      />
    </div>
  );
}

export default DocenteComisionSection;
