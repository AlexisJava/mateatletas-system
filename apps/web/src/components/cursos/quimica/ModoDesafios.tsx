/**
 * MODO DESAFÍOS - LA FÁBRICA DE COHETES ESPACIALES
 * ==================================================
 *
 * Tres desafíos progresivos que ponen a prueba los conocimientos adquiridos.
 *
 * DESAFÍO 1: Altura Exacta (20cm) - Precisión
 * DESAFÍO 2: Presupuesto Limitado ($100, máxima altura) - Optimización económica
 * DESAFÍO 3: Eficiencia Máxima (30cm, mínimas cucharadas) - Eficiencia de recursos
 */

'use client';

import { useState } from 'react';
import Cohete from './Cohete';
import SelectorIngredientes, { SeleccionIngredientes } from './SelectorIngredientes';
import { calcularReaccion, ResultadoReaccion } from '@/lib/quimica/motor-quimico';

interface ModoDesafiosProps {
  onBack: () => void;
}

type Desafio = 1 | 2 | 3;

export default function ModoDesafios({ onBack }: ModoDesafiosProps) {
  const [desafioActual, setDesafioActual] = useState<Desafio | null>(null);
  const [desafiosCompletados, setDesafiosCompletados] = useState<Set<Desafio>>(new Set());

  const marcarCompletado = (desafio: Desafio) => {
    setDesafiosCompletados(new Set(desafiosCompletados).add(desafio));
  };

  const volverAMenu = () => {
    setDesafioActual(null);
  };

  if (desafioActual === null) {
    return (
      <MenuDesafios
        onBack={onBack}
        onSelectDesafio={setDesafioActual}
        completados={desafiosCompletados}
      />
    );
  }

  return (
    <>
      {desafioActual === 1 && (
        <Desafio1
          onBack={volverAMenu}
          onCompletado={() => marcarCompletado(1)}
          yaCompletado={desafiosCompletados.has(1)}
        />
      )}
      {desafioActual === 2 && (
        <Desafio2
          onBack={volverAMenu}
          onCompletado={() => marcarCompletado(2)}
          yaCompletado={desafiosCompletados.has(2)}
        />
      )}
      {desafioActual === 3 && (
        <Desafio3
          onBack={volverAMenu}
          onCompletado={() => marcarCompletado(3)}
          yaCompletado={desafiosCompletados.has(3)}
        />
      )}
    </>
  );
}

// ============================================================================
// MENÚ DE DESAFÍOS
// ============================================================================

interface MenuDesafiosProps {
  onBack: () => void;
  onSelectDesafio: (desafio: Desafio) => void;
  completados: Set<Desafio>;
}

