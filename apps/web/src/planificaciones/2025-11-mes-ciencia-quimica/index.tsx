/**
 * MES DE MATEMÁTICA APLICADA - SEMANA 1: MATEMÁTICAS Y QUÍMICA
 * "El Laboratorio de Mezclas Mágicas"
 *
 * NARRATIVA:
 * Los estudiantes son aprendices de un laboratorio secreto. Deben aprender a crear compuestos
 * siguiendo recetas exactas, balanceando proporciones y gestionando inventarios para salvar a la
 * ciudad de una crisis química.
 *
 * ACTIVIDADES ASINCRÓNICAS:
 * 1. Desafío de acertijos matemáticos con temática química (historia interactiva)
 * 2. Simulador de concentraciones (8-10 niveles de dificultad creciente)
 * 3. Olimpiada de problemas (15-20 ejercicios progresivos)
 * 4. Proyecto final: Simulador de reacción en cadena (balancear múltiples variables)
 *
 * DIFERENCIACIÓN POR GRUPOS:
 * - Grupo 1 (6-7): Sumas/restas hasta 1,000, multiplicación básica, proporciones simples (2:3)
 * - Grupo 2 (8-9): Operaciones hasta 10,000, proporciones más complejas, fracciones básicas, regla de 3 simple
 * - Grupo 3 (10-12): Ecuaciones simples, porcentajes, balanceo de ecuaciones, optimización
 */

'use client';

import { PlanificacionWrapper, usePlanificacion } from '@/planificaciones/shared';
import type { PlanificacionConfig } from '@/planificaciones/shared';
import { useState } from 'react';
import { Beaker, Sparkles, Trophy, Star, ChevronRight, Lock } from 'lucide-react';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
export const PLANIFICACION_CONFIG: PlanificacionConfig = {
  codigo: '2025-11-mes-ciencia-quimica',
  titulo: 'Mes de la Ciencia - Semana 1: Laboratorio Químico',
  grupo: 'TODOS', // Se aplica a todos los grupos con diferente dificultad
  mes: 11,
  anio: 2025,
  semanas: 4, // 4 actividades asincrónicas
};

// ============================================================================
// TIPOS
// ============================================================================
interface EstadoQuimica {
  actividadActual: number;
  puntosActividad: number[];
  estrellasActividad: number[];
  tiempoActividad: number[];
  compuestosCreados: string[];
  mejorRacha: number;
}

