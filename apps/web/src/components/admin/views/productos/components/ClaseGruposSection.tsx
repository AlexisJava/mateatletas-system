'use client';

/**
 * ClaseGruposSection - Horarios para productos tipo Club
 *
 * Similar a ComisionesSection pero para ClaseGrupos.
 * Muestra los horarios semanales vinculados a un producto Club.
 * CRUD completo: crear, editar, eliminar horarios.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { listarClaseGrupos, eliminarClaseGrupo, type ClaseGrupo } from '@/lib/api/clase-grupos.api';
import { DIA_SEMANA_LABELS } from '@/types/clase-grupo';
import { ClaseGrupoFormModal } from './ClaseGrupoFormModal';

interface ClaseGruposSectionProps {
  productoId: string;
  productoNombre: string;
}

export function ClaseGruposSection({ productoId, productoNombre }: ClaseGruposSectionProps) {
  const [claseGrupos, setClaseGrupos] = useState<ClaseGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClaseGrupo, setEditingClaseGrupo] = useState<ClaseGrupo | null>(null);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Para evitar race conditions
  const requestIdRef = useRef(0);

  const fetchClaseGrupos = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await listarClaseGrupos({ productoId });

      // Ignorar respuestas de requests anteriores
      if (currentRequestId !== requestIdRef.current) return;

      setClaseGrupos(response.data || []);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.error('Error al cargar horarios:', err);
      setError('Error al cargar los horarios del Club');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [productoId]);

  useEffect(() => {
    fetchClaseGrupos();
  }, [fetchClaseGrupos]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Modal handlers
  const handleOpenCreate = () => {
    setEditingClaseGrupo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grupo: ClaseGrupo, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClaseGrupo(grupo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClaseGrupo(null);
  };

  const handleModalSuccess = () => {
    fetchClaseGrupos();
  };

  // Delete handlers
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await eliminarClaseGrupo(deletingId);
      toast.success('Horario eliminado');
      setDeletingId(null);
      fetchClaseGrupos();
    } catch (err) {
      console.error('Error al eliminar:', err);
      toast.error('Error al eliminar el horario');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-[var(--admin-accent)]" />
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Horarios del Club</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-[var(--admin-accent)]" />
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Horarios del Club</h3>
        </div>
        <div className="flex items-center gap-2 text-[var(--status-danger)] bg-red-500/10 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[var(--admin-accent)]" />
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Horarios del Club</h3>
          <span className="px-2 py-0.5 text-xs bg-[var(--admin-surface-2)] rounded-full text-[var(--admin-text-muted)]">
            {claseGrupos.length}
          </span>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--admin-accent)] text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nuevo Horario
        </button>
      </div>

      {/* Lista de horarios */}
      {claseGrupos.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-10 h-10 mx-auto mb-3 text-[var(--admin-text-muted)] opacity-40" />
          <p className="text-[var(--admin-text-muted)]">
            No hay horarios configurados para este Club
          </p>
          <p className="text-xs text-[var(--admin-text-muted)] mt-1">
            Los horarios se configuran desde la sección de Grupos
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {claseGrupos.map((grupo) => {
            const isExpanded = expandedId === grupo.id;
            const totalInscriptos = grupo.totalInscriptos ?? grupo.inscripciones?.length ?? 0;
            const cupoInfo = grupo.cupoMaximo
              ? `${totalInscriptos}/${grupo.cupoMaximo}`
              : `${totalInscriptos}`;

            return (
              <div
                key={grupo.id}
                className="bg-[var(--admin-surface-2)] rounded-xl border border-[var(--admin-border)] overflow-hidden"
              >
                {/* Header del horario - clickeable para expandir */}
                <button
                  onClick={() => toggleExpand(grupo.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[var(--admin-surface-1)] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Día y hora */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--admin-text)]">
                        {DIA_SEMANA_LABELS[grupo.diaSemana] || grupo.diaSemana}
                      </span>
                      <span className="text-xs text-[var(--admin-text-muted)]">
                        {grupo.horaInicio} - {grupo.horaFin}
                      </span>
                    </div>

                    {/* Nombre/Código */}
                    <div className="border-l border-[var(--admin-border)] pl-4">
                      <span className="text-sm text-[var(--admin-text)]">{grupo.nombre}</span>
                      <span className="text-xs text-[var(--admin-text-muted)] ml-2">
                        ({grupo.codigo})
                      </span>
                    </div>

                    {/* Docente */}
                    {grupo.docente && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
                        <User className="w-3.5 h-3.5" />
                        <span>
                          {grupo.docente.nombre} {grupo.docente.apellido}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Inscriptos */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--admin-surface-1)] rounded-lg">
                      <Users className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
                      <span className="text-xs text-[var(--admin-text)]">{cupoInfo}</span>
                    </div>

                    {/* Estado */}
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        grupo.activo
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {grupo.activo ? 'Activo' : 'Inactivo'}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEdit(grupo, e)}
                        className="p-1.5 rounded-lg hover:bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
                        title="Editar horario"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(grupo.id, e)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--admin-text-muted)] hover:text-red-400 transition-colors"
                        title="Eliminar horario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Expand icon */}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    )}
                  </div>
                </button>

                {/* Contenido expandido */}
                {isExpanded && (
                  <div className="border-t border-[var(--admin-border)] p-4 space-y-4">
                    {/* Info adicional */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--admin-text-muted)] text-xs">Tipo</span>
                        <p className="text-[var(--admin-text)]">
                          {grupo.tipo === 'GRUPO_REGULAR' ? 'Grupo Regular' : 'Curso Temporal'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--admin-text-muted)] text-xs">Año Lectivo</span>
                        <p className="text-[var(--admin-text)]">{grupo.anioLectivo}</p>
                      </div>
                      <div>
                        <span className="text-[var(--admin-text-muted)] text-xs">Inicio</span>
                        <p className="text-[var(--admin-text)]">
                          {new Date(grupo.fechaInicio).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--admin-text-muted)] text-xs">Fin</span>
                        <p className="text-[var(--admin-text)]">
                          {new Date(grupo.fechaFin).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>

                    {/* Ruta curricular si existe */}
                    {grupo.rutaCurricular && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--admin-text-muted)]">
                          Ruta Curricular:
                        </span>
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: `${grupo.rutaCurricular.color}20`,
                            color: grupo.rutaCurricular.color,
                          }}
                        >
                          {grupo.rutaCurricular.nombre}
                        </span>
                      </div>
                    )}

                    {/* Inscripciones */}
                    {grupo.inscripciones && grupo.inscripciones.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-[var(--admin-text)] mb-2">
                          Estudiantes Inscriptos ({grupo.inscripciones.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {grupo.inscripciones.slice(0, 6).map((inscripcion) => (
                            <div
                              key={inscripcion.id}
                              className="flex items-center gap-2 p-2 bg-[var(--admin-surface-1)] rounded-lg text-sm"
                            >
                              <div className="w-7 h-7 rounded-full bg-[var(--admin-accent)]/20 flex items-center justify-center">
                                <span className="text-xs text-[var(--admin-accent)]">
                                  {inscripcion.estudiante?.nombre?.[0] || '?'}
                                  {inscripcion.estudiante?.apellido?.[0] || ''}
                                </span>
                              </div>
                              <div>
                                <p className="text-[var(--admin-text)]">
                                  {inscripcion.estudiante?.nombre}{' '}
                                  {inscripcion.estudiante?.apellido}
                                </p>
                              </div>
                            </div>
                          ))}
                          {grupo.inscripciones.length > 6 && (
                            <div className="flex items-center justify-center p-2 text-xs text-[var(--admin-text-muted)]">
                              +{grupo.inscripciones.length - 6} más
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de formulario crear/editar */}
      <ClaseGrupoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        productoId={productoId}
        productoNombre={productoNombre}
        claseGrupo={editingClaseGrupo}
      />

      {/* Modal de confirmación de borrado */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--admin-text)]">Eliminar Horario</h3>
            </div>
            <p className="text-[var(--admin-text-muted)] text-sm mb-6">
              ¿Estás seguro de eliminar este horario? Esta acción no se puede deshacer. Los
              estudiantes inscriptos perderán su inscripción.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaseGruposSection;
