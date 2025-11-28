import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Props del componente Card
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  className?: string;
  hoverable?: boolean;
}

/**
 * Card Component - Estilo Crash Bandicoot
 *
 * Características:
 * - Fondo beige claro o blanco
 * - Sombra suave
 * - Bordes redondeados generosos
 * - Padding amplio
 * - Efecto lift en hover (opcional)
 * - Título con fuente bold
 *
 * @example
 * ```tsx
 * <Card title="Mi Tarjeta" hoverable>
 *   <p>Contenido de la tarjeta</p>
 * </Card>
 * ```
 */
export function Card({ children, title, className = '', hoverable = false, ...rest }: CardProps) {
  // Estilos base: fondo, bordes, sombra, padding
  const baseStyles = 'bg-[#fff9e6] rounded-xl shadow-md p-6 transition-all duration-200';

  // Efecto hover si es hoverable
  const hoverStyles = hoverable ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

  const composedClasses = `${baseStyles} ${hoverStyles} ${className}`.trim();

  return (
    <div className={composedClasses} {...rest}>
      {/* Título opcional */}
      {title && (
        <h3 className="text-2xl font-bold text-[#2a1a5e] mb-4 border-b-2 border-[#ff6b35] pb-2">
          {title}
        </h3>
      )}

      {/* Contenido */}
      <div className="text-[#2a1a5e]">{children}</div>
    </div>
  );
}
