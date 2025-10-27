'use client';

import { useState } from 'react';
import { Play, Lock, Star, Zap, Trophy, Target, ChevronRight } from 'lucide-react';

/**
 * 🎮 CONSOLA DE VIDEOJUEGOS - MES DE MATEMÁTICA APLICADA
 * Mejor organización: Header → Hero → Grid Misiones → Sidebar
 */

interface Actividad {
  id: string;
  tipo: 'quiz' | 'ejercicios' | 'proyecto';
  titulo: string;
  descripcion: string;
  duracion: string;
  puntos: number;
  completada: boolean;
  bloqueada: boolean;
  color: string;
}

export default function EstudiantePlanificacionesPage() {
  const [selectedActivity, setSelectedActivity] = useState<string>('quiz-proporciones');

  const mundo = {
    nombre: 'LABORATORIO QUÍMICO',
    nivel: 1,
    icono: '🧪',
    progreso: 0,
    puntosActuales: 0,
    puntosTotal: 100,
  };

  const actividades: Actividad[] = [
    {
      id: 'quiz-proporciones',
      tipo: 'quiz',
      titulo: 'Proporciones Químicas',
      descripcion: 'Mezcla los elementos correctos',
      duracion: '5 MIN',
      puntos: 20,
      completada: false,
      bloqueada: false,
      color: 'bg-blue-600',
    },
    {
      id: 'ejercicios-mezclas',
      tipo: 'ejercicios',
      titulo: 'Cálculo de Mezclas',
      descripcion: 'Resuelve las ecuaciones',
      duracion: '10 MIN',
      puntos: 30,
      completada: false,
      bloqueada: false,
      color: 'bg-purple-600',
    },
    {
      id: 'proyecto-experimento',
      tipo: 'proyecto',
      titulo: 'Experimento Final',
      descripcion: 'Crea tu fórmula maestra',
      duracion: '15 MIN',
      puntos: 50,
      completada: false,
      bloqueada: false,
      color: 'bg-orange-600',
    },
  ];

  const selectedActivityData = actividades.find(a => a.id === selectedActivity) || actividades[0];

  return (
    <div className="space-y-6">

      {/* SECCIÓN 1: Header con Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white uppercase mb-1">Mes Matemático</h1>
          <p className="text-slate-400 font-medium">Nivel {mundo.nivel} · {mundo.puntosActuales}/{mundo.puntosTotal} XP</p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-yellow-500/20 border-2 border-yellow-500/50">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
              <span className="text-2xl font-black text-yellow-400">{mundo.puntosActuales}</span>
            </div>
            <p className="text-[10px] font-bold text-yellow-300/60 uppercase mt-0.5">Estrellas</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-orange-500/20 border-2 border-orange-500/50">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" fill="currentColor" />
              <span className="text-2xl font-black text-orange-400">0</span>
            </div>
            <p className="text-[10px] font-bold text-orange-300/60 uppercase mt-0.5">Racha</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-500/20 border-2 border-purple-500/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" fill="currentColor" />
              <span className="text-2xl font-black text-purple-400">1</span>
            </div>
            <p className="text-[10px] font-bold text-purple-300/60 uppercase mt-0.5">Nivel</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Hero - Mundo Actual */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 to-emerald-600/30" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />

        <div className="relative p-8 flex items-center justify-between">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 mb-3">
              <span className="text-xs font-black text-green-300 uppercase">Mundo {mundo.nivel}</span>
            </div>
            <h2 className="text-5xl font-black text-white uppercase mb-3">{mundo.nombre}</h2>
            <p className="text-lg text-white/80 mb-6 max-w-2xl">
              ¡Ayuda al Dr. Números a resolver el misterio del líquido químico! Completa las misiones y descubre los secretos de las proporciones.
            </p>

            {/* Barra de progreso */}
            <div className="max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white uppercase">Progreso</span>
                <span className="text-sm font-bold text-white">{mundo.progreso}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${mundo.progreso}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-2">Completa las 3 misiones para desbloquear el siguiente mundo</p>
            </div>
          </div>

          {/* Emoji grande */}
          <div className="text-9xl ml-8">{mundo.icono}</div>
        </div>
      </div>

      {/* SECCIÓN 3: Misiones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-black text-white uppercase flex items-center gap-3">
            <Target className="w-7 h-7 text-purple-400" />
            Misiones Disponibles
          </h3>
          <span className="text-sm text-slate-400 font-medium">{actividades.filter(a => !a.completada).length} pendientes</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {actividades.map((actividad, index) => (
            <button
              key={actividad.id}
              onClick={() => setSelectedActivity(actividad.id)}
              className={`relative text-left transition-all ${
                selectedActivity === actividad.id
                  ? 'scale-105 ring-4 ring-white/50'
                  : 'hover:scale-102'
              }`}
            >
              <div className="relative rounded-2xl overflow-hidden border-4 border-slate-700 group">
                {/* Header de la card */}
                <div className={`${actividad.color} p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-14 h-14 rounded-xl bg-black/30 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">{index + 1}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">+{actividad.puntos}</div>
                      <div className="text-xs font-bold text-white/70 uppercase">XP</div>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-white uppercase mb-1">{actividad.titulo}</h4>
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-xs font-bold uppercase">{actividad.tipo}</span>
                    <span className="text-white/50">•</span>
                    <span className="text-xs font-bold">{actividad.duracion}</span>
                  </div>
                </div>

                {/* Body de la card */}
                <div className="bg-slate-800 p-4">
                  <p className="text-sm text-slate-300 mb-4">{actividad.descripcion}</p>

                  {/* Botón */}
                  {actividad.completada ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-green-500/20 border-2 border-green-500/50 text-green-400 font-black uppercase text-sm">
                      <Star className="w-5 h-5" fill="currentColor" />
                      Completado
                    </div>
                  ) : actividad.bloqueada ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-700/50 border-2 border-slate-600 text-slate-400 font-black uppercase text-sm">
                      <Lock className="w-5 h-5" />
                      Bloqueado
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white text-slate-900 font-black uppercase text-sm group-hover:bg-white/90 transition-colors">
                      <Play className="w-5 h-5" fill="currentColor" />
                      Jugar
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de selección */}
              {selectedActivity === actividad.id && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-black uppercase animate-pulse">
                  Seleccionado
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 4: Próximos Mundos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
            <Lock className="w-6 h-6 text-slate-500" />
            Próximos Mundos
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { nivel: 2, nombre: 'Astronomía', icono: '🪐' },
            { nivel: 3, nombre: 'Física', icono: '⚡' },
            { nivel: 4, nombre: 'Computación', icono: '💻' },
          ].map((mundo) => (
            <div key={mundo.nivel} className="relative rounded-xl bg-slate-800/50 border-2 border-slate-700 p-6 opacity-50">
              <div className="text-5xl mb-3 grayscale">{mundo.icono}</div>
              <div className="text-xs font-black text-slate-500 uppercase mb-1">Nivel {mundo.nivel}</div>
              <div className="text-lg font-black text-slate-400 uppercase">{mundo.nombre}</div>
              <div className="absolute top-4 right-4">
                <Lock className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
