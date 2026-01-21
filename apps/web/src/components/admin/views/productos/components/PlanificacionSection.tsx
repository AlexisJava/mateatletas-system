'use client';

/**
 * PlanificacionSection - Asignar planificacion a productos tipo Club
 *
 * Permite al admin:
 * - Ver la planificacion actualmente asignada
 * - Asignar una nueva planificacion publicada
 * - Cambiar o quitar la planificacion existente
 */

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronDown, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getPlanificaciones,
  asignarPlanificacionProducto,
  quitarPlanificacionProducto,
  getProductoConPlanificacion,
  type Planificacion,
} from '@/lib/api/admin.api';

interface PlanificacionSectionProps {
  productoId: string;
  productoNombre: string;
  onPlanificacionChange?: () => void;
}

const CASA_LABELS: Record<string, string> = {
  QUANTUM: 'Quantum',
  VERTEX: 'Vertex',
  PULSAR: 'Pulsar',
};

const MUNDO_LABELS: Record<string, string> = {
  MATEMATICA: 'Matematica',
  PROGRAMACION: 'Programacion',
  CIENCIAS: 'Ciencias',
};

export function PlanificacionSection({
  productoId,
  productoNombre: _productoNombre,
  onPlanificacionChange,
}: PlanificacionSectionProps) {
  const [planificaciones, setPlanificaciones] = useState<Planificacion[]>([]);
  const [planificacionActual, setPlanificacionActual] = useState<Planificacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar planificacion actual del producto
  const fetchPlanificacionActual = useCallback(async () => {
    try {
      const producto = await getProductoConPlanificacion(productoId);
      setPlanificacionActual(producto.planificacion || null);
    } catch (err) {
      console.error('Error al cargar planificacion actual:', err);
    }
  }, [productoId]);

  // Cargar planificaciones publicadas
  const fetchPlanificaciones = useCallback(async () => {
    setLoading(true);
    try {
      const [, planificacionesResponse] = await Promise.all([
        fetchPlanificacionActual(),
        getPlanificaciones({ estado: 'PUBLICADO', limit: 100 }),
      ]);
      setPlanificaciones(planificacionesResponse.data || []);
    } catch (err) {
      console.error('Error al cargar planificaciones:', err);
      toast.error('Error al cargar planificaciones');
    } finally {
      setLoading(false);
    }
  }, [fetchPlanificacionActual]);

  useEffect(() => {
    fetchPlanificaciones();
  }, [fetchPlanificaciones]);

  const handleAsignar = async (planificacionId: string) => {
    setSaving(true);
    try {
      await asignarPlanificacionProducto(productoId, planificacionId);
      toast.success('Planificacion asignada exitosamente');
      // Actualizar la planificacion actual
      const planificacion = planificaciones.find((p) => p.id === planificacionId);
      setPlanificacionActual(planificacion || null);
      setIsOpen(false);
      onPlanificacionChange?.();
    } catch (err) {
      console.error('Error al asignar planificacion:', err);
      toast.error('Error al asignar planificacion');
    } finally {
      setSaving(false);
    }
  };

  const handleQuitar = async () => {
    if (!confirm('Quitar la planificacion de este producto?')) return;

    setSaving(true);
    try {
      await quitarPlanificacionProducto(productoId);
      toast.success('Planificacion removida');
      setPlanificacionActual(null);
      onPlanificacionChange?.();
    } catch (err) {
      console.error('Error al quitar planificacion:', err);
      toast.error('Error al quitar planificacion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl mb-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-accent)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--admin-accent)]" />
          <h2 className="text-lg font-semibold text-[var(--admin-text)]">Planificacion del Club</h2>
        </div>
      </div>

      {/* Planificacion actual o selector */}
      {planificacionActual ? (
        <div className="p-4 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-[var(--admin-text)]">{planificacionActual.titulo}</h3>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                {planificacionActual.cantidadClases} clases -{' '}
                {CASA_LABELS[planificacionActual.casaTipo] || 'Sin casa'} /{' '}
                {MUNDO_LABELS[planificacionActual.mundoTipo] || 'Sin mundo'}
              </p>
              {planificacionActual.descripcion && (
                <p className="text-sm text-[var(--admin-text-muted)] mt-2">
                  {planificacionActual.descripcion}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={saving}
                className="px-3 py-1.5 text-sm bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
              >
                Cambiar
              </button>
              <button
                onClick={handleQuitar}
                disabled={saving}
                className="p-1.5 text-[var(--status-error)] hover:bg-[var(--status-error-muted)] rounded-lg transition-colors"
                title="Quitar planificacion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[var(--admin-surface-2)] border border-dashed border-[var(--admin-border)] rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--admin-text-muted)]" />
              <span className="text-[var(--admin-text-muted)]">Sin planificacion asignada</span>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              disabled={saving}
              className="px-4 py-2 bg-[var(--admin-accent)] text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Asignar Planificacion
            </button>
          </div>
        </div>
      )}

      {/* Dropdown de seleccion */}
      {isOpen && (
        <div className="mt-4 p-4 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--admin-text)]">
              Seleccionar planificacion publicada
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[var(--admin-surface-1)] rounded"
            >
              <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
            </button>
          </div>

          {planificaciones.length === 0 ? (
            <p className="text-center py-4 text-[var(--admin-text-muted)]">
              No hay planificaciones publicadas disponibles
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {planificaciones.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleAsignar(plan.id)}
                  disabled={saving || plan.id === planificacionActual?.id}
                  className={`w-full p-3 rounded-lg border transition-all text-left flex items-center justify-between ${
                    plan.id === planificacionActual?.id
                      ? 'border-[var(--admin-accent)] bg-[var(--admin-accent)]/10'
                      : 'border-[var(--admin-border)] hover:border-[var(--admin-accent)]/50 hover:bg-[var(--admin-surface-1)]'
                  } disabled:opacity-50`}
                >
                  <div>
                    <p className="font-medium text-[var(--admin-text)]">{plan.titulo}</p>
                    <p className="text-sm text-[var(--admin-text-muted)]">
                      {plan.cantidadClases} clases - {CASA_LABELS[plan.casaTipo] || plan.casaTipo} /{' '}
                      {MUNDO_LABELS[plan.mundoTipo] || plan.mundoTipo}
                    </p>
                  </div>
                  {plan.id === planificacionActual?.id && (
                    <Check className="w-5 h-5 text-[var(--admin-accent)]" />
                  )}
                  {saving && plan.id !== planificacionActual?.id && (
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--admin-text-muted)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
