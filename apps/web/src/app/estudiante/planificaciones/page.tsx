'use client';

import { useState } from 'react';
import { Gamepad2, Play, Lock, Star, Zap, Crown, ChevronRight } from 'lucide-react';

/**
 * 🎮 CONSOLA DE VIDEOJUEGOS - MES DE MATEMÁTICA APLICADA
 *
 * Diseño inspirado en:
 * - Nintendo Switch UI
 * - PlayStation 5 Dashboard
 * - Xbox Series UI
 *
 * Features:
 * - Cards grandes horizontales (como juegos en consola)
 * - Íconos/badges tipo achievement
 * - Colores vibrantes pero equilibrados
 * - Navegación tipo carrusel
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
  imagen: string; // Color de fondo
}

export default function EstudiantePlanificacionesPage() {
  const [selectedActivity, setSelectedActivity] = useState<string>('quiz-proporciones');

  // Datos hardcodeados - MVP
  const mundo = {
    nombre: 'LABORATORIO QUÍMICO',
    nivel: 1,
    icono: '🧪',
    colorPrimario: '#10b981', // green-500
    colorSecundario: '#059669', // green-600
    puntosActuales: 0,
    puntosTotal: 100,
    progreso: 0, // 0-100
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
    <div className="min-h-screen">
      {/* Header tipo consola */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              MES MATEMÁTICO
            </h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wide">Nivel {mundo.nivel} · {mundo.puntosActuales}/{mundo.puntosTotal} XP</p>
          </div>
        </div>

        {/* Stats rápidas tipo achievement */}
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
            <span className="text-yellow-400 font-black">{mundo.puntosActuales}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-orange-500/10 border-2 border-orange-500/30 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" fill="currentColor" />
            <span className="text-orange-400 font-black">0</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-400" fill="currentColor" />
            <span className="text-purple-400 font-black">1</span>
          </div>
        </div>
      </div>

      {/* Mundo actual - Hero tipo portada de juego */}
      <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700">
        {/* Fondo gradiente del mundo */}
        <div
          className="absolute inset-0 bg-gradient-to-br opacity-40"
          style={{
            backgroundImage: `linear-gradient(135deg, ${mundo.colorPrimario} 0%, ${mundo.colorSecundario} 100%)`
          }}
        />

        {/* Grid pattern overlay */}
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

        {/* Contenido */}
        <div className="relative z-10 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3">
                <span className="text-xs font-black text-white uppercase tracking-wider">Mundo {mundo.nivel}</span>
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">
                {mundo.nombre}
              </h2>
              <p className="text-lg text-white/80 font-medium">
                ¡Ayuda al Dr. Números a resolver el misterio del líquido químico!
              </p>
            </div>

            {/* Icono grande del mundo */}
            <div className="text-8xl opacity-90 drop-shadow-2xl">
              {mundo.icono}
            </div>
          </div>

          {/* Barra de progreso tipo loading screen */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-white uppercase tracking-wide">Progreso del Mundo</span>
              <span className="text-sm font-black text-white">{mundo.progreso}%</span>
            </div>
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${mundo.progreso}%` }}
              />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Selector de actividades - Grid tipo consola */}
      <div className="mb-8">
        <h3 className="text-xl font-black text-white uppercase tracking-wide mb-4 flex items-center gap-3">
          <Play className="w-6 h-6 text-purple-400" />
          Selecciona tu Misión
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {actividades.map((actividad, index) => (
            <button
              key={actividad.id}
              onClick={() => setSelectedActivity(actividad.id)}
              className={`relative group text-left transition-all duration-200 ${
                selectedActivity === actividad.id
                  ? 'scale-100'
                  : 'scale-95 opacity-60 hover:opacity-100'
              }`}
            >
              {/* Card principal - Estilo portada de juego horizontal */}
              <div className={`relative h-40 rounded-2xl overflow-hidden border-4 transition-all ${
                selectedActivity === actividad.id
                  ? 'border-white shadow-2xl shadow-purple-500/50'
                  : 'border-slate-700 hover:border-slate-600'
              }`}>
                {/* Fondo gradiente */}
                <div className={`absolute inset-0 bg-gradient-to-r ${actividad.imagen}`} />

                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-slate-900/40" />

                {/* Pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Contenido */}
                <div className="relative h-full flex items-center justify-between p-6">
                  <div className="flex items-center gap-6">
                    {/* Número de misión */}
                    <div className="w-20 h-20 rounded-xl bg-slate-900/50 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                      <span className="text-4xl font-black text-white">{index + 1}</span>
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded bg-black/40 backdrop-blur-sm text-xs font-black text-white uppercase">
                          {actividad.tipo}
                        </span>
                        <span className="text-yellow-400 font-black text-sm">+{actividad.puntos} XP</span>
                        <span className="text-white/60 text-sm">•</span>
                        <span className="text-white/80 font-bold text-sm">{actividad.duracion}</span>
                      </div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                        {actividad.titulo}
                      </h4>
                      <p className="text-white/70 font-medium">
                        {actividad.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Estado e indicador */}
                  <div className="flex flex-col items-end gap-3">
                    {actividad.completada ? (
                      <div className="px-4 py-2 rounded-xl bg-green-500 flex items-center gap-2">
                        <Star className="w-5 h-5 text-white" fill="currentColor" />
                        <span className="text-white font-black uppercase text-sm">Completo</span>
                      </div>
                    ) : actividad.bloqueada ? (
                      <div className="px-4 py-2 rounded-xl bg-slate-700 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-400 font-black uppercase text-sm">Bloqueado</span>
                      </div>
                    ) : selectedActivity === actividad.id ? (
                      <div className="px-4 py-2 rounded-xl bg-white flex items-center gap-2 animate-pulse">
                        <Play className="w-5 h-5 text-slate-900" fill="currentColor" />
                        <span className="text-slate-900 font-black uppercase text-sm">Presiona A</span>
                      </div>
                    ) : (
                      <ChevronRight className="w-8 h-8 text-white/40 group-hover:text-white/60 transition-colors" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Botón de inicio - Estilo PlayStation/Xbox */}
      {!selectedActivityData.bloqueada && !selectedActivityData.completada && (
        <div className="mb-8">
          <button className="w-full h-20 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 flex items-center justify-center gap-4 group border-4 border-purple-400">
            <Play className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="currentColor" />
            <span className="text-3xl font-black text-white uppercase tracking-wide">
              Iniciar Misión
            </span>
          </button>
        </div>
      )}

      {/* Mundos próximos - Estilo carrusel de juegos */}
      <div className="rounded-3xl bg-slate-800/30 backdrop-blur-xl border-2 border-slate-700/50 p-6">
        <h3 className="text-lg font-black text-white uppercase tracking-wide mb-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-slate-500" />
          Próximos Mundos
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {mundosProximos.map((mundo) => (
            <div
              key={mundo.nivel}
              className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-700/50 group opacity-60"
            >
              <div className="absolute inset-0 bg-slate-900" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl mb-3 grayscale">{mundo.icono}</div>
                <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase">Nivel {mundo.nivel}</span>
                </div>
                <span className="text-sm font-black text-slate-500 uppercase text-center px-2">
                  {mundo.nombre}
                </span>
              </div>
              {/* Candado overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
                <Lock className="w-10 h-10 text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
