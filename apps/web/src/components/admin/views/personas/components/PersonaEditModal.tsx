'use client';

import { useState, useEffect } from 'react';
import { X, Edit2, GraduationCap, Users, UserCog, Shield } from 'lucide-react';
import type { AdminPerson, UserRole } from '@/types/admin-dashboard.types';

/**
 * PersonaEditModal - Modal para editar personas existentes
 *
 * Permite editar estudiantes o docentes según el rol existente.
 * Conectado al backend: PATCH /estudiantes/:id, PATCH /docentes/:id
 *
 * Nota: Tutores y admins solo pueden editar roles, no otros campos.
 */

interface PersonaEditModalProps {
  person: AdminPerson | null;
  onClose: () => void;
  onSubmit: (personId: string, data: PersonaEditData) => Promise<void>;
}

export interface PersonaEditData {
  nombre?: string;
  apellido?: string;
  email?: string;
  edad?: number;
  nivelEscolar?: 'Primaria' | 'Secundaria' | 'Universidad';
  titulo?: string;
  telefono?: string;
}

const RoleIcon: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  estudiante: GraduationCap,
  docente: Users,
  tutor: UserCog,
  admin: Shield,
};

const RoleLabel: Record<UserRole, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  tutor: 'Tutor',
  admin: 'Administrador',
};

export function PersonaEditModal({ person, onClose, onSubmit }: PersonaEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [edad, setEdad] = useState<number>(10);
  const [nivelEscolar, setNivelEscolar] = useState<'Primaria' | 'Secundaria' | 'Universidad'>(
    'Primaria',
  );
  const [titulo, setTitulo] = useState('');
  const [telefono, setTelefono] = useState('');

  // Initialize form when person changes
  useEffect(() => {
    if (person) {
      setNombre(person.nombre);
      setApellido(person.apellido);
      setEmail(person.email || '');
      setEdad(person.edad ?? 10);
      setNivelEscolar(
        (person.nivelEscolar as 'Primaria' | 'Secundaria' | 'Universidad') ?? 'Primaria',
      );
      setTitulo(person.titulo ?? '');
      setTelefono(person.telefono ?? '');
      setError(null);
    }
  }, [person]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const data: PersonaEditData = {
        nombre,
        apellido,
      };

      if (person.role === 'estudiante') {
        data.edad = edad;
        data.nivelEscolar = nivelEscolar;
      } else if (person.role === 'docente') {
        data.email = email;
        if (titulo) data.titulo = titulo;
        if (telefono) data.telefono = telefono;
      }

      await onSubmit(person.id, data);
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar persona';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!person) return null;

  const Icon = RoleIcon[person.role];
  const isEditable = person.role === 'estudiante' || person.role === 'docente';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--admin-surface-1)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--admin-border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <Edit2 className="w-5 h-5 text-[var(--admin-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">Editar Persona</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--admin-accent-muted)] text-[var(--admin-accent)] text-sm">
            <Icon className="w-4 h-4" />
            <span>{RoleLabel[person.role]}</span>
          </div>
        </div>

        {!isEditable ? (
          // For tutors and admins, show read-only info
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              Los datos de tutores y administradores solo pueden modificarse desde la gestión de
              usuarios.
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[var(--admin-text-muted)]">
                  Nombre completo
                </label>
                <p className="text-[var(--admin-text)]">
                  {person.nombre} {person.apellido}
                </p>
              </div>
              <div>
                <label className="block text-sm text-[var(--admin-text-muted)]">Email</label>
                <p className="text-[var(--admin-text)]">{person.email || '-'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-[var(--admin-surface-2)] text-[var(--admin-text)] hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          // Editable form for estudiantes and docentes
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                />
              </div>
            </div>

            {/* Estudiante-specific fields */}
            {person.role === 'estudiante' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={edad}
                    onChange={(e) => setEdad(parseInt(e.target.value))}
                    min={3}
                    max={99}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                    Nivel Escolar *
                  </label>
                  <select
                    value={nivelEscolar}
                    onChange={(e) =>
                      setNivelEscolar(e.target.value as 'Primaria' | 'Secundaria' | 'Universidad')
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                  >
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Universidad">Universidad</option>
                  </select>
                </div>
              </div>
            )}

            {/* Docente-specific fields */}
            {person.role === 'docente' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Lic. en Matemáticas"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-2)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-[var(--admin-accent)] text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PersonaEditModal;
