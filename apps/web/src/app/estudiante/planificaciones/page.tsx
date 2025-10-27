'use client';

import { useState } from 'react';
import { Play, Lock, Star, Zap, Trophy, Target } from 'lucide-react';

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

  return (
    <div className="space-y-4 max-w-7xl">

      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">Mes Matemático</h1>
          <p className="text-xs text-slate-400 font-medium">Nivel {mundo.nivel} · {mundo.puntosActuales}/{mundo.puntosTotal} XP</p>
        </div>

        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-lg font-black text-yellow-400">{mundo.puntosActuales}</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/50">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" fill="currentColor" />
              <span className="text-lg font-black text-orange-400">0</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/50">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-purple-400" fill="currentColor" />
              <span className="text-lg font-black text-purple-400">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Hero + Misiones */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-4">

        {/* Hero compacto */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 to-emerald-600/30" />
          <div className="relative p-5">
            <div className="inline-block px-2 py-0.5 rounded-full bg-green-500/20 border border-green-400/30 mb-2">
              <span className="text-[10px] font-black text-green-300 uppercase">Mundo {mundo.nivel}</span>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white uppercase mb-1">{mundo.nombre}</h2>
                <p className="text-xs text-white/80 leading-relaxed">
                  ¡Ayuda al Dr. Números a resolver el misterio del líquido químico!
                </p>
              </div>
              <div className="text-5xl">{mundo.icono}</div>
            </div>

            {/* Barra progreso */}
            <div className="bg-slate-900/50 rounded-lg p-2.5 border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-white uppercase">Progreso</span>
                <span className="text-xs font-bold text-white">{mundo.progreso}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${mundo.progreso}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Misiones - Grid 3 columnas compacto */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Misiones Disponibles
            </h3>
            <span className="text-xs text-slate-400 font-medium">{actividades.filter(a => !a.completada).length} pendientes</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {actividades.map((actividad, index) => (
              <button
                key={actividad.id}
                onClick={() => setSelectedActivity(actividad.id)}
                className={`relative text-left transition-all ${
                  selectedActivity === actividad.id
                    ? 'ring-2 ring-white/50'
                    : 'hover:ring-2 hover:ring-white/30'
                }`}
              >
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-700">
                  {/* Header */}
                  <div className={`${actividad.color} p-3`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center">
                        <span className="text-xl font-black text-white">{index + 1}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-white">+{actividad.puntos}</div>
                        <div className="text-[9px] font-bold text-white/70 uppercase">XP</div>
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-white uppercase leading-tight">{actividad.titulo}</h4>
                    <div className="flex items-center gap-1.5 text-white/80 mt-1">
                      <span className="text-[9px] font-bold uppercase">{actividad.tipo}</span>
                      <span className="text-white/50">•</span>
                      <span className="text-[9px] font-bold">{actividad.duracion}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="bg-slate-800 p-3">
                    <p className="text-xs text-slate-300 mb-3 leading-snug">{actividad.descripcion}</p>

                    {/* Botón */}
                    {actividad.completada ? (
                      <div className="flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-black uppercase text-[10px]">
                        <Star className="w-3 h-3" fill="currentColor" />
                        Completado
                      </div>
                    ) : actividad.bloqueada ? (
                      <div className="flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 font-black uppercase text-[10px]">
                        <Lock className="w-3 h-3" />
                        Bloqueado
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 py-2 rounded-lg bg-white hover:bg-white/90 text-slate-900 font-black uppercase text-[10px] transition-colors">
                        <Play className="w-3 h-3" fill="currentColor" />
                        Jugar
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Próximos mundos compactos */}
      <div>
        <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-slate-500" />
          Próximos Mundos
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { nivel: 2, nombre: 'Astronomía', icono: '🪐' },
            { nivel: 3, nombre: 'Física', icono: '⚡' },
            { nivel: 4, nombre: 'Computación', icono: '💻' },
          ].map((mundo) => (
            <div key={mundo.nivel} className="relative rounded-lg bg-slate-800/50 border border-slate-700 p-4 opacity-50">
              <div className="text-3xl mb-2 grayscale">{mundo.icono}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase mb-0.5">Nivel {mundo.nivel}</div>
              <div className="text-sm font-black text-slate-400 uppercase">{mundo.nombre}</div>
              <Lock className="absolute top-3 right-3 w-4 h-4 text-slate-600" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
