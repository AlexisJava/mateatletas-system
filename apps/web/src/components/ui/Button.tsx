import React from 'react';

/**
 * Props del componente Button
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}

/**
 * Button Component - Estilo Crash Bandicoot
 *
 * Características:
 * - Diseño chunky y vibrante
 * - Múltiples variantes de color
 * - Efectos de hover animados
 * - Estado de carga
 * - Totalmente accesible
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me!
 * </Button>
 * ```
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  // Estilos base: fuente bold, bordes redondeados, sombra, transiciones
  const baseStyles =
    'font-bold rounded-lg shadow-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  // Variantes de color con efecto hover
  const variants = {
    primary:
      'bg-[#ff6b35] hover:bg-[#ff5722] text-white hover:scale-105 hover:shadow-xl',
    secondary:
      'bg-[#f7b801] hover:bg-[#ffc107] text-[#2a1a5e] hover:scale-105 hover:shadow-xl',
    outline:
      'border-2 border-[#ff6b35] text-[#ff6b35] bg-transparent hover:bg-[#ff6b35] hover:text-white hover:scale-105',
    ghost:
      'text-[#ff6b35] bg-transparent hover:bg-[#ff6b35]/10 shadow-none hover:shadow-lg',
  };

  // Tamaños (padding y font-size)
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
