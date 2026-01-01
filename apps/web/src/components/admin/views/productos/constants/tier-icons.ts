import {
  Package,
  GraduationCap,
  FileText,
  Calendar,
  ShoppingBag,
  Users,
  Layers,
  Award,
} from 'lucide-react';
import type { TipoIconMap } from '../types/productos.types';

/**
 * TIPO_ICON_MAP - Mapeo de iconos por tipo de producto
 *
 * - Evento: Colonia, talleres, workshops (con fecha y cupo)
 * - Digital: PDFs, guías, videos descargables
 * - Fisico: Remeras, libros, merch (con stock)
 * - Curso: Cursos online con duración
 * - Servicio: Clase particular, mentoría 1:1
 * - Bundle: Combo de productos
 * - Certificacion: Examen + certificado
 */

export const TIPO_ICON_MAP: TipoIconMap = {
  Evento: Calendar,
  Digital: FileText,
  Fisico: ShoppingBag,
  Curso: GraduationCap,
  Servicio: Users,
  Bundle: Layers,
  Certificacion: Award,
};

export const DEFAULT_TIPO_ICON = Package;

/**
 * Colores por tipo de producto
 */
export const TIPO_COLORS: Record<string, string> = {
  Evento: '#f59e0b', // amber-500 (colonias, talleres)
  Digital: '#8b5cf6', // violet-500 (PDFs, guías)
  Fisico: '#ec4899', // pink-500 (merch)
  Curso: '#10b981', // emerald-500 (cursos online)
  Servicio: '#3b82f6', // blue-500 (mentorías)
  Bundle: '#6366f1', // indigo-500 (combos)
  Certificacion: '#eab308', // yellow-500 (certificados)
};

export const DEFAULT_TIPO_COLOR = '#6b7280'; // gray-500
