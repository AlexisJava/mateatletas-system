'use client';

import { useState } from 'react';
import { Gamepad2, Play, Lock, Star, Zap, Crown, ChevronRight } from 'lucide-react';

/**
 * 🎮 CONSOLA DE VIDEOJUEGOS - MES DE MATEMÁTICA APLICADA
 * Grid compacto y denso estilo dashboard de consola
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
  imagen: string;
}

export default function EstudiantePlanificacionesPage() {
  const [selectedActivity, setSelectedActivity] = useState<string>('quiz-proporciones');

  const mundo = {
    nombre: 'LABORATORIO QUÍMICO',
    nivel: 1,
    icono: '🧪',
    colorPrimario: '#10b981',
    colorSecundario: '#059669',
    puntosActuales: 0,
    puntosTotal: 100,
    progreso: 0,
  };

  const actividades: Actividad[] = [
    {
      id: 'quiz-proporciones',
      tipo: 'quiz',
      titulo: 'PROPORCIONES QUÍMICAS',
      descripcion: 'Mezcla los elementos correctos',
      duracion: '5 MIN',
      puntos: 20,
      completada: false,
      bloqueada: false,
      imagen: 'from-blue-600 to-cyan-600',
    },
    {
      id: 'ejercicios-mezclas',
      tipo: 'ejercicios',
      titulo: 'CÁLCULO DE MEZCLAS',
      descripcion: 'Resuelve las ecuaciones',
      duracion: '10 MIN',
      puntos: 30,
      completada: false,
      bloqueada: false,
      imagen: 'from-purple-600 to-pink-600',
    },
    {
      id: 'proyecto-experimento',
      tipo: 'proyecto',
      titulo: 'EXPERIMENTO FINAL',
      descripcion: 'Crea tu fórmula maestra',
      duracion: '15 MIN',
      puntos: 50,
      completada: false,
      bloqueada: false,
      imagen: 'from-orange-600 to-red-600',
    },
  ];

  const selectedActivityData = actividades.find(a => a.id === selectedActivity) || actividades[0];

  const mundosProximos = [
    { nombre: 'ASTRONOMÍA', icono: '🪐', nivel: 2, bloqueado: true },
    { nombre: 'FÍSICA', icono: '⚡', nivel: 3, bloqueado: true },
    { nombre: 'COMPUTACIÓN', icono: '💻', nivel: 4, bloqueado: true },
  ];

  return (
    <div className="h-full">
      {/* Grid principal - 2 columnas */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4 h-full">

        {/* Columna izquierda - Mundo + Misiones */}
        <div className="flex flex-col gap-4">

          {/* Hero compacto */}
          <div className="relative rounded-2xl overflow-hidden border-4 border-slate-700 h-48">
            <div
              className="absolute inset-0 bg-gradient-to-br opacity-40"
              style={{
                backgroundImage: `linear-gradient(135deg, ${mundo.colorPrimario} 0%, ${mundo.colorSecundario} 100%)`
              }}
            />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, white 1px, transparent 1px),
                  linear-gradient(0deg, white 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Mundo {mundo.nivel}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1 drop-shadow-lg">
                    {mundo.nombre}
                  </h2>
                  <p className="text-sm text-white/80 font-medium">
                    ¡Ayuda al Dr. Números a resolver el misterio!
                  </p>
                </div>
                <div className="text-6xl opacity-90 drop-shadow-2xl">
                  {mundo.icono}
                </div>
              </div>

              {/* Barra progreso compacta */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-white uppercase tracking-wide">Progreso</span>
                  <span className="text-xs font-black text-white">{mundo.progreso}%</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{ width: `${mundo.progreso}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Misiones - Grid vertical compacto */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400" />
              Selecciona tu Misión
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {actividades.map((actividad, index) => (
                <button
                  key={actividad.id}
                  onClick={() => setSelectedActivity(actividad.id)}
                  className={`relative group text-left transition-all duration-200 ${
                    selectedActivity === actividad.id
                      ? 'scale-100'
                      : 'scale-98 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`relative h-24 rounded-xl overflow-hidden border-3 transition-all ${
                    selectedActivity === actividad.id
                      ? 'border-white shadow-lg shadow-purple-500/30'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${actividad.imagen}`} />
                    <div className="absolute inset-0 bg-slate-900/40" />

                    <div className="relative h-full flex items-center justify-between px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-slate-900/50 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-black text-white">{index + 1}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-black text-white uppercase">
                              {actividad.tipo}
                            </span>
                            <span className="text-yellow-400 font-black text-xs">+{actividad.puntos} XP</span>
                            <span className="text-white/60 text-xs">•</span>
                            <span className="text-white/80 font-bold text-xs">{actividad.duracion}</span>
                          </div>
                          <h4 className="text-lg font-black text-white uppercase tracking-tight mb-0.5">
                            {actividad.titulo}
                          </h4>
                          <p className="text-white/60 text-xs font-medium">
                            {actividad.descripcion}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {actividad.completada ? (
                          <div className="px-3 py-1.5 rounded-lg bg-green-500 flex items-center gap-1">
                            <Star className="w-4 h-4 text-white" fill="currentColor" />
                            <span className="text-white font-black uppercase text-[10px]">Completo</span>
                          </div>
                        ) : actividad.bloqueada ? (
                          <div className="px-3 py-1.5 rounded-lg bg-slate-700 flex items-center gap-1">
                            <Lock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400 font-black uppercase text-[10px]">Bloqueado</span>
                          </div>
                        ) : selectedActivity === actividad.id ? (
                          <div className="px-3 py-1.5 rounded-lg bg-white flex items-center gap-1 animate-pulse">
                            <Play className="w-4 h-4 text-slate-900" fill="currentColor" />
                            <span className="text-slate-900 font-black uppercase text-[10px]">Presiona A</span>
                          </div>
                        ) : (
                          <ChevronRight className="w-6 h-6 text-white/30 group-hover:text-white/50 transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha - Botón + Próximos mundos */}
        <div className="flex flex-col gap-4">

          {/* Botón iniciar */}
          {!selectedActivityData.bloqueada && !selectedActivityData.completada && (
            <button className="h-20 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 shadow-xl shadow-purple-500/40 transition-all hover:scale-105 flex items-center justify-center gap-3 group border-3 border-purple-400">
              <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" />
              <span className="text-2xl font-black text-white uppercase tracking-wide">
                Iniciar Misión
              </span>
            </button>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-yellow-400 font-black text-sm">{mundo.puntosActuales}</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" fill="currentColor" />
              <span className="text-orange-400 font-black text-sm">0</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-purple-400" fill="currentColor" />
              <span className="text-purple-400 font-black text-sm">1</span>
            </div>
          </div>

          {/* Próximos mundos compactos */}
          <div className="flex-1 rounded-2xl bg-slate-800/30 backdrop-blur-xl border-2 border-slate-700/50 p-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wide mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Próximos Mundos
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {mundosProximos.map((mundo) => (
                <div
                  key={mundo.nivel}
                  className="relative h-16 rounded-xl overflow-hidden border-2 border-slate-700/50 opacity-50"
                >
                  <div className="absolute inset-0 bg-slate-900" />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl grayscale">{mundo.icono}</div>
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Nivel {mundo.nivel}</div>
                        <div className="text-sm font-black text-slate-400 uppercase">{mundo.nombre}</div>
                      </div>
                    </div>
                    <Lock className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
