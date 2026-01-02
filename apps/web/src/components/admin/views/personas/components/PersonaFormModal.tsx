'use client';

import { useState } from 'react';
import { X, UserPlus, GraduationCap, Users } from 'lucide-react';
import type { UserRole } from '@/types/admin-dashboard.types';

/**
 * PersonaFormModal - Modal para crear nuevas personas
 *
 * Permite crear estudiantes o docentes según el rol seleccionado.
 * Conectado al backend: POST /admin/estudiantes, POST /docentes
 */

interface PersonaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonaFormData) => Promise<void>;
}

export interface PersonaFormData {
  role: 'estudiante' | 'docente';
  nombre: string;
  apellido: string;
  email?: string;
  // Estudiante fields
  edad?: number;
  nivelEscolar?: 'Primaria' | 'Secundaria' | 'Universidad';
  tutorNombre?: string;
  tutorApellido?: string;
  tutorEmail?: string;
  tutorTelefono?: string;
  // Docente fields
  titulo?: string;
  telefono?: string;
}

export function PersonaFormModal({ isOpen, onClose, onSubmit }: PersonaFormModalProps) {
  const [role, setRole] = useState<'estudiante' | 'docente'>('estudiante');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');

  // Estudiante fields
  const [edad, setEdad] = useState<number>(10);
  const [nivelEscolar, setNivelEscolar] = useState<'Primaria' | 'Secundaria' | 'Universidad'>(
    'Primaria',
  );
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorApellido, setTutorApellido] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorTelefono, setTutorTelefono] = useState('');

  // Docente fields
  const [titulo, setTitulo] = useState('');
  const [telefono, setTelefono] = useState('');

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setEmail('');
    setEdad(10);
    setNivelEscolar('Primaria');
    setTutorNombre('');
    setTutorApellido('');
    setTutorEmail('');
    setTutorTelefono('');
    setTitulo('');
    setTelefono('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data: PersonaFormData = {
        role,
        nombre,
        apellido,
      };

      if (role === 'estudiante') {
        data.edad = edad;
        data.nivelEscolar = nivelEscolar;
        if (tutorNombre) data.tutorNombre = tutorNombre;
        if (tutorApellido) data.tutorApellido = tutorApellido;
        if (tutorEmail) data.tutorEmail = tutorEmail;
        if (tutorTelefono) data.tutorTelefono = tutorTelefono;
      } else {
        data.email = email;
        if (titulo) data.titulo = titulo;
        if (telefono) data.telefono = telefono;
      }

      await onSubmit(data);
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear persona';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--admin-surface-1)] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--admin-border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-[var(--admin-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">Agregar Persona</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-2">
              Tipo de persona
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('estudiante')}
                className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${
                  role === 'estudiante'
                    ? 'bg-[var(--admin-accent-muted)] border-[var(--admin-accent)] text-[var(--admin-accent)]'
                    : 'border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-[var(--admin-border-accent)]'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                <span>Estudiante</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('docente')}
                className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${
                  role === 'docente'
                    ? 'bg-[var(--admin-accent-muted)] border-[var(--admin-accent)] text-[var(--admin-accent)]'
                    : 'border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-[var(--admin-border-accent)]'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Docente</span>
              </button>
            </div>
          </div>

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
          {role === 'estudiante' && (
            <>
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

              <div className="border-t border-[var(--admin-border)] pt-4">
                <h3 className="text-sm font-medium text-[var(--admin-text)] mb-3">
                  Datos del Tutor
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                      Nombre Tutor
                    </label>
                    <input
                      type="text"
                      value={tutorNombre}
                      onChange={(e) => setTutorNombre(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                      Apellido Tutor
                    </label>
                    <input
                      type="text"
                      value={tutorApellido}
                      onChange={(e) => setTutorApellido(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                      Email Tutor
                    </label>
                    <input
                      type="email"
                      value={tutorEmail}
                      onChange={(e) => setTutorEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">
                      Teléfono Tutor
                    </label>
                    <input
                      type="tel"
                      value={tutorTelefono}
                      onChange={(e) => setTutorTelefono(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Docente-specific fields */}
          {role === 'docente' && (
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
              {isSubmitting ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonaFormModal;
