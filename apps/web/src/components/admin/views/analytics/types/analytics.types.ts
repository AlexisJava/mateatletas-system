/**
 * Analytics Types - Tipos para la vista de analytics
 */

import type { LucideIcon } from 'lucide-react';

// =============================================================================
// TAB TYPES
// =============================================================================

export type AnalyticsTabId = 'casas' | 'biblioteca' | 'retencion';

export interface AnalyticsTab {
  id: AnalyticsTabId;
  label: string;
  icon: LucideIcon;
}

// =============================================================================
// STAT CARD
// =============================================================================

export interface AnalyticsStatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color: string;
}

// =============================================================================
// SECTION HEADER
// =============================================================================

export interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  iconColor: string;
}

// =============================================================================
// LIBRARY DATA
// =============================================================================

export interface LibraryMonthData {
  month: string;
  lecturas: number;
  completados: number;
  promedio: number;
}

export interface BookData {
  title: string;
  reads: number;
  rating: number;
}

// =============================================================================
// RETENTION STAT
// =============================================================================

export interface RetentionStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
}
