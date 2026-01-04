import React from 'react';
import { Users, Clock, ArrowRight, Layers } from 'lucide-react';
import { Course } from '../../types/docente.types';

const courses: Course[] = [
  {
    id: '1',
    title: 'Roblox Studio: Creá tu primer Videojuego',
    ageGroup: '8-10 años',
    schedule: 'Lun 14:30',
    enrolled: 1,
    capacity: 15,
    progress: 15,
    image: 'https://picsum.photos/seed/roblox/400/200',
  },
  {
    id: '2',
    title: 'Python Essentials: Nivel 1',
    ageGroup: '12-15 años',
    schedule: 'Mar 17:00',
    enrolled: 12,
    capacity: 20,
    progress: 45,
    image: 'https://picsum.photos/seed/python/400/200',
  },
  {
    id: '3',
    title: 'Desarrollo Web con React',
    ageGroup: 'Avanzado',
    schedule: 'Jue 18:00',
    enrolled: 18,
    capacity: 20,
    progress: 80,
    image: 'https://picsum.photos/seed/react/400/200',
  },
  {
    id: '4',
    title: 'Intro a Unity 3D',
    ageGroup: '15+ años',
    schedule: 'Vie 16:00',
    enrolled: 8,
    capacity: 15,
    progress: 10,
    image: 'https://picsum.photos/seed/unity/400/200',
  },
];

export const CourseList: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
      <div className="p-5 border-b border-slate-800/50 flex items-center justify-between shrink-0">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-indigo-400" />
          Comisiones
        </h3>
        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wide">
          Ver Todo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            {/* Image */}
            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-200 text-sm truncate group-hover:text-white">
                {course.title}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <Clock size={10} /> {course.schedule}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <Users size={10} /> {course.enrolled}/{course.capacity}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${course.progress}%` }} />
              </div>
              <ArrowRight
                size={14}
                className="text-slate-600 group-hover:text-indigo-400 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
