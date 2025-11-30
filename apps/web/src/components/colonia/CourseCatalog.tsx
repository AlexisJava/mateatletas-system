'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import CourseCard from './CourseCard';
import { COURSES } from '@/data/colonia-courses';
import type { CourseArea, AgeRange } from '@/types/colonia';

interface CourseCatalogProps {
  onInscribe: () => void;
}

export default function CourseCatalog({ onInscribe }: CourseCatalogProps) {
  const [selectedArea, setSelectedArea] = useState<CourseArea | 'Todas'>('Todas');
  const [selectedAge, setSelectedAge] = useState<AgeRange | 'Todas'>('Todas');

  // Helper: Check if a specific age falls within a course's age range
  const ageMatchesRange = (selectedRange: AgeRange, courseRange: AgeRange): boolean => {
    // Si seleccionaste un rango específico, necesitamos ver si hay solapamiento
    const selectedParts = selectedRange.split('-').map((n) => parseInt(n));
    const courseParts = courseRange.split('-').map((n) => parseInt(n));

    const selectedMin = selectedParts[0] ?? 0;
    const selectedMax = selectedParts[1] ?? selectedMin;
    const courseMin = courseParts[0] ?? 0;
    const courseMax = courseParts[1] ?? courseMin;

    // Hay solapamiento si: el rango seleccionado y el rango del curso se tocan
    // Ejemplo: seleccionado 8-9, curso 8-12 → hay solapamiento
    // Ejemplo: seleccionado 10-12, curso 8-12 → hay solapamiento
    // Ejemplo: seleccionado 5-6, curso 8-12 → NO hay solapamiento
    return selectedMin <= courseMax && selectedMax >= courseMin;
  };

  // Filter courses
  const filteredCourses = COURSES.filter((course) => {
    const matchesArea = selectedArea === 'Todas' || course.area === selectedArea;
    const matchesAge = selectedAge === 'Todas' || ageMatchesRange(selectedAge, course.ageRange);
    return matchesArea && matchesAge;
  });

  const areas: Array<CourseArea | 'Todas'> = [
    'Todas',
    'Matemática',
    'Didáctica de la Matemática',
    'Programación',
    'Ciencias',
  ];
  const ages: Array<AgeRange | 'Todas'> = ['Todas', '5-6', '6-7', '8-9', '10-12', '13-17'];

  const areaColors: Record<CourseArea | 'Todas', string> = {
    Todas: '#8b5cf6',
    Matemática: '#10b981',
    'Didáctica de la Matemática': '#10b981',
    Programación: '#f43f5e',
    Ciencias: '#0ea5e9',
  };

  return (
    <section id="cursos" className="relative py-32 bg-black">
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
            <Filter className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Catálogo de Cursos
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6"
          >
            ELIGE TU
            <br />
            <span className="title-gradient">AVENTURA</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/70 max-w-2xl mx-auto"
          >
            11 cursos diseñados para que aprendan jugando. Matemática, programación y ciencias como
            nunca antes.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto mb-12">
          {/* Area Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">
              Filtrar por Área
            </h3>
            <div className="flex flex-wrap gap-3">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
                    selectedArea === area ? 'scale-105 shadow-2xl' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: selectedArea === area ? areaColors[area] : 'transparent',
                    color: selectedArea === area ? 'white' : areaColors[area],
                    border: `2px solid ${areaColors[area]}`,
                  }}
                >
                  {area === 'Todas' ? '🌟 ' : ''}
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Age Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">
              Filtrar por Edad
            </h3>
            <div className="flex flex-wrap gap-3">
              {ages.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    selectedAge === age
                      ? 'bg-white text-black scale-105 shadow-2xl'
                      : 'bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {age === 'Todas' ? 'Todas las edades' : `${age} años`}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center text-white/50 text-sm">
            Mostrando {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} onInscribe={onInscribe} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">😢</div>
              <h3 className="text-2xl font-black text-white mb-2">
                No hay cursos con esos filtros
              </h3>
              <p className="text-white/60">Prueba con otra combinación de área y edad</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
