'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Calendar, Info } from 'lucide-react';
import type { Course } from '@/types/colonia';
import CourseDetailModal from './CourseDetailModal';

interface CourseCardProps {
  course: Course;
  index: number;
  onInscribe?: () => void;
}

export default function CourseCard({ course, index, onInscribe }: CourseCardProps) {
  const [showModal, setShowModal] = useState(false);

  const handleInscribe = () => {
    if (onInscribe) {
      onInscribe();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group relative card-glass rounded-2xl border-2 border-white/10 p-6 transition-all hover:border-white/30 hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${course.color}10 0%, transparent 100%)`,
        }}
      >
        {/* Área tag */}
        <div
          className="absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider"
          style={{
            backgroundColor: `${course.color}20`,
            color: course.color,
            border: `2px solid ${course.color}40`,
          }}
        >
          {course.area}
        </div>

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4"
          style={{
            backgroundColor: `${course.color}20`,
            border: `2px solid ${course.color}40`,
          }}
        >
          {course.icon}
        </div>

        {/* Course Name */}
        <h3 className="text-2xl font-black text-white mb-3 leading-tight">{course.name}</h3>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed mb-6">{course.description}</p>

        {/* Meta Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white/80 font-medium">{course.ageRange} años</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-5 h-5 text-white/60" />
            <span className="text-white/80 font-medium">
              {course.schedules.length > 1
                ? 'Múltiples horarios disponibles'
                : course.schedules[0].dayOfWeek}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-5 h-5 text-white/60" />
            <span className="text-white/80 font-medium">
              {course.schedules.length > 1
                ? `${course.schedules.length} opciones`
                : course.schedules[0].timeSlot}
            </span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black"
            style={{
              backgroundColor: `${course.color}30`,
              color: course.color,
            }}
          >
            {course.schedules[0].instructor[0]}
          </div>
          <div>
            <div className="text-xs text-white/50">Instructor</div>
            <div className="text-sm font-bold text-white">
              Profe {course.schedules[0].instructor}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* +Info Button */}
          <button
            onClick={() => setShowModal(true)}
            className="py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 flex items-center justify-center gap-2 border-2"
            style={{
              borderColor: course.color,
              color: course.color,
              backgroundColor: 'transparent',
            }}
          >
            <Info className="w-4 h-4" />
            Info
          </button>

          {/* Inscribir Button */}
          <button
            onClick={handleInscribe}
            className="py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: course.color,
              color: 'white',
              boxShadow: `0 10px 30px ${course.color}40`,
            }}
          >
            Inscribir
          </button>
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <CourseDetailModal
          course={course}
          onClose={() => setShowModal(false)}
          onInscribe={() => {
            setShowModal(false);
            handleInscribe();
          }}
        />
      )}
    </>
  );
}
