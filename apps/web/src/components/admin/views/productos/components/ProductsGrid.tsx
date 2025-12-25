'use client';

import { Package } from 'lucide-react';
import type { MockProduct } from '@/lib/constants/admin-mock-data';
import { ProductCard } from './ProductCard';

/**
 * ProductsGrid - Grid de productos
 */

interface ProductsGridProps {
  products: MockProduct[];
  onView: (product: MockProduct) => void;
  onEdit: (product: MockProduct) => void;
  onDelete: (product: MockProduct) => void;
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
