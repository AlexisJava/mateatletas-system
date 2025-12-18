/**
 * MISIÓN ESPACIAL - LA FÁBRICA DE COHETES ESPACIALES
 * ====================================================
 *
 * El desafío final: construir un cohete multi-etapa para llegar a la Luna.
 *
 * REQUISITOS:
 * - Altura EXACTA: 60cm (ni más ni menos ±2cm)
 * - Presupuesto: $150
 * - Usar AL MENOS 2 combustibles diferentes
 * - Sistema de etapas (lanzar en secuencia)
 *
 * PEDAGOGÍA:
 * - Sintetiza todo lo aprendido
 * - Introduce planning y multi-step thinking
 * - Celebración épica del logro
 */

'use client';

import { useState } from 'react';
import Cohete from './Cohete';
import {
  calcularReaccion,
  COMBUSTIBLES,
  PROPULSORES,
  CombustibleTipo,
  PropulsorTipo,
  ResultadoReaccion,
} from '@/lib/quimica/motor-quimico';

interface MisionEspacialProps {
  onBack: () => void;
}

interface Etapa {
  id: number;
  combustible: {
    tipo: CombustibleTipo;
    cantidad: number;
  };
  propulsor: {
    tipo: PropulsorTipo;
    cantidad: number;
  };
  costo: number;
}

type Fase = 'briefing' | 'planificacion' | 'lanzamiento' | 'resultado';

export default function MisionEspacial({ onBack }: MisionEspacialProps) {
  const [fase, setFase] = useState<Fase>('briefing');
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [etapaActual, setEtapaActual] = useState(0);
  const [alturaAcumulada, setAlturaAcumulada] = useState(0);
  const [resultadosEtapas, setResultadosEtapas] = useState<ResultadoReaccion[]>([]);
  const [enAnimacion, setEnAnimacion] = useState(false);
  const [misionExitosa, setMisionExitosa] = useState(false);

  const OBJETIVO_ALTURA = 60;
  const MARGEN_ERROR = 2;
  const PRESUPUESTO_TOTAL = 150;

  const iniciarPlanificacion = () => {
    setFase('planificacion');
    setEtapas([crearEtapaVacia(1)]);
  };

  const crearEtapaVacia = (id: number): Etapa => ({
    id,
    combustible: { tipo: 'vinagre', cantidad: 0 },
    propulsor: { tipo: 'bicarbonato', cantidad: 0 },
    costo: 0,
  });

  const agregarEtapa = () => {
    if (etapas.length < 3) {
      setEtapas([...etapas, crearEtapaVacia(etapas.length + 1)]);
    }
  };

  const eliminarEtapa = (id: number) => {
    if (etapas.length > 1) {
      setEtapas(etapas.filter((e) => e.id !== id).map((e, i) => ({ ...e, id: i + 1 })));
    }
  };

  const actualizarEtapa = (id: number, etapaActualizada: Etapa) => {
    setEtapas(etapas.map((e) => (e.id === id ? etapaActualizada : e)));
  };

  const calcularCostoTotal = () => {
    return etapas.reduce((total, etapa) => total + etapa.costo, 0);
  };

  const validarYLanzar = () => {
    const costoTotal = calcularCostoTotal();

    // Validar presupuesto
    if (costoTotal > PRESUPUESTO_TOTAL) {
      alert(
        `⚠️ ¡Excediste el presupuesto!\n\nCosto total: $${costoTotal}\nPresupuesto: $${PRESUPUESTO_TOTAL}`,
      );
      return;
    }

    // Validar que todas las etapas tengan ingredientes
    const todasCompletas = etapas.every(
      (e) => e.combustible.cantidad > 0 && e.propulsor.cantidad > 0,
    );
    if (!todasCompletas) {
      alert('⚠️ Todas las etapas deben tener ingredientes');
      return;
    }

    // Validar al menos 2 combustibles diferentes
    const combustiblesUnicos = new Set(etapas.map((e) => e.combustible.tipo));
    if (combustiblesUnicos.size < 2) {
      alert('⚠️ Debes usar AL MENOS 2 combustibles diferentes\n\n(Puede ser en diferentes etapas)');
      return;
    }

    // Todo OK - iniciar lanzamiento
    setFase('lanzamiento');
    lanzarSiguienteEtapa();
  };

  const lanzarSiguienteEtapa = () => {
    if (etapaActual >= etapas.length) {
      // Misión completada
      verificarExito();
      return;
    }

    const etapa = etapas[etapaActual];
    const resultado = calcularReaccion({
      combustible: etapa.combustible,
      propulsor: etapa.propulsor,
    });

    setResultadosEtapas([...resultadosEtapas, resultado]);
    setAlturaAcumulada(alturaAcumulada + resultado.alturaAlcanzada);
    setEnAnimacion(true);

    // Siguiente etapa después de la animación
    setTimeout(() => {
      setEnAnimacion(false);
      setEtapaActual(etapaActual + 1);

      if (etapaActual + 1 < etapas.length) {
        // Hay más etapas
        setTimeout(() => {
          lanzarSiguienteEtapa();
        }, 1500);
      } else {
        // Era la última etapa
        setTimeout(() => {
          verificarExito();
        }, 1000);
      }
    }, 3000);
  };

  const verificarExito = () => {
    const alturaFinal =
      alturaAcumulada + (resultadosEtapas[resultadosEtapas.length - 1]?.alturaAlcanzada || 0);
    const diferencia = Math.abs(alturaFinal - OBJETIVO_ALTURA);
    const exito = diferencia <= MARGEN_ERROR;

    setMisionExitosa(exito);
    setFase('resultado');
  };

  const reiniciar = () => {
    setFase('briefing');
    setEtapas([]);
    setEtapaActual(0);
    setAlturaAcumulada(0);
    setResultadosEtapas([]);
    setEnAnimacion(false);
    setMisionExitosa(false);
  };

  return (
    <>
      {fase === 'briefing' && <Briefing onContinuar={iniciarPlanificacion} onBack={onBack} />}

      {fase === 'planificacion' && (
        <Planificacion
          etapas={etapas}
          onAgregarEtapa={agregarEtapa}
          onEliminarEtapa={eliminarEtapa}
          onActualizarEtapa={actualizarEtapa}
          costoTotal={calcularCostoTotal()}
          presupuestoTotal={PRESUPUESTO_TOTAL}
          onLanzar={validarYLanzar}
          onBack={() => setFase('briefing')}
        />
      )}

      {fase === 'lanzamiento' && (
        <Lanzamiento
          etapas={etapas}
          etapaActual={etapaActual}
          alturaAcumulada={alturaAcumulada}
          enAnimacion={enAnimacion}
          resultado={resultadosEtapas[etapaActual]}
        />
      )}

      {fase === 'resultado' && (
        <Resultado
          exito={misionExitosa}
          alturaFinal={alturaAcumulada}
          objetivo={OBJETIVO_ALTURA}
          etapas={etapas}
          resultados={resultadosEtapas}
          onReintentar={reiniciar}
          onVolver={onBack}
        />
      )}
    </>
  );
}

