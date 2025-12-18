/**
 * DESAFÍO 2: PRESUPUESTO LIMITADO - VERSIÓN COMPACTA SIN SCROLL
 * ===============================================================
 * Diseño estilo Roblox en 3 columnas que cabe en una pantalla completa
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

export default function Desafio2Compacto({ onBack, onCompletado, yaCompletado }: Desafio2Props) {
  const [seleccion, setSeleccion] = useState<SeleccionIngredientes | null>(null);
  const [resultado, setResultado] = useState<ResultadoReaccion | null>(null);
  const [enAnimacion, setEnAnimacion] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [mejorAltura, setMejorAltura] = useState<number>(0);
  const [showHints, setShowHints] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const PRESUPUESTO_MAXIMO = 100;
  const ALTURA_MINIMA_EXITO = 35;

  // Sistema de pistas compacto
  const getPistas = () => {
    const pistas = [];
    if (!seleccion) return ['💡 Seleccioná ingredientes para empezar'];

    const costo = seleccion.costoTotal;
    const altura = resultado?.alturaAlcanzada || 0;

    if (costo > PRESUPUESTO_MAXIMO) {
      pistas.push('💸 Reducí cantidad o elegí más baratos');
    } else if (costo >= 90) {
      pistas.push('✅ Buen uso del presupuesto');
    }

    if (resultado && altura < ALTURA_MINIMA_EXITO) {
      if (altura < 20) pistas.push('📈 Necesitás más potencia');
      else if (altura < 30) pistas.push('📊 Aumentá cantidades');
      else pistas.push('🎯 ¡Casi! Ajustá el balance');
    }

    if (intentos >= 3 && mejorAltura < ALTURA_MINIMA_EXITO) {
      pistas.push('🔑 Limón + Bicarbonato especial, $85-95');
    }

    return pistas.slice(0, 2);
  };

  // Tests compactos
  const tests = [
    { name: 'Presupuesto OK', passed: !seleccion || seleccion.costoTotal <= PRESUPUESTO_MAXIMO },
    {
      name: 'Ingredientes OK',
      passed:
        (seleccion?.combustible.cantidad ?? 0) > 0 && (seleccion?.propulsor.cantidad ?? 0) > 0,
    },
    { name: 'Altura ≥35cm', passed: resultado && resultado.alturaAlcanzada >= ALTURA_MINIMA_EXITO },
    { name: 'Uso eficiente', passed: seleccion && seleccion.costoTotal >= 70 },
  ];

  const handleMezclar = () => {
    if (!seleccion || seleccion.combustible.cantidad === 0 || seleccion.propulsor.cantidad === 0)
      return;
    if (seleccion.costoTotal > PRESUPUESTO_MAXIMO) return;

    const res = calcularReaccion({
      combustible: seleccion.combustible,
      propulsor: seleccion.propulsor,
    });

    setResultado(res);
    setEnAnimacion(true);
    setIntentos(intentos + 1);

    if (res.alturaAlcanzada > mejorAltura) {
      setMejorAltura(res.alturaAlcanzada);

      if (res.alturaAlcanzada >= ALTURA_MINIMA_EXITO) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        if (!yaCompletado) {
          setTimeout(() => onCompletado(), 2000);
        }
      }
    }
  };

  const exito = resultado && resultado.alturaAlcanzada >= ALTURA_MINIMA_EXITO;
  const pistas = getPistas();
  const porcentajePresupuesto = ((seleccion?.costoTotal || 0) / PRESUPUESTO_MAXIMO) * 100;

  return (
    <div className="h-screen flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['🎉', '✨', '💰', '⭐'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      {/* Header ultra compacto */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-b border-purple-500/30 px-4 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold transition-all"
          >
            ← Volver
          </button>

          <div className="text-center flex-1">
            <div className="text-xs text-purple-400 font-bold mb-0.5">DESAFÍO 2 · OPTIMIZACIÓN</div>
            <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              💰 Presupuesto Limitado
            </h1>
          </div>

          <div className="text-xs text-right">
            <div className="text-purple-400 font-bold">
              {exito ? '✅ Completado' : 'En progreso'}
            </div>
          </div>
        </div>

        {/* Progress bar mini */}
        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${Math.min((mejorAltura / ALTURA_MINIMA_EXITO) * 100, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
          <span>Intentos: {intentos}</span>
          <span>
            Mejor: {mejorAltura}cm / {ALTURA_MINIMA_EXITO}cm
          </span>
        </div>
      </div>

      {/* Layout 3 columnas - SIN SCROLL */}
      <div className="flex-1 grid grid-cols-3 gap-2 p-2 overflow-hidden">
        {/* COLUMNA 1: TEORÍA + PISTAS */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/40 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-purple-500/10 border-b border-purple-500/30 px-3 py-1.5">
            <h3 className="text-xs font-black text-white">📚 TEORÍA & ESTRATEGIA</h3>
          </div>

          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            {/* Objetivo */}
            <div className="bg-slate-900/60 rounded p-2 border border-slate-700">
              <h4 className="text-xs font-bold text-purple-300 mb-1">🎯 Objetivo</h4>
              <p className="text-xs text-slate-300 leading-tight">
                Máxima altura con máximo{' '}
                <span className="text-purple-400 font-bold">${PRESUPUESTO_MAXIMO}</span> (mínimo{' '}
                {ALTURA_MINIMA_EXITO}cm)
              </p>
            </div>

            {/* Concepto */}
            <div className="bg-slate-900/60 rounded p-2 border border-slate-700">
              <h4 className="text-xs font-bold text-purple-300 mb-1">💡 Concepto</h4>
              <p className="text-xs text-slate-300 leading-tight">
                <span className="text-purple-400 font-bold">Optimización</span>: balance entre costo
                y potencia
              </p>
            </div>

            {/* Pistas */}
            <button
              onClick={() => setShowHints(!showHints)}
              className="w-full px-2 py-1.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-all"
            >
              {showHints ? '🙈 Ocultar' : '💡 Mostrar'} Pistas ({pistas.length})
            </button>

            {showHints && (
              <div className="bg-amber-500/10 rounded p-2 border border-amber-500/40 animate-fadeIn">
                {pistas.map((pista, idx) => (
                  <div key={idx} className="text-xs text-slate-300 mb-1 flex gap-1">
                    <span className="text-amber-400">•</span>
                    <span className="leading-tight">{pista}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tests */}
            <div className="bg-slate-900/60 rounded p-2 border border-slate-700">
              <h4 className="text-xs font-bold text-white mb-1.5">✓ Tests</h4>
              <div className="space-y-1">
                {tests.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className="text-sm">{test.passed ? '✅' : '⚪'}</span>
                    <span className={test.passed ? 'text-green-300' : 'text-slate-500'}>
                      {test.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: CONFIGURACIÓN */}
        <div className="bg-slate-900/80 border border-green-500/40 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-green-500/10 border-b border-green-500/30 px-3 py-1.5">
            <h3 className="text-xs font-black text-white">🧪 CONFIGURACIÓN</h3>
          </div>

          <div className="flex-1 p-3 space-y-2 overflow-hidden flex flex-col">
            {/* Barra de presupuesto */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">💰 Presupuesto</span>
                <span className="text-sm font-black text-white">
                  ${seleccion?.costoTotal || 0}/{PRESUPUESTO_MAXIMO}
                </span>
              </div>

              <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    porcentajePresupuesto > 100
                      ? 'bg-red-500'
                      : porcentajePresupuesto >= 80
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(porcentajePresupuesto, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {Math.round(porcentajePresupuesto)}%
                  </span>
                </div>
              </div>

              <div className="text-center mt-1">
                {(seleccion?.costoTotal || 0) > PRESUPUESTO_MAXIMO ? (
                  <span className="text-xs text-red-400 font-bold">
                    ⚠️ Excedido por ${(seleccion?.costoTotal || 0) - PRESUPUESTO_MAXIMO}
                  </span>
                ) : (
                  <span className="text-xs text-emerald-400 font-bold">
                    ✓ Disponible: ${PRESUPUESTO_MAXIMO - (seleccion?.costoTotal || 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Warning inline */}
            {seleccion && seleccion.costoTotal > PRESUPUESTO_MAXIMO && (
              <div className="bg-red-500/20 border border-red-500/50 rounded p-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <div className="text-xs text-red-300 font-bold">
                    ¡Reducí cantidad o elegí más baratos!
                  </div>
                </div>
              </div>
            )}

            {/* Selector compacto */}
            <div className="flex-1 overflow-auto">
              <SelectorIngredientes
                onCambio={setSeleccion}
                presupuestoMaximo={PRESUPUESTO_MAXIMO}
                mostrarPrediccion={true}
              />
            </div>

            {/* Botón */}
            <button
              onClick={handleMezclar}
              disabled={
                !seleccion ||
                seleccion.combustible.cantidad === 0 ||
                seleccion.propulsor.cantidad === 0 ||
                seleccion.costoTotal > PRESUPUESTO_MAXIMO
              }
              className="w-full px-4 py-2.5 rounded-lg font-black text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white shadow-lg"
              style={{
                background:
                  seleccion && seleccion.costoTotal > PRESUPUESTO_MAXIMO
                    ? '#475569'
                    : 'linear-gradient(135deg, #a855f7, #ec4899)',
              }}
            >
              {!seleccion ||
              seleccion.combustible.cantidad === 0 ||
              seleccion.propulsor.cantidad === 0
                ? '⚠️ Elegí ingredientes'
                : seleccion.costoTotal > PRESUPUESTO_MAXIMO
                  ? '⚠️ Excedido'
                  : '🚀 ¡LANZAR!'}
            </button>
          </div>
        </div>

        {/* COLUMNA 3: RESULTADO */}
        <div className="bg-slate-900/80 border border-indigo-500/40 rounded-lg flex flex-col overflow-hidden">
          <div className="bg-indigo-500/10 border-b border-indigo-500/30 px-3 py-1.5">
            <h3 className="text-xs font-black text-white">🚀 RESULTADO</h3>
          </div>

          <div className="flex-1 p-3 flex flex-col overflow-hidden">
            {/* Stats mini */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="bg-slate-800/50 border border-slate-700 rounded p-1.5 text-center">
                <div className="text-xs text-slate-400">📊</div>
                <div className="text-lg font-black text-white">{intentos}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded p-1.5 text-center">
                <div className="text-xs text-slate-400">🏅</div>
                <div className="text-lg font-black text-cyan-400">{mejorAltura}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded p-1.5 text-center">
                <div className="text-xs text-slate-400">🎯</div>
                <div className="text-lg font-black text-purple-400">{ALTURA_MINIMA_EXITO}</div>
              </div>
            </div>

            {/* Cohete - ocupa el espacio restante */}
            <div className="flex-1 relative">
              <Cohete
                altura={resultado?.alturaAlcanzada || 0}
                alturaMaxima={80}
                enAnimacion={enAnimacion}
                intensidad={resultado?.intensidadVisual}
                onAnimacionCompleta={() => setEnAnimacion(false)}
              />
            </div>

            {/* Resultado compacto */}
            {resultado && (
              <div
                className={`
                mt-2 rounded p-2 border animate-fadeIn
                ${exito ? 'bg-green-500/20 border-green-500/50' : 'bg-blue-500/20 border-blue-500/50'}
              `}
              >
                <div className="text-center">
                  {exito ? (
                    <>
                      <div className="text-3xl mb-1">🎉</div>
                      <div className="text-sm font-black text-green-300 mb-1">¡EXCELENTE!</div>
                      <div className="text-xs text-white">
                        <span className="font-bold text-green-400">
                          {resultado.alturaAlcanzada}cm
                        </span>{' '}
                        · ${seleccion?.costoTotal}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl mb-1">📊</div>
                      <div className="text-sm font-bold text-cyan-300">
                        {resultado.alturaAlcanzada}cm
                      </div>
                      <div className="text-xs text-slate-300">
                        {resultado.alturaAlcanzada >= 30
                          ? `Faltan ${ALTURA_MINIMA_EXITO - resultado.alturaAlcanzada}cm`
                          : 'Más potencia'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
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
