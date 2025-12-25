'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  X,
  Gamepad2,
  Sparkles,
  Crown,
} from 'lucide-react';
import {
  MOCK_PRODUCTS,
  formatCurrency,
  formatDate,
  getTierColor,
  type MockProduct,
} from '@/lib/constants/admin-mock-data';

/**
 * ProductosView - Vista de gestion de productos
 *
 * Gestiona productos: Colonia, Cursos, Talleres.
 * Muestra tier, precio, inscripciones.
 */

// =============================================================================
// TIER ICON MAP
// =============================================================================

const TIER_ICON_MAP: Record<string, typeof Package> = {
  'STEAM Libros': Gamepad2,
  'STEAM Asincronico': Sparkles,
  'STEAM Asincrónico': Sparkles,
  'STEAM Sincronico': Crown,
  'STEAM Sincrónico': Crown,
};

// =============================================================================
// PRODUCT CARD COMPONENT
// =============================================================================

interface ProductCardProps {
  product: MockProduct;
  onView: (product: MockProduct) => void;
  onEdit: (product: MockProduct) => void;
  onDelete: (product: MockProduct) => void;
}

function ProductCard({ product, onView, onEdit, onDelete }: ProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tierColor = getTierColor(product.tier);
  const TierIcon = TIER_ICON_MAP[product.tier] || Package;

  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${tierColor}20` }}
        >
          <TierIcon className="w-6 h-6" style={{ color: tierColor }} />
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
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-[var(--admin-text-muted)]" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 py-1 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-lg shadow-xl z-50">
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

        {/* Tier Badge */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--admin-text-muted)]" />
          <span
            className="text-sm font-medium px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
          >
            {product.tier}
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
            <Users className="w-4 h-4 text-[var(--status-info)]" />
            <div>
              <p className="text-xs text-[var(--admin-text-muted)]">Inscritos</p>
              <p className="text-sm font-semibold text-[var(--admin-text)]">{product.inscritos}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PRODUCT DETAIL MODAL
// =============================================================================

interface ProductDetailModalProps {
  product: MockProduct | null;
  onClose: () => void;
}

function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  if (!product) return null;

  const tierColor = getTierColor(product.tier);
  const TierIcon = TIER_ICON_MAP[product.tier] || Package;

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

// =============================================================================
// MAIN PRODUCTOS VIEW
// =============================================================================

export function ProductosView() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = tierFilter === 'all' || product.tier === tierFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.activo) ||
        (statusFilter === 'inactive' && !product.activo);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [searchQuery, tierFilter, statusFilter]);

  const stats = useMemo(() => {
    const activeProducts = MOCK_PRODUCTS.filter((p) => p.activo);
    const totalInscritos = activeProducts.reduce((acc, p) => acc + p.inscritos, 0);
    const totalIngresos = activeProducts.reduce((acc, p) => acc + p.precio * p.inscritos, 0);

    return {
      total: MOCK_PRODUCTS.length,
      activos: activeProducts.length,
      totalInscritos,
      totalIngresos,
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:border-[var(--admin-accent)]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
          >
            <option value="all">Todos los tiers</option>
            <option value="STEAM Libros">STEAM Libros</option>
            <option value="STEAM Asincronico">STEAM Asincronico</option>
            <option value="STEAM Sincronico">STEAM Sincronico</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2.5 bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={setSelectedProduct}
            onEdit={(p) => console.log('Edit', p)}
            onDelete={(p) => console.log('Delete', p)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center">
          <Package className="w-12 h-12 text-[var(--admin-text-disabled)] mx-auto mb-3" />
          <p className="text-[var(--admin-text-muted)]">No se encontraron productos</p>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-[var(--admin-text-muted)]">
        Mostrando {filteredProducts.length} de {MOCK_PRODUCTS.length} productos
      </div>

      {/* Detail Modal */}
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

export default ProductosView;
