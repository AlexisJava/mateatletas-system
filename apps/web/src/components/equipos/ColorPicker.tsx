'use client';

import { useState } from 'react';

/**
 * Props del ColorPicker
 */
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (_color: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * Colores predefinidos para los equipos
 * Basados en la paleta de Mateatletas
 */
const PRESET_COLORS = [
  '#FF6B35', // Naranja principal
  '#F7B801', // Amarillo principal
  '#00D9FF', // Cyan
  '#2A1A5E', // Morado oscuro
  '#FF0054', // Rojo vibrante
  '#00C853', // Verde vibrante
  '#FFD600', // Amarillo dorado
  '#7C4DFF', // Púrpura
  '#FF6F00', // Naranja oscuro
  '#00BFA5', // Turquesa
  '#F50057', // Rosa fuerte
  '#2979FF', // Azul brillante
];

/**
 * Componente ColorPicker
 * Selector de color con paleta predefinida y selector nativo
 *
 * Características:
 * - Muestra colores predefinidos de la marca
 * - Permite selección personalizada con input[type="color"]
 * - Previsualización del color seleccionado
 * - Validación de formato hexadecimal
 */
export default function ColorPicker({
  label,
  value,
  onChange,
  error,
  required = false,
}: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  /**
   * Manejar selección de color predefinido
   */
  const handlePresetColor = (color: string) => {
    onChange(color);
    setShowCustomPicker(false);
  };

  /**
   * Manejar cambio en el input de color personalizado
   */
  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.toUpperCase());
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-semibold text-[#2a1a5e]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Previsualización del color actual */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-16 h-16 rounded-lg border-4 border-white shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-xs text-gray-500">Color actual</p>
          <p className="font-mono font-bold text-[#2a1a5e]">{value}</p>
        </div>
      </div>

      {/* Paleta de colores predefinidos */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Colores predefinidos:</p>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetColor(color)}
              className={`
                w-full aspect-square rounded-lg transition-all
                hover:scale-110 hover:shadow-lg
                ${value === color ? 'ring-4 ring-[#2a1a5e] scale-110' : 'ring-2 ring-gray-300'}
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Selector de color personalizado */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="text-sm text-[#ff6b35] hover:underline font-semibold"
        >
          {showCustomPicker ? '▲ Ocultar' : '▼ Elegir color personalizado'}
        </button>

        {showCustomPicker && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <label className="flex items-center gap-3">
              <input
                type="color"
                value={value}
                onChange={handleCustomColor}
                className="w-20 h-20 rounded-lg cursor-pointer border-4 border-white shadow-md"
              />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">
                  Haz clic para elegir un color personalizado
                </p>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value.toUpperCase())}
                  placeholder="#FF6B35"
                  maxLength={7}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-[#ff6b35]"
                />
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