interface ActividadConfig {
  numero: number;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  duracion: string;
  puntos: number;
  bloqueada: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function MesMatematicaQuimica() {
  return (
    <PlanificacionWrapper config={PLANIFICACION_CONFIG}>
      <ContenidoPlanificacion />
    </PlanificacionWrapper>
  );
}

// ============================================================================
// CONTENIDO
// ============================================================================
function ContenidoPlanificacion() {
  const {
    progreso,
    guardarEstado,
    avanzarSemana,
    completarSemana,
  } = usePlanificacion();

  // Estado local del juego
  const [estadoLocal, setEstadoLocal] = useState<EstadoQuimica>(() => {
    const estadoGuardado = progreso?.estadoGuardado as EstadoQuimica | null;
    return estadoGuardado || {
      actividadActual: 1,
      puntosActividad: [0, 0, 0, 0],
      estrellasActividad: [0, 0, 0, 0],
      tiempoActividad: [0, 0, 0, 0],
      compuestosCreados: [],
      mejorRacha: 0,
    };
  });

  // Semana actual (actividad actual)
  const actividadActual = estadoLocal.actividadActual;

  // Configuración de actividades
  const actividades: ActividadConfig[] = [
    {
      numero: 1,
      titulo: 'ACERTIJOS QUÍMICOS',
      descripcion: 'Historia interactiva con problemas matemáticos en contexto químico',
      icono: <Sparkles className="w-6 h-6" />,
      duracion: '20 MIN',
      puntos: 100,
      bloqueada: false,
    },
    {
      numero: 2,
      titulo: 'SIMULADOR DE CONCENTRACIONES',
      descripcion: 'Mezcla reactivos siguiendo proporciones exactas',
      icono: <Beaker className="w-6 h-6" />,
      duracion: '20 MIN',
      puntos: 150,
      bloqueada: actividadActual < 2,
    },
    {
      numero: 3,
      titulo: 'OLIMPIADA MATEMÁTICA',
      descripcion: '15-20 problemas progresivos con temática química',
      icono: <Trophy className="w-6 h-6" />,
      duracion: '25 MIN',
      puntos: 200,
      bloqueada: actividadActual < 3,
    },
    {
      numero: 4,
      titulo: 'PROYECTO: REACCIÓN EN CADENA',
      descripcion: 'Balancea múltiples variables en una reacción compleja',
      icono: <Star className="w-6 h-6" fill="currentColor" />,
      duracion: '30 MIN',
      puntos: 250,
      bloqueada: actividadActual < 4,
    },
  ];

  // Handler para seleccionar actividad
  const handleSeleccionarActividad = (numero: number) => {
    if (numero > actividadActual) return; // Bloqueada
    setEstadoLocal((prev) => ({ ...prev, actividadActual: numero }));
  };

  // Handler para guardar progreso
  const handleGuardarProgreso = async () => {
    try {
      await guardarEstado(estadoLocal);
    } catch (err) {
      console.error('Error al guardar progreso:', err);
    }
  };

  // Calcular progreso total
  const puntosTotal = estadoLocal.puntosActividad.reduce((a, b) => a + b, 0);
  const estrellasTotal = estadoLocal.estrellasActividad.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header con Grid Pattern */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/50 bg-slate-900/50">
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }} />

          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Beaker className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                      LABORATORIO QUÍMICO
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                      Semana 1 • Mes de la Ciencia
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3">
                <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    <span className="text-2xl font-black text-yellow-400">{estrellasTotal}</span>
                  </div>
                  <p className="text-[10px] font-bold text-yellow-400/60 uppercase text-center">Estrellas</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border-2 border-purple-500/30">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Trophy className="w-5 h-5 text-purple-400" fill="currentColor" />
                    <span className="text-2xl font-black text-purple-400">{puntosTotal}</span>
                  </div>
                  <p className="text-[10px] font-bold text-purple-400/60 uppercase text-center">Puntos</p>
                </div>
              </div>
            </div>

            {/* Narrativa */}
            <div className="mt-4 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
              <p className="text-sm text-teal-100 leading-relaxed">
                🧪 <strong>MISIÓN:</strong> Eres aprendiz de un laboratorio secreto. Debes aprender a crear compuestos
                siguiendo recetas exactas, balanceando proporciones y gestionando inventarios para salvar a la
                ciudad de una crisis química.
              </p>
            </div>
          </div>
        </div>

        {/* Actividades */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              ACTIVIDADES DISPONIBLES
            </h3>
            <span className="text-sm text-slate-400 font-medium">
              {actividades.filter(a => !a.bloqueada).length} de {actividades.length} desbloqueadas
            </span>
          </div>

          {/* Grid de actividades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {actividades.map((actividad) => (
              <button
                key={actividad.numero}
                onClick={() => handleSeleccionarActividad(actividad.numero)}
                disabled={actividad.bloqueada}
                className={`group relative text-left transition-all ${
                  actividadActual === actividad.numero
                    ? 'scale-105'
                    : actividad.bloqueada
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-[1.02] opacity-90 hover:opacity-100'
                }`}
              >
                {/* Card */}
                <div className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
                  actividadActual === actividad.numero
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20'
                    : 'border-slate-700/50 shadow-xl'
                }`}>

                  {/* Header colorido */}
                  <div className={`${
                    actividad.numero === 1 ? 'bg-blue-600' :
                    actividad.numero === 2 ? 'bg-purple-600' :
                    actividad.numero === 3 ? 'bg-orange-600' :
                    'bg-emerald-600'
                  } p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      {/* Número */}
                      <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                        <span className="text-3xl font-black text-white">{actividad.numero}</span>
                      </div>

                      {/* Puntos */}
                      <div className="text-right">
                        <div className="text-3xl font-black text-white leading-none">+{actividad.puntos}</div>
                        <div className="text-xs font-bold text-white/80 uppercase tracking-wide">PUNTOS</div>
                      </div>
                    </div>

                    {/* Título */}
                    <h4 className="text-xl font-black text-white uppercase mb-1 leading-tight">
                      {actividad.titulo}
                    </h4>

                    {/* Duración */}
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="text-xs font-bold">{actividad.duracion}</span>
                    </div>
                  </div>

                  {/* Body con grid pattern */}
                  <div className="relative bg-slate-800 p-4">
                    {/* Grid Pattern Sutil */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `
                        linear-gradient(rgba(100, 116, 139, 0.15) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(100, 116, 139, 0.15) 1px, transparent 1px)
                      `,
                      backgroundSize: '24px 24px'
                    }} />

                    {/* Descripción */}
                    <p className="relative text-sm text-slate-300 mb-4 leading-relaxed">
                      {actividad.descripcion}
                    </p>

                    {/* Progreso si ya se jugó */}
                    {estadoLocal.puntosActividad[actividad.numero - 1] > 0 && (
                      <div className="relative mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-400 font-bold">Completado</span>
                          <span className="text-green-300">{estadoLocal.puntosActividad[actividad.numero - 1]} pts</span>
                        </div>
                      </div>
                    )}

                    {/* Botón */}
                    {actividad.bloqueada ? (
                      <div className="relative flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700/50 border-2 border-slate-600 text-slate-400 font-black uppercase text-sm">
                        <Lock className="w-5 h-5" />
                        BLOQUEADO
                      </div>
                    ) : estadoLocal.puntosActividad[actividad.numero - 1] > 0 ? (
                      <div className="relative flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/20 border-2 border-green-500/50 text-green-400 font-black uppercase text-sm hover:bg-green-500/30 transition-all">
                        <ChevronRight className="w-5 h-5" />
                        VOLVER A JUGAR
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-white/90 text-slate-900 font-black uppercase text-sm transition-all group-hover:shadow-lg">
                        <ChevronRight className="w-5 h-5" fill="currentColor" />
                        JUGAR
                      </div>
                    )}
                  </div>
                </div>

                {/* Indicador de selección */}
                {actividadActual === actividad.numero && !actividad.bloqueada && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-white text-xs font-black uppercase shadow-lg shadow-cyan-500/30">
                    SELECCIONADO
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de la actividad seleccionada */}
        <div className="rounded-2xl overflow-hidden border-2 border-slate-700/50 bg-slate-900">
          <div className="p-6">
            <ActividadContent
              numero={actividadActual}
              estado={estadoLocal}
              onEstadoChange={setEstadoLocal}
              onGuardar={handleGuardarProgreso}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: CONTENIDO DE ACTIVIDAD
// ============================================================================
interface ActividadContentProps {
  numero: number;
  estado: EstadoQuimica;
  onEstadoChange: (estado: EstadoQuimica) => void;
  onGuardar: () => void;
}

function ActividadContent({ numero, estado, onEstadoChange, onGuardar }: ActividadContentProps) {
  // TODO: Implementar contenido de cada actividad
  // Por ahora mostramos placeholder

  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
        <Beaker className="w-12 h-12 text-cyan-500" />
      </div>
      <h3 className="text-2xl font-black text-white mb-2">
        ACTIVIDAD {numero}
      </h3>
      <p className="text-slate-400 mb-6">
        Contenido de la actividad en desarrollo...
      </p>
      <div className="inline-block px-6 py-3 rounded-xl bg-slate-800 border border-slate-700">
        <p className="text-sm text-slate-400">
          Próximamente: Simulador interactivo
        </p>
      </div>
    </div>
  );
}
