import React, { useId } from 'react';

/**
 * Props del componente Input
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

/**
 * Input Component - Estilo Crash Bandicoot
 *
 * Características:
 * - Label opcional arriba del input
 * - Borde que cambia a cyan en focus
 * - Mensaje de error con icono
 * - Padding generoso
 * - Bordes redondeados
 * - Totalmente accesible
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="tu@email.com"
 *   error="Email inválido"
 *   required
 * />
 * ```
 */
export function Input({
  label,
  error,
  className = '',
  id,
  required = false,
  disabled = false,
  ...props
}: InputProps) {
  // Generar ID único usando useId de React (SSR-safe)
  const generatedId = useId();
  const inputId = id || generatedId;

  // Estilos base del input
  const baseStyles =
    'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium bg-white';

  // Estilos condicionales según estado
  const stateStyles = error
    ? 'border-[#f44336] focus:border-[#f44336] focus:ring-2 focus:ring-[#f44336]/20'
    : 'border-gray-300 focus:border-[#00d9ff] focus:ring-2 focus:ring-[#00d9ff]/20';

  const disabledStyles = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : 'hover:border-[#00d9ff]/50';

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-[#2a1a5e] mb-2">
          {label}
          {required && <span className="text-[#f44336] ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        id={inputId}
        disabled={disabled}
        required={required}
        className={`${baseStyles} ${stateStyles} ${disabledStyles} focus:outline-none placeholder:text-gray-400`}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-start gap-2 text-[#f44336] text-sm">
          {/* Error Icon */}
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
