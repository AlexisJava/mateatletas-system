/**
 * Dashboard Types - Tipos para el dashboard admin
 */

import type { LucideIcon } from 'lucide-react';
import type { TaskItemData } from '../hooks/useTareas';

// =============================================================================
// STAT CARD
// =============================================================================

export type StatStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number | null;
  changeLabel?: string;
  icon: LucideIcon;
  status?: StatStatus;
}

// =============================================================================
// QUICK ACTION
// =============================================================================

export interface QuickActionProps {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

// =============================================================================
// ALERT ITEM
// =============================================================================

export type AlertType = 'warning' | 'info' | 'success';

export interface AlertItemProps {
  type: AlertType;
  title: string;
  description: string;
  action?: string;
  href?: string;
}

// =============================================================================
// TASK ITEM
// =============================================================================

export interface TaskItemProps {
  task: TaskItemData;
  onToggle: (id: string) => void;
}

// =============================================================================
// NOTES MODAL
// =============================================================================

export interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onSave: (notes: string) => void;
}
