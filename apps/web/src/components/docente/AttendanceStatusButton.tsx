'use client';

import { EstadoAsistencia } from '@/types/asistencia.types';

interface AttendanceStatusButtonProps {
  /** Estado actual de la asistencia */
  currentStatus: EstadoAsistencia | null;
  /** Callback cuando se selecciona un estado */
  onStatusChange: (_status: EstadoAsistencia) => void;
  /** Si el componente está deshabilitado */
  disabled?: boolean;
}

/**
 * AttendanceStatusButton - Botones para marcar asistencia
 *
 * Muestra 4 botones para los estados de asistencia:
 * - Presente (verde)
 * - Ausente (rojo)
 * - Justificado (azul)
 * - Tardanza (amarillo)
 *
 * El botón activo se resalta con estilo diferente.
 *
 * @example
 * ```tsx
 * <AttendanceStatusButton
 *   currentStatus={asistencia?.estado || null}
 *   onStatusChange={(status) => handleMarcar(estudianteId, status)}
 *   disabled={isLoading}
 * />
 * ```
 */
export default function AttendanceStatusButton({
  currentStatus,
  onStatusChange,
  disabled = false,
}: AttendanceStatusButtonProps) {
  /**
   * Configuración de cada estado
   */
  const statusConfig = {
    [EstadoAsistencia.Presente]: {
      label: 'Presente',
      emoji: '✅',
      color: '#4caf50',
      bgColor: '#e8f5e9',
      activeClass: 'bg-[#4caf50] text-white border-[#4caf50]',
      inactiveClass: 'bg-[#e8f5e9] text-[#4caf50] border-[#4caf50] hover:bg-[#4caf50] hover:text-white',
    },
    [EstadoAsistencia.Ausente]: {
      label: 'Ausente',
      emoji: '❌',
      color: '#f44336',
      bgColor: '#ffebee',
      activeClass: 'bg-[#f44336] text-white border-[#f44336]',
      inactiveClass: 'bg-[#ffebee] text-[#f44336] border-[#f44336] hover:bg-[#f44336] hover:text-white',
    },
    [EstadoAsistencia.Justificado]: {
      label: 'Justificado',
      emoji: '📝',
      color: '#2196f3',
      bgColor: '#e3f2fd',
      activeClass: 'bg-[#2196f3] text-white border-[#2196f3]',
      inactiveClass: 'bg-[#e3f2fd] text-[#2196f3] border-[#2196f3] hover:bg-[#2196f3] hover:text-white',
    },
    [EstadoAsistencia.Tardanza]: {
      label: 'Tardanza',
      emoji: '⏰',
      color: '#ff9800',
      bgColor: '#fff3e0',
      activeClass: 'bg-[#ff9800] text-white border-[#ff9800]',
      inactiveClass: 'bg-[#fff3e0] text-[#ff9800] border-[#ff9800] hover:bg-[#ff9800] hover:text-white',
    },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(statusConfig).map(([status, config]) => {
        const isActive = currentStatus === status;
        const buttonClass = isActive ? config.activeClass : config.inactiveClass;

        return (
          <button
            key={status}
            onClick={() => onStatusChange(status as EstadoAsistencia)}
            disabled={disabled}
            className={`
              px-3 py-2 rounded-lg border-2 font-semibold text-sm
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${buttonClass}
              ${isActive ? 'shadow-md scale-105' : 'shadow-sm'}
            `}
            title={`Marcar como ${config.label}`}
          >
            <span className="mr-1">{config.emoji}</span>
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
