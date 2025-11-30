'use client';

import { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { COURSES } from '@/data/colonia-courses';
import type { Course, CourseSchedule, DayOfWeek } from '@/types/colonia';

export default function ScheduleGrid() {
  const days: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves'];
  const [activeDay, setActiveDay] = useState(0);

  // Helper function to calculate duration
  const calculateDuration = (timeSlot: string): number => {
    const times = timeSlot.split('-').map((time) => {
      const parts = time.split(':').map(Number);
      const hours = parts[0] ?? 0;
      const minutes = parts[1] ?? 0;
      return hours * 60 + minutes;
    });
    const start = times[0] ?? 0;
    const end = times[1] ?? 0;
    return end - start;
  };

  // Get ALL courses for a specific day (sorted by time)
  const getAllCoursesForDay = (
    day: DayOfWeek,
  ): Array<{ course: Course; schedule: CourseSchedule }> => {
    const results: Array<{ course: Course; schedule: CourseSchedule }> = [];
    for (const course of COURSES) {
      for (const schedule of course.schedules) {
        if (schedule.dayOfWeek === day) {
          results.push({ course, schedule });
        }
      }
    }
    // Sort by time slot
    return results.sort((a, b) => {
      const timeA = a.schedule.timeSlot.split('-')[0] ?? '';
      const timeB = b.schedule.timeSlot.split('-')[0] ?? '';
      return timeA.localeCompare(timeB);
    });
  };

  // Navigation functions
  const nextDay = () => {
    if (activeDay < days.length - 1) {
      setActiveDay(activeDay + 1);
    }
  };

  const prevDay = () => {
    if (activeDay > 0) {
      setActiveDay(activeDay - 1);
    }
  };

  return (
    <section id="horarios" className="relative py-32 bg-gradient-to-b from-black to-[#1a1a2e]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-6">
            <Calendar className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Horarios
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6">
            ORGANIZA TU
            <br />
            <span className="title-gradient">SEMANA</span>
          </h2>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Lunes a Jueves. Viernes, sábado y domingo libres para disfrutar el verano.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Current Day Indicator */}
          <div className="text-center mb-8">
            <div className="inline-block card-glass rounded-2xl border-2 border-[#fbbf24]/30 px-8 py-4">
              <h3 className="text-3xl md:text-4xl font-black text-white">{days[activeDay]}</h3>
            </div>
          </div>

          {/* Carousel Track Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${activeDay * 100}%)`,
                willChange: 'transform',
              }}
            >
              {/* Slides - One per day */}
              {days.map((day) => {
                const coursesForDay = getAllCoursesForDay(day);

                return (
                  <div key={day} className="w-full flex-shrink-0 px-4" style={{ minWidth: '100%' }}>
                    {/* Courses List */}
                    <div className="space-y-3">
                      {coursesForDay.map(({ course, schedule }) => {
                        return (
                          <div
                            key={schedule.id}
                            className="group relative card-glass rounded-xl border-2 border-white/10 transition-all hover:scale-[1.005] cursor-pointer overflow-hidden"
                            style={{
                              minHeight: '110px',
                              backfaceVisibility: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = course.color;
                              e.currentTarget.style.boxShadow = `0 0 30px ${course.color}60`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div className="flex min-h-[110px]">
                              {/* Left Sidebar - Horario (20% width) */}
                              <div
                                className="flex-shrink-0 w-[20%] min-w-[100px] flex flex-col items-center justify-center gap-2 border-r-2"
                                style={{
                                  backgroundColor: `${course.color}15`,
                                  borderColor: `${course.color}40`,
                                }}
                              >
                                <Clock className="w-6 h-6" style={{ color: course.color }} />
                                <div className="text-center px-2">
                                  <div
                                    className="text-sm md:text-base font-black leading-tight"
                                    style={{ color: course.color }}
                                  >
                                    {schedule.timeSlot}
                                  </div>
                                  <div className="text-[10px] text-white/60 font-bold mt-1">
                                    {calculateDuration(schedule.timeSlot)} min
                                  </div>
                                </div>
                              </div>

                              {/* Right Content - Course Info (80% width) */}
                              <div className="flex-1 p-4 flex items-center gap-4">
                                {/* Icon */}
                                <div
                                  className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                                  style={{
                                    backgroundColor: `${course.color}20`,
                                    border: `2px solid ${course.color}40`,
                                  }}
                                >
                                  {course.icon}
                                </div>

                                {/* Course Name & Area */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm md:text-base font-black text-white leading-tight mb-1">
                                    {course.name}
                                  </h4>
                                  <div
                                    className="text-[10px] md:text-xs font-bold"
                                    style={{ color: course.color }}
                                  >
                                    {course.area}
                                  </div>
                                </div>

                                {/* Right Side - Age + Instructor */}
                                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                  <div
                                    className="px-3 py-1 rounded-full text-xs font-black"
                                    style={{
                                      backgroundColor: `${course.color}30`,
                                      color: course.color,
                                    }}
                                  >
                                    {course.ageRange} años
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                                      style={{
                                        backgroundColor: `${course.color}40`,
                                        color: course.color,
                                      }}
                                    >
                                      {schedule.instructor[0]}
                                    </div>
                                    <span className="text-white/70 text-xs font-semibold hidden sm:inline">
                                      {schedule.instructor}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Glow effect on hover - inset para evitar cortes */}
                            <div
                              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                              style={{
                                background: `radial-gradient(circle at center, ${course.color}20 0%, transparent 60%)`,
                                boxShadow: `inset 0 0 40px ${course.color}30`,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* Previous Button */}
            <button
              onClick={prevDay}
              disabled={activeDay === 0}
              className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-white group-disabled:text-white/30" />
              <div className="text-left hidden sm:block">
                <div className="text-xs text-white/50 font-bold uppercase">Anterior</div>
                {activeDay > 0 && (
                  <div className="text-sm text-white font-black">{days[activeDay - 1]}</div>
                )}
              </div>
            </button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-2">
              {days.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(index)}
                  className="group relative"
                  aria-label={`Ir a ${day}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeDay
                        ? 'bg-[#fbbf24] scale-125'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-black/90 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {day}
                  </div>
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextDay}
              disabled={activeDay === days.length - 1}
              className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs text-white/50 font-bold uppercase">Siguiente</div>
                {activeDay < days.length - 1 && (
                  <div className="text-sm text-white font-black">{days[activeDay + 1]}</div>
                )}
              </div>
              <ChevronRight className="w-6 h-6 text-white group-disabled:text-white/30" />
            </button>
          </div>

          {/* Mobile: Swipe Hint */}
          <div className="text-center mt-6 sm:hidden">
            <p className="text-xs text-white/40">
              👆 Deslizá o usá las flechas para ver otros días
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="card-glass rounded-2xl md:rounded-3xl border-2 border-white/10 p-6 md:p-8 max-w-4xl mx-auto text-center mb-12">
          <div className="text-white/80 text-base md:text-lg leading-relaxed">
            <strong className="text-white font-black">
              Podés tomar todos los cursos que quieras.
            </strong>
            <br />
            Elegí los horarios que mejor se adapten a tu rutina de verano.
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {[
            { area: 'Matemática', color: '#10b981', icon: '📊' },
            { area: 'Didáctica de la Matemática', color: '#10b981', icon: '🌟' },
            { area: 'Programación', color: '#f43f5e', icon: '💻' },
            { area: 'Ciencias', color: '#0ea5e9', icon: '🔬' },
          ].map((item) => (
            <div key={item.area} className="flex items-center gap-2 md:gap-3">
              <div
                className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs md:text-sm font-bold text-white/70">
                {item.icon} {item.area}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
