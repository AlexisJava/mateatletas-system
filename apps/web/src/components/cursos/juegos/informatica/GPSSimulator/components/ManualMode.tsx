import React, { useState } from 'react';
import { Grafo } from '../types';
import GraphCanvas from './GraphCanvas';

interface ManualModeProps {
  grafo: Grafo;
  onComplete: (path: string[], cost: number) => void;
}

const ManualMode: React.FC<ManualModeProps> = ({ grafo, onComplete }) => {
  const inicio = grafo.nodos.find((n) => n.esInicio)!;
  const destino = grafo.nodos.find((n) => n.esDestino)!;

  const [camino, setCamino] = useState<string[]>([inicio.id]);
  const [costo, setCosto] = useState(0);
  const [mensaje, setMensaje] = useState('Selecciona el siguiente punto conectado.');

  const handleNodeClick = (id: string) => {
    const ultimoNodo = camino[camino.length - 1];

    // Undo
    if (id === ultimoNodo && camino.length > 1) {
      const nuevoCamino = [...camino];
      const eliminado = nuevoCamino.pop()!;
      const anterior = nuevoCamino[nuevoCamino.length - 1];
      const arista = grafo.aristas.find(
        (a) =>
          (a.desde === eliminado && a.hasta === anterior) ||
          (a.desde === anterior && a.hasta === eliminado),
      );
      if (arista) setCosto((c) => c - arista.costo);
      setCamino(nuevoCamino);
      return;
    }

    // Connect
    const arista = grafo.aristas.find(
      (a) =>
        (a.desde === ultimoNodo && a.hasta === id) || (a.desde === id && a.hasta === ultimoNodo),
    );

    if (!arista) {
      setMensaje('❌ Conexión inválida.');
      setTimeout(() => setMensaje('Selecciona el siguiente punto.'), 1000);
      return;
    }

    if (camino.includes(id)) return;

    setCamino([...camino, id]);
    setCosto((c) => c + arista.costo);

    if (id === destino.id) {
      setMensaje('🎉 ¡Conexión establecida!');
    }
  };

  const haLlegado = camino[camino.length - 1] === destino.id;

  return (
    <div className="w-full max-w-6xl mx-auto p-2 md:p-4 flex flex-col lg:flex-row gap-4 overflow-y-auto flex-1 min-h-0">
      <div className="w-full lg:w-1/3 order-2 lg:order-1 space-y-4">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-pink-500 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">MODO MANUAL</h2>
          <p className="text-slate-400 mb-6">Traza la ruta más eficiente manualmente.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-pink-500 font-bold uppercase">Distancia</div>
              <div className="text-3xl font-mono text-white">{costo}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 font-bold uppercase">Saltos</div>
              <div className="text-3xl font-mono text-white">{camino.length - 1}</div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded text-sm text-cyan-200 mb-6 border border-slate-700">
            {mensaje}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setCamino([inicio.id]);
                setCosto(0);
              }}
              className="flex-1 py-3 bg-slate-700 rounded-lg font-bold text-slate-300 hover:bg-slate-600 transition"
            >
              RESET
            </button>
            {haLlegado && (
              <button
                onClick={() => onComplete(camino, costo)}
                className="flex-[2] py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold shadow-lg animate-pulse"
              >
                CONFIRMAR
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 order-1 lg:order-2 flex items-center justify-center">
        <GraphCanvas
          grafo={grafo}
          manualMode={true}
          manualPath={camino}
          onNodeClick={!haLlegado ? handleNodeClick : undefined}
          width={700}
          height={400}
        />
      </div>
    </div>
  );
};

export default ManualMode;
