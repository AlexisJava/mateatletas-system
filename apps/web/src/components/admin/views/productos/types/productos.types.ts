import type { LucideIcon } from 'lucide-react';
import type { Producto } from '@/types/catalogo.types';

/**
 * Productos Types - Tipos para la vista de productos (admin)
 *
 * ProductosView muestra productos de pago único:
 * - Cursos (talleres, colonias, eventos)
 * - RecursoDigital (material descargable)
 *
 * Las Suscripciones STEAM se gestionan en FinanceView.
 */

/** Producto adaptado para la vista admin */
export interface AdminProducto extends Producto {
  /** Número de ventas/inscripciones (calculado del backend o mock) */
  ventas?: number;
}

export interface ProductCardProps {
  product: AdminProducto;
  onView: (product: AdminProducto) => void;
  onEdit: (product: AdminProducto) => void;
  onDelete: (product: AdminProducto) => void;
}

export interface ProductDetailModalProps {
  product: AdminProducto | null;
  onClose: () => void;
}

export interface ProductosStats {
  total: number;
  activos: number;
  cursos: number;
  recursos: number;
}

export type TipoFilter = 'all' | 'Curso' | 'RecursoDigital';
export type StatusFilter = 'all' | 'active' | 'inactive';

export type TipoIconMap = Record<string, LucideIcon>;

// Re-export para compatibilidad
export type TierFilter = TipoFilter;
