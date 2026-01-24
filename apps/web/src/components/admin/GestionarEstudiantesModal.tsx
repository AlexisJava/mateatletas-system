'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, UserPlus, Users, Search, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import { AdminModal } from './primitives/AdminModal';
import { AdminButton } from './primitives/AdminButton';
import { AdminInput } from './primitives/AdminInput';
import { AdminSelect } from './primitives/AdminSelect';
import { AdminCard } from './primitives/AdminCard';
import { AdminBadge } from './primitives/AdminBadge';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  nivelEscolar: string;
  avatarUrl: string | null;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface EstudianteInscrito extends Estudiante {
  inscripcionId: string;
  fechaInscripcion: string;
}

interface ClaseEstudiantes {
  claseId: string;
  nombre: string;
  cuposMaximo: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  docente: {
    id: string;
    nombre: string;
    apellido: string;
    sector: {
      id: string;
      nombre: string;
      color: string;
      icono: string;
    } | null;
  };
  estudiantes: EstudianteInscrito[];
}

interface Props {
  claseId: string;
  claseNombre: string;
  onClose: () => void;
  onSuccess: () => void;
}

const NIVEL_OPTIONS = [
  { value: 'Primaria', label: 'Primaria' },
  { value: 'Secundaria', label: 'Secundaria' },
  { value: 'Universidad', label: 'Universidad' },
];

