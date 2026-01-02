'use client';

import { Users } from 'lucide-react';
import type { AdminPerson } from '@/types/admin-dashboard.types';
import { PersonRow } from './PersonRow';

/**
 * PersonasTable - Tabla de personas
 */

interface PersonasTableProps {
  people: AdminPerson[];
  onView: (person: AdminPerson) => void;
  onEdit: (person: AdminPerson) => void;
  onDelete: (person: AdminPerson) => void;
}

export function PersonasTable({ people, onView, onEdit, onDelete }: PersonasTableProps) {
  return (
    <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Persona
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Rol
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider hidden md:table-cell">
                Info
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                Registro
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <PersonRow
                key={`${person.id}-${person.role}`}
                person={person}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
      {people.length === 0 && (
        <div className="py-12 text-center">
          <Users className="w-12 h-12 text-[var(--admin-text-disabled)] mx-auto mb-3" />
          <p className="text-[var(--admin-text-muted)]">No se encontraron personas</p>
        </div>
      )}
    </div>
  );
}

export default PersonasTable;
