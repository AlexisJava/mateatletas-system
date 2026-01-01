'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  DollarSign,
  Tag,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/constants/admin-mock-data';
import type { ProductCardProps } from '../types/productos.types';
import {
  TIPO_ICON_MAP,
  DEFAULT_TIPO_ICON,
  TIPO_COLORS,
  DEFAULT_TIPO_COLOR,
} from '../constants/tier-icons';

/**
 * ProductCard - Card de producto de pago único
 */

export function ProductCard({ product, onView, onEdit, onDelete }: ProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tipoColor = TIPO_COLORS[product.tipo] || DEFAULT_TIPO_COLOR;
  const TipoIcon = TIPO_ICON_MAP[product.tipo] || DEFAULT_TIPO_ICON;

  // Labels amigables para los tipos
  const TIPO_LABELS: Record<string, string> = {
    Evento: 'Evento',
    Digital: 'Digital',
    Fisico: 'Físico',
    Curso: 'Curso',
    Servicio: 'Servicio',
    Bundle: 'Bundle',
    Certificacion: 'Certificación',
  };
  const tipoLabel = TIPO_LABELS[product.tipo] || product.tipo;

  return (
    <div
      onClick={() => onView(product)}
      className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${tipoColor}20` }}
        >
          <TipoIcon className="w-6 h-6" style={{ color: tipoColor }} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              product.activo
                ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
                : 'bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)]'
            }`}
          >
            {product.activo ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {product.activo ? 'Activo' : 'Inactivo'}
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-40 py-1 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg shadow-xl z-50"
                >
                  <button
                    onClick={() => {
                      onView(product);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </button>
                  <button
                    onClick={() => {
                      onEdit(product);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      onDelete(product);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-muted)] flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-[var(--admin-text)] mb-1 line-clamp-1">
            {product.nombre}
          </h3>
          <p className="text-sm text-[var(--admin-text-muted)] line-clamp-2">
            {product.descripcion}
          </p>
        </div>

        {/* Tipo Badge */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--admin-text-muted)]" />
          <span
            className="text-sm font-medium px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `${tipoColor}20`, color: tipoColor }}
          >
            {tipoLabel}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--admin-border)]">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--status-success)]" />
            <div>
              <p className="text-xs text-[var(--admin-text-muted)]">Precio</p>
              <p className="text-sm font-semibold text-[var(--admin-text)]">
                {formatCurrency(product.precio)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[var(--status-info)]" />
            <div>
              <p className="text-xs text-[var(--admin-text-muted)]">Ventas</p>
              <p className="text-sm font-semibold text-[var(--admin-text)]">
                {product.ventas ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