export default function GestionarEstudiantesModal({
  claseId,
  claseNombre,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claseData, setClaseData] = useState<ClaseEstudiantes | null>(null);
  const [todosEstudiantes, setTodosEstudiantes] = useState<Estudiante[]>([]);
  const [selectedEstudiantes, setSelectedEstudiantes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    nivelEscolar: 'Primaria' as 'Primaria' | 'Secundaria' | 'Universidad',
    tutorNombre: '',
    tutorApellido: '',
    tutorEmail: '',
    tutorTelefono: '',
  });

  const currentRequestRef = useRef<string | null>(null);

  const fetchData = useCallback(
    async (requestId: string) => {
      setLoading(true);
      setError(null);
      try {
        const [claseResponse, estudiantesResponse] = await Promise.all([
          axios.get<ClaseEstudiantes>(`/clases/${claseId}/estudiantes`),
          axios.get('/admin/estudiantes'),
        ]);

        if (currentRequestRef.current !== requestId) return;

        const clase = (claseResponse as ClaseEstudiantes) ?? null;
        setClaseData(clase);
        const estudiantes =
          (Array.isArray(estudiantesResponse)
            ? estudiantesResponse
            : (estudiantesResponse as { data?: Estudiante[] })?.data) ?? [];
        setTodosEstudiantes(estudiantes as Estudiante[]);
      } catch (err) {
        if (currentRequestRef.current !== requestId) return;
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos');
        toast.error('Error al cargar datos de la clase');
        setTodosEstudiantes([]);
      } finally {
        if (currentRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [claseId],
  );

  useEffect(() => {
    const requestId = `clase-${claseId}-${Date.now()}`;
    currentRequestRef.current = requestId;
    void fetchData(requestId);
    return () => {
      currentRequestRef.current = null;
    };
  }, [claseId, fetchData]);

  const handleAsignarEstudiantes = async () => {
    if (selectedEstudiantes.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`/clases/${claseId}/asignar-estudiantes`, {
        estudianteIds: selectedEstudiantes,
      });

      const requestId = `clase-${claseId}-${Date.now()}`;
      currentRequestRef.current = requestId;
      await fetchData(requestId);
      setSelectedEstudiantes([]);
      onSuccess();
    } catch (err) {
      console.error('Error al asignar estudiantes:', err);
      setError('Error al asignar estudiantes');
      toast.error('Error al asignar estudiantes');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEstudiante = (estudianteId: string) => {
    setSelectedEstudiantes((prev) =>
      prev.includes(estudianteId)
        ? prev.filter((id) => id !== estudianteId)
        : [...prev, estudianteId],
    );
  };

  const handleCrearEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const dataToSend = {
        ...createForm,
        sectorId: claseData?.docente?.sector?.id || undefined,
      };

      const nuevoEstudiante = await axios.post<Estudiante>('/admin/estudiantes', dataToSend);

      if (!nuevoEstudiante || !nuevoEstudiante.id) {
        throw new Error('Respuesta inválida del servidor');
      }

      setTodosEstudiantes((prev) => [...(prev || []), nuevoEstudiante]);
      setSelectedEstudiantes((prev) => [...prev, nuevoEstudiante.id]);
      setCreateForm({
        nombre: '',
        apellido: '',
        edad: '',
        nivelEscolar: 'Primaria',
        tutorNombre: '',
        tutorApellido: '',
        tutorEmail: '',
        tutorTelefono: '',
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error al crear estudiante:', err);
      setError('Error al crear el estudiante');
      toast.error('Error al crear el estudiante');
    } finally {
      setSubmitting(false);
    }
  };

  const estudiantesDisponibles = (todosEstudiantes || []).filter(
    (est) => !claseData?.estudiantes.some((inscrito) => inscrito.id === est.id),
  );

  const estudiantesFiltrados = (estudiantesDisponibles || []).filter(
    (est) =>
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.tutor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.tutor.apellido.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <AdminModal open={true} onClose={onClose} title="Cargando..." size="lg">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-[var(--admin-accent)] animate-spin" />
          <p className="mt-4 text-[var(--admin-text-muted)]">Cargando datos...</p>
        </div>
      </AdminModal>
    );
  }

  const footer = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full">
      <div className="text-sm text-[var(--admin-text-muted)]">
        Cupos disponibles:{' '}
        <span className="text-[var(--status-success)] font-semibold">
          {claseData?.cuposDisponibles || 0}
        </span>
      </div>
      <AdminButton variant="secondary" onClick={onClose}>
        Cerrar
      </AdminButton>
    </div>
  );

  return (
    <AdminModal
      open={true}
      onClose={onClose}
      title="Gestionar Estudiantes"
      description={claseNombre}
      size="xl"
      footer={footer}
    >
      {error && (
        <div className="mb-4 bg-[var(--status-danger-muted)] border border-[var(--status-danger)]/30 text-[var(--status-danger)] px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna izquierda: Estudiantes inscritos */}
        <AdminCard padding="md" animate={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h4 className="text-sm font-semibold text-[var(--admin-text)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--admin-accent)]" />
              Estudiantes Inscritos
            </h4>
            <div className="text-sm">
              <span className="text-[var(--status-success)] font-semibold">
                {claseData?.cuposOcupados || 0}
              </span>
              <span className="text-[var(--admin-text-muted)]">
                {' '}
                / {claseData?.cuposMaximo || 0} cupos
              </span>
            </div>
          </div>

          {claseData && claseData.estudiantes.length === 0 ? (
            <div className="text-center py-8 text-[var(--admin-text-muted)] bg-white/[0.02] rounded-xl border border-dashed border-white/[0.08]">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay estudiantes inscritos aún</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {claseData?.estudiantes.map((estudiante) => (
                <EstudianteRow key={estudiante.id} estudiante={estudiante} />
              ))}
            </div>
          )}
        </AdminCard>

        {/* Columna derecha: Asignar estudiantes */}
        <AdminCard padding="md" animate={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h4 className="text-sm font-semibold text-[var(--admin-text)]">
              Asignar Nuevos Estudiantes
            </h4>
            <AdminButton
              variant={showCreateForm ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
              icon={<UserPlus className="w-4 h-4" />}
            >
              {showCreateForm ? 'Cancelar' : 'Crear Nuevo'}
            </AdminButton>
          </div>

          {showCreateForm ? (
            <form onSubmit={handleCrearEstudiante} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <AdminInput
                  label="Nombre *"
                  required
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                />
                <AdminInput
                  label="Apellido *"
                  required
                  value={createForm.apellido}
                  onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AdminInput
                  label="Edad *"
                  type="number"
                  required
                  min={3}
                  max={99}
                  value={createForm.edad}
                  onChange={(e) => setCreateForm({ ...createForm, edad: e.target.value })}
                  placeholder="ej: 8"
                />
                <AdminSelect
                  label="Nivel Escolar *"
                  value={createForm.nivelEscolar}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      nivelEscolar: e.target.value as 'Primaria' | 'Secundaria' | 'Universidad',
                    })
                  }
                  options={NIVEL_OPTIONS}
                />
              </div>
              <div className="border-t border-white/[0.08] pt-3">
                <p className="text-xs text-[var(--admin-text-muted)] mb-2">
                  Datos del Tutor (opcional)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <AdminInput
                    label="Nombre Tutor"
                    value={createForm.tutorNombre}
                    onChange={(e) => setCreateForm({ ...createForm, tutorNombre: e.target.value })}
                  />
                  <AdminInput
                    label="Apellido Tutor"
                    value={createForm.tutorApellido}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, tutorApellido: e.target.value })
                    }
                  />
                </div>
              </div>
              <AdminButton
                type="submit"
                variant="primary"
                loading={submitting}
                icon={<UserPlus className="w-4 h-4" />}
                className="w-full"
              >
                Crear y Seleccionar
              </AdminButton>
            </form>
          ) : (
            <>
              <div className="mb-4">
                <AdminInput
                  placeholder="Buscar estudiante o tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>

              {claseData && claseData.cuposDisponibles === 0 ? (
                <div className="text-center py-6 text-[var(--status-warning)] bg-[var(--status-warning-muted)] rounded-xl border border-[var(--status-warning)]/30">
                  <p className="text-sm font-medium">⚠️ No hay cupos disponibles</p>
                </div>
              ) : estudiantesFiltrados.length === 0 ? (
                <div className="text-center py-6 text-[var(--admin-text-muted)] bg-white/[0.02] rounded-xl border border-dashed border-white/[0.08]">
                  <p className="text-sm">
                    {searchTerm
                      ? 'No se encontraron estudiantes'
                      : 'No hay más estudiantes disponibles'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {estudiantesFiltrados.map((estudiante) => (
                    <SelectableEstudianteRow
                      key={estudiante.id}
                      estudiante={estudiante}
                      selected={selectedEstudiantes.includes(estudiante.id)}
                      onToggle={() => toggleEstudiante(estudiante.id)}
                    />
                  ))}
                </div>
              )}

              {selectedEstudiantes.length > 0 && (
                <AdminButton
                  variant="primary"
                  onClick={handleAsignarEstudiantes}
                  loading={submitting}
                  disabled={(claseData?.cuposDisponibles || 0) < selectedEstudiantes.length}
                  icon={<UserPlus className="w-4 h-4" />}
                  className="w-full"
                >
                  Asignar {selectedEstudiantes.length} estudiante(s)
                </AdminButton>
              )}
            </>
          )}
        </AdminCard>
      </div>
    </AdminModal>
  );
}

function EstudianteRow({ estudiante }: { estudiante: EstudianteInscrito }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
      <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--admin-accent)] to-[var(--admin-accent-hover)] flex items-center justify-center text-white font-semibold text-sm">
        {estudiante.nombre.charAt(0)}
        {estudiante.apellido.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--admin-text)] truncate">
          {estudiante.nombre} {estudiante.apellido}
        </p>
        <p className="text-xs text-[var(--admin-text-muted)] truncate">
          Tutor: {estudiante.tutor.nombre} {estudiante.tutor.apellido}
        </p>
      </div>
    </div>
  );
}

function SelectableEstudianteRow({
  estudiante,
  selected,
  onToggle,
}: {
  estudiante: Estudiante;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
        selected
          ? 'bg-[var(--admin-accent)]/10 border-2 border-[var(--admin-accent)]'
          : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--admin-accent)] to-[var(--admin-accent-hover)] flex items-center justify-center text-white font-semibold text-sm">
        {estudiante.nombre.charAt(0)}
        {estudiante.apellido.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--admin-text)] truncate">
          {estudiante.nombre} {estudiante.apellido}
        </p>
        <p className="text-xs text-[var(--admin-text-muted)] truncate">
          {estudiante.nivelEscolar} • Tutor: {estudiante.tutor.nombre}
        </p>
      </div>
      {selected && (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--admin-accent)] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
}
