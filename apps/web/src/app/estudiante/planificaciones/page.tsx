'use client';

import { useState } from 'react';
import { Beaker, Sparkles, Play, CheckCircle, Lock, Trophy, Star, Flame } from 'lucide-react';

/**
 * 🧪 MES DE MATEMÁTICA APLICADA - SEMANA 1: QUÍMICA
 *
 * Vista completa del estudiante con:
 * - Narrativa inmersiva
 * - 3 actividades asíncronas (Quiz, Ejercicios, Proyecto)
 * - Sistema de progreso visual
 * - Gamificación integrada
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
}

export default function EstudiantePlanificacionesPage() {
  const [actividadActiva, setActividadActiva] = useState<string | null>(null);

  // Estado hardcodeado para MVP - luego viene de backend
  const planificacion = {
    titulo: 'Mes de Matemática Aplicada',
    semanaActual: 1,
    tematica: 'Química',
    icono: '🧪',
    color: 'from-green-500 to-emerald-500',
    narrativa: {
      intro: '¡Bienvenido al laboratorio del Dr. Números! 🧪',
      descripcion: 'Un misterioso líquido ha aparecido en el laboratorio. Necesitamos tu ayuda para analizar sus propiedades usando matemática y química. ¿Estás listo para el desafío?',
      contexto: 'En esta semana, aprenderás cómo las proporciones, porcentajes y fracciones se usan en química para hacer mezclas perfectas.',
    },
    progreso: {
      actividadesCompletadas: 0,
      actividadesTotales: 3,
      puntosObtenidos: 0,
      puntosTotales: 100,
    },
  };

  const actividades: Actividad[] = [
    {
      id: 'quiz-proporciones',
      tipo: 'quiz',
      titulo: 'Quiz: Proporciones Químicas',
      descripcion: '¿Cuánto sabes sobre mezclas y proporciones? Responde 5 preguntas rápidas.',
      duracion: '5 min',
      puntos: 20,
      completada: false,
      bloqueada: false,
    },
    {
      id: 'ejercicios-mezclas',
      tipo: 'ejercicios',
      titulo: 'Ejercicios: Calculando Mezclas',
      descripcion: 'Resuelve 3 problemas sobre cómo mezclar sustancias en las proporciones correctas.',
      duracion: '10 min',
      puntos: 30,
      completada: false,
      bloqueada: false,
    },
    {
      id: 'proyecto-experimento',
      tipo: 'proyecto',
      titulo: 'Proyecto: Diseña tu Experimento',
      descripcion: 'Crea una fórmula matemática para un experimento químico usando lo aprendido.',
      duracion: '15 min',
      puntos: 50,
      completada: false,
      bloqueada: false,
    },
  ];

  const getIconoActividad = (tipo: string) => {
    switch (tipo) {
      case 'quiz':
        return <Sparkles className="w-6 h-6" />;
      case 'ejercicios':
        return <Star className="w-6 h-6" />;
      case 'proyecto':
        return <Trophy className="w-6 h-6" />;
      default:
        return <Play className="w-6 h-6" />;
    }
  };

  const getColorActividad = (tipo: string) => {
    switch (tipo) {
      case 'quiz':
        return 'from-blue-500 to-cyan-500';
      case 'ejercicios':
        return 'from-purple-500 to-pink-500';
      case 'proyecto':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleIniciarActividad = (actividadId: string) => {
    setActividadActiva(actividadId);
    // Aquí navegarías a la página de la actividad
    console.log(`Iniciando actividad: ${actividadId}`);
  };

  const porcentajeProgreso = (planificacion.progreso.actividadesCompletadas / planificacion.progreso.actividadesTotales) * 100;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section - Narrativa Inmersiva */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        {/* Fondo con gradiente */}
        <div className={`absolute inset-0 bg-gradient-to-br ${planificacion.color} opacity-20`} />
        <div className="absolute inset-0 backdrop-blur-3xl bg-slate-900/60" />

        {/* Contenido */}
        <div className="relative z-10 p-8">
          <div className="flex items-start gap-6 mb-6">
            {/* Icono gigante */}
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${planificacion.color} flex items-center justify-center shadow-2xl shadow-green-500/50 flex-shrink-0`}>
              <span className="text-6xl">{planificacion.icono}</span>
            </div>

            {/* Título y descripción */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-bold uppercase">
                  Semana {planificacion.semanaActual}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
                  {planificacion.progreso.puntosObtenidos}/{planificacion.progreso.puntosTotales} puntos
                </span>
              </div>

              <h1 className="text-4xl font-black text-white mb-3">
                {planificacion.tematica}: {planificacion.narrativa.intro}
              </h1>

              <p className="text-slate-200 text-lg leading-relaxed mb-4">
                {planificacion.narrativa.descripcion}
              </p>

              <div className="flex items-center gap-2 text-green-300 bg-green-900/30 rounded-xl px-4 py-3 border border-green-500/30">
                <Beaker className="w-5 h-5" />
                <p className="text-sm font-medium">
                  {planificacion.narrativa.contexto}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-lg">Tu Progreso esta Semana</span>
              <span className="text-purple-300 font-black text-xl">
                {planificacion.progreso.actividadesCompletadas}/{planificacion.progreso.actividadesTotales} actividades
              </span>
            </div>

            <div className="relative w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${planificacion.color} rounded-full transition-all duration-500 flex items-center justify-end px-2`}
                style={{ width: `${porcentajeProgreso}%` }}
              >
                {porcentajeProgreso > 10 && (
                  <Flame className="w-4 h-4 text-white animate-pulse" />
                )}
              </div>
            </div>

            <p className="text-slate-400 text-sm mt-2">
              {porcentajeProgreso === 100
                ? '¡Felicitaciones! Completaste todas las actividades 🎉'
                : `Completa ${planificacion.progreso.actividadesTotales - planificacion.progreso.actividadesCompletadas} actividades más para terminar esta semana`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Actividades */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <Play className="w-7 h-7 text-purple-400" />
          Actividades de esta Semana
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {actividades.map((actividad, index) => (
            <div
              key={actividad.id}
              className={`relative rounded-2xl bg-slate-800/50 backdrop-blur-xl border-2 p-6 transition-all hover:scale-105 ${
                actividad.completada
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                  : actividad.bloqueada
                  ? 'border-slate-700/30 opacity-60'
                  : 'border-slate-600/50 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20'
              }`}
            >
              {/* Badge de número */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {index + 1}
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorActividad(actividad.tipo)} flex items-center justify-center shadow-lg`}>
                  {actividad.completada ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : actividad.bloqueada ? (
                    <Lock className="w-6 h-6 text-white" />
                  ) : (
                    getIconoActividad(actividad.tipo)
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-sm font-bold">{actividad.puntos} pts</span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-400 text-sm">{actividad.duracion}</span>
                </div>
              </div>

              {/* Título y descripción */}
              <h3 className="text-xl font-bold text-white mb-2">{actividad.titulo}</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">{actividad.descripcion}</p>

              {/* Botón de acción */}
              {actividad.completada ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 font-bold justify-center">
                  <CheckCircle className="w-5 h-5" />
                  Completada
                </div>
              ) : actividad.bloqueada ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-700/30 border border-slate-600/30 text-slate-500 font-bold justify-center">
                  <Lock className="w-5 h-5" />
                  Bloqueada
                </div>
              ) : (
                <button
                  onClick={() => handleIniciarActividad(actividad.id)}
                  className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r ${getColorActividad(actividad.tipo)} text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105`}
                >
                  <Play className="w-5 h-5" />
                  Iniciar Actividad
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Próximas semanas (preview) */}
      <div className="rounded-3xl bg-slate-800/30 backdrop-blur-xl border-2 border-slate-700/50 p-8">
        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
          <Lock className="w-7 h-7 text-slate-500" />
          Próximas Semanas
        </h2>
        <p className="text-slate-400 mb-6">
          Completa esta semana para desbloquear las siguientes aventuras matemáticas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { semana: 2, tema: 'Astronomía', icono: '🪐', color: 'from-blue-500 to-indigo-500' },
            { semana: 3, tema: 'Física', icono: '⚡', color: 'from-yellow-500 to-orange-500' },
            { semana: 4, tema: 'Computación', icono: '💻', color: 'from-cyan-500 to-teal-500' },
          ].map((proxima) => (
            <div
              key={proxima.semana}
              className="rounded-xl bg-slate-900/50 border border-slate-700/30 p-4 opacity-60"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${proxima.color} flex items-center justify-center mb-3 opacity-50`}>
                <span className="text-2xl">{proxima.icono}</span>
              </div>
              <h4 className="text-white font-bold mb-1">Semana {proxima.semana}</h4>
              <p className="text-slate-500 text-sm">{proxima.tema}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
