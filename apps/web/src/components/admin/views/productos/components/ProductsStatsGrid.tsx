'use client';

import { Package, CheckCircle, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/constants/admin-mock-data';
import type { ProductosStats } from '../types/productos.types';

/**
 * ProductsStatsGrid - Grid de estadísticas de productos
 */

interface ProductsStatsGridProps {
  stats: ProductosStats;
}

export function ProductsStatsGrid({ stats }: ProductsStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-muted)] flex items-center justify-center">
            <Package className="w-5 h-5 text-[var(--admin-accent)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.total}</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Productos</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--status-success-muted)] flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.activos}</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Activos</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--status-info-muted)] flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--status-info)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.totalInscritos}</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Inscritos</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--status-success-muted)] flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[var(--status-success)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--admin-text)]">
              {formatCurrency(stats.totalIngresos)}
            </p>
            <p className="text-sm text-[var(--admin-text-muted)]">Ingresos/mes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsStatsGrid;
