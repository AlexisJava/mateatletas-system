'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  FileText,
  Plus,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Zap,
  X,
  Check,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'class' | 'exam' | 'mentoring';
  duration: string;
  date: number; // Day of the month
  month: number; // 0-11
}

const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Intro a React Hooks',
    time: '14:00',
    type: 'class',
    duration: '90m',
    date: 5,
    month: new Date().getMonth(),
  },
  {
    id: '2',
    title: 'Entrega Final UX/UI',
    time: '23:59',
    type: 'exam',
    duration: 'Deadline',
    date: 8,
    month: new Date().getMonth(),
  },
  {
    id: '3',
    title: 'Revisión de Código',
    time: '10:00',
    type: 'mentoring',
    duration: '45m',
    date: 5,
    month: new Date().getMonth(),
  },
  {
    id: '4',
    title: 'Workshop: State Mgmt',
    time: '18:00',
    type: 'class',
    duration: '120m',
    date: 12,
    month: new Date().getMonth(),
  },
  {
    id: '5',
    title: 'Q&A Sesión 4',
    time: '16:00',
    type: 'class',
    duration: '60m',
    date: 15,
    month: new Date().getMonth(),
  },
  {
    id: '6',
    title: 'Mentoria 1:1 - Juan',
    time: '09:00',
    type: 'mentoring',
    duration: '30m',
    date: 20,
    month: new Date().getMonth(),
  },
  {
    id: '7',
    title: 'Examen Teórico JS',
    time: '19:00',
    type: 'exam',
    duration: '2h',
    date: 25,
    month: new Date().getMonth(),
  },
];

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '12:00',
    type: 'class' as 'class' | 'exam' | 'mentoring',
    duration: '60m',
  });

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startingBlankDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
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
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDay(1);
  };

  const getEventsForDay = (day: number) => {
    return events.filter((e) => e.date === day && e.month === currentDate.getMonth());
  };

  const handleAddEvent = () => {
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      time: newEvent.time,
      type: newEvent.type,
      duration: newEvent.duration,
      date: selectedDay,
      month: currentDate.getMonth(),
    };

    setEvents([...events, event]);
    setIsModalOpen(false);
    setNewEvent({ title: '', time: '12:00', type: 'class', duration: '60m' });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-indigo-500 shadow-indigo-500/50';
      case 'exam':
        return 'bg-red-500 shadow-red-500/50';
      case 'mentoring':
        return 'bg-emerald-500 shadow-emerald-500/50';
      default:
        return 'bg-slate-500';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'class':
        return <Video size={14} className="text-indigo-400" />;
      case 'exam':
        return <FileText size={14} className="text-red-400" />;
      case 'mentoring':
        return <Zap size={14} className="text-emerald-400" />;
      default:
        return <Clock size={14} />;
    }
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

  // Dynamic Insight Logic
  const getInsightMessage = () => {
    const count = selectedDayEvents.length;
    if (count === 0) return 'Día libre. Ideal para preparar material o descansar.';
    if (count > 3)
      return `Día intenso con ${count} eventos. Asegúrate de tomar pausas entre bloques.`;
    return `Carga moderada. Tienes ${count} eventos programados.`;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden relative">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50 bg-slate-950/20">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="text-indigo-500" />
              {monthNames[currentDate.getMonth()]}{' '}
              <span className="text-slate-500 font-medium">{currentDate.getFullYear()}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-bold text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-5 gap-3 flex-1">
            {Array.from({ length: startingBlankDays }).map((_, i) => (
              <div key={`blank-${i}`} className="opacity-0"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isSelected = day === selectedDay;
              const isToday =
                day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer border group
                                    ${
                                      isSelected
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]'
                                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                                    }
                                    ${isToday ? 'ring-1 ring-indigo-400' : ''}
                                `}
                >
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1
                                    ${
                                      isToday
                                        ? 'bg-indigo-500 text-white'
                                        : isSelected
                                          ? 'text-indigo-400'
                                          : 'text-slate-400 group-hover:text-white'
                                    }
                                `}
                  >
                    {day}
                  </span>

                  <div className="flex flex-col gap-1.5 mt-auto">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(ev.type)} shadow-none`}
                        />
                        <span
                          className={`text-[10px] font-medium truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}
                        >
                          {ev.time} {ev.title}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-slate-600 pl-3">
                        +{dayEvents.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Panel (Smart Agenda) */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <Plus size={20} />
          Nuevo Evento
        </button>

        <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Agenda del Día</h3>
              <p className="text-sm text-slate-400">
                {selectedDay} de {monthNames[currentDate.getMonth()]}
              </p>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <MoreHorizontal size={18} className="text-slate-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
            {selectedDayEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 opacity-60">
                <CalendarIcon size={40} strokeWidth={1} />
                <p className="text-sm">No hay eventos para este día</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Programar algo ahora
                </button>
              </div>
            ) : (
              selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="group relative pl-4 pb-4 border-l border-slate-800 last:border-l-0 last:pb-0"
                >
                  <div
                    className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${getEventTypeColor(ev.type)}`}
                  />

                  <div className="bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 rounded-xl p-4 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(ev.type)}
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide opacity-80">
                          {ev.type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">{ev.duration}</span>
                    </div>
                    <h4 className="text-white font-bold mb-1 group-hover:text-indigo-300 transition-colors">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      {ev.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dynamic Smart Insight */}
          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-indigo-200 mb-1">Teacher Insight</h5>
              <p className="text-xs text-slate-400 leading-relaxed">{getInsightMessage()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 animation-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nuevo Evento</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Título
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ej: Clase de React"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                    placeholder="Ej: 60m"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Tipo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['class', 'exam', 'mentoring'].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setNewEvent({ ...newEvent, type: type as 'class' | 'exam' | 'mentoring' })
                      }
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        newEvent.type === type
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {type === 'class' && <Video size={14} />}
                      {type === 'exam' && <FileText size={14} />}
                      {type === 'mentoring' && <Zap size={14} />}
                      <span className="capitalize">
                        {type === 'class' ? 'Clase' : type === 'exam' ? 'Examen' : 'Mentoría'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEvent}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <Check size={18} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
