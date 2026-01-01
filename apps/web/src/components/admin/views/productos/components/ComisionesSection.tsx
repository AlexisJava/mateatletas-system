'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Users,
  Clock,
  MapPin,
  User,
  Loader2,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  getComisionesByProducto,
  getComisionById,
  createComision,
  updateComision,
  deleteComision,
  type Comision,
  type CreateComisionDto,
  type InscripcionComision,
} from '@/lib/api/admin.api';
import { DocenteComisionSection, InscripcionesComisionSection } from '@/components/admin/shared';

interface ComisionesSectionProps {
  productoId: string;
  productoNombre: string;
}

/**
 * ComisionesSection - Sección de comisiones dentro del detalle de producto
 * Muestra las comisiones (turnos) de un producto tipo Curso
 */
/** Comisión con inscripciones cargadas */
type ComisionConInscripciones = Comision & { inscripciones?: InscripcionComision[] };

export function ComisionesSection({ productoId, productoNombre }: ComisionesSectionProps) {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComision, setEditingComision] = useState<Comision | null>(null);

  // Estado para comisión expandida (con inscripciones)
  const [expandedComisionId, setExpandedComisionId] = useState<string | null>(null);
  const [expandedComision, setExpandedComision] = useState<ComisionConInscripciones | null>(null);
  const [loadingExpanded, setLoadingExpanded] = useState(false);

  const fetchComisiones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComisionesByProducto(productoId);
      // Asegurar que siempre sea un array
      setComisiones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar comisiones:', err);
      setError('Error al cargar las comisiones');
      setComisiones([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar comisión expandida con inscripciones
  const fetchExpandedComision = async (comisionId: string) => {
    try {
      setLoadingExpanded(true);
      const data = await getComisionById(comisionId);
      setExpandedComision(data);
    } catch (err) {
      console.error('Error al cargar detalle de comisión:', err);
    } finally {
      setLoadingExpanded(false);
    }
  };

  const handleToggleExpand = async (comisionId: string) => {
    if (expandedComisionId === comisionId) {
      // Cerrar
      setExpandedComisionId(null);
      setExpandedComision(null);
    } else {
      // Expandir
      setExpandedComisionId(comisionId);
      await fetchExpandedComision(comisionId);
    }
  };

  const handleRefreshExpanded = async () => {
    if (expandedComisionId) {
      await fetchExpandedComision(expandedComisionId);
      // También refrescar lista para actualizar contadores
      fetchComisiones();
    }
  };

  useEffect(() => {
    fetchComisiones();
  }, [productoId]);

  const handleCreate = () => {
    setEditingComision(null);
    setIsFormOpen(true);
  };

  const handleEdit = (comision: Comision) => {
    setEditingComision(comision);
    setIsFormOpen(true);
  };

  const handleDelete = async (comision: Comision) => {
    if (!confirm(`¿Desactivar la comisión "${comision.nombre}"?`)) return;
    try {
      await deleteComision(comision.id);
      fetchComisiones();
    } catch (err) {
      console.error('Error al eliminar comisión:', err);
    }
  };

  const handleSave = async (data: CreateComisionDto) => {
    try {
      if (editingComision) {
        await updateComision(editingComision.id, data);
      } else {
        await createComision({ ...data, producto_id: productoId });
      }
      setIsFormOpen(false);
      fetchComisiones();
    } catch (err) {
      console.error('Error al guardar comisión:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[var(--status-error-muted)] rounded-xl text-[var(--status-error)] text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--admin-text)]">Comisiones / Turnos</h4>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--admin-accent)] text-black rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva Comisión
        </button>
      </div>

      {/* Lista de comisiones */}
      {comisiones.length === 0 ? (
        <div className="p-6 bg-[var(--admin-surface-2)] rounded-xl text-center">
          <Users className="w-10 h-10 text-[var(--admin-text-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">
            No hay comisiones creadas para este producto
          </p>
          <button
            onClick={handleCreate}
            className="mt-3 text-sm text-[var(--admin-accent)] hover:underline"
          >
            Crear primera comisión
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {comisiones.map((comision) => {
            const isExpanded = expandedComisionId === comision.id;

            return (
              <div
                key={comision.id}
                className={`bg-[var(--admin-surface-2)] rounded-xl border transition-colors ${
                  isExpanded
                    ? 'border-[var(--admin-accent)]'
                    : 'border-transparent hover:border-[var(--admin-border)]'
                } ${!comision.activo ? 'opacity-50' : ''}`}
              >
                {/* Header de comisión (clickeable para expandir) */}
                <div className="p-4 cursor-pointer" onClick={() => handleToggleExpand(comision.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[var(--admin-accent)]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[var(--admin-text-muted)]" />
                        )}
                        <h5 className="font-medium text-[var(--admin-text)] truncate">
                          {comision.nombre}
                        </h5>
                        {!comision.activo && (
                          <span className="text-xs px-1.5 py-0.5 bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] rounded">
                            Inactivo
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--admin-text-muted)] ml-6">
                        {comision.casa && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {comision.casa.emoji} {comision.casa.nombre}
                          </span>
                        )}
                        {comision.horario && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {comision.horario}
                          </span>
                        )}
                        {comision.docente && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {comision.docente.nombre} {comision.docente.apellido}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 ml-6">
                        <span className="text-xs font-medium text-[var(--status-info)]">
                          {comision.total_inscriptos ?? 0} inscriptos
                        </span>
                        {comision.cupo_maximo && (
                          <span className="text-xs text-[var(--admin-text-muted)]">
                            / {comision.cupo_maximo} cupos
                          </span>
                        )}
                        {comision.cupos_disponibles !== null &&
                          comision.cupos_disponibles !== undefined && (
                            <span
                              className={`text-xs ${comision.cupos_disponibles > 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}`}
                            >
                              ({comision.cupos_disponibles} disponibles)
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(comision)}
                        className="p-2 rounded-lg hover:bg-[var(--admin-surface-1)] transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-[var(--admin-text-muted)]" />
                      </button>
                      <button
                        onClick={() => handleDelete(comision)}
                        className="p-2 rounded-lg hover:bg-[var(--status-error-muted)] transition-colors"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4 text-[var(--status-error)]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenido expandido: Docente + Inscripciones */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-[var(--admin-border)]">
                    {loadingExpanded ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-accent)]" />
                      </div>
                    ) : expandedComision ? (
                      <>
                        {/* Sección Docente */}
                        <div className="pt-4">
                          <DocenteComisionSection
                            comision={expandedComision}
                            onRefresh={handleRefreshExpanded}
                          />
                        </div>

                        {/* Sección Inscripciones */}
                        <InscripcionesComisionSection
                          comision={expandedComision}
                          onRefresh={handleRefreshExpanded}
                        />
                      </>
                    ) : (
                      <div className="py-4 text-center text-[var(--admin-text-muted)] text-sm">
                        Error al cargar detalles
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de formulario */}
      {isFormOpen && (
        <ComisionFormModal
          comision={editingComision}
          productoId={productoId}
          productoNombre={productoNombre}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface ComisionFormModalProps {
  comision: Comision | null;
  productoId: string;
  productoNombre: string;
  onClose: () => void;
  onSave: (data: CreateComisionDto) => Promise<void>;
}

function ComisionFormModal({
  comision,
  productoId,
  productoNombre,
  onClose,
  onSave,
}: ComisionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateComisionDto>({
    nombre: comision?.nombre ?? '',
    descripcion: comision?.descripcion ?? '',
    producto_id: productoId,
    casa_id: comision?.casa_id ?? undefined,
    docente_id: comision?.docente_id ?? undefined,
    cupo_maximo: comision?.cupo_maximo ?? undefined,
    horario: comision?.horario ?? '',
    fecha_inicio: comision?.fecha_inicio?.split('T')[0] ?? '',
    fecha_fin: comision?.fecha_fin?.split('T')[0] ?? '',
    activo: comision?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <div>
            <h3 className="text-lg font-semibold text-[var(--admin-text)]">
              {comision ? 'Editar Comisión' : 'Nueva Comisión'}
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)]">{productoNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <Plus className="w-5 h-5 text-[var(--admin-text-muted)] rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
              Nombre de la comisión *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: QUANTUM Mañana"
              required
              className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] focus:border-transparent"
            />
          </div>

          {/* Horario */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
              Horario
            </label>
            <input
              type="text"
              value={formData.horario ?? ''}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              placeholder="Ej: Lunes a Viernes 9:00 - 12:00"
              className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] focus:border-transparent"
            />
          </div>

          {/* Cupo máximo */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
              Cupo máximo
            </label>
            <input
              type="number"
              value={formData.cupo_maximo ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cupo_maximo: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Sin límite"
              min={1}
              className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] focus:border-transparent"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                Fecha inicio
              </label>
              <input
                type="date"
                value={formData.fecha_inicio ?? ''}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
                Fecha fin
              </label>
              <input
                type="date"
                value={formData.fecha_fin ?? ''}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] focus:border-transparent"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text)] mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional"
              rows={2}
              className="w-full px-3 py-2.5 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] focus:border-transparent resize-none"
            />
          </div>

          {/* Activo toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
            />
            <span className="text-sm text-[var(--admin-text)]">Comisión activa</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre}
              className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {comision ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComisionesSection;
