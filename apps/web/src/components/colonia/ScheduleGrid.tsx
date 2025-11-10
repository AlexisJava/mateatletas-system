'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { COURSES } from '@/data/colonia-courses';
import type { Course, DayOfWeek, TimeSlot } from '@/types/colonia';

export default function ScheduleGrid() {
  const days: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves'];
  const timeSlots: TimeSlot[] = ['10:30-11:30', '10:30-12:00', '14:30-16:00', '15:00-16:00'];

  // Helper function to calculate duration
  const calculateDuration = (timeSlot: string): number => {
    const [start, end] = timeSlot.split('-').map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    });
    return end - start;
  };

  // Get course for specific day and time slot
  const getCourse = (day: DayOfWeek, timeSlot: TimeSlot): Course | null => {
    return COURSES.find(c => c.dayOfWeek === day && c.timeSlot === timeSlot) || null;
  };

  // Render course card
  const renderCourseCell = (course: Course | null, dayIndex: number, timeIndex: number, isMobile: boolean = false) => {
    if (!course) {
      return (
        <div className="h-full min-h-[200px] card-glass rounded-xl border border-white/5 flex items-center justify-center">
          <span className="text-white/20 text-sm">-</span>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: (dayIndex + timeIndex) * 0.05 }}
        className={`group relative h-full ${isMobile ? 'min-h-[180px]' : 'min-h-[200px]'} card-glass rounded-xl border-2 border-white/10 p-4 transition-all hover:scale-[1.02]`}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = course.color;
          e.currentTarget.style.boxShadow = `0 0 20px ${course.color}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Icon + Area */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{course.icon}</span>
          <span
            className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: course.color }}
          >
            {course.area}
          </span>
        </div>

        {/* Course Name */}
        <h3 className="text-sm font-black text-white leading-tight mb-3 line-clamp-2">
          {course.name}
        </h3>

        {/* Age Range */}
        <div className="flex items-center gap-1 mb-2">
          <div className="text-[10px] text-white/50">Edad:</div>
          <div className="text-xs font-bold text-white">{course.ageRange} años</div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 pt-2 mt-auto border-t border-white/10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f97316] flex items-center justify-center text-[10px] font-black">
            {course.instructor[0]}
          </div>
          <div className="text-[10px] font-bold text-white/70">{course.instructor}</div>
        </div>

        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${course.color}10 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    );
  };

  return (
    <section id="horarios" className="relative py-32 bg-gradient-to-b from-black to-[#1a1a2e]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Calendar className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Horarios
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6"
          >
            ORGANIZA TU
            <br />
            <span className="title-gradient">SEMANA</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
          >
            Lunes a Jueves. Viernes, sábado y domingo libres para disfrutar el verano.
          </motion.p>
        </div>

        {/* Calendar Grid */}
        <div className="max-w-7xl mx-auto mb-16">
          {/* Desktop Grid */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header Row - Days */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div></div> {/* Empty corner */}
                {days.map((day, index) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="card-glass rounded-xl border border-[#fbbf24]/20 py-4 px-2">
                      <div className="text-2xl font-black text-white">{day}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Time Slots Rows */}
              {timeSlots.map((timeSlot, timeIndex) => {
                const startHour = parseInt(timeSlot.split(':')[0]);
                const isAfternoon = startHour >= 12;

                return (
                  <motion.div
                    key={timeSlot}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: timeIndex * 0.1 }}
                    className="grid grid-cols-5 gap-4 mb-4"
                  >
                    {/* Time Label */}
                    <div className="flex items-center">
                      <div className="card-glass rounded-xl border-2 border-white/10 p-4 w-full">
                        <div className="flex items-center gap-3">
                          <Clock
                            className="w-6 h-6"
                            style={{ color: isAfternoon ? '#0ea5e9' : '#fbbf24' }}
                          />
                          <div>
                            <div className="text-sm font-black text-white whitespace-nowrap">
                              {timeSlot}
                            </div>
                            <div className="text-[10px] text-white/50">
                              {calculateDuration(timeSlot)}min
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Course Cells */}
                    {days.map((day, dayIndex) => (
                      <div key={`${day}-${timeSlot}`}>
                        {renderCourseCell(getCourse(day, timeSlot), dayIndex, timeIndex)}
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile/Tablet - Stacked by Day */}
          <div className="lg:hidden space-y-8">
            {days.map((day, dayIndex) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
              >
                {/* Day Header */}
                <div className="card-glass rounded-xl border border-[#fbbf24]/20 py-3 px-4 mb-4">
                  <div className="text-2xl font-black text-white text-center">{day}</div>
                </div>

                {/* Day's Courses */}
                <div className="space-y-4">
                  {timeSlots.map((timeSlot, timeIndex) => {
                    const course = getCourse(day, timeSlot);
                    if (!course) return null;

                    return (
                      <div key={timeSlot}>
                        {/* Time Label */}
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-[#fbbf24]" />
                          <span className="text-sm font-bold text-white">{timeSlot}</span>
                          <span className="text-xs text-white/50">
                            ({calculateDuration(timeSlot)}min)
                          </span>
                        </div>
                        {renderCourseCell(course, dayIndex, timeIndex, true)}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-glass rounded-2xl md:rounded-3xl border-2 border-white/10 p-6 md:p-8 max-w-4xl mx-auto text-center mb-12"
        >
          <div className="text-white/80 text-base md:text-lg leading-relaxed">
            <strong className="text-white font-black">Podés tomar todos los cursos que quieras.</strong>
            <br />
            Elegí los horarios que mejor se adapten a tu rutina de verano.
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 md:gap-6"
        >
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
        </motion.div>
      </div>
    </section>
  );
}
