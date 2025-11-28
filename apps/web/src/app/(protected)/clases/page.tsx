'use client';

import { useEffect, useState, useMemo } from 'react';
import { useClasesStore } from '@/store/clases.store';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import { ClassCard, RutaFilter, ClassReservationModal } from '@/components/features/clases';
import { Card } from '@/components/ui';
import { Clase } from '@/types/clases.types';

/**
 * Página de Clases Disponibles
 * Ruta: /clases
 *
 * Muestra todas las clases programadas con filtros por ruta curricular.
 * Permite al tutor reservar clases para sus estudiantes.
 */
export default function ClasesPage() {
  const {
    clases,
    rutasCurriculares,
    filtros,
    isLoading,
    error,
    fetchClases,
    fetchRutasCurriculares,
    setFiltros,
    reservarClase,
    setClaseSeleccionada,
  } = useClasesStore();

  const { estudiantes, fetchEstudiantes } = useEstudiantesStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [claseParaReservar, setClaseParaReservar] = useState<Clase | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    fetchClases();
    fetchRutasCurriculares();
    fetchEstudiantes();
  }, [fetchClases, fetchRutasCurriculares, fetchEstudiantes]);

  // Recargar clases cuando cambien los filtros
  useEffect(() => {
    fetchClases();
  }, [filtros, fetchClases]);

  // Calcular conteo de clases por ruta
  const claseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    clases.forEach((clase) => {
      if (clase.ruta_curricular_id) {
        counts[clase.ruta_curricular_id] = (counts[clase.ruta_curricular_id] || 0) + 1;
      }
    });
    return counts;
  }, [clases]);

  // Handler para abrir modal de reserva
  const handleOpenReserva = (clase: Clase) => {
    setClaseParaReservar(clase);
    setClaseSeleccionada(clase);
    setModalOpen(true);
  };

  // Handler para confirmar reserva
  const handleConfirmReserva = async (claseId: string, estudianteId: string) => {
    setIsReserving(true);
    const success = await reservarClase(claseId, { estudianteId });

    if (success) {
      setModalOpen(false);
      setClaseParaReservar(null);
      alert('¡Clase reservada exitosamente!');
    } else {
      alert(error || 'Error al reservar la clase');
    }

    setIsReserving(false);
  };

  // Handler para cambiar filtro de ruta
  const handleRutaChange = (rutaId: string | undefined) => {
    setFiltros({ ruta_curricular_id: rutaId });
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl">📚</span>
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-5xl text-[#2a1a5e]">
          Clases Disponibles
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Reserva clases para tus estudiantes y potencia su aprendizaje
        </p>
      </div>

      {/* Filtros por ruta curricular */}
      {!isLoading && rutasCurriculares.length > 0 && (
        <Card>
          <RutaFilter
            rutasCurriculares={rutasCurriculares}
            rutaActiva={filtros.ruta_curricular_id}
            onRutaChange={handleRutaChange}
            claseCounts={claseCounts}
          />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="animate-pulse border-3 border-black shadow-[5px_5px_0px_rgba(0,0,0,0.1)]"
            >
              <div className="h-2 bg-gray-200 rounded-t-lg"></div>
              <div className="p-5 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-6 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded mt-4"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && clases.length === 0 && (
        <Card className="py-16">
          <div className="text-center space-y-4">
            <div className="text-7xl">📚</div>
            <div>
              <h3 className="font-[family-name:var(--font-fredoka)] text-3xl text-[#2a1a5e] mb-2">
                No hay clases disponibles
              </h3>
              <p className="text-gray-600">
                {filtros.ruta_curricular_id
                  ? 'No hay clases para esta ruta curricular en este momento'
                  : 'No hay clases programadas en este momento'}
              </p>
            </div>
            {filtros.ruta_curricular_id && (
              <button
                onClick={() => setFiltros({ ruta_curricular_id: undefined })}
                className="
                  px-6 py-3
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
                Ver todas las clases
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Grid de clases */}
      {!isLoading && clases.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clases.map((clase) => (
              <ClassCard
                key={clase.id}
                clase={clase}
                onClick={handleOpenReserva}
                showReserveButton={true}
              />
            ))}
          </div>

          {/* Info adicional */}
          <Card className="bg-gradient-to-r from-[#00d9ff]/10 to-[#f7b801]/10 border-2 border-[#00d9ff]">
            <h3 className="font-[family-name:var(--font-fredoka)] text-2xl text-dark mb-4">
              💡 ¿Cómo funciona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <span className="text-3xl">1️⃣</span>
                <div>
                  <p className="font-bold text-dark mb-1">Elige una clase</p>
                  <p className="text-sm text-gray-600">
                    Explora las clases disponibles y filtra por ruta curricular
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-3xl">2️⃣</span>
                <div>
                  <p className="font-bold text-dark mb-1">Selecciona estudiante</p>
                  <p className="text-sm text-gray-600">
                    Elige para cuál de tus estudiantes es la reserva
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-3xl">3️⃣</span>
                <div>
                  <p className="font-bold text-dark mb-1">¡Listo!</p>
                  <p className="text-sm text-gray-600">
                    Recibirás confirmación y recordatorios por correo
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Modal de reserva */}
      <ClassReservationModal
        clase={claseParaReservar}
        estudiantes={estudiantes}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClaseParaReservar(null);
        }}
        onConfirm={handleConfirmReserva}
        isLoading={isReserving}
      />
    </div>
  );
}
