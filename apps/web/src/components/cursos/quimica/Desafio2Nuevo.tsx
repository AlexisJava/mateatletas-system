/**
 * DESAFÍO 2: PRESUPUESTO LIMITADO - Rediseño completo estilo Roblox
 * ===================================================================
 *
 * Layout de 3 columnas:
 * 1. TEORÍA + PISTAS - Contenido educativo y sistema de hints
 * 2. CONFIGURACIÓN - Selector de ingredientes con barra de presupuesto visual
 * 3. RESULTADO - Cohete y feedback visual
 */

'use client';

import { useState } from 'react';
import Cohete from './Cohete';
import SelectorIngredientes, { SeleccionIngredientes } from './SelectorIngredientes';
import { calcularReaccion, ResultadoReaccion } from '@/lib/quimica/motor-quimico';

interface Desafio2Props {
  onBack: () => void;
  onCompletado: () => void;
  yaCompletado: boolean;
}

export default function Desafio2Nuevo({ onBack, onCompletado, yaCompletado }: Desafio2Props) {
  const [seleccion, setSeleccion] = useState<SeleccionIngredientes | null>(null);
  const [resultado, setResultado] = useState<ResultadoReaccion | null>(null);
  const [enAnimacion, setEnAnimacion] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [mejorAltura, setMejorAltura] = useState<number>(0);
  const [showHints, setShowHints] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [historial, setHistorial] = useState<Array<{ altura: number; costo: number }>>([]);

  const PRESUPUESTO_MAXIMO = 100;
  const ALTURA_MINIMA_EXITO = 35;

  // Sistema de pistas inteligente
  const getPistas = () => {
    if (!seleccion) return [];

    const pistas = [];
    const costo = seleccion.costoTotal;
    const altura = resultado?.alturaAlcanzada || 0;

    // Pistas sobre presupuesto
    if (costo > PRESUPUESTO_MAXIMO) {
      pistas.push(
        '💸 Estás excediendo el presupuesto. Intentá con ingredientes más baratos o menos cantidad.',
      );
    } else if (costo < 50) {
      pistas.push('💰 Estás gastando poco. Podés usar ingredientes más potentes.');
    } else if (costo >= 90 && costo <= PRESUPUESTO_MAXIMO) {
      pistas.push('✅ Estás usando casi todo el presupuesto. ¡Buena estrategia!');
    }

    // Pistas sobre altura
    if (resultado) {
      if (altura < 20) {
        pistas.push(
          '📈 Muy bajo. Necesitás ingredientes más potentes (limón + bicarbonato especial).',
        );
      } else if (altura >= 20 && altura < 30) {
        pistas.push('📊 Vas por buen camino. Probá aumentar las cantidades o combinar mejor.');
      } else if (altura >= 30 && altura < ALTURA_MINIMA_EXITO) {
        pistas.push(
          '🎯 ¡Casi! Te faltan pocos cm. Ajustá las cantidades para equilibrar la reacción.',
        );
      }
    }

    // Pistas específicas sobre ingredientes
    if (seleccion.combustible.tipo === 'aguaSal') {
      pistas.push('💡 El agua con sal es muy débil. Probá con vinagre o limón para más potencia.');
    }

    if (seleccion.propulsor.tipo === 'polvoMagico') {
      pistas.push(
        '💡 El polvo mágico es económico pero débil. Probá con bicarbonato o bicarbonato especial.',
      );
    }

    // Pista sobre la combinación óptima
    if (intentos >= 3 && mejorAltura < ALTURA_MINIMA_EXITO) {
      pistas.push(
        '🔑 Pista estratégica: La mejor combinación cuesta entre $85-$95 y usa ingredientes potentes en cantidades iguales.',
      );
    }

    return pistas.slice(0, 3); // Máximo 3 pistas a la vez
  };

  // Tests de verificación
  const getTests = () => {
    const tests = [
      {
        description: 'Presupuesto respetado (≤ $100)',
        passed: !seleccion || seleccion.costoTotal <= PRESUPUESTO_MAXIMO,
      },
      {
        description: 'Ambos ingredientes seleccionados',
        passed: seleccion && seleccion.combustible.cantidad > 0 && seleccion.propulsor.cantidad > 0,
      },
      {
        description: 'Altura mínima alcanzada (≥ 35cm)',
        passed: resultado && resultado.alturaAlcanzada >= ALTURA_MINIMA_EXITO,
      },
      {
        description: 'Uso eficiente del presupuesto (≥ $70)',
        passed: seleccion && seleccion.costoTotal >= 70,
      },
    ];
    return tests;
  };

  const handleMezclar = () => {
    if (!seleccion || seleccion.combustible.cantidad === 0 || seleccion.propulsor.cantidad === 0) {
      return;
    }

    if (seleccion.costoTotal > PRESUPUESTO_MAXIMO) {
      // Ya no usamos alert - el feedback visual lo maneja la UI
      return;
    }

    const res = calcularReaccion({
      combustible: seleccion.combustible,
      propulsor: seleccion.propulsor,
    });

    setResultado(res);
    setEnAnimacion(true);
    setIntentos(intentos + 1);
    setHistorial([...historial, { altura: res.alturaAlcanzada, costo: seleccion.costoTotal }]);

    if (res.alturaAlcanzada > mejorAltura) {
      setMejorAltura(res.alturaAlcanzada);

      if (res.alturaAlcanzada >= ALTURA_MINIMA_EXITO) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);

        if (!yaCompletado) {
          setTimeout(() => {
            onCompletado();
          }, 2000);
        }
      }
    }
  };

  const exito = resultado && resultado.alturaAlcanzada >= ALTURA_MINIMA_EXITO;
  const tests = getTests();
  const pistas = getPistas();
  const presupuestoDisponible = PRESUPUESTO_MAXIMO - (seleccion?.costoTotal || 0);
  const porcentajePresupuesto = ((seleccion?.costoTotal || 0) / PRESUPUESTO_MAXIMO) * 100;

  return (
    <div
      className="min-h-screen py-6 px-4 relative overflow-hidden"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Confetti celebration */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: `${20 + Math.random() * 30}px`,
              }}
            >
              {['🎉', '✨', '🎊', '⭐', '🌟', '💫', '💰'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      )}

      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header compacto */}
        <header className="text-center mb-6">
          <button
            onClick={onBack}
            className="absolute top-0 left-0 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-purple-500 text-white font-semibold transition-all duration-300 hover:scale-105"
          >
            ← Volver
          </button>

          <div className="inline-block px-6 py-2 rounded-full text-sm font-bold border-2 mb-4 bg-purple-500/20 border-purple-500 text-white">
            DESAFÍO 2 · OPTIMIZACIÓN
          </div>

          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            💰 Presupuesto Limitado
          </h1>
          <p className="text-slate-300 text-lg">
            Máxima altura con máximo{' '}
            <span className="text-purple-400 font-bold">${PRESUPUESTO_MAXIMO}</span>
          </p>
        </header>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-400">
              Progreso: {intentos} intentos | Mejor: {mejorAltura}cm
            </span>
            <span className="text-sm font-bold text-purple-400">
              {exito ? '✅ Completado' : 'En progreso'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-pink-500"
              style={{
                width: `${Math.min((mejorAltura / ALTURA_MINIMA_EXITO) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* LAYOUT DE 3 COLUMNAS (estilo Roblox) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6" style={{ minHeight: '600px' }}>
          {/* COLUMNA 1: TEORÍA + PISTAS */}
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border-2 border-purple-400/60 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b-2 border-purple-400/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <h3 className="text-lg font-black text-white">TEORÍA & ESTRATEGIA</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Teoría */}
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
                <h4 className="font-bold text-purple-300 mb-2 text-sm">🎯 Objetivo del Desafío</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Tenés un presupuesto de{' '}
                  <span className="text-purple-400 font-bold">${PRESUPUESTO_MAXIMO}</span> para
                  comprar ingredientes. Tu meta es hacer que el cohete alcance la{' '}
                  <span className="text-green-400 font-bold">mayor altura posible</span> (mínimo{' '}
                  {ALTURA_MINIMA_EXITO}cm) sin gastar más del presupuesto.
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
                <h4 className="font-bold text-purple-300 mb-2 text-sm">💡 Concepto Clave</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Este desafío te enseña sobre{' '}
                  <span className="text-purple-400 font-bold">optimización de recursos</span>:
                  encontrar el mejor balance entre costo y potencia. Los ingredientes más caros no
                  siempre son la mejor opción si no los combinás bien.
                </p>
              </div>

              {/* Botón de pistas */}
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border-2 bg-amber-500/20 border-amber-500/60 text-amber-400"
              >
                {showHints ? '🙈 Ocultar' : '💡 Mostrar'} Pistas ({pistas.length})
              </button>

              {/* Pistas */}
              {showHints && pistas.length > 0 && (
                <div className="bg-amber-500/10 rounded-xl p-4 border-2 border-amber-500/40 animate-fadeIn">
                  <h4 className="font-bold text-amber-300 mb-3 text-sm">
                    💡 Pistas para este intento:
                  </h4>
                  <ul className="space-y-2">
                    {pistas.map((pista, idx) => (
                      <li key={idx} className="text-slate-300 text-sm flex gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{pista}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tests de verificación */}
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
                <h4 className="font-bold text-white mb-3 text-sm">✓ Tests de Verificación</h4>
                <div className="space-y-2">
                  {tests.map((test, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg transition-all duration-300 bg-slate-800/50"
                    >
                      <span className="text-xl">{test.passed ? '✅' : '⚪'}</span>
                      <span
                        className={`text-xs ${test.passed ? 'text-green-300' : 'text-slate-400'}`}
                      >
                        {test.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial */}
              {historial.length > 0 && (
                <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
                  <h4 className="font-bold text-white mb-3 text-sm">📊 Últimos 5 intentos</h4>
                  <div className="space-y-2">
                    {historial
                      .slice(-5)
                      .reverse()
                      .map((h, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 bg-slate-800/50 rounded"
                        >
                          <span className="text-slate-400">Intento {historial.length - idx}</span>
                          <span
                            className={`font-bold ${h.altura >= ALTURA_MINIMA_EXITO ? 'text-green-400' : 'text-cyan-400'}`}
                          >
                            {h.altura}cm
                          </span>
                          <span className="text-purple-400">${h.costo}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 2: CONFIGURACIÓN */}
          <div className="bg-slate-900/80 backdrop-blur-md border-2 border-green-500/40 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b-2 border-green-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧪</span>
                <h3 className="text-lg font-black text-white">CONFIGURACIÓN</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Barra de presupuesto visual */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">💰 Presupuesto</span>
                  <span className="text-lg font-black text-white">
                    ${seleccion?.costoTotal || 0} / ${PRESUPUESTO_MAXIMO}
                  </span>
                </div>

                {/* Barra visual */}
                <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${
                      porcentajePresupuesto > 100
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : porcentajePresupuesto >= 80
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(porcentajePresupuesto, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {Math.round(porcentajePresupuesto)}%
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  {presupuestoDisponible < 0 ? (
                    <span className="text-red-400 text-sm font-bold">
                      ⚠️ Te excediste por ${Math.abs(presupuestoDisponible)}
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-sm font-bold">
                      ✓ Te quedan ${presupuestoDisponible} disponibles
                    </span>
                  )}
                </div>
              </div>

              {/* Advertencia inline si excede presupuesto */}
              {seleccion && seleccion.costoTotal > PRESUPUESTO_MAXIMO && (
                <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h4 className="font-bold text-red-300 mb-1">¡Te pasaste del presupuesto!</h4>
                      <p className="text-red-200 text-sm">
                        Reducí la cantidad o elegí ingredientes más baratos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selector de ingredientes */}
              <SelectorIngredientes
                onCambio={setSeleccion}
                presupuestoMaximo={PRESUPUESTO_MAXIMO}
                mostrarPrediccion={true}
              />

              {/* Botón de lanzar */}
              <button
                onClick={handleMezclar}
                disabled={
                  !seleccion ||
                  seleccion.combustible.cantidad === 0 ||
                  seleccion.propulsor.cantidad === 0 ||
                  seleccion.costoTotal > PRESUPUESTO_MAXIMO
                }
                className="w-full px-6 py-4 rounded-xl font-black text-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white shadow-xl"
                style={{
                  background:
                    seleccion && seleccion.costoTotal > PRESUPUESTO_MAXIMO
                      ? '#475569'
                      : 'linear-gradient(135deg, #a855f7, #ec4899)',
                  boxShadow:
                    seleccion && seleccion.costoTotal <= PRESUPUESTO_MAXIMO
                      ? '0 8px 32px #a855f780'
                      : 'none',
                }}
              >
                {!seleccion ||
                seleccion.combustible.cantidad === 0 ||
                seleccion.propulsor.cantidad === 0
                  ? '⚠️ Elegí ingredientes'
                  : seleccion.costoTotal > PRESUPUESTO_MAXIMO
                    ? '⚠️ Presupuesto excedido'
                    : '🚀 ¡LANZAR COHETE!'}
              </button>
            </div>
          </div>

          {/* COLUMNA 3: RESULTADO */}
          <div className="bg-slate-900/80 backdrop-blur-md border-2 border-indigo-500/40 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b-2 border-indigo-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <h3 className="text-lg font-black text-white">RESULTADO</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Stats compactos */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">📊 Intentos</div>
                  <div className="text-2xl font-black text-white">{intentos}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">🏅 Mejor</div>
                  <div className="text-2xl font-black text-cyan-400">{mejorAltura}cm</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs mb-1">🎯 Meta</div>
                  <div className="text-2xl font-black text-purple-400">{ALTURA_MINIMA_EXITO}cm</div>
                </div>
              </div>

              {/* Cohete */}
              <Cohete
                altura={resultado?.alturaAlcanzada || 0}
                alturaMaxima={80}
                enAnimacion={enAnimacion}
                intensidad={resultado?.intensidadVisual}
                onAnimacionCompleta={() => setEnAnimacion(false)}
              />

              {/* Resultado del último lanzamiento */}
              {resultado && (
                <div
                  className={`
                  mt-4 rounded-xl p-4 border-2 transition-all animate-fadeIn
                  ${
                    exito
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50'
                      : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50'
                  }
                `}
                >
                  <div className="text-center">
                    {exito ? (
                      <>
                        <div className="text-6xl mb-3">🎉</div>
                        <h2 className="text-2xl font-black text-green-300 mb-2">
                          ¡EXCELENTE OPTIMIZACIÓN!
                        </h2>
                        <p className="text-lg text-white mb-1">
                          Altura:{' '}
                          <span className="font-bold text-green-400">
                            {resultado.alturaAlcanzada}cm
                          </span>
                        </p>
                        <p className="text-sm text-slate-300 mb-2">
                          Gastaste ${seleccion?.costoTotal} de ${PRESUPUESTO_MAXIMO}
                        </p>
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-xs text-green-200">
                          ✓ ¡Superaste los {ALTURA_MINIMA_EXITO}cm con presupuesto limitado!
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-5xl mb-3">📊</div>
                        <h3 className="text-xl font-bold text-cyan-300 mb-2">
                          Altura: {resultado.alturaAlcanzada}cm
                        </h3>
                        <p className="text-sm text-slate-300 mb-2">
                          Gastaste ${seleccion?.costoTotal} de ${PRESUPUESTO_MAXIMO}
                        </p>
                        {resultado.alturaAlcanzada >= 30 ? (
                          <p className="text-cyan-200 text-xs">
                            🎯 ¡Casi! Solo te faltan{' '}
                            {ALTURA_MINIMA_EXITO - resultado.alturaAlcanzada}cm
                          </p>
                        ) : (
                          <p className="text-cyan-200 text-xs">
                            💡 Probá con ingredientes más potentes
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
