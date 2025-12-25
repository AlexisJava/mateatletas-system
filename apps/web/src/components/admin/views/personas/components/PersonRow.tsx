'use client';

import { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2, Home } from 'lucide-react';
import { formatDate } from '@/lib/constants/admin-mock-data';
import type { PersonRowProps } from '../types/personas.types';
import { ROLE_CONFIG } from '../constants/role-config';

/**
 * PersonRow - Fila de persona en tabla
 */

export function PersonRow({ person, onView, onEdit, onDelete }: PersonRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const roleConfig = ROLE_CONFIG[person.role];
  const Icon = roleConfig.icon;

  return (
    <tr className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-surface-2)] transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg ${roleConfig.bgColor} flex items-center justify-center`}
          >
            <span className="text-sm font-bold text-[var(--admin-text)]">
              {person.nombre.charAt(0)}
              {person.apellido.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-[var(--admin-text)]">
              {person.nombre} {person.apellido}
            </p>
            <p className="text-xs text-[var(--admin-text-muted)]">{person.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}
        >
          <Icon className="w-3 h-3" />
          {roleConfig.label}
        </span>
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            person.status === 'active'
              ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
              : 'bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${person.status === 'active' ? 'bg-[var(--status-success)]' : 'bg-[var(--admin-text-disabled)]'}`}
          />
          {person.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        {person.role === 'estudiante' && person.casa && (
          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
            <span className="text-sm text-[var(--admin-text)]">{person.casa}</span>
          </div>
        )}
        {person.role === 'docente' && person.clasesAsignadas !== undefined && (
          <span className="text-sm text-[var(--admin-text)]">{person.clasesAsignadas} clases</span>
        )}
        {person.role === 'tutor' && person.estudiantesACargo !== undefined && (
          <span className="text-sm text-[var(--admin-text)]">
            {person.estudiantesACargo} estudiantes
          </span>
        )}
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className="text-sm text-[var(--admin-text-muted)]">
          {formatDate(person.createdAt)}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-1)] transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 py-1 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    onView(person);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalle
                </button>
                <button
                  onClick={() => {
                    onEdit(person);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete(person);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-muted)] flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default PersonRow;
