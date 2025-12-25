'use client';

import { X, Users, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, getTierColor } from '@/lib/constants/admin-mock-data';
import type { ProductDetailModalProps } from '../types/productos.types';
import { TIER_ICON_MAP, DEFAULT_TIER_ICON } from '../constants/tier-icons';

/**
 * ProductDetailModal - Modal de detalle de producto
 */

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  if (!product) return null;

  const tierColor = getTierColor(product.tier);
  const TierIcon = TIER_ICON_MAP[product.tier] || DEFAULT_TIER_ICON;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Detalle del Producto</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${tierColor}20` }}
            >
              <TierIcon className="w-8 h-8" style={{ color: tierColor }} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-[var(--admin-text)]">{product.nombre}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="text-sm font-medium px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
                >
                  {product.tier}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                    product.activo
                      ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
                      : 'bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)]'
                  }`}
                >
                  {product.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
            <p className="text-sm text-[var(--admin-text)]">{product.descripcion}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
              <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Precio</span>
              </div>
              <p className="text-xl font-bold text-[var(--status-success)]">
                {formatCurrency(product.precio)}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)]">por mes</p>
            </div>
            <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
              <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Inscritos</span>
              </div>
              <p className="text-xl font-bold text-[var(--status-info)]">{product.inscritos}</p>
              <p className="text-xs text-[var(--admin-text-muted)]">estudiantes</p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center justify-between p-3 bg-[var(--admin-surface-2)] rounded-lg">
            <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Fecha de creacion</span>
            </div>
            <span className="text-sm font-medium text-[var(--admin-text)]">
              {formatDate(product.createdAt)}
            </span>
          </div>

          {/* Revenue Estimate */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--status-success-muted)] to-[var(--admin-accent-muted)] border border-[var(--status-success)]/20">
            <p className="text-xs text-[var(--admin-text-muted)] mb-1">
              Ingresos estimados mensuales
            </p>
            <p className="text-2xl font-bold text-[var(--status-success)]">
              {formatCurrency(product.precio * product.inscritos)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[var(--admin-border)]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Cerrar
          </button>
          <button className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
