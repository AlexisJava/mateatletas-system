'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMisClasesDocente } from '@/lib/api/clases.api';
import { Clase } from '@/types/clases.types';
import { LoadingSpinner } from '@/components/effects';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export default function DocenteCalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clases, setClases] = useState<Clase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [vistaActual, setVistaActual] = useState<'calendario' | 'lista'>('calendario');

  // Fetch clases del docente
  useEffect(() => {
    const fetchClases = async () => {
      try {
        setIsLoading(true);
        const data = await getMisClasesDocente(true); // Incluir pasadas para calendario completo
        setClases(data);
      } catch (error) {
        console.error('Error al cargar clases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClases();
  }, []);

  // Obtener clases de un día específico
  const getClasesDelDia = (dia: Date): Clase[] => {
    if (!clases) return [];
    return clases.filter((clase) => {
      const fechaClase = parseISO(clase.fecha_hora_inicio);
      return isSameDay(fechaClase, dia);
    });
  };

  // Generar días del calendario (grid 7x6)
  const generarDiasCalendario = () => {
    const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }); // Lunes
    const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

    const dias: Date[] = [];
    let dia = startDate;

    while (dia <= endDate) {
      dias.push(dia);
      dia = addDays(dia, 1);
    }

    return dias;
  };

  const dias = generarDiasCalendario();

  // Navegar mes
  const mesAnterior = () => setCurrentMonth(subMonths(currentMonth, 1));
  const mesSiguiente = () => setCurrentMonth(addMonths(currentMonth, 1));
  const irHoy = () => setCurrentMonth(new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div {...fadeIn}>
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendario de Clases</h1>
            <p className="text-gray-600 mt-1">
              {clases?.length || 0} clases programadas
            </p>
          </div>

          {/* Controles de vista */}
          <div className="flex gap-2">
            <button
              onClick={() => setVistaActual('calendario')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                vistaActual === 'calendario'
                  ? 'bg-[#ff6b35] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📅 Calendario
            </button>
            <button
              onClick={() => setVistaActual('lista')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                vistaActual === 'lista'
                  ? 'bg-[#ff6b35] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 Lista
            </button>
          </div>
        </div>

        {vistaActual === 'calendario' ? (
          <>
            {/* Controles de navegación */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={mesAnterior}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Mes anterior"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                  </h2>
                  <button
                    onClick={irHoy}
                    className="text-sm text-[#ff6b35] hover:underline mt-1"
                  >
                    Ir a hoy
                  </button>
                </div>

                <button
                  onClick={mesSiguiente}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Mes siguiente"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendario Grid */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                  <div
                    key={dia}
                    className="py-3 text-center text-sm font-semibold text-gray-700"
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 divide-x divide-y">
                {dias.map((dia, index) => {
                  const clasesDelDia = getClasesDelDia(dia);
                  const esDelMesActual = isSameMonth(dia, currentMonth);
                  const esHoy = isToday(dia);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => setSelectedDay(dia)}
                      className={`min-h-[120px] p-2 cursor-pointer transition-all hover:bg-gray-50 ${
                        !esDelMesActual ? 'bg-gray-100/50 text-gray-400' : ''
                      } ${esHoy ? 'bg-blue-50' : ''}`}
                    >
                      {/* Número del día */}
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-sm font-semibold ${
                            esHoy
                              ? 'bg-[#ff6b35] text-white rounded-full w-7 h-7 flex items-center justify-center'
                              : ''
                          }`}
                        >
                          {format(dia, 'd')}
                        </span>
                        {clasesDelDia.length > 0 && (
                          <span className="text-xs bg-[#ff6b35] text-white rounded-full px-2 py-0.5">
                            {clasesDelDia.length}
                          </span>
                        )}
                      </div>

                      {/* Mini cards de clases */}
                      <div className="space-y-1">
                        {clasesDelDia.slice(0, 2).map((clase) => (
                          <div
                            key={clase.id}
                            className="text-xs p-1 rounded truncate"
                            style={{
                              backgroundColor: clase.rutaCurricular?.color + '20' || '#f3f4f6',
                              borderLeft: `3px solid ${clase.rutaCurricular?.color || '#9ca3af'}`,
                            }}
                          >
                            <div className="font-medium truncate">
                              {format(parseISO(clase.fecha_hora_inicio), 'HH:mm')}
                            </div>
                            <div className="truncate text-gray-700">
                              {clase.rutaCurricular?.nombre || 'Clase'}
                            </div>
                          </div>
                        ))}
                        {clasesDelDia.length > 2 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{clasesDelDia.length - 2} más
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Modal de día seleccionado */}
            <AnimatePresence>
              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedDay(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {format(selectedDay, 'EEEE d', { locale: es })}
                          </h3>
                          <p className="text-gray-600 capitalize">
                            {format(selectedDay, 'MMMM yyyy', { locale: es })}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedDay(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Lista de clases del día */}
                      <div className="space-y-3">
                        {getClasesDelDia(selectedDay).length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            No hay clases programadas para este día
                          </p>
                        ) : (
                          getClasesDelDia(selectedDay).map((clase) => (
                            <div
                              key={clase.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: clase.rutaCurricular?.color }}
                                    />
                                    <h4 className="font-semibold text-gray-900">
                                      {clase.rutaCurricular?.nombre}
                                    </h4>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    🕐 {format(parseISO(clase.fecha_hora_inicio), 'HH:mm')} -{' '}
                                    {format(
                                      addDays(
                                        parseISO(clase.fecha_hora_inicio),
                                        clase.duracion_minutos / 1440
                                      ),
                                      'HH:mm'
                                    )}{' '}
                                    ({clase.duracion_minutos} min)
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    👥 {clase.cupos_ocupados}/{clase.cupos_maximo} estudiantes
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    clase.estado === 'Programada'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {clase.estado}
                                </span>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <a
                                  href={`/docente/clases/${clase.id}/asistencia`}
                                  className="text-sm text-[#ff6b35] hover:underline"
                                >
                                  Ver asistencia →
                                </a>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Vista de Lista */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Todas las Clases
            </h2>
            <div className="space-y-3">
              {!clases || clases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay clases programadas
                </p>
              ) : (
                clases
                  .sort(
                    (a, b) =>
                      new Date(a.fecha_hora_inicio).getTime() -
                      new Date(b.fecha_hora_inicio).getTime()
                  )
                  .map((clase) => (
                    <div
                      key={clase.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: clase.rutaCurricular?.color }}
                            />
                            <h4 className="font-semibold text-gray-900">
                              {clase.rutaCurricular?.nombre}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            📅{' '}
                            {format(parseISO(clase.fecha_hora_inicio), "EEEE d 'de' MMMM, yyyy", {
                              locale: es,
                            })}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            🕐 {format(parseISO(clase.fecha_hora_inicio), 'HH:mm')} (
                            {clase.duracion_minutos} min)
                          </p>
                          <p className="text-sm text-gray-600">
                            👥 {clase.cupos_ocupados}/{clase.cupos_maximo} estudiantes
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            clase.estado === 'Programada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {clase.estado}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <a
                          href={`/docente/clases/${clase.id}/asistencia`}
                          className="text-sm bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-[#ff5722] transition-colors"
                        >
                          Ver asistencia
                        </a>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
