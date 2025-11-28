'use client';

import { useEffect, useState } from 'react';
import { useClasesStore } from '@/store/clases.store';
import { Card, Badge, Button } from '@/components/ui';
import { InscripcionClase } from '@/types/clases.types';

/**
 * Página de Mis Clases Reservadas
 * Ruta: /mis-clases
 *
 * Muestra todas las clases que el tutor ha reservado para sus estudiantes.
 * Permite cancelar reservas futuras.
 */
export default function MisClasesPage() {
  const { misReservas, isLoading, error, fetchMisReservas, cancelarReserva } = useClasesStore();

  const [cancelando, setCancelando] = useState<string | null>(null);

  // Cargar reservas al montar
  useEffect(() => {
    fetchMisReservas();
  }, [fetchMisReservas]);

  // Separar reservas en futuras y pasadas
  const reservasFuturas = misReservas.filter((reserva) => {
    if (!reserva.clase) return false;
    return new Date(reserva.clase.fecha_hora_inicio).getTime() > Date.now();
  });

  const reservasPasadas = misReservas.filter((reserva) => {
    if (!reserva.clase) return false;
    return new Date(reserva.clase.fecha_hora_inicio).getTime() <= Date.now();
  });

  // Handler para cancelar reserva
  const handleCancelar = async (inscripcionId: string) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas cancelar esta reserva?');
    if (!confirmar) return;

    setCancelando(inscripcionId);
    const success = await cancelarReserva(inscripcionId);

    if (success) {
      alert('Reserva cancelada exitosamente');
      fetchMisReservas(); // Recargar lista
    } else {
      alert(error || 'Error al cancelar reserva');
    }

    setCancelando(null);
  };

  // Componente para mostrar una reserva
  const ReservaCard = ({ reserva }: { reserva: InscripcionClase }) => {
    if (!reserva.clase) return null;

    const { clase } = reserva;
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
    const colorRuta = '#00d9ff'; // Color por defecto (rutas curriculares deprecated)
    const today = new Date();
    const esHoy =
      fecha.getDate() === today.getDate() &&
      fecha.getMonth() === today.getMonth() &&
      fecha.getFullYear() === today.getFullYear();
    const esFutura = fecha.getTime() > Date.now();

    return (
      <Card
        key={reserva.id}
        className="border-3 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all"
      >
        {/* Header con ruta curricular */}
        <div className="h-2 rounded-t-lg" style={{ backgroundColor: colorRuta }}></div>

        <div className="p-5 space-y-4">
          {/* Header: Ruta + Badge de estado */}
          <div className="flex items-start justify-between gap-2">
            <Badge
              className="font-bold text-sm px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              style={{
                backgroundColor: `${colorRuta}20`,
                color: colorRuta,
                borderColor: colorRuta,
              }}
            >
              📚 Clase
            </Badge>

            {esHoy && esFutura && (
              <Badge className="bg-[#f7b801] text-[#2a1a5e] font-bold text-xs px-2 py-1 border-2 border-black">
                HOY
              </Badge>
            )}

            {!esFutura && (
              <Badge className="bg-gray-300 text-gray-700 font-bold text-xs px-2 py-1 border-2 border-gray-400">
                FINALIZADA
              </Badge>
            )}
          </div>

          {/* Título */}
          <h3 className="font-[family-name:var(--font-fredoka)] text-2xl text-dark">
            {clase.nombre || 'Clase de Matemáticas'}
          </h3>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estudiante */}
            <div className="flex items-start gap-2">
              <span className="text-xl">👦</span>
              <div>
                <p className="text-xs text-gray-500">Estudiante</p>
                <p className="font-bold text-dark">
                  {reserva.estudiante
                    ? `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}`
                    : 'Estudiante'}
                </p>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="flex items-start gap-2">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-xs text-gray-500">Fecha y hora</p>
                <p className="font-bold text-dark capitalize">{fechaFormateada}</p>
                <p className="text-sm text-gray-600">
                  {horaFormateada} • {clase.duracion_minutos} min
                </p>
              </div>
            </div>

            {/* Docente - Información no disponible en este contexto */}
            {false && (
              <div className="flex items-start gap-2">
                <span className="text-xl">👨‍🏫</span>
                <div>
                  <p className="text-xs text-gray-500">Docente</p>
                  <p className="font-bold text-dark">Docente</p>
                </div>
              </div>
            )}

            {/* ID de reserva */}
            <div className="flex items-start gap-2">
              <span className="text-xl">🎫</span>
              <div>
                <p className="text-xs text-gray-500">ID de reserva</p>
                <p className="font-mono text-sm text-gray-700">{reserva.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Botón de cancelar (solo para reservas futuras) */}
          {esFutura && (
            <div className="pt-4 border-t-2 border-gray-200">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleCancelar(reserva.id)}
                isLoading={cancelando === reserva.id}
                className="w-full bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
              >
                {cancelando === reserva.id ? 'Cancelando...' : '✕ Cancelar reserva'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl">🎫</span>
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-5xl text-[#2a1a5e]">
          Mis Clases
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gestiona las clases reservadas para tus estudiantes
        </p>
      </div>

      {/* Stats card */}
      {!isLoading && misReservas.length > 0 && (
        <Card className="bg-gradient-to-r from-[#00d9ff]/20 to-[#f7b801]/20 border-2 border-[#00d9ff]">
          <div className="flex flex-wrap items-center justify-around gap-6">
            <div className="text-center">
              <p className="text-4xl font-[family-name:var(--font-fredoka)] text-[#2a1a5e]">
                {reservasFuturas.length}
              </p>
              <p className="text-sm text-gray-600">Próximas clases</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-[family-name:var(--font-fredoka)] text-[#2a1a5e]">
                {reservasPasadas.length}
              </p>
              <p className="text-sm text-gray-600">Clases completadas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-[family-name:var(--font-fredoka)] text-[#2a1a5e]">
                {misReservas.length}
              </p>
              <p className="text-sm text-gray-600">Total de reservas</p>
            </div>
          </div>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="bg-red-50 border-2 border-red-300">
          <div className="flex items-center gap-3 text-red-700">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="animate-pulse border-3 border-black shadow-[5px_5px_0px_rgba(0,0,0,0.1)]"
            >
              <div className="h-2 bg-gray-200 rounded-t-lg"></div>
              <div className="p-5 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && misReservas.length === 0 && (
        <Card className="py-16">
          <div className="text-center space-y-4">
            <div className="text-7xl">🎫</div>
            <div>
              <h3 className="font-[family-name:var(--font-fredoka)] text-3xl text-[#2a1a5e] mb-2">
                No tienes clases reservadas
              </h3>
              <p className="text-gray-600">
                Explora las clases disponibles y reserva una para tus estudiantes
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => (window.location.href = '/clases')}>
              📚 Ver clases disponibles
            </Button>
          </div>
        </Card>
      )}

      {/* Próximas clases */}
      {!isLoading && reservasFuturas.length > 0 && (
        <div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-3xl text-dark mb-6 flex items-center gap-3">
            <span>🔮</span>
            Próximas clases
            <Badge className="bg-primary text-white px-3 py-1 text-lg">
              {reservasFuturas.length}
            </Badge>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservasFuturas.map((reserva) => (
              <ReservaCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        </div>
      )}

      {/* Clases completadas */}
      {!isLoading && reservasPasadas.length > 0 && (
        <div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-3xl text-dark mb-6 flex items-center gap-3">
            <span>✅</span>
            Clases completadas
            <Badge className="bg-gray-300 text-gray-700 px-3 py-1 text-lg">
              {reservasPasadas.length}
            </Badge>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservasPasadas.map((reserva) => (
              <ReservaCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
