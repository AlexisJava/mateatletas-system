/**
 * ORDENAR GAME - Componente Reutilizable
 * =======================================
 *
 * Para nenes de 6-7 años - Ordenar elementos en secuencia
 *
 * Features:
 * - Drag & Drop vertical para reordenar
 * - Números grandes para mostrar posición
 * - Feedback visual inmediato
 * - Confeti cuando completan todo
 * - Reutilizable para cualquier contenido
 */

'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface OrdenarPaso {
  texto: string;
  emoji: string;
  orden: number; // 1, 2, 3, 4...
}

interface OrdenarGameProps {
  titulo: string;
  instrucciones: string;
  pasos: OrdenarPaso[];
  onCompleted?: () => void;
}

export default function OrdenarGame({
  titulo,
  instrucciones,
  pasos,
  onCompleted,
}: OrdenarGameProps) {
  // Estado: orden actual de los pasos (índices mezclados)
  const [ordenActual, setOrdenActual] = useState<number[]>([]);

  // Estado: qué elemento se está arrastrando
  const [arrastrando, setArrastrando] = useState<number | null>(null);

  // Estado: validación
  const [validado, setValidado] = useState(false);
  const [todosCorrecto, setTodosCorrecto] = useState(false);

  // Mezclar pasos al inicio
  useEffect(() => {
    const indices = pasos.map((_, i) => i);
    const mezclado = [...indices].sort(() => Math.random() - 0.5);
    setOrdenActual(mezclado);
  }, [pasos]);

  // ============================================================================
  // HANDLERS - DRAG & DROP
  // ============================================================================

  const onDragStart = (e: React.DragEvent, posicion: number) => {
    setArrastrando(posicion);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', posicion.toString());
  };

  const onDragEnd = () => {
    setArrastrando(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, posicionDestino: number) => {
    e.preventDefault();
    const posicionOrigen = parseInt(e.dataTransfer.getData('text/html'));

    if (posicionOrigen === posicionDestino) {
      setArrastrando(null);
      return;
    }

    // Intercambiar elementos
    const nuevoOrden = [...ordenActual];
    const temp = nuevoOrden[posicionOrigen];
    nuevoOrden[posicionOrigen] = nuevoOrden[posicionDestino];
    nuevoOrden[posicionDestino] = temp;

    setOrdenActual(nuevoOrden);
    setArrastrando(null);
    setValidado(false); // Reset validación si mueven algo
  };

  // ============================================================================
  // VALIDAR
  // ============================================================================

  const validar = () => {
    // Verificar que el orden actual coincide con el orden correcto
    let correcto = true;

    for (let i = 0; i < ordenActual.length; i++) {
      const pasoIndex = ordenActual[i];
      const paso = pasos[pasoIndex];

      // El paso en la posición i debería tener orden (i + 1)
      if (paso.orden !== i + 1) {
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
    const indices = pasos.map((_, i) => i);
    const mezclado = [...indices].sort(() => Math.random() - 0.5);
    setOrdenActual(mezclado);
    setValidado(false);
    setTodosCorrecto(false);
  };

  // ============================================================================
  // VERIFICAR SI UN PASO ESTÁ EN LA POSICIÓN CORRECTA
  // ============================================================================

  const esPosicionCorrecta = (posicion: number): boolean | null => {
    if (!validado) return null;
    const pasoIndex = ordenActual[posicion];
    const paso = pasos[pasoIndex];
    return paso.orden === posicion + 1;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 overflow-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-black text-white mb-3">{titulo}</h2>
        <p className="text-xl text-blue-200 font-bold">{instrucciones}</p>
        <p className="text-base text-blue-300 mt-2">
          💡 Arrastrá las tarjetas para ordenarlas de arriba a abajo
        </p>
      </div>

      {/* Lista de pasos */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="w-full max-w-3xl space-y-4">
          {ordenActual.map((pasoIndex, posicion) => {
            const paso = pasos[pasoIndex];
            const estaArrastrando = arrastrando === posicion;
            const esCorrecto = esPosicionCorrecta(posicion);

            return (
              <div
                key={posicion}
                draggable
                onDragStart={(e) => onDragStart(e, posicion)}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, posicion)}
                className={`
                  relative
                  bg-gradient-to-r from-slate-700 to-slate-800
                  border-4
                  ${esCorrecto === true ? 'border-green-500' : ''}
                  ${esCorrecto === false ? 'border-red-500 animate-shake' : ''}
                  ${esCorrecto === null ? 'border-white/20' : ''}
                  rounded-2xl p-6
                  cursor-grab active:cursor-grabbing
                  transition-all duration-300
                  hover:scale-105 hover:shadow-2xl
                  ${estaArrastrando ? 'opacity-50 scale-95' : 'opacity-100'}
                  shadow-lg
                `}
              >
                <div className="flex items-center gap-6">
                  {/* Número de posición actual */}
                  <div
                    className={`
                    flex-shrink-0 w-16 h-16 rounded-xl
                    flex items-center justify-center
                    text-3xl font-black text-white
                    ${esCorrecto === true ? 'bg-green-500' : ''}
                    ${esCorrecto === false ? 'bg-red-500' : ''}
                    ${esCorrecto === null ? 'bg-blue-500' : ''}
                  `}
                  >
                    {posicion + 1}
                  </div>

                  {/* Emoji */}
                  <div className="text-6xl">{paso.emoji}</div>

                  {/* Texto */}
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-white leading-relaxed">{paso.texto}</p>
                  </div>

                  {/* Indicador de correcto/incorrecto */}
                  {esCorrecto === true && <div className="text-5xl">✅</div>}
                  {esCorrecto === false && <div className="text-5xl">❌</div>}

                  {/* Icono de drag handle */}
                  {esCorrecto === null && <div className="text-3xl text-white/30">⋮⋮</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={validar}
          className="flex-1 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-black text-2xl transition-all hover:scale-105 shadow-xl"
        >
          ✅ Verificar Orden
        </button>

        <button
          onClick={resetear}
          className="px-8 py-5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white rounded-2xl font-black text-2xl transition-all hover:scale-105 shadow-xl"
        >
          🔄 Mezclar de Nuevo
        </button>
      </div>

      {/* Feedback */}
      {validado && (
        <div
          className={`mt-4 p-6 rounded-2xl text-center text-2xl font-black animate-bounce ${
            todosCorrecto
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}
        >
          {todosCorrecto
            ? '🎉 ¡PERFECTO! El orden es correcto 🎉'
            : '❌ Revisá los pasos marcados en rojo'}
        </div>
      )}
    </div>
  );
}
