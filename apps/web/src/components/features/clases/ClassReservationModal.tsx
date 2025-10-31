/**
 * ClassReservationModal - Modal de reserva de clase
 *
 * Permite al tutor seleccionar un estudiante y confirmar la reserva
 * de una clase. Muestra detalles de la clase y el estudiante seleccionado.
 *
 * @example
 * ```tsx
 * <ClassReservationModal
 *   clase={claseSeleccionada}
 *   estudiantes={estudiantes}
 *   isOpen={modalOpen}
 *   onClose={() => setModalOpen(false)}
 *   onConfirm={handleReservar}
 * />
 * ```
 */

import { useState } from 'react';
import { ClaseConRelaciones } from '@/types/clases.types';
import { Modal, Button } from '@/components/ui';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad?: number;
  avatar?: string;
}

interface ClassReservationModalProps {
  clase: ClaseConRelacionesConRelaciones | null;
  estudiantes: Estudiante[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (_claseId: string, _estudianteId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ClassReservationModal({
  clase,
  estudiantes,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ClassReservationModalProps) {
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<
    string | null
  >(null);

  if (!clase) return null;

  // Formatear fecha y hora
  const fecha = new Date(clase.fecha_hora_inicio);
  const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);

  const rutaCurricular = clase.ruta_curricular ?? clase.rutaCurricular;
  const colorRuta = rutaCurricular?.color ?? '#00d9ff';
  const nombreRuta = rutaCurricular?.nombre ?? 'Sin ruta';
  const cupoMaximo = clase.cupo_maximo ?? 0;
  const cuposOcupados = clase.cupos_ocupados ?? clase._count?.inscripciones ?? 0;
  const cuposDisponibles = Math.max(cupoMaximo - cuposOcupados, 0);

  // Handler de confirmación
  const handleConfirm = async () => {
    if (!estudianteSeleccionado) {
      alert('Debes seleccionar un estudiante');
      return;
    }

    await onConfirm(clase.id, estudianteSeleccionado);
    setEstudianteSeleccionado(null);
  };

  // Handler de cerrar
  const handleClose = () => {
    setEstudianteSeleccionado(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reservar clase"
      size="md"
    >
      <div className="bg-white rounded-lg p-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-2xl w-full">
        {/* Header */}
        <div className="text-center space-y-4 mb-6">
          <div className="text-6xl">🎫</div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-4xl text-dark">Reservar clase</h2>
        </div>

        {/* Detalles de la clase */}
        <div
          className="rounded-lg p-6 mb-6 border-2"
          style={{
            backgroundColor: `${colorRuta}10`,
            borderColor: colorRuta,
          }}
        >
          <div className="space-y-3">
            {/* Título */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Clase
              </p>
              <h3 className="font-[family-name:var(--font-fredoka)] text-2xl text-dark">{clase.titulo}</h3>
            </div>

            {/* Ruta */}
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <div>
                <p className="text-xs text-gray-500">Ruta</p>
                <p className="font-bold text-dark">{nombreRuta}</p>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-xs text-gray-500">Fecha y hora</p>
                <p className="font-bold text-dark capitalize">
                  {fechaFormateada}
                </p>
              </div>
            </div>

            {/* Docente */}
            {clase.docente && (
              <div className="flex items-center gap-2">
                <span className="text-xl">👨‍🏫</span>
                <div>
                  <p className="text-xs text-gray-500">Docente</p>
                  <p className="font-bold text-dark">
                    {clase.docente?.nombre} {clase.docente?.apellido}
                  </p>
                </div>
              </div>
            )}

            {/* Cupos */}
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <div>
                <p className="text-xs text-gray-500">Cupos disponibles</p>
                <p className="font-bold text-dark">
                  {cuposDisponibles} de {cupoMaximo}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de estudiante */}
        <div className="mb-6">
          <label className="block font-bold text-dark mb-3">
            👦 Selecciona el estudiante:
          </label>

          {estudiantes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-gray-300">
              <p className="text-gray-600 mb-4">
                No tienes estudiantes registrados
              </p>
              <Button variant="secondary" onClick={handleClose}>
                Agregar estudiante
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {estudiantes.map((estudiante) => (
                <button
                  key={estudiante.id}
                  onClick={() => setEstudianteSeleccionado(estudiante.id)}
                  className={`
                    w-full
                    p-4
                    rounded-lg
                    border-2
                    text-left
                    flex items-center gap-3
                    transition-all
                    ${
                      estudianteSeleccionado === estudiante.id
                        ? 'border-primary bg-primary/10 shadow-[3px_3px_0px_rgba(0,0,0,1)] scale-105'
                        : 'border-gray-300 bg-white hover:border-primary hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    }
                  `}
                >
                  {/* Avatar */}
                  <div
                    className={`
                      w-12 h-12
                      rounded-full
                      flex items-center justify-center
                      text-2xl
                      border-2 border-black
                      ${
                        estudianteSeleccionado === estudiante.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-200'
                      }
                    `}
                  >
                    {estudiante.avatar || '👦'}
                  </div>

                  {/* Nombre */}
                  <div className="flex-1">
                    <p className="font-bold text-dark">
                      {estudiante.nombre} {estudiante.apellido}
                    </p>
                    {estudiante.edad && (
                      <p className="text-sm text-gray-600">
                        {estudiante.edad} años
                      </p>
                    )}
                  </div>

                  {/* Checkmark */}
                  {estudianteSeleccionado === estudiante.id && (
                    <div className="text-2xl text-primary">✓</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirm}
            className="flex-1"
            isLoading={isLoading}
            disabled={!estudianteSeleccionado || estudiantes.length === 0}
          >
            {isLoading ? 'Reservando...' : '✓ Confirmar reserva'}
          </Button>
        </div>

        {/* Nota informativa */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Recibirás una confirmación por correo electrónico
        </p>
      </div>
    </Modal>
  );
}
