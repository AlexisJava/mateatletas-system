'use client';

import { GraduationCap, UserCheck, Users, Shield } from 'lucide-react';
import { PersonaStatCard } from './PersonaStatCard';
import type { PersonasStats, RoleFilter } from '../types/personas.types';

/**
 * PersonasStatsGrid - Grid de estadísticas de personas
 */

interface PersonasStatsGridProps {
  stats: PersonasStats;
  roleFilter: RoleFilter;
  onRoleFilterChange: (role: RoleFilter) => void;
}

export function PersonasStatsGrid({
  stats,
  roleFilter,
  onRoleFilterChange,
}: PersonasStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <PersonaStatCard
        label="Estudiantes"
        value={stats.estudiantes}
        icon={GraduationCap}
        color="text-[var(--status-info)]"
        bgColor="bg-[var(--status-info-muted)]"
        onClick={() => onRoleFilterChange(roleFilter === 'estudiante' ? 'all' : 'estudiante')}
        isActive={roleFilter === 'estudiante'}
      />
      <PersonaStatCard
        label="Docentes"
        value={stats.docentes}
        icon={UserCheck}
        color="text-[var(--status-success)]"
        bgColor="bg-[var(--status-success-muted)]"
        onClick={() => onRoleFilterChange(roleFilter === 'docente' ? 'all' : 'docente')}
        isActive={roleFilter === 'docente'}
      />
      <PersonaStatCard
        label="Tutores"
        value={stats.tutores}
        icon={Users}
        color="text-[var(--status-warning)]"
        bgColor="bg-[var(--status-warning-muted)]"
        onClick={() => onRoleFilterChange(roleFilter === 'tutor' ? 'all' : 'tutor')}
        isActive={roleFilter === 'tutor'}
      />
      <PersonaStatCard
        label="Admins"
        value={stats.admins}
        icon={Shield}
        color="text-[var(--admin-accent)]"
        bgColor="bg-[var(--admin-accent-muted)]"
        onClick={() => onRoleFilterChange(roleFilter === 'admin' ? 'all' : 'admin')}
        isActive={roleFilter === 'admin'}
      />
    </div>
  );
}

export default PersonasStatsGrid;
