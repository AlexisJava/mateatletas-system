'use client';

import { useState } from 'react';
import { Play, Lock, Star, Zap, Trophy } from 'lucide-react';

interface Actividad {
  id: string;
  numero: number;
  tipo: 'QUIZ' | 'EJERCICIOS' | 'PROYECTO';
  titulo: string;
  descripcion: string;
  duracion: string;
  puntos: number;
  completada: boolean;
  bloqueada: boolean;
  colorHeader: string;
  colorBg: string;
}

export default function EstudiantePlanificacionesPage() {
  const [selectedActivity, setSelectedActivity] = useState<string>('quiz-proporciones');

  const mundo = {
    nombre: 'LABORATORIO QUÍMICO',
    numeroMundo: 1,
    icono: '🧪',
    progreso: 0,
  };

  const stats = {
    estrellas: 0,
    racha: 0,
    nivel: 1,
  };

  const actividades: Actividad[] = [
    {
      id: 'quiz-proporciones',
      numero: 1,
      tipo: 'QUIZ',
      titulo: 'PROPORCIONES QUÍMICAS',
      descripcion: 'Mezcla los elementos correctos',
      duracion: '5 MIN',
      puntos: 20,
      completada: false,
      bloqueada: false,
      colorHeader: 'bg-blue-600',
      colorBg: 'from-blue-600 to-blue-700',
    },
    {
      id: 'ejercicios-mezclas',
      numero: 2,
      tipo: 'EJERCICIOS',
      titulo: 'CÁLCULO DE MEZCLAS',
      descripcion: 'Resuelve las ecuaciones',
      duracion: '10 MIN',
      puntos: 30,
      completada: false,
      bloqueada: false,
      colorHeader: 'bg-purple-600',
      colorBg: 'from-purple-600 to-purple-700',
    },
    {
      id: 'proyecto-experimento',
      numero: 3,
      tipo: 'PROYECTO',
      titulo: 'EXPERIMENTO FINAL',
      descripcion: 'Crea tu fórmula maestra',
      duracion: '15 MIN',
      puntos: 50,
      completada: false,
      bloqueada: false,
      colorHeader: 'bg-orange-600',
      colorBg: 'from-orange-600 to-orange-700',
    },
  ];

  const proximosMundos = [
    { nivel: 2, nombre: 'ASTRONOMÍA', icono: '🪐' },
    { nivel: 3, nombre: 'FÍSICA', icono: '⚡' },
    { nivel: 4, nombre: 'COMPUTACIÓN', icono: '💻' },
  ];

  return (
    <div className="space-y-6">

      {/* Header con Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">MES MATEMÁTICO</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Nivel {stats.nivel} · 0/100 XP</p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30">
            <div className="flex items-center gap-2 mb-0.5">
              <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
              <span className="text-2xl font-black text-yellow-400">{stats.estrellas}</span>
            </div>
            <p className="text-[10px] font-bold text-yellow-400/60 uppercase text-center">Estrellas</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-orange-500/10 border-2 border-orange-500/30">
            <div className="flex items-center gap-2 mb-0.5">
              <Zap className="w-5 h-5 text-orange-400" fill="currentColor" />
              <span className="text-2xl font-black text-orange-400">{stats.racha}</span>
            </div>
            <p className="text-[10px] font-bold text-orange-400/60 uppercase text-center">Racha</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-500/10 border-2 border-purple-500/30">
            <div className="flex items-center gap-2 mb-0.5">
              <Trophy className="w-5 h-5 text-purple-400" fill="currentColor" />
              <span className="text-2xl font-black text-purple-400">{stats.nivel}</span>
            </div>
            <p className="text-[10px] font-bold text-purple-400/60 uppercase text-center">Nivel</p>
          </div>
        </div>
      </div>

      {/* Hero - Mundo Actual */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-slate-700/50 shadow-2xl">
        {/* Background con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-green-600/20 to-emerald-600/20" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Badge mundo */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/40 backdrop-blur-sm mb-4">
                <span className="text-xs font-black text-green-300 uppercase tracking-wide">Mundo {mundo.numeroMundo}</span>
              </div>

              {/* Título */}
              <h2 className="text-5xl font-black text-white uppercase mb-3 drop-shadow-lg">
                {mundo.nombre}
              </h2>

              {/* Descripción */}
              <p className="text-lg text-white/90 mb-6 max-w-2xl font-medium leading-relaxed">
                ¡Ayuda al Dr. Números a resolver el misterio del líquido químico!
              </p>

              {/* Barra de progreso */}
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white uppercase tracking-wide">PROGRESO</span>
                  <span className="text-sm font-black text-white">{mundo.progreso}%</span>
                </div>
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${mundo.progreso}%` }}
                  />
                  {/* Brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>

            {/* Emoji gigante */}
            <div className="text-9xl drop-shadow-2xl ml-8">
              {mundo.icono}
            </div>
          </div>
        </div>
      </div>

      {/* Misiones Disponibles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
            MISIONES DISPONIBLES
          </h3>
          <span className="text-sm text-slate-400 font-medium">
            {actividades.filter(a => !a.completada).length} pendientes
          </span>
        </div>

        {/* Grid horizontal 3 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {actividades.map((actividad) => (
            <button
              key={actividad.id}
              onClick={() => setSelectedActivity(actividad.id)}
              className={`group relative text-left transition-all duration-200 ${
                selectedActivity === actividad.id
                  ? 'scale-105'
                  : 'hover:scale-102 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Card */}
              <div className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
                selectedActivity === actividad.id
                  ? 'border-white shadow-2xl shadow-purple-500/50'
                  : 'border-slate-700/50 shadow-xl'
              }`}>

                {/* Header colorido */}
                <div className={`${actividad.colorHeader} p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    {/* Número */}
                    <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                      <span className="text-3xl font-black text-white">{actividad.numero}</span>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="text-3xl font-black text-white leading-none">+{actividad.puntos}</div>
                      <div className="text-xs font-bold text-white/80 uppercase tracking-wide">XP</div>
                    </div>
                  </div>

                  {/* Título */}
                  <h4 className="text-xl font-black text-white uppercase mb-1 leading-tight">
                    {actividad.titulo}
                  </h4>

                  {/* Metadatos */}
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="text-xs font-bold uppercase tracking-wide">{actividad.tipo}</span>
                    <span className="text-white/60">•</span>
                    <span className="text-xs font-bold">{actividad.duracion}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="bg-slate-800 p-4">
                  {/* Descripción */}
                  <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                    {actividad.descripcion}
                  </p>

                  {/* Botón */}
                  {actividad.completada ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 border-2 border-green-500/50 text-green-400 font-black uppercase text-sm">
                      <Star className="w-5 h-5" fill="currentColor" />
                      COMPLETADO
                    </div>
                  ) : actividad.bloqueada ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700/50 border-2 border-slate-600 text-slate-400 font-black uppercase text-sm">
                      <Lock className="w-5 h-5" />
                      BLOQUEADO
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-white/90 text-slate-900 font-black uppercase text-sm transition-all group-hover:shadow-lg">
                      <Play className="w-5 h-5" fill="currentColor" />
                      JUGAR
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de selección */}
              {selectedActivity === actividad.id && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-slate-900 text-xs font-black uppercase shadow-lg animate-pulse">
                  SELECCIONADO
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Próximos Mundos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-6 bg-slate-600 rounded-full" />
            PRÓXIMOS MUNDOS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proximosMundos.map((mundo) => (
            <div
              key={mundo.nivel}
              className="relative rounded-2xl bg-slate-800/30 backdrop-blur-sm border-2 border-slate-700/50 p-6 opacity-60"
            >
              {/* Emoji grayscale */}
              <div className="text-6xl mb-4 grayscale opacity-40">
                {mundo.icono}
              </div>

              {/* Info */}
              <div className="text-xs font-black text-slate-500 uppercase mb-1 tracking-wide">
                NIVEL {mundo.nivel}
              </div>
              <div className="text-lg font-black text-slate-400 uppercase tracking-tight">
                {mundo.nombre}
              </div>

              {/* Candado */}
              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900/50 flex items-center justify-center border-2 border-slate-700">
                  <Lock className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
