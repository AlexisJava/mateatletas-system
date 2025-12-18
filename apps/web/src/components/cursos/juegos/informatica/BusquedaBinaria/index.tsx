'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Target,
  Terminal,
  ChevronRight,
  RotateCcw,
  Cpu,
  AlertCircle,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  Play,
  ShieldAlert,
  BarChart3,
  Binary,
  X,
} from 'lucide-react';

// --- Tipos ---

type Fase =
  | 'inicio'
  | 'tutorial'
  | 'libre'
  | 'ganado-libre'
  | 'explicacion'
  | 'desafio'
  | 'ganado-desafio'
  | 'final';

interface Caja {
  id: number;
  estado: 'default' | 'descartado' | 'foco' | 'ganador' | 'seleccionado';
}

interface LogEntry {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface BusquedaBinariaProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

// --- Constantes ---
const TOTAL_CAJAS = 64;

// --- Componentes UI ---

const Badge = ({
  children,
  color = 'blue',
}: {
  children?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-mono font-bold border ${colors[color]} uppercase tracking-wider`}
    >
      {children}
    </span>
  );
};

const TerminalLog = ({ logs }: { logs: LogEntry[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden font-mono text-xs shadow-inner">
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <span className="text-slate-400 flex items-center gap-2">
          <Terminal size={12} /> CONSOLA DE SISTEMA
        </span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {logs.length === 0 && (
          <span className="text-slate-600 italic">Esperando input del usuario...</span>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span
              className={`
              ${log.type === 'info' ? 'text-slate-300' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'warning' ? 'text-yellow-400' : ''}
              ${log.type === 'error' ? 'text-red-400' : ''}
            `}
            >
              <span className="mr-1">{'>'}</span> {log.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
}) => (
  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-mono font-bold text-white">{value}</p>
    </div>
    <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
      <Icon size={20} />
    </div>
  </div>
);

// --- Componente Principal ---

const BusquedaBinaria: React.FC<BusquedaBinariaProps> = ({ onCompleted, onExit }) => {
  // Estado
  const [fase, setFase] = useState<Fase>('inicio');
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [targetId, setTargetId] = useState<number>(0);
  const [rango, setRango] = useState<{ min: number; max: number }>({ min: 1, max: TOTAL_CAJAS });
  const [intentos, setIntentos] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Stats finales
  const [stats, setStats] = useState({ libre: 0, desafio: 0 });

  // Init
  useEffect(() => {
    // Inicializar grid vacío
    const initCajas: Caja[] = Array.from({ length: TOTAL_CAJAS }, (_, i) => ({
      id: i + 1,
      estado: 'default',
    }));
    setCajas(initCajas);
  }, []);

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [...prev, { id: Date.now(), text, type, timestamp: time }]);
  };

  const iniciarNivel = (modo: 'libre' | 'desafio') => {
    const nuevoTarget = Math.floor(Math.random() * TOTAL_CAJAS) + 1;
    setTargetId(nuevoTarget);
    setIntentos(0);
    setRango({ min: 1, max: TOTAL_CAJAS });
    setLogs([]); // Limpiar logs

    // Resetear cajas
    setCajas((prev) => prev.map((c) => ({ ...c, estado: 'default' })));

    setFase(modo === 'libre' ? 'libre' : 'desafio');

    addLog('SISTEMA INICIADO', 'info');
    addLog(`MODO: ${modo === 'libre' ? 'BÚSQUEDA LIBRE' : 'BÚSQUEDA BINARIA'}`, 'warning');
    addLog(`OBJETIVO OCULTO GENERADO [1-${TOTAL_CAJAS}]`, 'info');
    if (modo === 'desafio') {
      addLog('Algoritmo de sugerencia activo.', 'info');
    }
  };

  const procesarIntento = (id: number) => {
    if (fase !== 'libre' && fase !== 'desafio') return;

    const cajaActual = cajas.find((c) => c.id === id);
    if (!cajaActual || cajaActual.estado === 'descartado') return;

    const nuevosIntentos = intentos + 1;
    setIntentos(nuevosIntentos);

    // Animación de selección
    setCajas((prev) => prev.map((c) => (c.id === id ? { ...c, estado: 'seleccionado' } : c)));

    // Lógica principal
    setTimeout(() => {
      if (id === targetId) {
        // Ganador
        addLog(`¡OBJETIVO ${id} LOCALIZADO!`, 'success');
        addLog(`Búsqueda completada en ${nuevosIntentos} ciclos.`, 'success');

        setCajas((prev) => prev.map((c) => (c.id === id ? { ...c, estado: 'ganador' } : c)));

        if (fase === 'libre') {
          setStats((s) => ({ ...s, libre: nuevosIntentos }));
          setTimeout(() => setFase('ganado-libre'), 1500);
        } else {
          setStats((s) => ({ ...s, desafio: nuevosIntentos }));
          setTimeout(() => setFase('ganado-desafio'), 1500);
        }
      } else {
        // Fallo
        const esMayor = targetId > id;
        addLog(`Analizando índice ${id}...`, 'info');
        addLog(`El objetivo es ${esMayor ? 'MAYOR (⬆)' : 'MENOR (⬇)'} que ${id}`, 'warning');

        // Actualizar rango
        let nuevoRango = { ...rango };
        if (esMayor) {
          nuevoRango.min = Math.max(rango.min, id + 1);
          addLog(`Descartando sector inferior [${rango.min}-${id}]`, 'error');
        } else {
          nuevoRango.max = Math.min(rango.max, id - 1);
          addLog(`Descartando sector superior [${id}-${rango.max}]`, 'error');
        }
        setRango(nuevoRango);

        // Actualizar visualización de cajas
        setCajas((prev) =>
          prev.map((c) => {
            if (c.estado === 'descartado') return c;
            if (c.id === targetId) return c; // No tocar el premio (aunque no se ve)

            // Si está fuera del nuevo rango, descartar
            if (c.id < nuevoRango.min || c.id > nuevoRango.max) {
              return { ...c, estado: 'descartado' };
            }
            return { ...c, estado: 'default' }; // Resetear selección
          }),
        );
      }
    }, 400);
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  // Cálculo de sugerencia binaria
  const sugerencia = useMemo(() => {
    if (fase !== 'desafio') return null;
    return Math.floor((rango.min + rango.max) / 2);
  }, [rango, fase]);

  // --- Render Functions ---

  const renderGrid = () => (
    <div className="flex-1 w-full bg-slate-900/30 rounded-xl p-2 md:p-4 border border-slate-800 shadow-2xl backdrop-blur-sm relative flex flex-col min-h-0">
      {/* Overlay de Rango Activo (Visualización Matemática) */}
      <div className="absolute top-0 right-0 p-2 md:p-4 pointer-events-none flex gap-4 opacity-50 z-0">
        <span className="text-[100px] md:text-[200px] leading-none font-black text-white/5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {rango.max - rango.min + 1}
        </span>
      </div>

      <div className="grid grid-cols-8 gap-1.5 md:gap-2 h-full auto-rows-fr w-full max-w-[80vh] mx-auto z-10">
        <AnimatePresence>
          {cajas.map((caja) => {
            const isSuggestion = sugerencia === caja.id;
            const isDescartada = caja.estado === 'descartado';
            const isGanador = caja.estado === 'ganador';
            const inRange = caja.id >= rango.min && caja.id <= rango.max;

            return (
              <motion.button
                key={caja.id}
                layout
                initial={false}
                animate={{
                  scale: isDescartada ? 0.8 : isGanador ? 1.1 : 1,
                  opacity: isDescartada ? 0.15 : 1,
                  backgroundColor: isGanador
                    ? '#22c55e'
                    : isDescartada
                      ? '#1e293b'
                      : isSuggestion && !isGanador
                        ? '#3b82f6'
                        : '#0f172a',
                  borderColor: isGanador
                    ? '#4ade80'
                    : isSuggestion
                      ? '#60a5fa'
                      : isDescartada
                        ? 'transparent'
                        : '#334155',
                }}
                whileHover={
                  !isDescartada && !isGanador ? { scale: 1.05, backgroundColor: '#1e293b' } : {}
                }
                whileTap={!isDescartada ? { scale: 0.95 } : {}}
                onClick={() => procesarIntento(caja.id)}
                disabled={isDescartada || isGanador}
                className={`
                            relative rounded-md border md:border-2 flex items-center justify-center
                            transition-shadow duration-300
                            ${isSuggestion ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20 ring-1 ring-blue-400' : ''}
                            ${isGanador ? 'shadow-[0_0_30px_rgba(34,197,94,0.6)] z-30 ring-2 ring-white' : ''}
                            ${inRange && !isGanador ? 'border-slate-700' : ''}
                        `}
              >
                <span
                  className={`
                            font-mono font-bold text-xs md:text-sm lg:text-lg
                            ${isGanador ? 'text-white' : isDescartada ? 'text-slate-700' : 'text-slate-300'}
                            ${isSuggestion ? 'text-white' : ''}
                        `}
                >
                  {caja.id}
                </span>

                {/* Indicador de medio en modo desafío */}
                {isSuggestion && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full animate-ping" />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );

  // --- Screens ---

  if (fase === 'inicio') {
    return (
      <div className="max-h-[85vh] flex flex-col items-center justify-center p-6 text-center space-y-8 bg-slate-900 relative">
        {onExit && (
          <button
            onClick={handleExit}
            className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all shadow-lg"
            title="Salir"
          >
            <X size={24} />
          </button>
        )}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
          <Binary size={80} className="text-blue-400 relative z-10 mb-4 mx-auto" />
          <h1 className="text-5xl md:text-7xl font-black text-white relative z-10 tracking-tight">
            BINARY<span className="text-blue-500">SEARCH</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm md:text-base tracking-widest mt-2 uppercase">
            Simulador de Algoritmos v2.0
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
            <Search className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Búsqueda Lineal</h3>
            <p className="text-sm text-slate-400">
              Lenta. Ineficiente. Intentar uno por uno hasta encontrar.
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5">
              RECOMENDADO
            </div>
            <Cpu className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Búsqueda Binaria</h3>
            <p className="text-sm text-slate-400">Rápida. Divide y vencerás. Elimina mitades.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
            <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Comparativa</h3>
            <p className="text-sm text-slate-400">
              Experimenta la diferencia de velocidad en tiempo real.
            </p>
          </div>
        </div>

        <button
          onClick={() => iniciarNivel('libre')}
          className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center gap-3 text-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Play fill="currentColor" /> INICIAR SIMULACIÓN
        </button>
      </div>
    );
  }

  if (fase === 'explicacion') {
    // Pantalla intermedia para enseñar el truco
    return (
      <div className="max-h-[85vh] flex flex-col items-center justify-center p-8 bg-slate-900 overflow-y-auto relative">
        {onExit && (
          <button
            onClick={handleExit}
            className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all shadow-lg"
            title="Salir"
          >
            <X size={24} />
          </button>
        )}
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">ALGORITMO DETECTADO</h2>
            <p className="text-slate-400">Optimización disponible: BÚSQUEDA BINARIA</p>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-sm space-y-4 shadow-2xl">
            <p className="text-green-400">$ analyzing_search_pattern...</p>
            <p className="text-slate-300">
              Detectado patrón ineficiente (Lineal).
              <br />
              Costo computacional: <span className="text-red-400">Alto (O(n))</span>
            </p>
            <div className="h-px bg-slate-800 my-4" />
            <p className="text-blue-400 font-bold">&gt;&gt; ACTIVANDO PROTOCOLO BINARIO</p>
            <ul className="text-slate-400 space-y-2 list-disc pl-4">
              <li>Ordenar datos (Ya ordenado: 1-64)</li>
              <li>Seleccionar punto medio</li>
              <li>Si Objetivo &lt; Medio → Descartar mitad superior</li>
              <li>Si Objetivo &gt; Medio → Descartar mitad inferior</li>
              <li>Repetir.</li>
            </ul>
            <p className="text-yellow-400 mt-4">
              RESULTADO ESPERADO: Máximo 6 intentos (log₂ 64 = 6).
            </p>
          </div>

          <button
            onClick={() => iniciarNivel('desafio')}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
          >
            <Cpu size={20} /> EJECUTAR ALGORITMO OPTIMIZADO
          </button>
        </div>
      </div>
    );
  }

  if (fase === 'ganado-libre' || fase === 'ganado-desafio') {
    // Pantalla de transición rápida o resultado parcial
    const esLibre = fase === 'ganado-libre';
    return (
      <div className="max-h-[85vh] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md absolute inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center shadow-2xl max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">¡OBJETIVO ENCONTRADO!</h2>
          <div className="my-6">
            <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Total Ciclos</p>
            <p className="text-6xl font-mono font-black text-white">
              {esLibre ? stats.libre : stats.desafio}
            </p>
          </div>
          <button
            onClick={() => (esLibre ? setFase('explicacion') : setFase('final'))}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"
          >
            CONTINUAR <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  if (fase === 'final') {
    return (
      <div className="max-h-[85vh] flex flex-col items-center justify-center p-6 bg-slate-900 overflow-y-auto relative">
        {onExit && (
          <button
            onClick={handleExit}
            className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all shadow-lg"
            title="Salir"
          >
            <X size={24} />
          </button>
        )}
        <div className="max-w-2xl w-full bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-xl shadow-2xl text-center">
          <TrophySection stats={stats} onRestart={() => setFase('inicio')} />
        </div>
      </div>
    );
  }

  // --- Main Simulation View (Libre & Desafio) ---

  return (
    <div className="max-h-[85vh] flex flex-col p-2 md:p-4 gap-2 md:gap-4 max-w-7xl mx-auto relative">
      {onExit && (
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all shadow-lg"
          title="Salir"
        >
          <X size={24} />
        </button>
      )}
      {/* Header HUD */}
      <header className="flex justify-between items-stretch gap-2 h-20 shrink-0">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-center w-48">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Target size={14} /> <span className="text-[10px] font-bold uppercase">Objetivo</span>
          </div>
          <div className="text-2xl font-mono font-bold text-blue-400 tracking-wider">
            {fase === 'libre' ? (
              '???'
            ) : (
              <span className="flex items-center gap-2">
                ??? <Badge color="green">AUTO</Badge>
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard
            label="Intentos"
            value={intentos.toString().padStart(2, '0')}
            icon={RotateCcw}
            color="yellow"
          />
          <StatCard
            label="Rango Activo"
            value={`[${rango.min}-${rango.max}]`}
            icon={BarChart3}
            color="blue"
          />
          <div className="hidden md:flex bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex-col justify-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
              Espacio de Búsqueda
            </p>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${((rango.max - rango.min + 1) / 64) * 100}%` }}
                className="h-full bg-blue-500"
              />
            </div>
            <p className="text-right text-[10px] text-slate-500 mt-1">
              {rango.max - rango.min + 1} / 64 nodos
            </p>
          </div>
          <div className="hidden md:flex bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex-col justify-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Eficiencia</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${fase === 'libre' ? 'bg-red-500' : 'bg-green-500'}`}
              ></div>
              <span className="font-mono text-sm">{fase === 'libre' ? 'O(n)' : 'O(log n)'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setFase('inicio')}
          className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 rounded-lg hover:bg-red-900/40 transition-colors"
        >
          ABORT
        </button>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* Left: Visualization (Grid) */}
        <div className="flex-1 flex flex-col min-h-0">
          {renderGrid()}

