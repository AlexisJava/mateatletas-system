'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, Users, Calendar } from 'lucide-react';
import type { Course } from '@/types/colonia';
import { COURSE_DETAILS_MAP } from '@/data/colonia-courses';

interface CourseDetailModalProps {
  course: Course;
  onClose: () => void;
  onInscribe: () => void;
}

export default function CourseDetailModal({ course, onClose, onInscribe }: CourseDetailModalProps) {
  const details = COURSE_DETAILS_MAP[course.id];

  if (!details) {
    return null;
  }

  const handleInscribe = () => {
    onClose();
    onInscribe();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card-glass rounded-3xl border-2 border-white/20 p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0"
                style={{
                  backgroundColor: `${course.color}20`,
                  border: `2px solid ${course.color}40`,
                }}
              >
                {course.icon}
              </div>
              <div className="flex-1">
                <div
                  className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2"
                  style={{
                    backgroundColor: `${course.color}20`,
                    color: course.color,
                    border: `2px solid ${course.color}40`,
                  }}
                >
                  {course.area}
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">{course.name}</h2>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/60" />
                <span className="text-white/80 font-medium">{course.ageRange} años</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

          {/* Horarios Disponibles */}
          {course.schedules.length > 1 ? (
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-4" style={{ color: course.color }}>
                Horarios Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.schedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black"
                      style={{
                        backgroundColor: `${course.color}30`,
                        color: course.color,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span className="text-white/90 font-bold">{schedule.dayOfWeek}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white/60" />
                        <span className="text-white/80">{schedule.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: `${course.color}30`,
                            color: course.color,
                          }}
                        >
                          {schedule.instructor[0]}
                        </div>
                        <span className="text-white/70 text-sm">Profe {schedule.instructor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            (() => {
              const firstSchedule = course.schedules[0];
              if (!firstSchedule) return null;
              return (
                <div className="mb-8">
                  <div className="flex flex-wrap gap-6 text-sm p-5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-white/60" />
                      <span className="text-white/80 font-medium">{firstSchedule.dayOfWeek}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-white/60" />
                      <span className="text-white/80 font-medium">{firstSchedule.timeSlot}</span>
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${course.color}20`,
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: course.color }}>
                        Profe {firstSchedule.instructor}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Descripción */}
          <div className="mb-8">
            <p className="text-white/80 text-lg leading-relaxed">{course.description}</p>
          </div>

          {/* Temario */}
          <div className="mb-8">
            <h3 className="text-2xl font-black mb-4" style={{ color: course.color }}>
              ¿Qué vas a aprender?
            </h3>
            <div className="space-y-3">
              {details.temario.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                    style={{
                      backgroundColor: `${course.color}30`,
                      color: course.color,
                    }}
                  >
                    {index + 1}
                  </div>
                  <p className="text-white/80 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Objetivos */}
          <div className="mb-8">
            <h3 className="text-2xl font-black mb-4" style={{ color: course.color }}>
              Objetivos del Curso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.objetivos.map((objetivo, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <CheckCircle
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: course.color }}
                  />
                  <p className="text-white/80 leading-relaxed">{objetivo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metodología */}
          <div className="mb-8">
            <h3 className="text-2xl font-black mb-4" style={{ color: course.color }}>
              Metodología
            </h3>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/80 leading-relaxed text-lg">{details.metodologia}</p>
            </div>
          </div>

          {/* Requisitos */}
          <div className="mb-8">
            <h3 className="text-2xl font-black mb-4" style={{ color: course.color }}>
              Requisitos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {details.requisitos.map((requisito, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: course.color }}
                  />
                  <p className="text-white/80">{requisito}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-xl font-bold text-lg uppercase tracking-wider transition-all hover:scale-105 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20"
            >
              Cerrar
            </button>
            <button
              onClick={handleInscribe}
              className="flex-1 py-4 px-6 rounded-xl font-black text-lg uppercase tracking-wider transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                backgroundColor: course.color,
                color: 'white',
                boxShadow: `0 10px 40px ${course.color}40`,
              }}
            >
              QUIERO ESTE CURSO
              <span className="text-xl">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
