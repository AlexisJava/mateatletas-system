import type { LucideIcon } from 'lucide-react';
import type { UserRole, AdminPerson } from '@/types/admin-dashboard.types';

/**
 * Personas Types - Tipos para la vista de personas
 *
 * Usa AdminPerson del sistema de tipos unificado
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
  person: AdminPerson;
  onView: (person: AdminPerson) => void;
  onEdit: (person: AdminPerson) => void;
  onDelete: (person: AdminPerson) => void;
}

export interface PersonDetailModalProps {
  person: AdminPerson | null;
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
