'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Clock, Users, Award, ChevronRight } from 'lucide-react';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  area: 'programacion' | 'matematica' | 'ciencias';
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  duracionSemanas: number;
  totalClases: number;
  edadMinima: number;
  edadMaxima: number;
  precio: number;
  popularidad: number; // 1-5
}

const cursos: Curso[] = [
  {
    id: 'scratch-basico',
    nombre: 'Scratch Básico',
    descripcion: 'Crea tus primeros juegos interactivos con programación visual',
    emoji: '🎮',
    area: 'programacion',
    nivel: 'Principiante',
    duracionSemanas: 6,
    totalClases: 12,
    edadMinima: 7,
    edadMaxima: 11,
    precio: 25000,
    popularidad: 5,
  },
  {
    id: 'python-kids',
    nombre: 'Python para Niños',
    descripcion: 'Aprende tu primer lenguaje de programación profesional',
    emoji: '🐍',
    area: 'programacion',
    nivel: 'Principiante',
    duracionSemanas: 8,
    totalClases: 16,
    edadMinima: 10,
    edadMaxima: 14,
    precio: 30000,
    popularidad: 5,
  },
  {
    id: 'roblox-studio',
    nombre: 'Desarrollo en Roblox',
    descripcion: 'Diseña mundos 3D y publica tus juegos en Roblox',
    emoji: '🎨',
    area: 'programacion',
    nivel: 'Intermedio',
    duracionSemanas: 10,
    totalClases: 18,
    edadMinima: 10,
    edadMaxima: 15,
    precio: 35000,
    popularidad: 5,
  },
  {
    id: 'web-dev-kids',
    nombre: 'Desarrollo Web',
    descripcion: 'Crea páginas web con HTML, CSS y JavaScript',
    emoji: '🌐',
    area: 'programacion',
    nivel: 'Intermedio',
    duracionSemanas: 12,
    totalClases: 20,
    edadMinima: 12,
    edadMaxima: 16,
    precio: 35000,
    popularidad: 4,
  },
  {
    id: 'matematica-olimpiadas',
    nombre: 'Mate para Olimpiadas',
    descripcion: 'Prepárate para competencias con problemas desafiantes',
    emoji: '🏆',
    area: 'matematica',
    nivel: 'Avanzado',
    duracionSemanas: 16,
    totalClases: 24,
    edadMinima: 11,
    edadMaxima: 16,
    precio: 40000,
    popularidad: 4,
  },
  {
    id: 'matematica-basica',
    nombre: 'Mate Divertida',
    descripcion: 'Refuerza fundamentos matemáticos jugando y resolviendo acertijos',
    emoji: '🧮',
    area: 'matematica',
    nivel: 'Principiante',
    duracionSemanas: 8,
    totalClases: 16,
    edadMinima: 8,
    edadMaxima: 12,
    precio: 25000,
    popularidad: 4,
  },
  {
    id: 'fisica-experimentos',
    nombre: 'Física Experimental',
    descripcion: 'Experimentos caseros para entender física de forma práctica',
    emoji: '🔬',
    area: 'ciencias',
    nivel: 'Principiante',
    duracionSemanas: 8,
    totalClases: 14,
    edadMinima: 9,
    edadMaxima: 13,
    precio: 28000,
    popularidad: 3,
  },
  {
    id: 'astronomia-kids',
    nombre: 'Astronomía para Niños',
    descripcion: 'Explora el universo, planetas y estrellas',
    emoji: '🌌',
    area: 'ciencias',
    nivel: 'Principiante',
    duracionSemanas: 6,
    totalClases: 12,
    edadMinima: 8,
    edadMaxima: 14,
    precio: 25000,
    popularidad: 4,
  },
  {
    id: 'quimica-divertida',
    nombre: 'Química Divertida',
    descripcion: 'Reacciones químicas y experimentos seguros en casa',
    emoji: '⚗️',
    area: 'ciencias',
    nivel: 'Intermedio',
    duracionSemanas: 10,
    totalClases: 16,
    edadMinima: 11,
    edadMaxima: 15,
    precio: 30000,
    popularidad: 3,
  },
];

