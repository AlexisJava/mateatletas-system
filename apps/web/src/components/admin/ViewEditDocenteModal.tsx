'use client';

import { useState } from 'react';
import {
  X,
  Edit2,
  Save,
  Calendar,
  Clock,
  MapPin,
  Award,
  BookOpen,
  GraduationCap,
  User,
  Mail,
  Phone,
  Trash2,
  Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AdminModal } from './primitives/AdminModal';
import { AdminButton } from './primitives/AdminButton';
import { AdminInput } from './primitives/AdminInput';
import { AdminSelect } from './primitives/AdminSelect';
import { AdminCard } from './primitives/AdminCard';
import { AdminBadge } from './primitives/AdminBadge';

interface Docente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  titulo?: string;
  sectores?: Array<{ nombre: string; icono: string; color: string }>;
  especialidades?: string[];
  disponibilidadHoraria?: Record<string, string[]>;
  nivelEducativo?: string[];
  estado?: string;
  createdAt: string;
  updatedAt: string;
}

interface ViewEditDocenteModalProps {
  docente: Docente;
  onClose: () => void;
  onUpdate: (_docenteId: string, _data: Partial<Docente>) => Promise<void>;
  isLoading?: boolean;
}

const ESPECIALIDADES_MATE = [
  'Álgebra',
  'Geometría',
  'Trigonometría',
  'Cálculo',
  'Estadística',
  'Matemática Aplicada',
  'Lógica Matemática',
  'Matemática Financiera',
];

const NIVELES_EDUCATIVOS = ['Primaria', 'Secundaria', 'Universidad'];
const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'vacaciones', label: 'De vacaciones' },
];

function getEstadoBadgeVariant(estado: string): 'success' | 'warning' | 'danger' {
  if (estado === 'activo') return 'success';
  if (estado === 'vacaciones') return 'warning';
  return 'danger';
}

function getEstadoLabel(estado: string): string {
  if (estado === 'activo') return '✓ Activo';
  if (estado === 'vacaciones') return '🏖️ Vacaciones';
  return '✗ Inactivo';
}

