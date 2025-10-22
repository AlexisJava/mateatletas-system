/**
 * ClassCard - Tarjeta de clase individual
 *
 * Muestra información de una clase programada con ruta curricular,
 * docente, fecha/hora, cupos disponibles y botón de reserva.
 *
 * @example
 * ```tsx
 * <ClassCard
 *   clase={clase}
 *   onClick={() => handleClick(clase)}
 * />
 * ```
 */

import { Clase } from '@/types/clases.types';
import { Card, Badge } from '@/components/ui';

interface ClassCardProps {
  clase: Clase;
  onClick?: (clase: Clase) => void;
  showReserveButton?: boolean;
}

export function ClassCard({
  clase,
  onClick,
  showReserveButton = true,
}: ClassCardProps) {
  // Formatear fecha y hora
  const fecha = new Date(clase.fecha_hora_inicio);
  const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(fecha);
  const horaFormateada = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);

  // Determinar color de la ruta curricular
  const colorRuta = clase.ruta_curricular?.color || '#00d9ff';

  // Determinar si hay cupos disponibles
  const sinCupos = clase.cupo_disponible === 0;
  const pocoCupo = clase.cupo_disponible <= 3 && clase.cupo_disponible > 0;

  // Badge de cupo
  const cupoColor = sinCupos
    ? 'bg-red-100 text-red-700 border-red-300'
    : pocoCupo
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
      : 'bg-green-100 text-green-700 border-green-300';

  return (
    <Card
      className={`
        border-3 border-black
        shadow-[5px_5px_0px_rgba(0,0,0,1)]
        hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
        hover:scale-105
        transition-all duration-200
        ${onClick && !sinCupos ? 'cursor-pointer' : ''}
        ${sinCupos ? 'opacity-60' : ''}
      `}
      onClick={() => !sinCupos && onClick && onClick(clase)}
    >
      {/* Header con ruta curricular */}
      <div
        className="h-2 rounded-t-lg"
        style={{ backgroundColor: colorRuta }}
      ></div>

      <div className="space-y-4 p-5">
        {/* Ruta curricular y estado */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            className="font-bold text-sm px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            style={{
              backgroundColor: `${colorRuta}20`,
              color: colorRuta,
              borderColor: colorRuta,
            }}
          >
            📚 {clase.ruta_curricular?.nombre || 'Sin ruta'}
          </Badge>

          {sinCupos && (
            <Badge className="bg-red-500 text-white font-bold text-xs px-2 py-1 border-2 border-black">
              LLENO
            </Badge>
          )}
        </div>

        {/* Título de la clase */}
        <h3 className="font-[family-name:var(--font-fredoka)] text-2xl text-dark line-clamp-2">
          {clase.titulo}
        </h3>

        {/* Descripción */}
        {clase.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {clase.descripcion}
          </p>
        )}

        {/* Info: Fecha, hora, docente */}
        <div className="space-y-2 pt-3 border-t-2 border-gray-200">
          {/* Fecha y hora */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-bold text-dark capitalize">{fechaFormateada}</p>
              <p className="text-gray-600">
                {horaFormateada} • {clase.duracion_minutos} min
              </p>
            </div>
          </div>

          {/* Docente */}
          {clase.docente && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">👨‍🏫</span>
              <p className="text-gray-700">
                {clase.docente?.nombre} {clase.docente?.apellido}
              </p>
            </div>
          )}

          {/* Cupos disponibles */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">👥</span>
            <div
              className={`
              px-3 py-1 rounded-full text-xs font-bold border-2
              ${cupoColor}
            `}
            >
              {sinCupos
                ? 'Sin cupos'
                : `${clase.cupo_disponible}/${clase.cupo_maximo} disponibles`}
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        {showReserveButton && !sinCupos && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(clase);
            }}
            className="
              w-full
              px-4 py-3
              bg-primary
              text-white
              font-bold
              rounded-lg
              border-2 border-black
              shadow-[3px_3px_0px_rgba(0,0,0,1)]
              hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]
              hover:scale-105
              transition-all
            "
          >
            🎫 Reservar clase
          </button>
        )}

        {sinCupos && showReserveButton && (
          <button
            disabled
            className="
              w-full
              px-4 py-3
              bg-gray-300
              text-gray-600
              font-bold
              rounded-lg
              border-2 border-gray-400
              cursor-not-allowed
            "
          >
            Sin cupos disponibles
          </button>
        )}
      </div>
    </Card>
  );
}
