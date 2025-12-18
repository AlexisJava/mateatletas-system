'use client';

import { useRef, useEffect, useState } from 'react';

interface Nodo {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

interface Arista {
  from: string;
  to: string;
}

const nodos: Nodo[] = [
  { id: 'A', label: 'Tu casa', x: 150, y: 200, color: '#FF6B6B' },
  { id: 'B', label: 'La plaza', x: 350, y: 100, color: '#4ECDC4' },
  { id: 'C', label: 'El kiosco', x: 350, y: 300, color: '#95E1D3' },
  { id: 'D', label: 'La escuela', x: 550, y: 100, color: '#FFE66D' },
  { id: 'E', label: 'La cancha', x: 550, y: 300, color: '#A8E6CF' },
];

const aristas: Arista[] = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'B', to: 'D' },
  { from: 'C', to: 'D' },
  { from: 'C', to: 'E' },
  { from: 'D', to: 'E' },
];

export default function GrafoVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress((prev) => (prev + 0.02) % 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar aristas
    aristas.forEach((arista, index) => {
      const fromNode = nodos.find((n) => n.id === arista.from);
      const toNode = nodos.find((n) => n.id === arista.to);

      if (!fromNode || !toNode) return;

      // Animación de "pulso" en las aristas
      const delay = index * 0.15;
      const pulse = Math.sin((animationProgress + delay) * Math.PI * 2);
      const lineWidth = 2 + pulse * 1;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle =
        selectedNode === fromNode.id || selectedNode === toNode.id ? '#FF6B6B' : '#D1D5DB';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    });

    // Dibujar nodos
    nodos.forEach((nodo) => {
      const isSelected = selectedNode === nodo.id;
      const isHovered = hoveredNode === nodo.id;
      const radius = isSelected ? 35 : isHovered ? 32 : 30;

      // Sombra
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Círculo del nodo
      ctx.beginPath();
      ctx.arc(nodo.x, nodo.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#FF6B6B' : nodo.color;
      ctx.fill();

      // Borde
      ctx.strokeStyle = isSelected ? '#FF0000' : isHovered ? '#666' : '#333';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.stroke();

      // Resetear sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Label del nodo (letra)
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nodo.id, nodo.x, nodo.y);

      // Descripción debajo
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(nodo.label, nodo.x, nodo.y + radius + 20);
    });
  }, [selectedNode, hoveredNode, animationProgress]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Detectar clic en nodo
    const clickedNode = nodos.find((nodo) => {
      const dx = x - nodo.x;
      const dy = y - nodo.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= 30;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id === selectedNode ? null : clickedNode.id);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Detectar hover en nodo
    const hoveredNode = nodos.find((nodo) => {
      const dx = x - nodo.x;
      const dy = y - nodo.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= 30;
    });

    setHoveredNode(hoveredNode ? hoveredNode.id : null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      <canvas
        ref={canvasRef}
        width={700}
        height={400}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="border-2 border-gray-300 rounded-lg shadow-lg bg-white cursor-pointer"
      />

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">👆 Hacé clic en los nodos para seleccionarlos</p>
        {selectedNode && (
          <div className="bg-white px-4 py-2 rounded-lg shadow-md border-2 border-blue-400">
            <p className="text-lg font-bold text-blue-600">
              Seleccionado: Nodo {selectedNode} - {nodos.find((n) => n.id === selectedNode)?.label}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-sm text-gray-700 mb-2">🔵 Nodos ({nodos.length})</h3>
          <ul className="text-xs space-y-1">
            {nodos.map((nodo) => (
              <li key={nodo.id} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: nodo.color }} />
                <span>
                  {nodo.id}: {nodo.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-sm text-gray-700 mb-2">➡️ Aristas ({aristas.length})</h3>
          <ul className="text-xs space-y-1">
            {aristas.map((arista, index) => (
              <li key={index}>
                {arista.from} ↔ {arista.to}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
