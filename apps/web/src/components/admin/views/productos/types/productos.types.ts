import type { LucideIcon } from 'lucide-react';
import type { Producto } from '@/types/catalogo.types';

/**
 * Productos Types - Tipos para la vista de productos (admin)
 *
 * ProductosView muestra todos los tipos de productos:
 * - Evento: Colonia, talleres, workshops (con fecha y cupo)
 * - Digital: PDFs, guías, videos descargables
 * - Fisico: Remeras, libros, merch (con stock)
 * - Curso: Cursos online con duración
 * - Servicio: Clase particular, mentoría 1:1
 * - Bundle: Combo de productos
 * - Certificacion: Examen + certificado
 */

/** Producto adaptado para la vista admin */
export interface AdminProducto extends Producto {
  /** Número de ventas/inscripciones (calculado del backend o mock) */
  ventas?: number;
  /** Subcategoría del producto */
  subcategoria?: string | null;
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
  onEdit?: (product: AdminProducto) => void;
  onDelete?: (product: AdminProducto) => void;
}

export interface ProductosStats {
  total: number;
  activos: number;
  eventos: number;
  cursos: number;
  digitales: number;
  fisicos: number;
  servicios: number;
}

export type TipoFilter =
  | 'all'
  | 'Evento'
  | 'Digital'
  | 'Fisico'
  | 'Curso'
  | 'Servicio'
  | 'Bundle'
  | 'Certificacion';
export type StatusFilter = 'all' | 'active' | 'inactive';

export type TipoIconMap = Record<string, LucideIcon>;

// Re-export para compatibilidad
export type TierFilter = TipoFilter;
