import type { LucideIcon } from 'lucide-react';
import type { MockProduct } from '@/lib/constants/admin-mock-data';

/**
 * Productos Types - Tipos para la vista de productos
 */

export interface ProductCardProps {
  product: MockProduct;
  onView: (product: MockProduct) => void;
  onEdit: (product: MockProduct) => void;
  onDelete: (product: MockProduct) => void;
}

export interface ProductDetailModalProps {
  product: MockProduct | null;
  onClose: () => void;
}

export interface ProductosStats {
  total: number;
  activos: number;
  totalInscritos: number;
  totalIngresos: number;
}

export type TierFilter = string;
export type StatusFilter = 'all' | 'active' | 'inactive';

export type TierIconMap = Record<string, LucideIcon>;
