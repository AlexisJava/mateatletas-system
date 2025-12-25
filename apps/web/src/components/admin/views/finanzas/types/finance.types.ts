/**
 * Finance Types - Tipos para la vista de finanzas
 */

import type { LucideIcon } from 'lucide-react';

// =============================================================================
// STAT CARD
// =============================================================================

export interface FinanceStatCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  gradient: string;
  bgGradient: string;
}

// =============================================================================
// CONFIG
// =============================================================================

export interface TierConfig {
  precioSteamLibros: number;
  precioSteamAsincronico: number;
  precioSteamSincronico: number;
  descuentoSegundoHermano: number;
  diaVencimiento: number;
  diasAntesRecordatorio: number;
  notificacionesActivas: boolean;
}

export interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TierConfig;
  onSave: (config: TierConfig) => void;
}

// =============================================================================
// TRANSACTIONS
// =============================================================================

export interface Transaction {
  id: string;
  studentName: string;
  tier: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
}

// =============================================================================
// CHARTS
// =============================================================================

export interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}
