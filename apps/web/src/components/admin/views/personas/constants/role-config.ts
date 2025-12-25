import { Users, GraduationCap, UserCheck, Shield } from 'lucide-react';
import type { RoleConfigMap } from '../types/personas.types';

/**
 * ROLE_CONFIG - Configuración de roles de usuario
 */

export const ROLE_CONFIG: RoleConfigMap = {
  estudiante: {
    label: 'Estudiante',
    icon: GraduationCap,
    color: 'text-[var(--status-info)]',
    bgColor: 'bg-[var(--status-info-muted)]',
  },
  docente: {
    label: 'Docente',
    icon: UserCheck,
    color: 'text-[var(--status-success)]',
    bgColor: 'bg-[var(--status-success-muted)]',
  },
  tutor: {
    label: 'Tutor',
    icon: Users,
    color: 'text-[var(--status-warning)]',
    bgColor: 'bg-[var(--status-warning-muted)]',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-[var(--admin-accent)]',
    bgColor: 'bg-[var(--admin-accent-muted)]',
  },
};
