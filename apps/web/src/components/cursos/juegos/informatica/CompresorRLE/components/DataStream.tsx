import React from 'react';
import { CompressedGroup, Cell } from '../types';
import { COLORS } from '../constants';
import { Box, ArrowRight } from 'lucide-react';

interface DataStreamProps {
  cells: Cell[]; // Raw data
  groups: CompressedGroup[]; // Compressed data
  highlightedGroupId?: string;
  onHoverGroup: (groupId?: string) => void;
  savings: number;
}

export const DataStream: React.FC<DataStreamProps> = ({
  cells,
  groups,
  highlightedGroupId,
  onHoverGroup,
  savings,
}) => {
  return (
    <div className="w-full bg-slate-900/95 border-t border-slate-700 p-6 backdrop-blur-sm flex flex-col gap-6">
      {/* 1. MODO LENTO (SIN COMPRIMIR) */}
      <div className="flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex justify-between items-end px-2">
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
            <span>❌ MODO LENTO (SIN COMPRIMIR)</span>
            <span className="bg-red-900/30 text-red-300 px-1 rounded">64 PAQUETES</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">OCUPA MUCHO ESPACIO</div>
        </div>

        {/* The Long Stream */}
        <div className="w-full h-8 bg-slate-800/50 rounded flex items-center px-1 gap-[1px] overflow-hidden relative border border-red-900/20 grayscale">
          {cells.map((cell) => (
            <div
              key={cell.id}
              className="h-6 flex-1 min-w-[4px] rounded-[1px]"
              style={{ backgroundColor: COLORS[cell.colorId].hex }}
            />
          ))}
          {/* Overlay to show length overflow if imagined */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#080808] to-transparent"></div>
        </div>
      </div>

      {/* 2. MODO RÁPIDO (COMPRIMIDO) */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end px-2">
          <div className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
            <span>✅ MODO RÁPIDO (COMPRIMIDO)</span>
            <span className="bg-green-900/30 text-green-300 px-2 py-0.5 rounded border border-green-800">
              SOLO {groups.length} PAQUETES
            </span>
          </div>
          <div className="text-xs font-bold text-white font-mono">¡AHORRO DEL {savings}%!</div>
        </div>

        {/* The Short Stream (Interactive) */}
        <div className="flex gap-2 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {groups.map((group, idx) => {
            const colorDef = COLORS[group.colorId];
            const isHighlighted = highlightedGroupId === group.id;

            return (
              <div
                key={idx}
                onMouseEnter={() => onHoverGroup(group.id)}
                onMouseLeave={() => onHoverGroup(undefined)}
                className={`
                  flex-shrink-0 relative group select-none
                  flex flex-col items-center justify-center
                  min-w-[60px] h-[70px] rounded-lg
                  border-2 transition-all duration-200 cursor-pointer
                  ${
                    isHighlighted
                      ? 'scale-110 z-10 border-white bg-slate-800'
                      : 'scale-100 border-slate-700 bg-slate-900 hover:border-slate-500'
                  }
                `}
                style={{
                  boxShadow: isHighlighted ? `0 0 15px ${colorDef.glowColor}` : 'none',
                }}
              >
                {/* Number Badge */}
                <div
                  className={`
                  text-2xl font-black font-mono mb-1
                  ${isHighlighted ? 'text-white' : 'text-slate-400'}
                `}
                >
                  {group.count}
                </div>

                {/* Color Bar */}
                <div
                  className="w-8 h-2 rounded-full"
                  style={{ backgroundColor: colorDef.hex, boxShadow: `0 0 5px ${colorDef.hex}` }}
                />

                {/* Tooltip on Hover */}
                {isHighlighted && (
                  <div className="absolute -top-10 bg-white text-black text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                    {group.count} BLOQUES {colorDef.name}
                  </div>
                )}
              </div>
            );
          })}

          {/* Success Visual */}
          {groups.length < 10 && (
            <div className="flex items-center text-green-500 text-xs font-bold uppercase ml-4 animate-pulse">
              <ArrowRight size={16} className="mr-1" />
              Listo para enviar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
