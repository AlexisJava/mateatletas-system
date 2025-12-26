'use client';

import { Package } from 'lucide-react';
import type { AdminProducto } from '../types/productos.types';
import { ProductCard } from './ProductCard';

/**
 * ProductsGrid - Grid de productos de pago único
 */

interface ProductsGridProps {
  products: AdminProducto[];
  onView: (product: AdminProducto) => void;
  onEdit: (product: AdminProducto) => void;
  onDelete: (product: AdminProducto) => void;
}

export function ProductsGrid({ products, onView, onEdit, onDelete }: ProductsGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center">
          <Package className="w-12 h-12 text-[var(--admin-text-disabled)] mx-auto mb-3" />
          <p className="text-[var(--admin-text-muted)]">No se encontraron productos</p>
        </div>
      )}
    </>
  );
}

export default ProductsGrid;