// ============================================================================
// FASE 1: BRIEFING (Presentación de la misión)
// ============================================================================

interface BriefingProps {
  onContinuar: () => void;
  onBack: () => void;
}

function Briefing({ onContinuar, onBack }: BriefingProps) {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="mb-8 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
        >
          ← Volver al Menú
        </button>

        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-3xl p-12 shadow-2xl shadow-purple-500/20">
          {/* Header épico */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 animate-bounce">🌌</div>
            <h1 className="text-6xl font-black mb-4">
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                MISIÓN ESPACIAL
              </span>
            </h1>
            <h2 className="text-4xl font-bold text-cyan-400 mb-6">DESTINO: LUNA 🌙</h2>
            <div className="inline-block px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-full">
              <span className="text-red-300 font-bold">🚨 CLASIFICACIÓN: DIFÍCIL</span>
            </div>
          </div>

          {/* Mensaje de la NASA */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">👨‍🚀</div>
              <div>
                <h3 className="text-cyan-300 font-bold text-xl mb-2">Comunicado de la NASA:</h3>
                <p className="text-slate-200 text-lg leading-relaxed">
                  &quot;Necesitamos enviar un satélite a la Luna. Vos sos el científico elegido para
                  diseñar el cohete. Esta misión es crítica. ¡El mundo cuenta con vos!&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 mb-8">
            <h3 className="text-amber-300 font-bold text-2xl mb-6 flex items-center gap-3">
              <span>📋</span> Requisitos de la Misión:
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-slate-900/50 rounded-xl p-4">
                <span className="text-3xl">🎯</span>
                <div>
                  <div className="text-white font-bold text-lg">Altura EXACTA: 60cm</div>
                  <div className="text-slate-300 text-sm">(Margen de error: ±2cm)</div>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-slate-900/50 rounded-xl p-4">
                <span className="text-3xl">💰</span>
                <div>
                  <div className="text-white font-bold text-lg">Presupuesto: $150</div>
                  <div className="text-slate-300 text-sm">No podés gastar más</div>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-slate-900/50 rounded-xl p-4">
                <span className="text-3xl">🧪</span>
                <div>
                  <div className="text-white font-bold text-lg">
                    Usar AL MENOS 2 combustibles diferentes
                  </div>
                  <div className="text-slate-300 text-sm">Para mayor seguridad y redundancia</div>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-slate-900/50 rounded-xl p-4">
                <span className="text-3xl">🚀</span>
                <div>
                  <div className="text-white font-bold text-lg">Sistema Multi-Etapa</div>
                  <div className="text-slate-300 text-sm">
                    Podés dividir el cohete en varias etapas que se lanzan en secuencia
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explicación de etapas */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <h4 className="text-purple-300 font-bold mb-3">💡 ¿Qué es un cohete multi-etapa?</h4>
            <p className="text-slate-300 mb-4">
              Los cohetes reales (como los de la NASA) tienen varias &quot;etapas&quot;. Cada etapa
              tiene su propio combustible y se enciende en secuencia: primero la Etapa 1, después la
              Etapa 2, etc.
            </p>
            <p className="text-slate-300">
              <span className="font-bold text-purple-200">Ejemplo:</span> Etapa 1 sube 30cm, después
              Etapa 2 sube otros 30cm = Total 60cm
            </p>
          </div>

          {/* Botón comenzar */}
          <div className="text-center">
            <button
              onClick={onContinuar}
              className="px-12 py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white rounded-2xl font-black text-2xl transition-all shadow-2xl shadow-purple-500/50 hover:scale-105"
            >
              🚀 ACEPTAR MISIÓN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FASE 2: PLANIFICACIÓN (Diseñar las etapas)
// ============================================================================

interface PlanificacionProps {
  etapas: Etapa[];
  onAgregarEtapa: () => void;
  onEliminarEtapa: (id: number) => void;
  onActualizarEtapa: (id: number, etapa: Etapa) => void;
  costoTotal: number;
  presupuestoTotal: number;
  onLanzar: () => void;
  onBack: () => void;
}

function Planificacion({
  etapas,
  onAgregarEtapa,
  onEliminarEtapa,
  onActualizarEtapa,
  costoTotal,
  presupuestoTotal,
  onLanzar,
  onBack,
}: PlanificacionProps) {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
          >
            ← Volver al Briefing
          </button>

          <h1 className="text-3xl font-bold text-white">🛠️ Fase de Planificación</h1>

          <div className="w-32"></div>
        </div>

        {/* Presupuesto */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6 text-center">
            <div className="text-purple-300 text-sm mb-2">💰 Presupuesto Total</div>
            <div className="text-4xl font-black text-white">${presupuestoTotal}</div>
          </div>

          <div
            className={`border rounded-xl p-6 text-center ${
              costoTotal > presupuestoTotal
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-emerald-500/20 border-emerald-500/50'
            }`}
          >
            <div
              className={costoTotal > presupuestoTotal ? 'text-red-300' : 'text-emerald-300'}
              text-sm
              mb-2
            >
              💸 Gasto Actual
            </div>
            <div
              className={`text-4xl font-black ${costoTotal > presupuestoTotal ? 'text-red-400' : 'text-emerald-400'}`}
            >
              ${costoTotal}
            </div>
          </div>

          <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-6 text-center">
            <div className="text-cyan-300 text-sm mb-2">💵 Disponible</div>
            <div className="text-4xl font-black text-white">
              ${Math.max(0, presupuestoTotal - costoTotal)}
            </div>
          </div>
        </div>

        {/* Etapas */}
        <div className="space-y-6 mb-8">
          {etapas.map((etapa, index) => (
            <EditorEtapa
              key={etapa.id}
              etapa={etapa}
              numero={index + 1}
              onActualizar={onActualizarEtapa}
              onEliminar={onEliminarEtapa}
              puedeEliminar={etapas.length > 1}
            />
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onAgregarEtapa}
            disabled={etapas.length >= 3}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all"
          >
            + Agregar Etapa {etapas.length >= 3 && '(Máx. 3)'}
          </button>

          <button
            onClick={onLanzar}
            disabled={
              costoTotal > presupuestoTotal ||
              etapas.some((e) => e.combustible.cantidad === 0 || e.propulsor.cantidad === 0)
            }
            className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-black text-xl transition-all shadow-lg shadow-green-500/30 disabled:shadow-none hover:scale-105 disabled:hover:scale-100"
          >
            🚀 ¡LANZAR COHETE!
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponente: Editor de una etapa
interface EditorEtapaProps {
  etapa: Etapa;
  numero: number;
  onActualizar: (id: number, etapa: Etapa) => void;
  onEliminar: (id: number) => void;
  puedeEliminar: boolean;
}

function EditorEtapa({ etapa, numero, onActualizar, onEliminar, puedeEliminar }: EditorEtapaProps) {
  const actualizarCombustible = (tipo: CombustibleTipo, cantidad: number) => {
    const combustible = COMBUSTIBLES[tipo];
    const propulsor = PROPULSORES[etapa.propulsor.tipo];
    const costo = combustible.precio * cantidad + propulsor.precio * etapa.propulsor.cantidad;

    onActualizar(etapa.id, {
      ...etapa,
      combustible: { tipo, cantidad },
      costo,
    });
  };

  const actualizarPropulsor = (tipo: PropulsorTipo, cantidad: number) => {
    const combustible = COMBUSTIBLES[etapa.combustible.tipo];
    const propulsor = PROPULSORES[tipo];
    const costo = combustible.precio * etapa.combustible.cantidad + propulsor.precio * cantidad;

    onActualizar(etapa.id, {
      ...etapa,
      propulsor: { tipo, cantidad },
      costo,
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-cyan-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-cyan-400">🚀 Etapa {numero}</h3>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-400">Costo Etapa</div>
            <div className="text-2xl font-bold text-emerald-400">${etapa.costo}</div>
          </div>

          {puedeEliminar && (
            <button
              onClick={() => onEliminar(etapa.id)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg font-semibold transition-all"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Combustible */}
        <div>
          <label className="block text-cyan-300 font-bold mb-3">💧 Combustible:</label>
          <select
            value={etapa.combustible.tipo}
            onChange={(e) =>
              actualizarCombustible(e.target.value as CombustibleTipo, etapa.combustible.cantidad)
            }
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-3"
          >
            {Object.values(COMBUSTIBLES).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} (${c.precio})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                actualizarCombustible(
                  etapa.combustible.tipo,
                  Math.max(0, etapa.combustible.cantidad - 1),
                )
              }
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white"
            >
              -
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-white">{etapa.combustible.cantidad}</span>
              <span className="text-slate-400 ml-2">cucharadas</span>
            </div>
            <button
              onClick={() =>
                actualizarCombustible(
                  etapa.combustible.tipo,
                  Math.min(20, etapa.combustible.cantidad + 1),
                )
              }
              className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white"
            >
              +
            </button>
          </div>
        </div>

        {/* Propulsor */}
        <div>
          <label className="block text-purple-300 font-bold mb-3">⚪ Propulsor:</label>
          <select
            value={etapa.propulsor.tipo}
            onChange={(e) =>
              actualizarPropulsor(e.target.value as PropulsorTipo, etapa.propulsor.cantidad)
            }
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-3"
          >
            {Object.values(PROPULSORES).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (${p.precio})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                actualizarPropulsor(etapa.propulsor.tipo, Math.max(0, etapa.propulsor.cantidad - 1))
              }
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white"
            >
              -
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-white">{etapa.propulsor.cantidad}</span>
              <span className="text-slate-400 ml-2">cucharadas</span>
            </div>
            <button
              onClick={() =>
                actualizarPropulsor(
                  etapa.propulsor.tipo,
                  Math.min(20, etapa.propulsor.cantidad + 1),
                )
              }
              className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FASE 3: LANZAMIENTO (Animación de despegue multi-etapa)
// ============================================================================

interface LanzamientoProps {
  etapas: Etapa[];
  etapaActual: number;
  alturaAcumulada: number;
  enAnimacion: boolean;
  resultado: ResultadoReaccion | undefined;
}

function Lanzamiento({
  etapas,
  etapaActual,
  alturaAcumulada,
  enAnimacion,
  resultado,
}: LanzamientoProps) {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Countdown / Estado */}
        <div className="text-center mb-8">
          {etapaActual < etapas.length ? (
            <>
              <div className="text-6xl mb-4 animate-pulse">🚀</div>
              <h2 className="text-4xl font-black text-cyan-400 mb-2">
                LANZANDO ETAPA {etapaActual + 1} de {etapas.length}
              </h2>
              <p className="text-xl text-slate-300">
                {COMBUSTIBLES[etapas[etapaActual].combustible.tipo].nombre} +{' '}
                {PROPULSORES[etapas[etapaActual].propulsor.tipo].nombre}
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-4xl font-black text-purple-400">Calculando resultado...</h2>
            </>
          )}
        </div>

        {/* Indicadores de etapas */}
        <div className="flex justify-center gap-4 mb-8">
          {etapas.map((_, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all ${
                index < etapaActual
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : index === etapaActual
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 animate-pulse'
                    : 'bg-slate-800/50 border-slate-700 text-slate-600'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Altura acumulada */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <div className="text-purple-300 font-bold mb-3">📊 Altura Acumulada</div>
            <div className="text-7xl font-black text-white mb-2">{alturaAcumulada}cm</div>
            <div className="text-slate-300">Objetivo: 60cm</div>
          </div>
        </div>

        {/* Cohete */}
        {resultado && (
          <Cohete
            altura={resultado.alturaAlcanzada}
            alturaMaxima={80}
            enAnimacion={enAnimacion}
            intensidad={resultado.intensidadVisual}
            onAnimacionCompleta={() => {}}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FASE 4: RESULTADO (Éxito o fracaso)
// ============================================================================

interface ResultadoProps {
  exito: boolean;
  alturaFinal: number;
  objetivo: number;
  etapas: Etapa[];
  resultados: ResultadoReaccion[];
  onReintentar: () => void;
  onVolver: () => void;
}

function Resultado({
  exito,
  alturaFinal,
  objetivo,
  etapas,
  resultados,
  onReintentar,
  onVolver,
}: ResultadoProps) {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div
          className={`
          rounded-3xl p-12 border-4 transition-all
          ${
            exito
              ? 'bg-gradient-to-b from-green-500/20 to-emerald-500/20 border-green-500'
              : 'bg-gradient-to-b from-red-500/20 to-orange-500/20 border-red-500'
          }
        `}
        >
          {/* Resultado principal */}
          <div className="text-center mb-12">
            {exito ? (
              <>
                <div className="text-9xl mb-6 animate-bounce">🎉</div>
                <h1 className="text-7xl font-black text-green-300 mb-6">¡MISIÓN EXITOSA!</h1>
                <div className="text-6xl font-black text-white mb-4">{alturaFinal}cm</div>
                <p className="text-2xl text-green-200">¡El satélite llegó a la Luna! 🌙</p>
              </>
            ) : (
              <>
                <div className="text-8xl mb-6">😔</div>
                <h1 className="text-6xl font-black text-red-300 mb-6">Misión Fallida</h1>
                <div className="text-6xl font-black text-white mb-4">{alturaFinal}cm</div>
                <p className="text-xl text-red-200">
                  {alturaFinal < objetivo
                    ? `Te faltaron ${objetivo - alturaFinal}cm para llegar`
                    : `Te pasaste por ${alturaFinal - objetivo}cm`}
                </p>
              </>
            )}
          </div>

          {/* Detalles por etapa */}
          <div className="bg-slate-900/50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">📊 Detalles de Cada Etapa:</h3>
            <div className="space-y-4">
              {resultados.map((resultado, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-bold">Etapa {index + 1}</div>
                    <div className="text-sm text-slate-400">
                      {COMBUSTIBLES[etapas[index].combustible.tipo].nombre} +{' '}
                      {PROPULSORES[etapas[index].propulsor.tipo].nombre}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-cyan-400">
                      {resultado.alturaAlcanzada}cm
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <div className="text-xl text-white font-bold">TOTAL:</div>
                <div className="text-5xl font-black text-white">{alturaFinal}cm</div>
              </div>
            </div>
          </div>

          {/* Mensaje especial */}
          {exito && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-2xl p-8 mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold text-amber-300 mb-4">
                  ¡Felicitaciones, Científico Espacial!
                </h3>
                <p className="text-slate-200 text-lg">
                  Completaste el desafío más difícil del Simulador de Química. Ahora sabés cómo
                  trabajan los científicos de la NASA.
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onReintentar}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all"
            >
              🔄 Reintentar Misión
            </button>
            <button
              onClick={onVolver}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all"
            >
              ← Volver al Menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
