'use client';

import React, { useState, useEffect } from 'react';
import { Play, Clock, Users, Calendar, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import { Comision } from '../../types/docente.types';

interface ProximaClaseProps {
  comision: Comision | null;
}

// Función para calcular la próxima clase basada en el horario
function getNextClassTime(horario: string): Date {
  const now = new Date();

  // Parsear horario tipo "Lunes 10:00 - 12:00" o "10:00 - 12:00"
  const timeMatch = horario.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch || !timeMatch[1] || !timeMatch[2]) {
    // Si no hay horario válido, simular clase en 2 horas
    return new Date(now.getTime() + 2 * 60 * 60 * 1000);
  }

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);

  // Crear fecha de hoy con esa hora
  const nextClass = new Date(now);
  nextClass.setHours(hours, minutes, 0, 0);

  // Si ya pasó hoy, programar para mañana
  if (nextClass <= now) {
    nextClass.setDate(nextClass.getDate() + 1);
  }

  return nextClass;
}

export const ProximaClaseCard: React.FC<ProximaClaseProps> = ({ comision }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLiveish, setIsLiveish] = useState(false);
  const [nextClassDate, setNextClassDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!comision) return;

    // Calcular próxima clase basada en horario
    const targetDate = comision.proximaClase
      ? new Date(comision.proximaClase)
      : getNextClassTime(comision.horario);

    setNextClassDate(targetDate);

    const calculateTime = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        const endDiff = diff + 2 * 60 * 60 * 1000;
        if (endDiff > 0) {
          setTimeLeft('EN CURSO');
          setIsLiveish(true);
        } else {
          setTimeLeft('Finalizada');
          setIsLiveish(false);
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours < 1) {
        setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        setIsLiveish(true);
      } else if (hours < 24) {
        setTimeLeft(`${hours}h ${String(minutes).padStart(2, '0')}m`);
        setIsLiveish(hours < 2);
      } else {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days} día${days > 1 ? 's' : ''}`);
        setIsLiveish(false);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [comision]);

  if (!comision) {
    return (
      <div className="h-full bg-slate-900/30 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity" />
        <div className="z-10 bg-slate-800/50 p-4 rounded-full mb-4">
          <Calendar size={36} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-white z-10">No tienes clases programadas</h3>
        <p className="text-slate-400 z-10 mt-2 max-w-sm text-base">
          Aprovecha para revisar las entregas pendientes o preparar material para tus próximas
          clases.
        </p>
        <button className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all z-10">
          Ver Calendario Completo
        </button>
      </div>
    );
  }

  const isUrgent = isLiveish || timeLeft === 'EN CURSO';
  const capacityPercent = Math.round((comision.inscripciones / comision.cupo_maximo) * 100);

  return (
    <div className="relative w-full h-full min-h-0 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col group">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={comision.thumbnail || 'https://picsum.photos/seed/tech/800/600'}
          alt="Class Background"
          className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t via-slate-950/85 to-slate-950/60 ${isUrgent ? 'from-indigo-950' : 'from-slate-950'}`}
        />
        {isUrgent && (
          <div className="absolute inset-0 bg-indigo-600/10 animate-pulse pointer-events-none mix-blend-overlay" />
        )}
      </div>

      <div className="relative z-10 p-6 lg:p-8 flex flex-col h-full justify-between">
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div
            className={`px-4 py-1.5 rounded-full border backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isUrgent
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
            }`}
          >
            {isUrgent && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            {isUrgent ? 'Comienza pronto' : 'Próxima Clase'}
          </div>

          <div
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
              comision.casa === 'QUANTUM'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : comision.casa === 'VERTEX'
                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                  : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            }`}
          >
            {comision.casa}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <h1 className="text-2xl lg:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
            {comision.producto}
          </h1>

          {/* Info Pills */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="flex items-center gap-2 text-sm font-medium bg-slate-900/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-700/50">
              <Clock size={16} className="text-cyan-400" />
              <span className="text-white">{comision.horario}</span>
            </span>
            <span className="flex items-center gap-2 text-sm font-medium bg-slate-900/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-slate-700/50">
              <Users size={16} className="text-emerald-400" />
              <span className="text-white">
                {comision.inscripciones}/{comision.cupo_maximo} Alumnos
              </span>
            </span>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-indigo-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase">Capacidad</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{capacityPercent}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Target size={18} className="text-purple-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase">Sesión</span>
              </div>
              <span className="text-2xl font-bold text-white">#12</span>
              <p className="text-xs text-slate-500 mt-1">de 24 clases</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-amber-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase">Asistencia</span>
              </div>
              <span className="text-2xl font-bold text-white">94%</span>
              <p className="text-xs text-slate-500 mt-1">promedio</p>
            </div>
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="flex items-end justify-between gap-4 pt-4 border-t border-slate-700/30">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              {timeLeft === 'EN CURSO' ? 'Estado' : 'Inicio en'}
            </span>
            <span
              className={`text-3xl font-mono font-black tracking-tight tabular-nums ${isUrgent ? 'text-indigo-400' : 'text-white'}`}
            >
              {timeLeft || '--:--'}
            </span>
            {nextClassDate && timeLeft !== 'EN CURSO' && (
              <span className="text-xs text-slate-500 mt-1">
                {nextClassDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <button
            onClick={() => console.log('Iniciar Clase', comision.id)}
            className={`group relative px-6 py-3 rounded-xl font-bold text-white text-base shadow-lg flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 overflow-hidden ${
              isUrgent
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            {isUrgent && (
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {isUrgent ? <Play size={20} fill="currentColor" /> : <Calendar size={20} />}
              {isUrgent ? 'INICIAR CLASE' : 'Ver Detalles'}
            </span>
            {!isUrgent && (
              <ArrowRight
                size={18}
                className="text-slate-400 group-hover:text-white transition-colors"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
