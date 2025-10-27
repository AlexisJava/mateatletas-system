interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
}

/**
 * Select Component - Crash Bandicoot Style
 * Select dropdown con diseño chunky
 */
export function Select({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  disabled = false,
  required = false,
  className = '',
  name,
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-[#2a1a5e] mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all duration-200 focus:outline-none focus:border-[#00d9ff] focus:shadow-[5px_5px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : ''
        } ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
