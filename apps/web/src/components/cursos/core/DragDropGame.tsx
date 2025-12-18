/**
 * DRAG & DROP GAME - Componente Reutilizable
 * ===========================================
 *
 * Para nenes de 6-7 años - Grande, colorido, con feedback visual
 *
 * Features:
 * - Drag & Drop con HTML5 (táctil y mouse)
 * - Categorías visuales con colores
 * - Elementos grandes con emojis
 * - Animaciones suaves
 * - Feedback visual inmediato
 * - Confeti cuando completan todo
 * - Reutilizable para cualquier contenido
 */

'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface DragDropCategoria {
  id: string;
  nombre: string;
  emoji: string;
  color: string; // Tailwind gradient class (e.g., 'from-cyan-500 to-blue-500')
}

export interface DragDropElemento {
  id: string;
  texto: string;
  emoji: string;
  categoriaCorrecta: string;
}

interface DragDropGameProps {
  titulo: string;
  instrucciones: string;
  categorias: DragDropCategoria[];
  elementos: DragDropElemento[];
  onCompleted?: () => void;
}

export default function DragDropGame({
  titulo,
  instrucciones,
  categorias,
  elementos,
  onCompleted,
}: DragDropGameProps) {
  // Estado: dónde está cada elemento
  const [posiciones, setPosiciones] = useState<Record<string, string>>({});
  // 'sin-asignar' | categoria.id

  // Estado: qué elemento se está arrastrando
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  // Estado: sobre qué categoría está el mouse
  const [sobreCategoria, setSobreCategoria] = useState<string | null>(null);

  // Estado: mostrar validación
  const [validado, setValidado] = useState(false);
  const [todosCorrecto, setTodosCorrecto] = useState(false);

  // Inicializar: todos sin asignar
  useEffect(() => {
    const inicial: Record<string, string> = {};
    elementos.forEach((elem) => {
      inicial[elem.id] = 'sin-asignar';
    });
    setPosiciones(inicial);
  }, [elementos]);

  // ============================================================================
  // HANDLERS - DRAG & DROP
  // ============================================================================

  const onDragStart = (e: React.DragEvent, elementoId: string) => {
    setArrastrando(elementoId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', elementoId);
  };

  const onDragEnd = () => {
    setArrastrando(null);
    setSobreCategoria(null);
  };

  const onDragOver = (e: React.DragEvent, categoriaId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setSobreCategoria(categoriaId);
  };

  const onDragLeave = () => {
    setSobreCategoria(null);
  };

  const onDrop = (e: React.DragEvent, categoriaId: string) => {
    e.preventDefault();
    const elementoId = e.dataTransfer.getData('text/html');

    // Actualizar posición
    setPosiciones((prev) => ({
      ...prev,
      [elementoId]: categoriaId,
    }));

    setArrastrando(null);
    setSobreCategoria(null);
    setValidado(false); // Reset validación si mueven algo
  };

  // ============================================================================
  // VALIDAR
  // ============================================================================

  const validar = () => {
    let correcto = true;

    // Verificar que todos estén asignados
    for (const elem of elementos) {
      if (posiciones[elem.id] === 'sin-asignar') {
        correcto = false;
        break;
      }

      // Verificar que esté en la categoría correcta
      if (posiciones[elem.id] !== elem.categoriaCorrecta) {
        correcto = false;
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
    const inicial: Record<string, string> = {};
    elementos.forEach((elem) => {
      inicial[elem.id] = 'sin-asignar';
    });
    setPosiciones(inicial);
    setValidado(false);
    setTodosCorrecto(false);
  };

  // ============================================================================
  // OBTENER ELEMENTOS POR CATEGORÍA
  // ============================================================================

  const obtenerElementosEnCategoria = (categoriaId: string) => {
    return elementos.filter((elem) => posiciones[elem.id] === categoriaId);
  };

  const obtenerElementosSinAsignar = () => {
    return elementos.filter((elem) => posiciones[elem.id] === 'sin-asignar');
  };

  // ============================================================================
  // VERIFICAR SI UN ELEMENTO ESTÁ CORRECTO
  // ============================================================================

  const esCorrecto = (elementoId: string): boolean | null => {
    if (!validado) return null;
    const elem = elementos.find((e) => e.id === elementoId);
    if (!elem) return null;
    return posiciones[elementoId] === elem.categoriaCorrecta;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 overflow-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-black text-white mb-3">{titulo}</h2>
        <p className="text-xl text-purple-200 font-bold">{instrucciones}</p>
      </div>

      {/* Zona de elementos sin asignar */}
      <div className="bg-slate-800/50 border-4 border-dashed border-slate-600 rounded-3xl p-6 mb-6 min-h-[120px]">
        <div className="text-center mb-3">
          <span className="text-lg font-bold text-slate-300">👇 Arrastrá estos elementos 👇</span>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {obtenerElementosSinAsignar().map((elem) => {
            const correcto = esCorrecto(elem.id);

            return (
              <div
                key={elem.id}
                draggable
                onDragStart={(e) => onDragStart(e, elem.id)}
                onDragEnd={onDragEnd}
                className={`
                  bg-gradient-to-br from-white to-slate-100
                  border-4 border-slate-300
                  rounded-2xl px-6 py-4
                  cursor-grab active:cursor-grabbing
                  transition-all duration-200
                  hover:scale-110 hover:shadow-2xl
                  ${arrastrando === elem.id ? 'opacity-50 scale-95' : 'opacity-100'}
                  ${correcto === false ? 'border-red-500 animate-shake' : ''}
                `}
              >
                <div className="text-center">
                  <div className="text-5xl mb-2">{elem.emoji}</div>
                  <div className="text-lg font-bold text-slate-800">{elem.texto}</div>
                </div>
              </div>
            );
          })}

          {obtenerElementosSinAsignar().length === 0 && (
            <div className="text-slate-500 text-lg font-bold">¡Todos asignados! 🎉</div>
          )}
        </div>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        {categorias.map((cat) => {
          const elementosAqui = obtenerElementosEnCategoria(cat.id);
          const estaSobre = sobreCategoria === cat.id;

          return (
            <div
              key={cat.id}
              onDragOver={(e) => onDragOver(e, cat.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, cat.id)}
              className={`
                bg-gradient-to-br ${cat.color}
                border-4 border-dashed
                rounded-3xl p-6
                transition-all duration-300
                min-h-[300px]
                ${
                  estaSobre
                    ? 'border-yellow-300 scale-105 shadow-2xl shadow-yellow-500/50'
                    : 'border-white/30'
                }
              `}
            >
              {/* Header de categoría */}
              <div className="text-center mb-4 pb-4 border-b-4 border-white/30">
                <div className="text-6xl mb-2">{cat.emoji}</div>
                <div className="text-2xl font-black text-white">{cat.nombre}</div>
              </div>

              {/* Elementos en esta categoría */}
              <div className="flex flex-col gap-3">
                {elementosAqui.map((elem) => {
                  const correcto = esCorrecto(elem.id);

                  return (
                    <div
                      key={elem.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, elem.id)}
                      onDragEnd={onDragEnd}
                      className={`
                        bg-white/90
                        border-4
                        rounded-xl px-4 py-3
                        cursor-grab active:cursor-grabbing
                        transition-all duration-200
                        hover:scale-105 hover:bg-white
                        ${arrastrando === elem.id ? 'opacity-50 scale-95' : 'opacity-100'}
                        ${correcto === true ? 'border-green-500 shadow-lg shadow-green-500/50' : ''}
                        ${correcto === false ? 'border-red-500 shadow-lg shadow-red-500/50 animate-shake' : 'border-slate-300'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{elem.emoji}</div>
                        <div className="text-lg font-bold text-slate-800 flex-1">{elem.texto}</div>
                        {correcto === true && <span className="text-2xl">✅</span>}
                        {correcto === false && <span className="text-2xl">❌</span>}
                      </div>
                    </div>
                  );
                })}

                {elementosAqui.length === 0 && (
                  <div className="text-center text-white/50 text-lg font-bold py-8">
                    Arrastrá elementos aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botones */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={validar}
          disabled={obtenerElementosSinAsignar().length > 0}
          className="flex-1 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-2xl font-black text-2xl transition-all hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xl"
        >
          ✅ Verificar
        </button>

        <button
          onClick={resetear}
          className="px-8 py-5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white rounded-2xl font-black text-2xl transition-all hover:scale-105 shadow-xl"
        >
          🔄 Reintentar
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
            ? '🎉 ¡PERFECTO! Todos están en el lugar correcto 🎉'
            : '❌ Revisá los elementos marcados en rojo'}
        </div>
      )}
    </div>
  );
}
