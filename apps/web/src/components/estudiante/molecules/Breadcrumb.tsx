'use client';

import { Home, ChevronRight } from 'lucide-react';

/**
 * Breadcrumb - Navegación jerárquica con íconos
 *
 * Extraído del Top Bar de "13. Clase en Vivo" (portal_estudiante.pen):
 *
 * Estructura: Home icon → "Matemáticas" → "Clase en Vivo"
 * - gap: 6 entre todos los elementos
 * - Home icon: lucide "house", 12x12, fill #6B7280
 * - Separador: lucide "chevron-right", 10x10, fill #4B5563
 * - Segmento intermedio: Inter 10px weight 500, fill #6B7280
 * - Segmento actual (último): Inter 10px weight 600, fill #9CA3AF
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps): React.JSX.Element {
  return (
    <nav className={`flex items-center gap-1.5 ${className}`} aria-label="Breadcrumb">
      {/* Home icon - 12x12, #6B7280 */}
      <Home size={12} style={{ color: '#6B7280' }} />

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.label} className="flex items-center gap-1.5">
            {/* Separator - chevron-right 10x10, #4B5563 */}
            <ChevronRight size={10} style={{ color: '#4B5563' }} />

            {/* Segment text */}
            <span
              className="font-[Inter]"
              style={{
                fontSize: 10,
                fontWeight: isLast ? 600 : 500,
                color: isLast ? '#9CA3AF' : '#6B7280',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