function MenuDesafios({ onBack, onSelectDesafio, completados }: MenuDesafiosProps) {
  const desafios = [
    {
      numero: 1 as Desafio,
      icon: '🎯',
      nombre: 'Altura Exacta',
      descripcion: 'Hacé que el cohete llegue a exactamente 20cm',
      dificultad: 'Fácil',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      numero: 2 as Desafio,
      icon: '💰',
      nombre: 'Presupuesto Limitado',
      descripcion: 'Llegá lo más alto posible gastando máximo $100',
      dificultad: 'Medio',
      color: 'from-purple-500 to-pink-500',
    },
    {
      numero: 3 as Desafio,
      icon: '⚡',
      nombre: 'Eficiencia Máxima',
      descripcion: 'Llegá a 30cm usando la menor cantidad de cucharadas',
      dificultad: 'Difícil',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
          >
            ← Volver al Menú Principal
          </button>

          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Modo Desafíos
            </span>
          </h1>
          <p className="text-xl text-slate-300">Ponete a prueba con estos retos de química</p>

          {/* Progreso */}
          <div className="mt-6 inline-block px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl">
            <span className="text-slate-300">
              Completados: <span className="text-cyan-400 font-bold">{completados.size}</span> / 3
            </span>
          </div>
        </header>

        {/* Grid de desafíos */}
        <div className="grid md:grid-cols-3 gap-6">
          {desafios.map((desafio, index) => {
            const completado = completados.has(desafio.numero);

            return (
              <div
                key={desafio.numero}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <button
                  onClick={() => onSelectDesafio(desafio.numero)}
                  className={`
                    relative w-full p-8 rounded-2xl border-2 transition-all duration-300
                    ${
                      completado
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 hover:border-green-400'
                        : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
                    }
                    hover:shadow-xl hover:-translate-y-1
                  `}
                >
                  {/* Badge completado */}
                  {completado && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-3 shadow-lg">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="text-center space-y-4">
                    <div className="text-6xl">{desafio.icon}</div>

                    <h3 className="text-2xl font-bold text-white">Desafío {desafio.numero}</h3>

                    <h4
                      className={`text-xl font-bold bg-gradient-to-r ${desafio.color} bg-clip-text text-transparent`}
                    >
                      {desafio.nombre}
                    </h4>

                    <p className="text-slate-300 text-sm">{desafio.descripcion}</p>

                    {/* Dificultad */}
                    <div className="pt-4 border-t border-slate-700">
                      <span
                        className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${
                          desafio.dificultad === 'Fácil'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : desafio.dificultad === 'Medio'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }
                      `}
                      >
                        {desafio.dificultad}
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <span
                        className={`inline-block px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r ${desafio.color} text-white`}
                      >
                        {completado ? 'Reintentar →' : 'Comenzar →'}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Mensaje motivacional */}
        {completados.size === 3 && (
          <div className="mt-12 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-2xl p-8 animate-fadeIn">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-3xl font-bold text-amber-300 mb-3">
                ¡Felicitaciones, Maestro Químico!
              </h3>
              <p className="text-slate-300 text-lg">
                Completaste los 3 desafíos. Ahora estás listo para la Misión Espacial final.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DESAFÍO 1: ALTURA EXACTA (20cm)
// ============================================================================

interface DesafioProps {
  onBack: () => void;
  onCompletado: () => void;
  yaCompletado: boolean;
}

function Desafio1({ onBack, onCompletado, yaCompletado }: DesafioProps) {
  const [seleccion, setSeleccion] = useState<SeleccionIngredientes | null>(null);
  const [resultado, setResultado] = useState<ResultadoReaccion | null>(null);
  const [enAnimacion, setEnAnimacion] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [mejorIntento, setMejorIntento] = useState<number | null>(null);
  const [historial, setHistorial] = useState<number[]>([]);
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  const OBJETIVO = 20;

  const handleMezclar = () => {
    if (!seleccion || seleccion.combustible.cantidad === 0 || seleccion.propulsor.cantidad === 0) {
      return;
    }

    const res = calcularReaccion({
      combustible: seleccion.combustible,
      propulsor: seleccion.propulsor,
    });

    setResultado(res);
    setEnAnimacion(true);
    setIntentos(intentos + 1);
    setHistorial([...historial, res.alturaAlcanzada]);

    // Actualizar mejor intento (más cercano al objetivo)
    const diferencia = Math.abs(res.alturaAlcanzada - OBJETIVO);
    const mejorDiferencia = mejorIntento !== null ? Math.abs(mejorIntento - OBJETIVO) : Infinity;

    if (diferencia < mejorDiferencia) {
      setMejorIntento(res.alturaAlcanzada);
    }

    // Verificar si se completó - CELEBRACIÓN ÉPICA
    if (res.alturaAlcanzada === OBJETIVO) {
      setMostrarCelebracion(true);
      if (!yaCompletado) {
        setTimeout(() => {
          onCompletado();
        }, 3000);
      }
    }
  };

  const exito = resultado?.alturaAlcanzada === OBJETIVO;
  const diferencia = resultado ? Math.abs(resultado.alturaAlcanzada - OBJETIVO) : null;
  const cerca = diferencia !== null && diferencia <= 2;
  const muyLejos = diferencia !== null && diferencia > 10;

  // Calcular ranking basado en intentos
  const getRanking = () => {
    if (!exito) return null;
    if (intentos === 1)
      return {
        titulo: '🏆 GENIO ABSOLUTO',
        color: 'text-yellow-300',
        desc: '¡Perfecto al primer intento!',
      };
    if (intentos <= 3)
      return { titulo: '🥇 MAESTRO', color: 'text-amber-300', desc: 'Excelente precisión' };
    if (intentos <= 5)
      return { titulo: '🥈 EXPERTO', color: 'text-slate-300', desc: 'Muy buen trabajo' };
    if (intentos <= 8)
      return { titulo: '🥉 APRENDIZ', color: 'text-orange-300', desc: 'Buen progreso' };
    return { titulo: '📚 ESTUDIANTE', color: 'text-blue-300', desc: 'Seguí practicando' };
  };

  // Sistema de pistas inteligente
  const getPista = () => {
    if (!resultado) return null;
    const diff = resultado.alturaAlcanzada - OBJETIVO;

    if (diff === 0) return null;
    if (Math.abs(diff) <= 1) return '🎯 ¡Casi perfecto! Ajustá apenas un poquito';
    if (Math.abs(diff) <= 3) return '😊 Muy cerca! Cambiá 1 cucharada';
    if (Math.abs(diff) <= 5) return '🤔 Te estás acercando. Probá con cantidades similares';
    if (diff > 5) return '⬇️ Te pasaste. Usá menos cantidad o ingredientes más débiles';
    if (diff < -5) return '⬆️ Muy bajo. Necesitás más potencia o más cantidad';
    return null;
  };

  const ranking = getRanking();
  const pista = getPista();

  return (
    <div className="h-screen pt-2 pb-2 px-4 relative overflow-hidden">
      {/* Partículas de celebración */}
      {mostrarCelebracion && (
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
              {['🎉', '✨', '🎊', '⭐', '🌟', '💫'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="h-full flex flex-col">
        {/* Header SIMPLE */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
          >
            ← Volver
          </button>

          <h1 className="text-xl font-black text-cyan-400">
            🎯 Desafío: Altura Exacta ({OBJETIVO}cm)
          </h1>

          <div className="w-16"></div>
        </div>

        {/* GRID DE 3 COLUMNAS */}
        <div className="grid grid-cols-3 gap-2 flex-1 overflow-hidden">
          {/* COLUMNA 1: Teoría + Estadísticas */}
          <div className="flex flex-col gap-2 overflow-auto">
            {/* Teoría */}
            <div className="bg-slate-800/50 border border-slate-700 rounded p-2">
              <h3 className="text-xs font-bold text-cyan-400 mb-2">📚 Objetivo</h3>
              <p className="text-xs text-slate-300">
                Mezclá los ingredientes para que el cohete alcance exactamente{' '}
                <span className="text-cyan-400 font-bold">{OBJETIVO}cm</span> de altura.
              </p>
            </div>

            {/* Estadísticas - 4 mini cards */}
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-cyan-500/10 border border-cyan-500/50 rounded p-1.5 text-center">
                <div className="text-xs text-cyan-300">🎯 Objetivo</div>
                <div className="text-lg font-black text-white">{OBJETIVO}</div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded p-1.5 text-center">
                <div className="text-xs text-slate-400">📊 Intentos</div>
                <div className="text-lg font-black text-white">{intentos}</div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded p-1.5 text-center">
                <div className="text-xs text-slate-400">🏅 Mejor</div>
                <div
                  className={`text-lg font-black ${
                    mejorIntento === OBJETIVO
                      ? 'text-green-400'
                      : mejorIntento !== null && Math.abs(mejorIntento - OBJETIVO) <= 2
                        ? 'text-yellow-400'
                        : 'text-cyan-400'
                  }`}
                >
                  {mejorIntento !== null ? mejorIntento : '-'}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded p-1.5 text-center">
                <div className="text-xs text-slate-400">🎪 Precisión</div>
                <div className="text-lg font-black text-purple-400">
                  {resultado ? `${Math.max(0, 100 - diferencia! * 5)}%` : '-'}
                </div>
              </div>
            </div>

            {/* Pista si hay */}
            {pista && (
              <div className="bg-blue-500/10 border border-blue-500/50 rounded p-2">
                <div className="flex items-start gap-1">
                  <div className="text-sm">💡</div>
                  <div className="text-xs text-slate-200 leading-tight">{pista}</div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA 2: Selector de ingredientes */}
          <div className="bg-slate-800/50 border border-slate-700 rounded p-2 overflow-auto">
            <h3 className="text-xs font-bold text-white mb-2">🧪 Laboratorio</h3>
            <SelectorIngredientes onCambio={setSeleccion} mostrarPrediccion={true} />
          </div>

          {/* COLUMNA 3: Cohete + Botón */}
          <div className="flex flex-col gap-2">
            {/* Cohete */}
            <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded p-2">
              <Cohete
                altura={resultado?.alturaAlcanzada || 0}
                alturaMaxima={60}
                enAnimacion={enAnimacion}
                intensidad={resultado?.intensidadVisual}
                onAnimacionCompleta={() => setEnAnimacion(false)}
              />
            </div>

            {/* Botón LANZAR */}
            <button
              onClick={handleMezclar}
              disabled={
                !seleccion ||
                seleccion.combustible.cantidad === 0 ||
                seleccion.propulsor.cantidad === 0
              }
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded font-black text-sm transition-all hover:scale-105 disabled:hover:scale-100"
            >
              {seleccion && seleccion.combustible.cantidad > 0 && seleccion.propulsor.cantidad > 0
                ? '🚀 ¡LANZAR!'
                : '⚠️ Elegí ingredientes'}
            </button>
          </div>
        </div>

        {/* Resultado épico - Como overlay COMPACTO */}
        {resultado && exito && (
          <div className="absolute inset-x-6 bottom-4 rounded-xl p-4 border-2 border-green-500 bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-cyan-500/30 animate-fadeIn relative overflow-hidden shadow-2xl">
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

            <div className="text-center relative z-10">
              <div className="text-5xl mb-2 animate-bounce">🏆</div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-green-300 to-emerald-300 bg-clip-text text-transparent mb-2 animate-pulse">
                ¡PERFECTO!
              </h2>
              {ranking && (
                <div className={`text-xl font-bold ${ranking.color} mb-1`}>{ranking.titulo}</div>
              )}
              <p className="text-lg text-white mb-1">
                Altura:{' '}
                <span className="font-black text-green-400">{resultado.alturaAlcanzada}cm</span>
              </p>
              <p className="text-sm text-slate-200 mb-2">{ranking?.desc}</p>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-300">
                <div>
                  📊 Intentos: <span className="font-bold text-white">{intentos}</span>
                </div>
                <div>•</div>
                <div>
                  🎯 Precisión: <span className="font-bold text-green-400">100%</span>
                </div>
              </div>
              {yaCompletado && (
                <div className="mt-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg inline-block">
                  <span className="text-amber-300 text-xs">✓ Ya completado</span>
                </div>
              )}
            </div>
          </div>
        )}

        {resultado && !exito && (
          <div
            className={`
            absolute inset-x-6 bottom-4 rounded-lg p-3 border transition-all animate-fadeIn shadow-2xl
            ${
              cerca
                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50'
                : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50'
            }
          `}
          >
            <div className="text-center">
              <div className="text-4xl mb-1">{cerca ? '😊' : '💪'}</div>
              <h3
                className={`text-xl font-bold mb-1 ${cerca ? 'text-yellow-300' : 'text-cyan-300'}`}
              >
                {cerca ? '¡Muy cerca!' : 'Seguí intentando'}
              </h3>
              <p className="text-lg text-white mb-1">
                Altura:{' '}
                <span className={`font-bold ${cerca ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {resultado.alturaAlcanzada}cm
                </span>
              </p>
              <p className="text-xs text-slate-200">
                Diferencia: <span className="font-bold">{diferencia}cm</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float-up {
          to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// DESAFÍO 2: PRESUPUESTO LIMITADO ($100, máxima altura)
// ============================================================================

function Desafio2({ onBack, onCompletado, yaCompletado }: DesafioProps) {
  const [seleccion, setSeleccion] = useState<SeleccionIngredientes | null>(null);
  const [resultado, setResultado] = useState<ResultadoReaccion | null>(null);
  const [enAnimacion, setEnAnimacion] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [mejorAltura, setMejorAltura] = useState<number>(0);

  const PRESUPUESTO_MAXIMO = 100;
  const ALTURA_MINIMA_EXITO = 35; // Para considerarlo exitoso

  const handleMezclar = () => {
    if (!seleccion || seleccion.combustible.cantidad === 0 || seleccion.propulsor.cantidad === 0) {
      return;
    }

    if (seleccion.costoTotal > PRESUPUESTO_MAXIMO) {
      alert(
        `⚠️ Te pasaste del presupuesto!\nCosto actual: $${seleccion.costoTotal}\nPresupuesto: $${PRESUPUESTO_MAXIMO}`,
      );
      return;
    }

    const res = calcularReaccion({
      combustible: seleccion.combustible,
      propulsor: seleccion.propulsor,
    });

    setResultado(res);
    setEnAnimacion(true);
    setIntentos(intentos + 1);

    if (res.alturaAlcanzada > mejorAltura) {
      setMejorAltura(res.alturaAlcanzada);

      if (res.alturaAlcanzada >= ALTURA_MINIMA_EXITO && !yaCompletado) {
        setTimeout(() => {
          onCompletado();
        }, 2000);
      }
    }
  };

  const exito = resultado && resultado.alturaAlcanzada >= ALTURA_MINIMA_EXITO;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
          >
            ← Volver a Desafíos
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              💰 Desafío 2: Presupuesto Limitado
            </h1>
            <p className="text-slate-300">Máxima altura con máximo ${PRESUPUESTO_MAXIMO}</p>
          </div>

          <div className="w-32"></div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-6 text-center">
            <div className="text-purple-300 text-sm mb-2">💰 Presupuesto</div>
            <div className="text-4xl font-black text-white">${PRESUPUESTO_MAXIMO}</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-slate-400 text-sm mb-2">💸 Gasto Actual</div>
            <div
              className={`text-4xl font-black ${seleccion && seleccion.costoTotal > PRESUPUESTO_MAXIMO ? 'text-red-400' : 'text-emerald-400'}`}
            >
              ${seleccion?.costoTotal || 0}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-slate-400 text-sm mb-2">📊 Intentos</div>
            <div className="text-4xl font-black text-white">{intentos}</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-slate-400 text-sm mb-2">🏅 Mejor Altura</div>
            <div className="text-4xl font-black text-cyan-400">{mejorAltura}cm</div>
          </div>
        </div>

        {/* Área de trabajo */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Selector */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Seleccioná ingredientes:</h3>

            <SelectorIngredientes
              onCambio={setSeleccion}
              presupuestoMaximo={PRESUPUESTO_MAXIMO}
              mostrarPrediccion={true}
            />

            <button
              onClick={handleMezclar}
              disabled={
                !seleccion ||
                seleccion.combustible.cantidad === 0 ||
                seleccion.propulsor.cantidad === 0 ||
                seleccion.costoTotal > PRESUPUESTO_MAXIMO
              }
              className="mt-6 w-full px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-black text-2xl transition-all shadow-lg shadow-purple-500/30 disabled:shadow-none hover:scale-105 disabled:hover:scale-100"
            >
              {seleccion && seleccion.costoTotal > PRESUPUESTO_MAXIMO
                ? '⚠️ ¡Te pasaste del presupuesto!'
                : seleccion &&
                    seleccion.combustible.cantidad > 0 &&
                    seleccion.propulsor.cantidad > 0
                  ? '🧪 ¡MEZCLAR!'
                  : '⚠️ Elegí ingredientes'}
            </button>
          </div>

          {/* Cohete */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Cohete:</h3>
            <Cohete
              altura={resultado?.alturaAlcanzada || 0}
              alturaMaxima={80}
              enAnimacion={enAnimacion}
              intensidad={resultado?.intensidadVisual}
              onAnimacionCompleta={() => setEnAnimacion(false)}
            />
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div
            className={`
            rounded-2xl p-8 border-2 transition-all animate-fadeIn
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
                  <div className="text-8xl mb-4">🎉</div>
                  <h2 className="text-4xl font-black text-green-300 mb-4">
                    ¡EXCELENTE OPTIMIZACIÓN!
                  </h2>
                  <p className="text-2xl text-white mb-2">
                    Altura alcanzada:{' '}
                    <span className="font-bold text-green-400">{resultado.alturaAlcanzada}cm</span>
                  </p>
                  <p className="text-slate-300 text-lg">
                    Gastaste ${seleccion?.costoTotal} de ${PRESUPUESTO_MAXIMO}
                  </p>
                  <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-4 inline-block">
                    <p className="text-green-200">
                      ✓ Desafío completado: ¡Superaste los {ALTURA_MINIMA_EXITO}cm con presupuesto
                      limitado!
                    </p>
                  </div>
                  {yaCompletado && (
                    <div className="mt-4 text-amber-300">
                      Ya habías completado este desafío. ¿Podés mejorarlo?
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-3xl font-bold text-cyan-300 mb-4">
                    Altura: {resultado.alturaAlcanzada}cm
                  </h3>
                  <p className="text-slate-300 text-lg mb-4">
                    Gastaste ${seleccion?.costoTotal} de ${PRESUPUESTO_MAXIMO}
                  </p>
                  <p className="text-cyan-200">
                    💡 Probá con ingredientes más potentes o cantidades balanceadas para llegar a{' '}
                    {ALTURA_MINIMA_EXITO}cm
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DESAFÍO 3: EFICIENCIA MÁXIMA (30cm con mínimas cucharadas)
// ============================================================================

function Desafio3({ onBack, onCompletado, yaCompletado }: DesafioProps) {
  const [seleccion, setSeleccion] = useState<SeleccionIngredientes | null>(null);
  const [resultado, setResultado] = useState<ResultadoReaccion | null>(null);
  const [enAnimacion, setEnAnimacion] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [mejorEficiencia, setMejorEficiencia] = useState<{
    cucharadas: number;
    altura: number;
  } | null>(null);

  const OBJETIVO_ALTURA = 30;
  const CUCHARADAS_MAXIMAS_EXCELENTE = 8; // Si lo logra con 8 o menos = excelente

  const handleMezclar = () => {
    if (!seleccion || seleccion.combustible.cantidad === 0 || seleccion.propulsor.cantidad === 0) {
      return;
    }

    const res = calcularReaccion({
      combustible: seleccion.combustible,
      propulsor: seleccion.propulsor,
    });

    setResultado(res);
    setEnAnimacion(true);
    setIntentos(intentos + 1);

    const totalCucharadas = seleccion.combustible.cantidad + seleccion.propulsor.cantidad;

    // Actualizar mejor eficiencia si alcanzó el objetivo
    if (res.alturaAlcanzada >= OBJETIVO_ALTURA) {
      if (!mejorEficiencia || totalCucharadas < mejorEficiencia.cucharadas) {
        setMejorEficiencia({
          cucharadas: totalCucharadas,
          altura: res.alturaAlcanzada,
        });

        if (totalCucharadas <= CUCHARADAS_MAXIMAS_EXCELENTE && !yaCompletado) {
          setTimeout(() => {
            onCompletado();
          }, 2000);
        }
      }
    }
  };

  const totalCucharadas = seleccion
    ? seleccion.combustible.cantidad + seleccion.propulsor.cantidad
    : 0;

  const exito =
    resultado &&
    resultado.alturaAlcanzada >= OBJETIVO_ALTURA &&
    totalCucharadas <= CUCHARADAS_MAXIMAS_EXCELENTE;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
          >
            ← Volver a Desafíos
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">⚡ Desafío 3: Eficiencia Máxima</h1>
            <p className="text-slate-300">Llegá a {OBJETIVO_ALTURA}cm con las mínimas cucharadas</p>
          </div>

          <div className="w-32"></div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl p-6 text-center">
            <div className="text-orange-300 text-sm mb-2">🎯 Altura Objetivo</div>
            <div className="text-4xl font-black text-white">{OBJETIVO_ALTURA}cm</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-slate-400 text-sm mb-2">🥄 Cucharadas Usadas</div>
            <div className="text-4xl font-black text-cyan-400">{totalCucharadas}</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-slate-400 text-sm mb-2">📊 Intentos</div>
            <div className="text-4xl font-black text-white">{intentos}</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-slate-400 text-sm mb-2">🏅 Mejor Eficiencia</div>
            <div className="text-2xl font-black text-emerald-400">
              {mejorEficiencia ? `${mejorEficiencia.cucharadas} 🥄` : '-'}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
          <p className="text-amber-200 text-center">
            💡 Tip: Los ingredientes más potentes necesitan menos cantidad para alcanzar mayor
            altura
          </p>
        </div>

        {/* Área de trabajo */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Selector */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Seleccioná ingredientes:</h3>

            <SelectorIngredientes onCambio={setSeleccion} mostrarPrediccion={true} />

            <button
              onClick={handleMezclar}
              disabled={
                !seleccion ||
                seleccion.combustible.cantidad === 0 ||
                seleccion.propulsor.cantidad === 0
              }
              className="mt-6 w-full px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-black text-2xl transition-all shadow-lg shadow-orange-500/30 disabled:shadow-none hover:scale-105 disabled:hover:scale-100"
            >
              {seleccion && seleccion.combustible.cantidad > 0 && seleccion.propulsor.cantidad > 0
                ? '🧪 ¡MEZCLAR!'
                : '⚠️ Elegí ingredientes'}
            </button>
          </div>

          {/* Cohete */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Cohete:</h3>
            <Cohete
              altura={resultado?.alturaAlcanzada || 0}
              alturaMaxima={80}
              enAnimacion={enAnimacion}
              intensidad={resultado?.intensidadVisual}
              onAnimacionCompleta={() => setEnAnimacion(false)}
            />
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div
            className={`
            rounded-2xl p-8 border-2 transition-all animate-fadeIn
            ${
              exito
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50'
                : resultado.alturaAlcanzada >= OBJETIVO_ALTURA
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50'
                  : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50'
            }
          `}
          >
            <div className="text-center">
              {exito ? (
                <>
                  <div className="text-8xl mb-4">🏆</div>
                  <h2 className="text-4xl font-black text-green-300 mb-4">¡EFICIENCIA PERFECTA!</h2>
                  <p className="text-2xl text-white mb-2">
                    Altura:{' '}
                    <span className="font-bold text-green-400">{resultado.alturaAlcanzada}cm</span>
                  </p>
                  <p className="text-xl text-white mb-4">
                    Cucharadas usadas:{' '}
                    <span className="font-bold text-emerald-400">{totalCucharadas}</span>
                  </p>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 inline-block">
                    <p className="text-green-200">
                      ✓ ¡Increíble! Llegaste a {OBJETIVO_ALTURA}cm usando solo {totalCucharadas}{' '}
                      cucharadas
                    </p>
                  </div>
                  {yaCompletado && (
                    <div className="mt-4 text-amber-300">
                      Ya habías completado este desafío. ¿Podés usar aún menos cucharadas?
                    </div>
                  )}
                </>
              ) : resultado.alturaAlcanzada >= OBJETIVO_ALTURA ? (
                <>
                  <div className="text-6xl mb-4">😊</div>
                  <h3 className="text-3xl font-bold text-yellow-300 mb-4">
                    ¡Llegaste a la altura!
                  </h3>
                  <p className="text-2xl text-white mb-2">
                    Altura:{' '}
                    <span className="font-bold text-yellow-400">{resultado.alturaAlcanzada}cm</span>
                  </p>
                  <p className="text-xl text-white mb-4">
                    Cucharadas usadas: <span className="font-bold">{totalCucharadas}</span>
                  </p>
                  <p className="text-yellow-200">
                    💡 Ahora intentá llegar con menos cucharadas (máximo{' '}
                    {CUCHARADAS_MAXIMAS_EXCELENTE} para ser excelente)
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🤔</div>
                  <h3 className="text-3xl font-bold text-cyan-300 mb-4">No llegaste al objetivo</h3>
                  <p className="text-2xl text-white mb-2">
                    Altura:{' '}
                    <span className="font-bold text-cyan-400">{resultado.alturaAlcanzada}cm</span>
                  </p>
                  <p className="text-slate-300">
                    Te faltaron {OBJETIVO_ALTURA - resultado.alturaAlcanzada}cm para llegar a{' '}
                    {OBJETIVO_ALTURA}cm
                  </p>
                  <p className="text-cyan-200 mt-4">
                    💡 Probá con ingredientes más potentes (limón, bicarbonato especial)
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
