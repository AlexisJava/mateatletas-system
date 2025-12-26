import { Package, GraduationCap, FileText } from 'lucide-react';
import type { TipoIconMap } from '../types/productos.types';

/**
 * TIPO_ICON_MAP - Mapeo de iconos por tipo de producto
 *
 * Para productos de pago único:
 * - Curso: talleres, colonias, eventos
 * - RecursoDigital: material descargable
 */

export const TIPO_ICON_MAP: TipoIconMap = {
  Curso: GraduationCap,
  RecursoDigital: FileText,
};

export const DEFAULT_TIPO_ICON = Package;

/**
 * Colores por tipo de producto
 */
export const TIPO_COLORS: Record<string, string> = {
  Curso: '#10b981', // emerald-500
  RecursoDigital: '#8b5cf6', // violet-500
};

export const DEFAULT_TIPO_COLOR = '#6b7280'; // gray-500
