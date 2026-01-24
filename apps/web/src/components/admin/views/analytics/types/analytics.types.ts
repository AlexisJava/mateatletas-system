/**
 * Analytics Types - Tipos para la vista de analytics completa
 */

import type { LucideIcon } from 'lucide-react';

// =============================================================================
// TAB TYPES
// =============================================================================

export type AnalyticsTabId = 'overview' | 'casas' | 'retencion' | 'suscripciones';

export interface AnalyticsTab {
  id: AnalyticsTabId;
  label: string;
  icon: LucideIcon;
  color: string;
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
// RETENTION STAT
// =============================================================================

export interface RetentionStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
}
