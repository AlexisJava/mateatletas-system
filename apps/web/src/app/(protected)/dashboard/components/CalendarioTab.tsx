'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';
import {
  Calendar,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react';
import { calendarioResponseSchema, type CalendarioResponse } from '@/lib/schemas/clase.schema';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function CalendarioTab() {
  const now = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(now.getMonth() + 1); // 1-12
  const [anioSeleccionado, setAnioSeleccionado] = useState(now.getFullYear());
  const [calendarioData, setCalendarioData] = useState<CalendarioResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCalendario();
  }, [mesSeleccionado, anioSeleccionado]);

  const loadCalendario = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<CalendarioResponse>('/clases/calendario', {
        params: {
          mes: mesSeleccionado,
          anio: anioSeleccionado,
        },
      });
      const parsed = calendarioResponseSchema.parse(response);
      setCalendarioData(parsed);
    } catch (error) {
      // Error loading calendar
    } finally {
      setLoading(false);
    }
  };

  const handleMesAnterior = () => {
    if (mesSeleccionado === 1) {
      setMesSeleccionado(12);
      setAnioSeleccionado(anioSeleccionado - 1);
    } else {
      setMesSeleccionado(mesSeleccionado - 1);
    }
  };

  const handleMesSiguiente = () => {
    if (mesSeleccionado === 12) {
      setMesSeleccionado(1);
      setAnioSeleccionado(anioSeleccionado + 1);
    } else {
      setMesSeleccionado(mesSeleccionado + 1);
    }
  };

  const agruparClasesPorDia = (clases: CalendarioResponse['clases']) => {
    const grupos: { [key: string]: CalendarioResponse['clases'] } = {};
    clases.forEach((clase) => {
      const fecha = new Date(clase.fecha_hora_inicio);
      const dia = fecha.getDate();
      const key = `${dia}`;
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(clase);
    });
    return grupos;
  };

  const clasesPorDia = calendarioData ? agruparClasesPorDia(calendarioData.clases) : {};
  const dias = Object.keys(clasesPorDia).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="h-full flex flex-col overflow-hidden gap-4">
      {/* Header con selector de mes/año */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-lg p-2">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Calendario de Clases</h2>
              <p className="text-sm text-gray-300">
                {calendarioData?.total || 0} clases en {MESES[mesSeleccionado - 1]}{' '}
                {anioSeleccionado}
              </p>
            </div>
          </div>

          {/* Navegador de Mes */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMesAnterior}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="text-center min-w-[140px]">
              <p className="font-bold text-white">{MESES[mesSeleccionado - 1]}</p>
              <p className="text-sm text-gray-400">{anioSeleccionado}</p>
            </div>
            <button
              onClick={handleMesSiguiente}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Clases por Día */}
      <div className="flex-1 bg-gray-900 rounded-xl shadow-2xl border-2 border-gray-700 p-4 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-white">Cargando calendario...</p>
            </div>
          </div>
        ) : dias.length > 0 ? (
          <div className="space-y-6">
            {dias.map((dia) => {
              const clasesDelDia = clasesPorDia[dia];
              const fecha = new Date(anioSeleccionado, mesSeleccionado - 1, parseInt(dia));
              const esHoy =
                fecha.getDate() === now.getDate() &&
                fecha.getMonth() === now.getMonth() &&
                fecha.getFullYear() === now.getFullYear();

              return (
                <div key={dia}>
                  {/* Header del Día */}
                  <div
                    className={`flex items-center gap-3 mb-3 pb-2 border-b-2 ${
                      esHoy ? 'border-indigo-500' : 'border-gray-700'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shadow-md ${
                        esHoy
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{dia}</span>
                      <span className="text-xs opacity-80">
                        {fecha.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {fecha.toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {clasesDelDia?.length || 0} clases programadas
                      </p>
                    </div>
                  </div>

                  {/* Clases del Día */}
                  <div className="space-y-2 pl-6">
                    {clasesDelDia?.map((clase) => {
                      const fechaClase = new Date(clase.fecha_hora_inicio);
                      const esFutura = fechaClase > now;

                      return (
                        <div
                          key={clase.id}
                          className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 hover:border-indigo-500 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Info de la Clase */}
                            <div className="flex items-start gap-3 flex-1">
                              <div className="bg-indigo-600 rounded-lg p-2 flex-shrink-0">
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-white">
                                    {(clase.ruta_curricular ?? clase.rutaCurricular)?.nombre ??
                                      'Sin asignar'}
                                  </h4>
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        (clase.ruta_curricular ?? clase.rutaCurricular)?.color ||
                                        '#6366F1',
                                    }}
                                  ></span>
                                </div>
                                <p className="text-sm text-gray-300 mb-2">
                                  {fechaClase.toLocaleTimeString('es-AR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  • {clase.duracion_minutos} min
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <User className="w-4 h-4" />
                                  <span>
                                    Prof. {clase.docente?.nombre} {clase.docente?.apellido}
                                  </span>
                                </div>

                                {/* Estudiantes Inscritos */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {clase.inscripciones?.map((insc) => {
                                    const asistencias =
                                      'asistencias' in clase && Array.isArray(clase.asistencias)
                                        ? clase.asistencias
                                        : [];
                                    const asistencia = asistencias.find(
                                      (a: { estudiante_id: string }) =>
                                        a.estudiante_id === insc.estudiante?.id,
                                    );
                                    return (
                                      <span
                                        key={insc.estudiante?.id}
                                        className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-700 border-2 border-gray-600 text-gray-200 flex items-center gap-1"
                                      >
                                        {insc.estudiante?.nombre}
                                        {asistencia && (
                                          <>
                                            {asistencia.estado === 'Presente' ? (
                                              <CheckCircle className="w-3 h-3 text-green-400" />
                                            ) : (
                                              <XCircle className="w-3 h-3 text-red-400" />
                                            )}
                                          </>
                                        )}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Estado */}
                            <div>
                              {esFutura ? (
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white">
                                  Programada
                                </span>
                              ) : (
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                                  Finalizada
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-xl font-bold text-white mb-2">No hay clases programadas</p>
              <p className="text-gray-400">
                No tienes clases en {MESES[mesSeleccionado - 1]} {anioSeleccionado}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
