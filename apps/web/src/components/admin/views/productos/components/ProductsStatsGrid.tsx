'use client';

import { Package, CheckCircle, GraduationCap, FileText } from 'lucide-react';
import type { ProductosStats } from '../types/productos.types';

/**
 * ProductsStatsGrid - Grid de estadísticas de productos de pago único
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
            <p className="text-sm text-[var(--admin-text-muted)]">Total Productos</p>
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
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.cursos}</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Cursos</p>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--admin-text)]">{stats.recursos}</p>
            <p className="text-sm text-[var(--admin-text-muted)]">Recursos Digitales</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsStatsGrid;
