'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Edit, Trash2, Home, CreditCard } from 'lucide-react';
import { formatDate } from '@/lib/constants/admin-mock-data';
import type { PersonRowProps } from '../types/personas.types';
import { ROLE_CONFIG } from '../constants/role-config';

/**
 * PersonRow - Fila de persona en tabla
 */

// Formatear nombre del plan para display
function formatPlanName(planNombre?: string): string {
  if (!planNombre) return 'Sin plan';
  // STEAM_SINCRONICO -> Sincrónico
  return (
    planNombre.replace('STEAM_', '').charAt(0) +
    planNombre.replace('STEAM_', '').slice(1).toLowerCase()
  );
}

export function PersonRow({ person, onView, onEdit, onDelete }: PersonRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const roleConfig = ROLE_CONFIG[person.role];
  const Icon = roleConfig.icon;

  // Calcular posición del menú cuando se abre
  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 160, // 160px es el ancho del menú (w-40)
      });
    }
  }, [menuOpen]);

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
        {person.role === 'estudiante' && (
          <div className="flex flex-col gap-1">
            {person.casa && (
              <div className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
                <span className="text-sm text-[var(--admin-text)]">{person.casa}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  person.planNombre === 'STEAM_SINCRONICO'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : person.planNombre
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {formatPlanName(person.planNombre)}
              </span>
            </div>
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
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-1)] transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
          </button>
          {menuOpen &&
            createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setMenuOpen(false)} />
                <div
                  className="fixed w-40 py-1 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg shadow-xl z-[9999]"
                  style={{ top: menuPosition.top, left: menuPosition.left }}
                >
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
              </>,
              document.body,
            )}
        </div>
      </td>
    </tr>
  );
}

export default PersonRow;