const areaColors = {
  programacion: {
    bg: 'from-[#0ea5e9]/20 to-[#0ea5e9]/5',
    border: 'border-[#0ea5e9]/30',
    text: 'text-[#0ea5e9]',
    badge: 'bg-[#0ea5e9]/20 border-[#0ea5e9]/30',
  },
  matematica: {
    bg: 'from-[#fbbf24]/20 to-[#fbbf24]/5',
    border: 'border-[#fbbf24]/30',
    text: 'text-[#fbbf24]',
    badge: 'bg-[#fbbf24]/20 border-[#fbbf24]/30',
  },
  ciencias: {
    bg: 'from-[#10b981]/20 to-[#10b981]/5',
    border: 'border-[#10b981]/30',
    text: 'text-[#10b981]',
    badge: 'bg-[#10b981]/20 border-[#10b981]/30',
  },
};

export default function CursosGrid() {
  const [filtroArea, setFiltroArea] = useState<string>('todos');

  const cursosFiltrados =
    filtroArea === 'todos' ? cursos : cursos.filter((c) => c.area === filtroArea);

  return (
    <section className="relative py-32 bg-black">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
            Explorá nuestros <span className="title-gradient">cursos</span>
          </h2>
          <p className="text-2xl text-white/70 max-w-3xl mx-auto mb-8">
            Todos con acceso permanente, proyectos prácticos y certificado final
          </p>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: 'todos', label: '✨ Todos', color: 'white' },
              { id: 'programacion', label: '💻 Programación', color: '#0ea5e9' },
              { id: 'matematica', label: '🧮 Matemática', color: '#fbbf24' },
              { id: 'ciencias', label: '🔬 Ciencias', color: '#10b981' },
            ].map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => setFiltroArea(filtro.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  filtroArea === filtro.id
                    ? 'bg-white/20 border-2 border-white/40 text-white scale-105'
                    : 'bg-white/5 border-2 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid de cursos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {cursosFiltrados.map((curso, index) => {
            const colors = areaColors[curso.area];

            return (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-3xl blur-xl group-hover:blur-2xl transition-all`}
                />

                {/* Card */}
                <div
                  className={`relative bg-black/60 backdrop-blur-xl border-2 ${colors.border} rounded-3xl p-6 hover:border-white/40 transition-all h-full flex flex-col`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{curso.emoji}</div>
                    {curso.popularidad >= 4 && (
                      <span className="px-3 py-1 bg-[#fbbf24]/20 border border-[#fbbf24]/30 rounded-full text-[#fbbf24] text-xs font-bold">
                        🔥 POPULAR
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <h3 className="text-2xl font-black text-white mb-2">{curso.nombre}</h3>

                  {/* Descripción */}
                  <p className="text-white/70 mb-4 flex-grow">{curso.descripcion}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-3 py-1 ${colors.badge} border rounded-full text-xs font-bold ${colors.text}`}
                    >
                      {curso.nivel}
                    </span>
                    <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white/70">
                      {curso.edadMinima}-{curso.edadMaxima} años
                    </span>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <Clock className="w-4 h-4 text-white/40 mx-auto mb-1" />
                      <p className="text-xs text-white/70">{curso.duracionSemanas} sem</p>
                    </div>
                    <div>
                      <Users className="w-4 h-4 text-white/40 mx-auto mb-1" />
                      <p className="text-xs text-white/70">{curso.totalClases} clases</p>
                    </div>
                    <div>
                      <Award className="w-4 h-4 text-white/40 mx-auto mb-1" />
                      <p className="text-xs text-white/70">Certificado</p>
                    </div>
                  </div>

                  {/* Precio y CTA */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-white/50">Desde</p>
                        <p className="text-2xl font-black text-white">
                          ${curso.precio.toLocaleString()}
                        </p>
                      </div>
                      <button
                        className={`px-5 py-3 bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl font-bold ${colors.text} hover:scale-105 transition-all flex items-center gap-2`}
                      >
                        Ver curso
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mensaje adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 text-lg">
            💡 Todos los cursos incluyen <strong className="text-white">acceso permanente</strong>,
            <strong className="text-white"> proyectos prácticos</strong> y
            <strong className="text-white"> certificado final</strong>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
