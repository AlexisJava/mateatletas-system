/**
 * MATCHING GAME - Componente Reutilizable
 * ========================================
 *
 * Para nenes de 6-7 años - Emparejar elementos de dos columnas
 *
 * Features:
 * - Click en izquierda, click en derecha para emparejar
 * - Líneas de conexión animadas con SVG
 * - Colores únicos para cada par
 * - Feedback visual inmediato
 * - Confeti cuando completan todo
 * - Reutilizable para cualquier contenido
 */

'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface MatchingPar {
  izquierda: {
    texto: string;
    emoji: string;
  };
  derecha: {
    texto: string;
    emoji: string;
  };
}

interface MatchingGameProps {
  titulo: string;
  instrucciones: string;
  pares: MatchingPar[];
  onCompleted?: () => void;
  compact?: boolean; // Para pantallas más pequeñas o muchos elementos
}

interface Conexion {
  izquierda: number;
  derecha: number;
  color: string;
}

const COLORES = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-green-500 to-emerald-600',
  'from-yellow-500 to-amber-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
];

export default function MatchingGame({
  titulo,
  instrucciones,
  pares,
  onCompleted,
  compact = false,
}: MatchingGameProps) {
  // Auto-detectar si necesita modo compacto (más de 4 pares)
  const useCompact = compact || pares.length > 4;
  // Estado: qué elementos están seleccionados
  const [seleccionadoIzq, setSeleccionadoIzq] = useState<number | null>(null);
  const [seleccionadoDer, setSeleccionadoDer] = useState<number | null>(null);

  // Estado: conexiones realizadas
  const [conexiones, setConexiones] = useState<Conexion[]>([]);

  // Estado: elementos de la derecha mezclados
  const [derechaMezclada, setDerechaMezclada] = useState<number[]>([]);

  // Estado: validación
  const [validado, setValidado] = useState(false);
  const [todosCorrecto, setTodosCorrecto] = useState(false);

  // Mezclar elementos de la derecha al inicio
  useEffect(() => {
    if (pares.length > 0 && derechaMezclada.length === 0) {
      const indices = pares.map((_, i) => i);
      const mezclado = [...indices].sort(() => Math.random() - 0.5);
      setDerechaMezclada(mezclado);
    }
  }, [pares, derechaMezclada]);

  // ============================================================================
  // CLICK EN ELEMENTOS
  // ============================================================================

  const clickIzquierda = (index: number) => {
    // Si ya tiene conexión, la removemos
    const tieneConexion = conexiones.find((c) => c.izquierda === index);
    if (tieneConexion) {
      setConexiones(conexiones.filter((c) => c.izquierda !== index));
      setSeleccionadoIzq(null);
      setValidado(false);
      return;
    }

    // Si no tiene conexión, lo seleccionamos
    setSeleccionadoIzq(index);

    // Si ya hay algo seleccionado en derecha, crear conexión
    if (seleccionadoDer !== null) {
      crearConexion(index, seleccionadoDer);
    }
  };

  const clickDerecha = (indexMezclado: number) => {
    // Obtener el índice real (antes de mezclar)
    const indexReal = derechaMezclada[indexMezclado];

    // Si ya tiene conexión, la removemos
    const tieneConexion = conexiones.find((c) => c.derecha === indexReal);
    if (tieneConexion) {
      setConexiones(conexiones.filter((c) => c.derecha !== indexReal));
      setSeleccionadoDer(null);
      setValidado(false);
      return;
    }

    // Si no tiene conexión, lo seleccionamos
    setSeleccionadoDer(indexReal);

    // Si ya hay algo seleccionado en izquierda, crear conexión
    if (seleccionadoIzq !== null) {
      crearConexion(seleccionadoIzq, indexReal);
    }
  };

  const crearConexion = (izq: number, der: number) => {
    // Elegir un color único
    const colorIndex = conexiones.length % COLORES.length;
    const color = COLORES[colorIndex];

    setConexiones([...conexiones, { izquierda: izq, derecha: der, color }]);
    setSeleccionadoIzq(null);
    setSeleccionadoDer(null);
    setValidado(false);
  };

  // ============================================================================
  // VALIDAR
  // ============================================================================

  const validar = () => {
    // Verificar que todos tengan conexión
    if (conexiones.length !== pares.length) {
      setValidado(true);
      setTodosCorrecto(false);
      return;
    }

    // Verificar que cada conexión sea correcta
    let correcto = true;
    for (const conexion of conexiones) {
      if (conexion.izquierda !== conexion.derecha) {
        correcto = false;
        break;
      }
    }

    setValidado(true);
    setTodosCorrecto(correcto);

    if (correcto) {
      // CONFETI!
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#00ffff', '#0080ff', '#ff00ff', '#ffff00', '#00ff00'],
      });

      // Llamar callback después de 2 segundos
      setTimeout(() => {
        if (onCompleted) {
          onCompleted();
        }
      }, 2000);
    }
  };

  // ============================================================================
  // RESETEAR
  // ============================================================================

  const resetear = () => {
    setConexiones([]);
    setSeleccionadoIzq(null);
    setSeleccionadoDer(null);
    setValidado(false);
    setTodosCorrecto(false);
  };

  // ============================================================================
  // VERIFICAR SI UN PAR ESTÁ CORRECTO O INCORRECTO
  // ============================================================================

  const verificarConexion = (izq: number, der: number): boolean | null => {
    if (!validado) return null;
    return izq === der;
  };

  // ============================================================================
  // OBTENER COLOR DE CONEXIÓN
  // ============================================================================

  const getColorConexion = (izq: number): string | null => {
    const conexion = conexiones.find((c) => c.izquierda === izq);
    return conexion ? conexion.color : null;
  };

  const tieneConexionIzq = (index: number) => {
    return conexiones.some((c) => c.izquierda === index);
  };

  const tieneConexionDer = (indexReal: number) => {
    return conexiones.some((c) => c.derecha === indexReal);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Esperar a que se mezclen los elementos
  if (derechaMezclada.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="text-4xl text-white animate-pulse">⏳ Cargando...</div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 ${useCompact ? 'p-4 md:p-6' : 'p-8'} overflow-auto`}
    >
      {/* Header */}
      <div className={`text-center ${useCompact ? 'mb-3' : 'mb-6'}`}>
        <h2
          className={`${useCompact ? 'text-2xl md:text-3xl' : 'text-4xl'} font-black text-white mb-2`}
        >
          {titulo}
        </h2>
        <p
          className={`${useCompact ? 'text-base md:text-lg' : 'text-xl'} text-indigo-200 font-bold`}
        >
          {instrucciones}
        </p>
      </div>

      {/* Área de juego */}
      <div
        className={`flex-1 relative flex ${useCompact ? 'gap-3 md:gap-6' : 'gap-8'} items-center justify-center ${useCompact ? 'mb-3' : 'mb-6'}`}
      >
        {/* Columna IZQUIERDA */}
        <div
          className={`flex flex-col ${useCompact ? 'gap-2 w-52 md:w-64 lg:w-72' : 'gap-4 w-80'}`}
        >
          {pares.map((par, index) => {
            const tieneConexion = tieneConexionIzq(index);
            const estaSeleccionado = seleccionadoIzq === index;
            const color = getColorConexion(index);
            const conexion = conexiones.find((c) => c.izquierda === index);
            const esCorrecto = conexion
              ? verificarConexion(conexion.izquierda, conexion.derecha)
              : null;

            return (
              <button
                key={index}
                onClick={() => clickIzquierda(index)}
                className={`
                  relative group
                  bg-gradient-to-br ${color ? color : 'from-slate-700 to-slate-800'}
                  ${estaSeleccionado ? 'ring-3 ring-yellow-400 scale-105' : ''}
                  ${!tieneConexion && !estaSeleccionado ? 'hover:scale-103 hover:shadow-xl' : ''}
                  ${esCorrecto === false ? 'animate-shake ring-3 ring-red-500' : ''}
                  ${esCorrecto === true ? 'ring-3 ring-green-500' : ''}
                  border-3 border-white/20
                  ${useCompact ? 'rounded-xl p-3 md:p-4' : 'rounded-2xl p-6'}
                  transition-all duration-300
                  text-left
                  shadow-lg
                `}
              >
                <div className={`flex items-center ${useCompact ? 'gap-3' : 'gap-4'}`}>
                  <div className={useCompact ? 'text-2xl md:text-3xl' : 'text-5xl'}>
                    {par.izquierda.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`${useCompact ? 'text-sm md:text-base' : 'text-xl'} font-bold text-white`}
                    >
                      {par.izquierda.texto}
                    </div>
                  </div>
                  {esCorrecto === true && (
                    <span className={useCompact ? 'text-xl' : 'text-3xl'}>✅</span>
                  )}
                  {esCorrecto === false && (
                    <span className={useCompact ? 'text-xl' : 'text-3xl'}>❌</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Conexión visual central */}
        <div className="flex items-center justify-center">
          <div className={`${useCompact ? 'text-3xl md:text-4xl' : 'text-6xl'} text-white/30`}>
            {conexiones.length === pares.length ? '✓' : '↔'}
          </div>
        </div>

        {/* Columna DERECHA (mezclada) */}
        <div
          className={`flex flex-col ${useCompact ? 'gap-2 w-52 md:w-64 lg:w-72' : 'gap-4 w-80'}`}
        >
          {derechaMezclada.map((indexReal, indexMezclado) => {
            const par = pares[indexReal];
            const tieneConexion = tieneConexionDer(indexReal);
            const estaSeleccionado = seleccionadoDer === indexReal;
            const conexion = conexiones.find((c) => c.derecha === indexReal);
            const color = conexion?.color;
            const esCorrecto = conexion
              ? verificarConexion(conexion.izquierda, conexion.derecha)
              : null;

            return (
              <button
                key={indexMezclado}
                onClick={() => clickDerecha(indexMezclado)}
                className={`
                  relative group
                  bg-gradient-to-br ${color ? color : 'from-slate-700 to-slate-800'}
                  ${estaSeleccionado ? 'ring-3 ring-yellow-400 scale-105' : ''}
                  ${!tieneConexion && !estaSeleccionado ? 'hover:scale-103 hover:shadow-xl' : ''}
                  ${esCorrecto === false ? 'animate-shake ring-3 ring-red-500' : ''}
                  ${esCorrecto === true ? 'ring-3 ring-green-500' : ''}
                  border-3 border-white/20
                  ${useCompact ? 'rounded-xl p-3 md:p-4' : 'rounded-2xl p-6'}
                  transition-all duration-300
                  text-left
                  shadow-lg
                `}
              >
                <div className={`flex items-center ${useCompact ? 'gap-3' : 'gap-4'}`}>
                  {esCorrecto === true && (
                    <span className={useCompact ? 'text-xl' : 'text-3xl'}>✅</span>
                  )}
                  {esCorrecto === false && (
                    <span className={useCompact ? 'text-xl' : 'text-3xl'}>❌</span>
                  )}
                  <div className={useCompact ? 'text-2xl md:text-3xl' : 'text-5xl'}>
                    {par.derecha.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`${useCompact ? 'text-sm md:text-base' : 'text-xl'} font-bold text-white`}
                    >
                      {par.derecha.texto}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botones */}
      <div className={`flex ${useCompact ? 'gap-3' : 'gap-4'}`}>
        <button
          onClick={validar}
          disabled={conexiones.length !== pares.length}
          className={`flex-1 ${useCompact ? 'px-6 py-3 text-base md:text-lg rounded-xl' : 'px-8 py-5 text-2xl rounded-2xl'} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-black transition-all hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xl`}
        >
          ✅ Verificar
        </button>

        <button
          onClick={resetear}
          className={`${useCompact ? 'px-6 py-3 text-base md:text-lg rounded-xl' : 'px-8 py-5 text-2xl rounded-2xl'} bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-black transition-all hover:scale-105 shadow-xl`}
        >
          🔄 Reiniciar
        </button>
      </div>

      {/* Feedback */}
      {validado && (
        <div
          className={`${useCompact ? 'mt-3 p-4 text-base md:text-lg' : 'mt-4 p-6 text-2xl'} rounded-xl text-center font-black ${
            todosCorrecto
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}
        >
          {todosCorrecto
            ? '🎉 ¡PERFECTO! Todos los pares son correctos 🎉'
            : '❌ Revisá los pares marcados en rojo'}
        </div>
      )}
    </div>
  );
}