export default function ViewEditDocenteModal({
  docente,
  onClose,
  onUpdate,
  isLoading = false,
}: ViewEditDocenteModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: docente.nombre || '',
    apellido: docente.apellido || '',
    telefono: docente.telefono || '',
    titulo: docente.titulo || '',
    especialidades: docente.especialidades || [],
    disponibilidadHoraria: docente.disponibilidadHoraria || {},
    nivelEducativo: docente.nivelEducativo || [],
    estado: docente.estado || 'activo',
  });

  const [especialidadInput, setEspecialidadInput] = useState('');
  const [selectedDia, setSelectedDia] = useState('lunes');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const handleSave = async () => {
    try {
      await onUpdate(docente.id, form);
      setIsEditMode(false);
      toast.success('Docente actualizado correctamente');
    } catch (error) {
      console.error('Error updating docente:', error);
      toast.error('Error al actualizar docente');
    }
  };

  const toggleNivelEducativo = (nivel: string) => {
    setForm((prev) => ({
      ...prev,
      nivelEducativo: prev.nivelEducativo?.includes(nivel)
        ? prev.nivelEducativo.filter((n) => n !== nivel)
        : [...(prev.nivelEducativo || []), nivel],
    }));
  };

  const agregarEspecialidad = (esp: string) => {
    if (esp && !form.especialidades?.includes(esp)) {
      setForm({ ...form, especialidades: [...(form.especialidades || []), esp] });
      setEspecialidadInput('');
    }
  };

  const eliminarEspecialidad = (esp: string) => {
    setForm({
      ...form,
      especialidades: form.especialidades?.filter((e) => e !== esp) || [],
    });
  };

  const agregarHorario = () => {
    if (!horaInicio || !horaFin) return;
    const nuevoHorario = `${horaInicio}-${horaFin}`;
    const horarios = form.disponibilidadHoraria?.[selectedDia] || [];

    setForm({
      ...form,
      disponibilidadHoraria: {
        ...form.disponibilidadHoraria,
        [selectedDia]: [...horarios, nuevoHorario],
      },
    });

    setHoraInicio('');
    setHoraFin('');
  };

  const eliminarHorario = (dia: string, horario: string) => {
    const horarios = form.disponibilidadHoraria?.[dia] || [];
    const nuevosHorarios = horarios.filter((h) => h !== horario);

    if (nuevosHorarios.length === 0) {
      const updatedDisponibilidad = { ...(form.disponibilidadHoraria || {}) };
      delete updatedDisponibilidad[dia];
      setForm({ ...form, disponibilidadHoraria: updatedDisponibilidad });
    } else {
      setForm({
        ...form,
        disponibilidadHoraria: {
          ...form.disponibilidadHoraria,
          [dia]: nuevosHorarios,
        },
      });
    }
  };

  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--admin-accent)] to-[var(--admin-accent-hover)] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[var(--admin-accent)]/30">
          {docente.nombre?.charAt(0)?.toUpperCase() || 'D'}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[var(--admin-text)]">
            {docente.nombre} {docente.apellido}
          </h3>
          <p className="text-sm text-[var(--admin-text-muted)]">
            {docente.titulo || 'Docente de Matemática'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isEditMode && (
          <AdminButton variant="ghost" size="sm" onClick={() => setIsEditMode(true)}>
            <Edit2 className="w-5 h-5" />
          </AdminButton>
        )}
        <AdminButton variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </AdminButton>
      </div>
    </div>
  );

  const footerContent = isEditMode ? (
    <div className="flex gap-3 w-full">
      <AdminButton variant="secondary" onClick={() => setIsEditMode(false)} disabled={isLoading}>
        Cancelar
      </AdminButton>
      <AdminButton
        variant="primary"
        onClick={handleSave}
        loading={isLoading}
        icon={<Save className="w-4 h-4" />}
      >
        Guardar Cambios
      </AdminButton>
    </div>
  ) : (
    <AdminButton variant="primary" onClick={onClose} className="w-full">
      Cerrar
    </AdminButton>
  );

  return (
    <AdminModal
      open={true}
      onClose={onClose}
      title=""
      size="xl"
      showCloseButton={false}
      footer={footerContent}
    >
      {/* Custom Header */}
      <div className="-mt-6 -mx-6 mb-6 p-6 border-b border-white/[0.08]">{headerContent}</div>

      <div className="space-y-4">
        {/* Sección 1: Información Básica */}
        <AdminCard padding="md" animate={false}>
          <h4 className="text-base font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--admin-accent)]" />
            Información Básica
          </h4>

          {isEditMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <AdminInput
                  label="Nombre *"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
                <AdminInput
                  label="Apellido *"
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <AdminInput label="Email" value={docente.email} disabled />
                <AdminInput
                  label="Teléfono"
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <AdminSelect
                label="Estado"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                options={ESTADO_OPTIONS}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={docente.email} />
              <InfoItem
                icon={<Phone className="w-4 h-4" />}
                label="Teléfono"
                value={docente.telefono || 'No especificado'}
              />
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Registro"
                value={new Date(docente.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              />
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                <div className="text-xs text-[var(--admin-text-muted)] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Estado
                </div>
                <AdminBadge variant={getEstadoBadgeVariant(docente.estado || 'activo')} size="md">
                  {getEstadoLabel(docente.estado || 'activo')}
                </AdminBadge>
              </div>
            </div>
          )}
        </AdminCard>

        {/* Sección 2: Información Profesional */}
        <AdminCard padding="md" animate={false}>
          <h4 className="text-base font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            Información Profesional
          </h4>

          {isEditMode ? (
            <div className="space-y-4">
              <AdminInput
                label="Título Profesional"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej: Licenciado en Matemática"
              />

              {/* Niveles Educativos */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  Niveles Educativos
                </label>
                <div className="flex flex-wrap gap-2">
                  {NIVELES_EDUCATIVOS.map((nivel) => (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => toggleNivelEducativo(nivel)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        form.nivelEducativo?.includes(nivel)
                          ? 'bg-[var(--admin-accent)] text-white shadow-lg shadow-[var(--admin-accent)]/30'
                          : 'bg-white/[0.05] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] hover:bg-white/[0.08]'
                      }`}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                  Especialidades
                </label>
                <div className="flex gap-2 mb-2">
                  <AdminSelect
                    value={especialidadInput}
                    onChange={(e) => setEspecialidadInput(e.target.value)}
                    options={ESPECIALIDADES_MATE.map((esp) => ({ value: esp, label: esp }))}
                    placeholder="Seleccionar..."
                    className="flex-1"
                  />
                  <AdminButton
                    variant="primary"
                    size="sm"
                    onClick={() => agregarEspecialidad(especialidadInput)}
                    disabled={!especialidadInput}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Agregar
                  </AdminButton>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.especialidades?.map((esp) => (
                    <AdminBadge key={esp} variant="info" size="md">
                      {esp}
                      <button
                        type="button"
                        onClick={() => eliminarEspecialidad(esp)}
                        className="ml-1.5 hover:text-white/80"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </AdminBadge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoItem
                icon={<Award className="w-4 h-4" />}
                label="Título Profesional"
                value={docente.titulo || 'No especificado'}
              />

              {docente.sectores && docente.sectores.length > 0 && (
                <div>
                  <div className="text-xs text-[var(--admin-text-muted)] mb-2 flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> Sectores
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docente.sectores.map((sector) => (
                      <span
                        key={sector.nombre}
                        className="px-3 py-1.5 text-white rounded-xl text-sm font-medium flex items-center gap-2"
                        style={{ backgroundColor: sector.color }}
                      >
                        <span>{sector.icono}</span>
                        <span>{sector.nombre}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {docente.nivelEducativo && docente.nivelEducativo.length > 0 && (
                <div>
                  <div className="text-xs text-[var(--admin-text-muted)] mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3 h-3" /> Niveles Educativos
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docente.nivelEducativo.map((nivel) => (
                      <AdminBadge key={nivel} variant="info" size="md">
                        {nivel}
                      </AdminBadge>
                    ))}
                  </div>
                </div>
              )}

              {docente.especialidades && docente.especialidades.length > 0 && (
                <div>
                  <div className="text-xs text-[var(--admin-text-muted)] mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Especialidades
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docente.especialidades.map((esp) => (
                      <AdminBadge key={esp} variant="pending" size="md">
                        {esp}
                      </AdminBadge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </AdminCard>

        {/* Sección 3: Disponibilidad Horaria */}
        <AdminCard padding="md" animate={false}>
          <h4 className="text-base font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--status-success)]" />
            Disponibilidad Horaria
          </h4>

          {isEditMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <AdminSelect
                  label="Día"
                  value={selectedDia}
                  onChange={(e) => setSelectedDia(e.target.value)}
                  options={DIAS_SEMANA.map((dia) => ({
                    value: dia,
                    label: dia.charAt(0).toUpperCase() + dia.slice(1),
                  }))}
                />
                <AdminInput
                  label="Desde"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
                <AdminInput
                  label="Hasta"
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                />
                <div className="flex items-end">
                  <AdminButton
                    variant="primary"
                    size="md"
                    onClick={agregarHorario}
                    icon={<Clock className="w-4 h-4" />}
                    className="w-full"
                  >
                    Agregar
                  </AdminButton>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(form.disponibilidadHoraria || {}).map(([dia, horarios]) => (
                  <div
                    key={dia}
                    className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]"
                  >
                    <div className="font-medium text-[var(--admin-text)] text-sm mb-2">
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {horarios.map((horario) => (
                        <AdminBadge key={horario} variant="success" size="md">
                          <Clock className="w-3 h-3 mr-1" />
                          {horario}
                          <button
                            type="button"
                            onClick={() => eliminarHorario(dia, horario)}
                            className="ml-1.5 hover:text-white/80"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </AdminBadge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {docente.disponibilidadHoraria &&
              Object.keys(docente.disponibilidadHoraria).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(docente.disponibilidadHoraria).map(([dia, horarios]) => (
                    <div
                      key={dia}
                      className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]"
                    >
                      <div className="font-medium text-[var(--admin-text)] text-sm mb-2">
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {horarios.map((horario) => (
                          <AdminBadge key={horario} variant="success" size="md">
                            <Clock className="w-3 h-3 mr-1" />
                            {horario}
                          </AdminBadge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06] text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-sm text-[var(--admin-text-muted)]">
                    No hay disponibilidad horaria configurada
                  </div>
                </div>
              )}
            </div>
          )}
        </AdminCard>
      </div>
    </AdminModal>
  );
}

// Helper component for info display
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
      <div className="text-xs text-[var(--admin-text-muted)] mb-1 flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className="text-sm font-medium text-[var(--admin-text)] break-all">{value}</div>
    </div>
  );
}
