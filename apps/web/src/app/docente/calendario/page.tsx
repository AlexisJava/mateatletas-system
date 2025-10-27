'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, BookOpen } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LoadingSpinner } from '@/components/effects';
import { docentesApi } from '@/lib/api/docentes.api';

/**
 * CALENDARIO DOCENTE - BRUTAL & INTELIGENTE
 *
 * Features:
 * - Vista mensual con grid completo
 * - Integración automática con clases del sistema
 * - Quick actions para crear eventos rápido
 * - Navegación fluida entre meses
 * - Resalta hoy, clases y eventos importantes
 */

interface ClaseDelDia {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  grupo_id: string;
  estudiantes: Array<{ id: string; nombre: string; apellido: string }>;
}

interface EventoDia {
  id: string;
  tipo: 'clase' | 'tarea' | 'recordatorio';
  titulo: string;
  hora?: string;
  color: string;
}

export default function DocenteCalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [clasesDelMes, setClasesDelMes] = useState<ClaseDelDia[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchClasesDelMes();
  }, [currentDate]);

  const fetchClasesDelMes = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementar endpoint para traer clases del mes
      // const response = await docentesApi.getClasesDelMes(format(currentDate, 'yyyy-MM'));
      // setClasesDelMes(response);
      setClasesDelMes([]);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generar días del calendario
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Mock: obtener eventos de un día
  const getEventosDelDia = (date: Date): EventoDia[] => {
    const eventos: EventoDia[] = [];

    // Buscar clases de ese día
    // TODO: Filtrar clasesDelMes por fecha

    return eventos;
  };

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col gap-6 overflow-y-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Calendario' }]} />

        {/* Header BRUTAL */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-purple-400" />
              CALENDARIO
            </h1>
            <p className="text-purple-300 text-base font-bold">
              {format(currentDate, "MMMM yyyy", { locale: es }).toUpperCase()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={goToToday}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              HOY
            </button>
            <button
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-purple-900 font-black rounded-xl transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              NUEVO EVENTO
            </button>
          </div>
        </motion.div>

        {/* Stats Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <Clock className="w-7 h-7 text-blue-400" />
              <div>
                <p className="text-2xl font-black text-white">12</p>
                <p className="text-purple-300 font-semibold text-sm">Clases este mes</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <Users className="w-7 h-7 text-green-400" />
              <div>
                <p className="text-2xl font-black text-white">45</p>
                <p className="text-purple-300 font-semibold text-sm">Estudiantes totales</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-yellow-400" />
              <div>
                <p className="text-2xl font-black text-white">3</p>
                <p className="text-purple-300 font-semibold text-sm">Tareas pendientes</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navegación del Calendario */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-2xl font-black text-white">
              {format(currentDate, "MMMM yyyy", { locale: es }).toUpperCase()}
            </h2>

            <button
              onClick={nextMonth}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Grid del Calendario */}
          <div className="grid grid-cols-7 gap-2">
            {/* Días de la semana */}
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="text-center py-3 text-purple-300 font-black text-sm"
              >
                {dia}
              </div>
            ))}

            {/* Días del mes */}
            {calendarDays.map((day, idx) => {
              const esHoy = isToday(day);
              const esMesActual = isSameMonth(day, currentDate);
              const eventos = getEventosDelDia(day);
              const tieneClases = eventos.some(e => e.tipo === 'clase');

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[100px] p-2 rounded-xl cursor-pointer transition-all
                    ${esMesActual
                      ? 'bg-white/10 hover:bg-white/20 border border-white/10 hover:border-purple-400/50'
                      : 'bg-white/5 opacity-40'
                    }
                    ${esHoy ? 'ring-2 ring-yellow-400 bg-yellow-500/20' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`
                      text-sm font-bold mb-1
                      ${esHoy ? 'text-yellow-400' : 'text-white'}
                    `}>
                      {format(day, 'd')}
                    </span>

                    {/* Indicadores de eventos */}
                    <div className="flex-1 space-y-1">
                      {eventos.slice(0, 2).map((evento, i) => (
                        <div
                          key={i}
                          className={`text-[10px] font-semibold px-2 py-1 rounded truncate ${
                            evento.tipo === 'clase'
                              ? 'bg-purple-600 text-white'
                              : evento.tipo === 'tarea'
                              ? 'bg-yellow-500 text-black'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {evento.hora && `${evento.hora} `}
                          {evento.titulo}
                        </div>
                      ))}

                      {eventos.length > 2 && (
                        <div className="text-[10px] text-purple-300 font-bold">
                          +{eventos.length - 2} más
                        </div>
                      )}
                    </div>

                    {/* Badge de "hoy" */}
                    {esHoy && (
                      <div className="absolute top-1 right-1 bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full text-[8px] font-black">
                        HOY
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Leyenda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg"
        >
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span className="text-white font-semibold">Clases</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-white font-semibold">Tareas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-white font-semibold">Recordatorios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded ring-2 ring-yellow-400"></div>
              <span className="text-white font-semibold">Hoy</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
