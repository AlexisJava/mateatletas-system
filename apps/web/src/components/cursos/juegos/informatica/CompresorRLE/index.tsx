'use client';

import React, { useState } from 'react';
import { ColorId } from './types';
import { GRID_SIZE, PRESETS, COLORS } from './constants';
import { calculateStats } from './utils';
import { PixelGrid } from './components/PixelGrid';
import { DataStream } from './components/DataStream';
import { Toolbar } from './components/Toolbar';
import { ArrowDown, Info, X } from 'lucide-react';

interface CompresorRLEProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

const CompresorRLE: React.FC<CompresorRLEProps> = ({ onCompleted, onExit }) => {
  // --- STATE ---
  const [grid, setGrid] = useState<ColorId[]>(PRESETS.alien.data);
  const [selectedColor, setSelectedColor] = useState<ColorId>('neon-green');
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | undefined>(undefined);

  // --- DERIVED STATE ---
  const cells = grid.map((colorId, index) => ({ id: index, colorId }));
  const stats = calculateStats(cells);

  // --- HANDLERS ---
  const handleCellClick = (index: number) => {
    const newGrid = [...grid];
    newGrid[index] = selectedColor;
    setGrid(newGrid);
  };

  const handleClear = () => {
    setGrid(Array(GRID_SIZE).fill('void'));
  };

  const handleLoadPreset = (data: ColorId[]) => {
    setGrid([...data]);
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="flex max-h-[85vh] bg-[#050505] text-white overflow-hidden font-sans relative">
      {/* Exit Button */}
      {onExit && (
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 z-50 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all shadow-lg"
          title="Salir"
        >
          <X size={24} />
        </button>
      )}

      {/* SIDEBAR */}
      <div className="flex-shrink-0 z-30">
        <Toolbar
          selectedColorId={selectedColor}
          onSelectColor={setSelectedColor}
          onClear={handleClear}
          onLoadPreset={handleLoadPreset}
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER / INSTRUCTIONS */}
        <div className="h-16 border-b border-slate-800 bg-[#0a0a0a] flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-400">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200 tracking-wide">
                LABORATORIO DE COMPRESIÓN
              </h2>
              <p className="text-xs text-slate-400">
                Objetivo: Lograr que la fila de abajo sea más corta que la de arriba.
              </p>
            </div>
          </div>
        </div>

        {/* WORKSPACE (CENTERED) */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 overflow-y-auto">
          {/* Visual Guide Lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>

          {/* THE GRID */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="text-xs font-mono text-slate-500 mb-1 uppercase tracking-widest">
              DIBUJA TU MENSAJE (8x8)
            </div>

            <PixelGrid
              cells={cells}
              onCellClick={handleCellClick}
              activeColorId={selectedColor}
              highlightedGroupId={highlightedGroupId}
              onHoverGroup={setHighlightedGroupId}
              groups={stats.groups}
            />

            {/* CONNECTING CABLES (VISUAL METAPHOR) */}
            <div className="flex flex-col items-center text-slate-700 animate-pulse mt-2">
              <div className="h-8 w-0.5 bg-gradient-to-b from-slate-700 to-blue-900"></div>
              <ArrowDown size={24} className="text-blue-900" />
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL: COMPARISON STREAM */}
        <div className="h-auto border-t border-slate-800 bg-[#080808] z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <DataStream
            cells={cells}
            groups={stats.groups}
            highlightedGroupId={highlightedGroupId}
            onHoverGroup={setHighlightedGroupId}
            savings={stats.savings}
          />
        </div>
      </div>
    </div>
  );
};

export default CompresorRLE;
