/**
 * MODO APRENDIZAJE - AVENTURA QUÍMICA
 * ====================================
 *
 * Presentación educativa tipo PowerPoint con storytelling
 * para niños de 6-7 años sobre reacciones químicas.
 */

'use client';

import { useState } from 'react';

interface ModoAprendizajeProps {
  onBack: () => void;
}

type Slide = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function ModoAprendizaje({ onBack }: ModoAprendizajeProps) {
  const [slideActual, setSlideActual] = useState<Slide>(1);

  const avanzar = () => {
    if (slideActual < 8) {
      setSlideActual((slideActual + 1) as Slide);
    }
  };

  const retroceder = () => {
    if (slideActual > 1) {
      setSlideActual((slideActual - 1) as Slide);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 overflow-hidden">
      {/* Header minimalista */}
      <div className="flex items-center justify-between px-8 py-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
        >
          ← Salir
        </button>

        <div className="text-slate-400 text-sm">{slideActual} / 8</div>
      </div>

      {/* Slide actual - FULL SCREEN */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <div className="w-full max-w-7xl">
          {slideActual === 1 && <Slide1 />}
          {slideActual === 2 && <Slide2 />}
          {slideActual === 3 && <Slide3 />}
          {slideActual === 4 && <Slide4 />}
          {slideActual === 5 && <Slide5 />}
          {slideActual === 6 && <Slide6 />}
          {slideActual === 7 && <Slide7 />}
          {slideActual === 8 && <Slide8 />}
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center justify-between px-8 py-6 border-t border-slate-700/50">
        <button
          onClick={retroceder}
          disabled={slideActual === 1}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Anterior
        </button>

        {/* Indicador de progreso */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div
              key={num}
              className={`w-12 h-2 rounded-full transition-all ${
                num === slideActual
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 w-16'
                  : num < slideActual
                    ? 'bg-green-500'
                    : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Botón dinámico: "Siguiente" o "Empezar a Experimentar" */}
        {slideActual === 8 ? (
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 animate-pulse"
          >
            ¡Empezar a Experimentar! 🚀
          </button>
        ) : (
          <button
            onClick={avanzar}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/30"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 1: PORTADA - LA HISTORIA COMIENZA
// ============================================================================

function Slide1() {
  return (
    <div className="text-center animate-fadeIn">
      {/* Ilustración grande */}
      <div className="text-9xl mb-8 animate-bounce">🚀</div>

      {/* Título principal */}
      <h1 className="text-6xl md:text-7xl font-black mb-6">
        <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          La Aventura de
        </span>
        <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          los Cohetes Mágicos
        </span>
      </h1>

      {/* Subtítulo narrativo */}
      <p className="text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
        Había una vez un científico llamado{' '}
        <span className="text-cyan-400 font-bold">Dr. Burbujas</span> que descubrió algo
        increíble...
      </p>

      {/* Caja de historia */}
      <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
        <p className="text-xl text-slate-200 leading-relaxed">
          💡 <span className="font-bold text-yellow-400">¿Sabías que?</span> Algunos líquidos y
          polvos, cuando se juntan, ¡hacen burbujas y pueden hacer volar cosas muy alto!
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 2: EL DESCUBRIMIENTO
// ============================================================================

function Slide2() {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center animate-fadeIn">
      {/* Lado izquierdo: Ilustración */}
      <div className="text-center">
        <div className="text-9xl mb-6">🧪</div>
        <div className="flex justify-center gap-4 text-7xl">
          <span className="animate-bounce">💧</span>
          <span className="text-4xl mt-8">+</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
            ⚪
          </span>
          <span className="text-4xl mt-8">=</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>
            ✨
          </span>
        </div>
      </div>

      {/* Lado derecho: Historia */}
      <div>
        <h2 className="text-5xl font-black text-white mb-6">El Gran Descubrimiento 🎉</h2>

        <div className="space-y-6">
          <p className="text-2xl text-slate-200 leading-relaxed">
            Un día, el Dr. Burbujas mezcló <span className="text-cyan-400 font-bold">vinagre</span>{' '}
            (un líquido ácido) con <span className="text-purple-400 font-bold">bicarbonato</span>{' '}
            (un polvo blanco)...
          </p>

          <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-xl p-6">
            <p className="text-2xl text-yellow-200 font-bold mb-2">¡BOOM! 💥</p>
            <p className="text-xl text-slate-200">
              ¡Empezaron a salir un montón de burbujas! El vaso casi explota de tanta espuma.
            </p>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
            <p className="text-sm text-cyan-300 font-bold mb-2">💡 DATO CURIOSO</p>
            <p className="text-slate-200">
              Esas burbujas son <span className="font-bold">dióxido de carbono</span> (CO₂). ¡Es el
              mismo gas que exhalamos cuando respiramos!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 3: CONOCIENDO LOS INGREDIENTES - LÍQUIDOS ÁCIDOS
// ============================================================================

function Slide3() {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-4xl font-black text-center mb-6">
        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Los Líquidos Mágicos 💧
        </span>
      </h2>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Vinagre */}
        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-cyan-500/30 rounded-2xl p-5 text-center">
          <div className="text-6xl mb-3">💧</div>
          <h3 className="text-2xl font-bold text-white mb-3">Vinagre</h3>

          <div className="bg-slate-900/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-slate-200 leading-snug">
              Es como el que ponés en la ensalada. Es{' '}
              <span className="text-cyan-400 font-bold">ácido</span>, por eso tiene ese gustito
              fuerte.
            </p>
          </div>

          {/* Potencia */}
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1">Fuerza</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= 5 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
            <p className="text-cyan-400 font-bold mt-1 text-sm">⭐⭐⭐⭐⭐</p>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/40 rounded-xl p-3">
            <p className="text-purple-200 text-xs font-bold mb-1">💡 ¿Sabías que?</p>
            <p className="text-slate-200 text-xs">
              ¡El vinagre está hecho de vino viejo! Por eso se llama{' '}
              <span className="font-bold">vin-agre</span>.
            </p>
          </div>
        </div>

        {/* Limón */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-2 border-yellow-500/30 rounded-2xl p-5 text-center">
          <div className="text-6xl mb-3">🍋</div>
          <h3 className="text-2xl font-bold text-white mb-3">Jugo de Limón</h3>

          <div className="bg-slate-900/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-slate-200 leading-snug">
              ¡El campeón de los ácidos! Es{' '}
              <span className="text-yellow-400 font-bold">MUY fuerte</span>, por eso hace más
              burbujas.
            </p>
          </div>

          {/* Potencia */}
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1">Fuerza</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= 8 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
            <p className="text-yellow-400 font-bold mt-1 text-sm">⭐⭐⭐⭐⭐⭐⭐⭐</p>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/40 rounded-xl p-3">
            <p className="text-purple-200 text-xs font-bold mb-1">💡 ¿Sabías que?</p>
            <p className="text-slate-200 text-xs">
              ¡El limón tiene <span className="font-bold">3 veces</span> más ácido que el vinagre!
            </p>
          </div>
        </div>

        {/* Agua con sal */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-slate-500/30 rounded-2xl p-5 text-center">
          <div className="text-6xl mb-3">🧂</div>
          <h3 className="text-2xl font-bold text-white mb-3">Agua con Sal</h3>

          <div className="bg-slate-900/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-slate-200 leading-snug">
              Es agua normal con sal. No es muy fuerte, pero ¡es{' '}
              <span className="text-green-400 font-bold">baratísima</span>!
            </p>
          </div>

          {/* Potencia */}
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1">Fuerza</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= 2 ? 'bg-gradient-to-r from-slate-400 to-slate-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
            <p className="text-slate-400 font-bold mt-1 text-sm">⭐⭐</p>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/40 rounded-xl p-3">
            <p className="text-purple-200 text-xs font-bold mb-1">💡 ¿Sabías que?</p>
            <p className="text-slate-200 text-xs">
              El agua del <span className="font-bold">mar</span> es agua con sal. ¡Por eso flotás
              más fácil!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 4: CONOCIENDO LOS INGREDIENTES - POLVOS BASE
// ============================================================================

function Slide4() {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-4xl font-black text-center mb-6">
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Los Polvos Especiales ⚪
        </span>
      </h2>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Bicarbonato Normal */}
        <div className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 border-2 border-purple-500/30 rounded-2xl p-5 text-center">
          <div className="text-6xl mb-3">⚪</div>
          <h3 className="text-2xl font-bold text-white mb-3">Bicarbonato Normal</h3>

          <div className="bg-slate-900/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-slate-200 leading-snug">
              Un polvito blanco que parece azúcar. ¡Cuando se junta con ácidos hace{' '}
              <span className="text-cyan-400 font-bold">burbujas</span>!
            </p>
          </div>

          {/* Potencia */}
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1">Fuerza</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= 5 ? 'bg-gradient-to-r from-purple-400 to-pink-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
            <p className="text-purple-400 font-bold mt-1 text-sm">⭐⭐⭐⭐⭐</p>
          </div>

          <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-xl p-3">
            <p className="text-cyan-200 text-xs font-bold mb-1">💡 ¿Sabías que?</p>
            <p className="text-slate-200 text-xs">
              ¡Tu mamá usa bicarbonato para cocinar <span className="font-bold">galletitas</span>!
            </p>
          </div>
        </div>

        {/* Bicarbonato Especial */}
        <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 border-2 border-fuchsia-500/30 rounded-2xl p-5 text-center">
          <div className="text-6xl mb-3">✨</div>
          <h3 className="text-2xl font-bold text-white mb-3">Bicarbonato Especial</h3>

          <div className="bg-slate-900/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-slate-200 leading-snug">
              ¡La versión <span className="text-fuchsia-400 font-bold">SUPER PODEROSA</span>! Hace
              MUCHAS más burbujas.
            </p>
          </div>

          {/* Potencia */}
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1">Fuerza</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= 9 ? 'bg-gradient-to-r from-fuchsia-400 to-pink-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
            <p className="text-fuchsia-400 font-bold mt-1 text-sm">⭐⭐⭐⭐⭐⭐⭐⭐⭐</p>
          </div>

          <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-xl p-3">
            <p className="text-cyan-200 text-xs font-bold mb-1">💡 ¿Sabías que?</p>
            <p className="text-slate-200 text-xs">
              Tiene cristales <span className="font-bold">más finos</span>, ¡por eso reacciona más
              rápido!
            </p>
          </div>
        </div>

        {/* Polvo Mágico */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-slate-500/30 rounded-2xl p-5 text-center">
          <div className="text-6xl mb-3">🌟</div>
          <h3 className="text-2xl font-bold text-white mb-3">Polvo Mágico</h3>

          <div className="bg-slate-900/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-slate-200 leading-snug">
              Menos potente pero <span className="text-green-400 font-bold">súper barato</span>.
              Bueno si no tenés mucho dinero.
            </p>
          </div>

          {/* Potencia */}
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1">Fuerza</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= 3 ? 'bg-gradient-to-r from-slate-400 to-slate-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
            <p className="text-slate-400 font-bold mt-1 text-sm">⭐⭐⭐</p>
          </div>

          <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-xl p-3">
            <p className="text-cyan-200 text-xs font-bold mb-1">💡 ¿Sabías que?</p>
            <p className="text-slate-200 text-xs">
              Se llama &quot;mágico&quot; pero en realidad es bicarbonato{' '}
              <span className="font-bold">viejo</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 5: ¿CÓMO FUNCIONA LA MAGIA?
// ============================================================================

function Slide5() {
  return (
    <div className="animate-fadeIn text-center">
      <h2 className="text-4xl font-black mb-8">
        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          ¿Cómo Funciona la Magia? 🪄
        </span>
      </h2>

      {/* Diagrama visual */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="grid grid-cols-5 gap-3 items-center">
          {/* Paso 1 */}
          <div className="bg-cyan-500/20 border-2 border-cyan-500 rounded-2xl p-4">
            <div className="text-5xl mb-1">💧</div>
            <p className="text-cyan-300 font-bold text-sm">Líquido Ácido</p>
          </div>

          <div className="text-4xl">+</div>

          {/* Paso 2 */}
          <div className="bg-purple-500/20 border-2 border-purple-500 rounded-2xl p-4">
            <div className="text-5xl mb-1">⚪</div>
            <p className="text-purple-300 font-bold text-sm">Polvo Base</p>
          </div>

          <div className="text-4xl">=</div>

          {/* Resultado */}
          <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-4 animate-pulse">
            <div className="text-5xl mb-1">💨</div>
            <p className="text-green-300 font-bold text-sm">¡Gas CO₂!</p>
          </div>
        </div>
      </div>

      {/* Explicación narrativa */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-5">
          <div className="text-3xl mb-2">🔬</div>
          <h3 className="text-xl font-bold text-white mb-2">Paso 1: El Encuentro</h3>
          <p className="text-lg text-slate-200 leading-relaxed">
            Cuando el líquido ácido toca el polvo base, ¡empiezan a{' '}
            <span className="text-cyan-400 font-bold">pelear</span>! Cada uno quiere quedarse con
            las partículas del otro.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-5">
          <div className="text-3xl mb-2">💥</div>
          <h3 className="text-xl font-bold text-white mb-2">Paso 2: La Reacción</h3>
          <p className="text-lg text-slate-200 leading-relaxed">
            En esa &quot;pelea química&quot;, se crea un nuevo gas llamado{' '}
            <span className="text-purple-400 font-bold">CO₂</span> (dióxido de carbono). ¡Ese gas
            forma las burbujas!
          </p>
        </div>

        <div className="bg-gradient-to-r from-pink-900/40 to-red-900/40 border border-pink-500/30 rounded-2xl p-5">
          <div className="text-3xl mb-2">🚀</div>
          <h3 className="text-xl font-bold text-white mb-2">Paso 3: ¡Despegue!</h3>
          <p className="text-lg text-slate-200 leading-relaxed">
            Todas esas burbujas{' '}
            <span className="text-pink-400 font-bold">empujan hacia arriba</span> con mucha fuerza.
            ¡Por eso el cohete vuela! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 6: EL SECRETO DE LAS CANTIDADES
// ============================================================================

function Slide6() {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-4xl font-black text-center mb-6">
        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
          El Secreto de las Cantidades 🎯
        </span>
      </h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Ejemplo BIEN */}
        <div className="bg-green-900/20 border-2 border-green-500 rounded-3xl p-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">✅</div>
            <h3 className="text-2xl font-bold text-green-400">¡PERFECTO!</h3>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="text-center">
                <div className="text-4xl mb-1">💧</div>
                <div className="text-2xl font-bold text-cyan-400">3</div>
                <p className="text-slate-300 text-xs">cucharadas</p>
              </div>
              <div className="text-3xl">+</div>
              <div className="text-center">
                <div className="text-4xl mb-1">⚪</div>
                <div className="text-2xl font-bold text-purple-400">3</div>
                <p className="text-slate-300 text-xs">cucharadas</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-lg text-slate-200 leading-snug">
              🎉 <span className="font-bold">Cantidades iguales</span> = ¡Se usa todo!
            </p>
            <p className="text-sm text-green-300">
              No sobra nada. Toda la mezcla se convierte en burbujas.
            </p>
          </div>
        </div>

        {/* Ejemplo MAL */}
        <div className="bg-red-900/20 border-2 border-red-500 rounded-3xl p-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-2xl font-bold text-red-400">¡CUIDADO!</h3>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="text-center">
                <div className="text-4xl mb-1">💧</div>
                <div className="text-2xl font-bold text-cyan-400">10</div>
                <p className="text-slate-300 text-xs">cucharadas</p>
              </div>
              <div className="text-3xl">+</div>
              <div className="text-center">
                <div className="text-4xl mb-1">⚪</div>
                <div className="text-2xl font-bold text-purple-400">3</div>
                <p className="text-slate-300 text-xs">cucharadas</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-lg text-slate-200 leading-snug">
              😢 <span className="font-bold">Cantidades diferentes</span> = Sobra material
            </p>
            <p className="text-sm text-red-300">
              Solo reaccionan 3 de cada uno. Las 7 cucharadas de vinagre se desperdician.
            </p>
          </div>
        </div>
      </div>

      {/* Moraleja */}
      <div className="max-w-3xl mx-auto mt-6 bg-yellow-500/10 border-2 border-yellow-500 rounded-2xl p-5">
        <div className="text-4xl mb-2 text-center">💡</div>
        <p className="text-xl text-center text-yellow-200 font-bold mb-2">
          ¡La Lección del Dr. Burbujas!
        </p>
        <p className="text-lg text-slate-200 text-center leading-snug">
          &quot;Si ponés cantidades <span className="text-cyan-400 font-bold">iguales</span>,
          aprovechás TODO el material. ¡Así hacen los verdaderos científicos!&quot;
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 7: COMBOS ESPECIALES
// ============================================================================

function Slide7() {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-4xl font-black text-center mb-4">
        <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
          ¡Combos Especiales! ⭐
        </span>
      </h2>

      <p className="text-lg text-center text-slate-300 mb-6 max-w-2xl mx-auto">
        Algunos ingredientes funcionan{' '}
        <span className="text-fuchsia-400 font-bold">mejor juntos</span>. ¡Como un equipo de
        superhéroes!
      </p>

      <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {/* Combo Campeón */}
        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-3 border-yellow-500 rounded-2xl p-5 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 px-4 py-1 rounded-full font-black text-sm">
            👑 CAMPEÓN
          </div>

          <div className="text-center mb-3 mt-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-5xl">🍋</div>
              <div className="text-3xl">+</div>
              <div className="text-5xl">✨</div>
            </div>
            <h3 className="text-lg font-bold text-yellow-400 mb-1">Limón + Bicarbonato Especial</h3>
            <div className="text-2xl font-black text-yellow-300">+30% más alto!</div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-3">
            <p className="text-sm text-slate-200 leading-snug">
              🏆 ¡El combo PERFECTO! Ambos son muy fuertes, así que juntos hacen una
              <span className="text-yellow-400 font-bold"> MEGA EXPLOSIÓN</span> de burbujas.
            </p>
          </div>
        </div>

        {/* Combo Bueno */}
        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-3 border-cyan-500 rounded-2xl p-5 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-cyan-950 px-4 py-1 rounded-full font-black text-sm">
            🥈 MUY BUENO
          </div>

          <div className="text-center mb-3 mt-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-5xl">🍋</div>
              <div className="text-3xl">+</div>
              <div className="text-5xl">⚪</div>
            </div>
            <h3 className="text-lg font-bold text-cyan-400 mb-1">Limón + Bicarbonato Normal</h3>
            <div className="text-2xl font-black text-cyan-300">+20% más alto!</div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-3">
            <p className="text-sm text-slate-200 leading-snug">
              👍 ¡Muy buena combinación! El limón fuerte compensa que el bicarbonato sea normal.
            </p>
          </div>
        </div>

        {/* Combo Normal */}
        <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-3 border-purple-500 rounded-2xl p-5 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-purple-950 px-4 py-1 rounded-full font-black text-sm">
            🥉 NORMAL
          </div>

          <div className="text-center mb-3 mt-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-5xl">💧</div>
              <div className="text-3xl">+</div>
              <div className="text-5xl">⚪</div>
            </div>
            <h3 className="text-lg font-bold text-purple-400 mb-1">Vinagre + Bicarbonato Normal</h3>
            <div className="text-2xl font-black text-purple-300">Altura normal</div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-3">
            <p className="text-sm text-slate-200 leading-snug">
              👌 El combo <span className="text-purple-400 font-bold">clásico</span>. Funciona bien,
              pero no es el más poderoso.
            </p>
          </div>
        </div>

        {/* Combo Malo */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-3 border-slate-500 rounded-2xl p-5 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-500 text-slate-950 px-4 py-1 rounded-full font-black text-sm">
            😢 FLOJITO
          </div>

          <div className="text-center mb-3 mt-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-5xl">🧂</div>
              <div className="text-3xl">+</div>
              <div className="text-5xl">🌟</div>
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-1">Agua con Sal + Polvo Mágico</h3>
            <div className="text-2xl font-black text-slate-300">-50% más bajo</div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-3">
            <p className="text-sm text-slate-200 leading-snug">
              😔 Ambos son débiles. No es buena idea usarlos juntos si querés volar alto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE 8: CIERRE - ¡AHORA TE TOCA A VOS!
// ============================================================================

function Slide8() {
  return (
    <div className="text-center animate-fadeIn">
      <div className="text-7xl mb-6">🎓</div>

      <h1 className="text-5xl font-black mb-6">
        <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          ¡Felicitaciones!
        </span>
        <span className="block text-white">Ya Sos un Científico 🧑‍🔬</span>
      </h1>

      <div className="max-w-3xl mx-auto space-y-5">
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500 rounded-2xl p-5">
          <h3 className="text-xl font-bold text-green-400 mb-3">📚 Ahora sabés:</h3>
          <ul className="space-y-2 text-left text-base text-slate-200">
            <li className="flex items-start gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>
                Qué son los <span className="font-bold">líquidos ácidos</span> y los{' '}
                <span className="font-bold">polvos base</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>
                Cómo se crean las <span className="font-bold">burbujas de CO₂</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>
                Por qué es importante usar <span className="font-bold">cantidades iguales</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>
                Qué <span className="font-bold">combos especiales</span> funcionan mejor
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500 rounded-2xl p-5">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-xl font-bold text-cyan-400 mb-3">¿Qué sigue ahora?</h3>
          <p className="text-lg text-slate-200 leading-snug">
            ¡Es hora de poner en práctica todo lo que aprendiste! Probá diferentes combos y
            cantidades para ver qué cohete vuela más alto.
          </p>
        </div>

        <div className="text-3xl">🎉 ¡Vamos a experimentar! 🎉</div>
      </div>
    </div>
  );
}
