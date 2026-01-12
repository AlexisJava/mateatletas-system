'use client';

interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Texto opcional debajo del spinner */
  text?: string;
  /** Clase CSS adicional */
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-2',
  lg: 'w-16 h-16 border-4',
};

/**
 * LoadingSpinner - Spinner de carga genérico
 *
 * Usa CSS variables para adaptarse automáticamente al portal:
 * - Admin: --admin-accent
 * - Docente: --docente-accent
 * - Estudiante: --house-primary
 */
export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin`}
        style={{
          borderColor: 'var(--docente-accent, var(--admin-accent, var(--house-primary, #3b82f6)))',
        }}
      />
      {text && <p className="text-sm text-gray-500 mt-3">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
