'use client';

interface AttendanceStatsCardProps {
  /** Total de estudiantes */
  total: number;
  /** Número de presentes */
  presentes: number;
  /** Número de ausentes */
  ausentes: number;
  /** Número de justificados */
  justificados: number;
  /** Número de tardanzas */
  tardanzas: number;
  /** Número de pendientes (sin marcar) */
  pendientes: number;
}

/**
 * AttendanceStatsCard - Tarjeta de estadísticas de asistencia
 *
 * Muestra un resumen visual de la asistencia de una clase con:
 * - Total de estudiantes
 * - Desglose por estado (presente, ausente, justificado, tardanza, pendiente)
 * - Porcentaje de asistencia
 * - Indicadores visuales con colores
 *
 * @example
 * ```tsx
 * <AttendanceStatsCard
 *   total={25}
 *   presentes={20}
 *   ausentes={2}
 *   justificados={1}
 *   tardanzas={2}
 *   pendientes={0}
 * />
 * ```
 */
export default function AttendanceStatsCard({
  total,
  presentes,
  ausentes,
  justificados,
  tardanzas,
  pendientes,
}: AttendanceStatsCardProps) {
  /**
   * Calcular porcentaje de asistencia efectiva
   * (Presentes + Justificados + Tardanzas) / Total
   */
  const asistenciaEfectiva = presentes + justificados + tardanzas;
  const porcentajeAsistencia = total > 0 ? Math.round((asistenciaEfectiva / total) * 100) : 0;

  /**
   * Determinar color del porcentaje
   */
  const getPorcentajeColor = () => {
    if (porcentajeAsistencia >= 90) return 'text-[#4caf50]';
    if (porcentajeAsistencia >= 70) return 'text-[#ff9800]';
    return 'text-[#f44336]';
  };

  /**
   * Estadísticas individuales
   */
  const stats = [
    {
      label: 'Presentes',
      value: presentes,
      emoji: '✅',
      color: '#4caf50',
      bgColor: '#e8f5e9',
    },
    {
      label: 'Ausentes',
      value: ausentes,
      emoji: '❌',
      color: '#f44336',
      bgColor: '#ffebee',
    },
    {
      label: 'Justificados',
      value: justificados,
      emoji: '📝',
      color: '#2196f3',
      bgColor: '#e3f2fd',
    },
    {
      label: 'Tardanzas',
      value: tardanzas,
      emoji: '⏰',
      color: '#ff9800',
      bgColor: '#fff3e0',
    },
    {
      label: 'Pendientes',
      value: pendientes,
      emoji: '⏳',
      color: '#9e9e9e',
      bgColor: '#f5f5f5',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#ff6b35]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2a1a5e]">Estadísticas de Asistencia</h3>
          <p className="text-sm text-gray-600 mt-1">Total de estudiantes: {total}</p>
        </div>

        {/* Porcentaje grande */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getPorcentajeColor()}`}>
            {porcentajeAsistencia}%
          </div>
          <div className="text-xs text-gray-600 mt-1">Asistencia</div>
        </div>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center p-4 rounded-lg border-2"
            style={{
              backgroundColor: stat.bgColor,
              borderColor: stat.color,
            }}
          >
            <span className="text-3xl mb-2">{stat.emoji}</span>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 mt-1 text-center">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-6">
        <div className="text-xs text-gray-600 mb-2">Distribución visual</div>
        <div className="flex h-4 rounded-full overflow-hidden border border-gray-300">
          {total > 0 ? (
            <>
              {/* Presentes */}
              {presentes > 0 && (
                <div
                  className="bg-[#4caf50]"
                  style={{ width: `${(presentes / total) * 100}%` }}
                  title={`Presentes: ${presentes}`}
                />
              )}
              {/* Justificados */}
              {justificados > 0 && (
                <div
                  className="bg-[#2196f3]"
                  style={{ width: `${(justificados / total) * 100}%` }}
                  title={`Justificados: ${justificados}`}
                />
              )}
              {/* Tardanzas */}
              {tardanzas > 0 && (
                <div
                  className="bg-[#ff9800]"
                  style={{ width: `${(tardanzas / total) * 100}%` }}
                  title={`Tardanzas: ${tardanzas}`}
                />
              )}
              {/* Ausentes */}
              {ausentes > 0 && (
                <div
                  className="bg-[#f44336]"
                  style={{ width: `${(ausentes / total) * 100}%` }}
                  title={`Ausentes: ${ausentes}`}
                />
              )}
              {/* Pendientes */}
              {pendientes > 0 && (
                <div
                  className="bg-[#9e9e9e]"
                  style={{ width: `${(pendientes / total) * 100}%` }}
                  title={`Pendientes: ${pendientes}`}
                />
              )}
            </>
          ) : (
            <div className="w-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              Sin estudiantes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