          {/* Visual Math Helper (Challenge Mode) */}
          {fase === 'desafio' && sugerencia && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-2 bg-blue-900/20 border border-blue-800 p-3 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Cpu className="text-blue-400" />
                <div className="text-sm font-mono">
                  <span className="text-slate-400">CALC:</span>{' '}
                  <span className="text-white">
                    ({rango.min} + {rango.max}) / 2 ={' '}
                  </span>{' '}
                  <span className="text-yellow-400 font-bold">
                    {Math.floor((rango.min + rango.max) / 2)}
                  </span>
                </div>
              </div>
              <Badge color="blue">PUNTO MEDIO</Badge>
            </motion.div>
          )}
        </div>

        {/* Right: Console Log */}
        <div className="h-48 md:h-auto md:w-80 shrink-0 flex flex-col">
          <TerminalLog logs={logs} />
        </div>
      </div>
    </div>
  );
};

// --- Subcomponente Final (Extraído para limpieza) ---
const TrophySection = ({
  stats,
  onRestart,
}: {
  stats: { libre: number; desafio: number };
  onRestart: () => void;
}) => {
  const mejora = Math.round(stats.libre / stats.desafio);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-white">REPORTE FINAL</h1>

      <div className="grid grid-cols-2 gap-8 items-end">
        <div className="space-y-2 opacity-50">
          <p className="text-sm font-mono text-slate-400">BÚSQUEDA HUMANA</p>
          <div className="text-5xl font-black text-slate-300">{stats.libre}</div>
          <div className="text-xs text-slate-500 uppercase">Intentos</div>
        </div>
        <div className="space-y-2 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">
            GANADOR
          </div>
          <p className="text-sm font-mono text-green-400">ALGORITMO BINARIO</p>
          <div className="text-6xl font-black text-green-400">{stats.desafio}</div>
          <div className="text-xs text-green-600 uppercase">Intentos</div>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <p className="text-slate-300 mb-2">
          Factor de aceleración:{' '}
          <span className="text-yellow-400 font-bold text-xl">{mejora}x</span>
        </p>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-green-500 w-full"></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Lento</span>
          <span>Óptimo</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="flex items-center justify-center gap-2 text-slate-400 hover:text-white mx-auto transition-colors"
      >
        <RotateCcw size={16} /> REINICIAR SISTEMA
      </button>
    </div>
  );
};

export default BusquedaBinaria;
