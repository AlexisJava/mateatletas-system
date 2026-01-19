import { type ReactNode, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Input, type InputProps } from '../primitives/Input';

export interface FormFieldProps extends InputProps {
  /** Field label */
  label?: string;
  /** Required indicator */
  required?: boolean;
  /** Help text shown below input */
  helpText?: string;
  /** Additional content after input (e.g., character count) */
  suffix?: ReactNode;
  /** Label class names */
  labelClassName?: string;
  /** Wrapper class names */
  wrapperClassName?: string;
}

/**
 * FormField - Molecule combining Label + Input + Help/Error text
 *
 * Provides a complete form field with consistent styling.
 * Wraps the Input primitive with label and help text support.
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   name="email"
 *   type="email"
 *   placeholder="tu@email.com"
 *   required
 *   helpText="Usaremos este email para notificaciones"
 * />
 *
 * <FormField
 *   label="Contraseña"
 *   name="password"
 *   type="password"
 *   error="La contraseña debe tener al menos 8 caracteres"
 * />
 * ```
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      required,
      helpText,
      suffix,
      error,
      labelClassName,
      wrapperClassName,
      id,
      ...inputProps
    },
    ref,
  ) => {
    // Generate id if not provided
    const fieldId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={clsx('w-full', wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={fieldId}
            className={clsx('block text-sm font-medium text-slate-300 mb-2', labelClassName)}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input */}
        <Input ref={ref} id={fieldId} error={error} {...inputProps} />

        {/* Help text (only shown if no error) */}
        {helpText && !error && <p className="mt-2 text-sm text-slate-500">{helpText}</p>}

        {/* Suffix content */}
        {suffix && <div className="mt-2">{suffix}</div>}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

/**
 * FormFieldGroup - Group related fields together
 */
export function FormFieldGroup({
  legend,
  children,
  className,
}: {
  legend?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={clsx('space-y-4', className)}>
      {legend && <legend className="text-lg font-semibold text-white mb-4">{legend}</legend>}
      {children}
    </fieldset>
  );
}

FormFieldGroup.displayName = 'FormFieldGroup';
