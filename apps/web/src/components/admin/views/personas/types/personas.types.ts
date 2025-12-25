import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types/admin-dashboard.types';
import type { MockPerson } from '@/lib/constants/admin-mock-data';

/**
 * Personas Types - Tipos para la vista de personas
 */

export interface RoleConfigItem {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export type RoleConfigMap = Record<UserRole, RoleConfigItem>;

export interface PersonaStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface PersonRowProps {
  person: MockPerson;
  onView: (person: MockPerson) => void;
  onEdit: (person: MockPerson) => void;
  onDelete: (person: MockPerson) => void;
}

export interface PersonDetailModalProps {
  person: MockPerson | null;
  onClose: () => void;
}

export interface PersonasStats {
  total: number;
  estudiantes: number;
  docentes: number;
  tutores: number;
  admins: number;
}

export type StatusFilter = 'all' | 'active' | 'inactive';
export type RoleFilter = UserRole | 'all';
