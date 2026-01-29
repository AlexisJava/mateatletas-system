'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * ErrorState - Componente de estado de error para el Portal Estudiante
 *
 * Muestra un mensaje de error con opciones de retry y navegación
 */

interface ErrorStateProps {
  /** Título del error */
  title?: string;
  /** Mensaje descriptivo */
  message?: string;
  /** Función de retry */
  onRetry?: () => void;
  /** Mostrar botón de volver al inicio */
  showHomeButton?: boolean;
  /** Variante de tamaño */
  variant?: 'full' | 'inline';
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'No pudimos cargar los datos. Por favor, intentá de nuevo.',
  onRetry,
  showHomeButton = true,
  variant = 'full',
}: ErrorStateProps): React.JSX.Element {
  const isInline = variant === 'inline';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${isInline ? 'py-8' : 'h-full min-h-[400px]'}`}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: isInline ? 60 : 80,
          height: isInline ? 60 : 80,
          backgroundColor: 'rgba(239,68,68,0.15)',
        }}
      >
        <AlertTriangle size={isInline ? 28 : 40} color="#EF4444" />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-2 text-center max-w-md">
        <h3
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: isInline ? 18 : 24,
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: isInline ? 13 : 14,
            fontWeight: 500,
            color: '#9CA3AF',
          }}
        >
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-transform hover:scale-105"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Reintentar
            </span>
          </button>
        )}

        {showHomeButton && (
          <Link
            href="/estudiante/portal"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-transform hover:scale-105"
            style={{ backgroundColor: '#374151' }}
          >
            <Home size={16} color="#FFFFFF" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Ir al inicio
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
