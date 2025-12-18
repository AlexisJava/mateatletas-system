import React from 'react';
import { ColorId } from '../types';
import { COLORS, PRESETS } from '../constants';
import { Trash2, Sparkles, Eraser } from 'lucide-react';

interface ToolbarProps {
  selectedColorId: ColorId;
  onSelectColor: (id: ColorId) => void;
  onClear: () => void;
  onLoadPreset: (data: ColorId[]) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedColorId,
  onSelectColor,
  onClear,
  onLoadPreset,
}) => {
  const palette = Object.values(COLORS).filter((c) => c.id !== 'void');

  return (
    <div className="flex flex-col gap-6 p-4 bg-[#0a0a0a] border-r border-slate-800 h-full w-[220px]">
      {/* Title */}
      <div className="pt-2 pb-4 border-b border-slate-800">
        <h1 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 italic uppercase leading-none">
          Pixel
          <br />
          Packer
          <br />
          3000
        </h1>
        <p className="text-[10px] text-slate-500 font-mono mt-2">v3.1 // COMPRESSION_LAB</p>
      </div>

      {/* Tools */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Acciones
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClear}
            className="flex flex-col items-center justify-center p-3 rounded bg-slate-900 hover:bg-red-900/20 border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 transition-all group"
          >
            <Trash2 size={18} className="mb-1" />
            <span className="text-[9px] font-bold">BORRAR</span>
          </button>

          <button
            onClick={() => onSelectColor('void')}
            className={`
               flex flex-col items-center justify-center p-3 rounded border transition-all
               ${
                 selectedColorId === 'void'
                   ? 'bg-slate-800 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                   : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-500'
               }
             `}
          >
            <Eraser size={18} className="mb-1" />
            <span className="text-[9px] font-bold">BORRAR PÍXEL</span>
          </button>
        </div>
      </div>

      {/* Palette */}
      <div className="space-y-3 flex-1">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Colores (Píxeles)
        </div>
        <div className="grid grid-cols-2 gap-3">
          {palette.map((color) => (
            <button
              key={color.id}
              onClick={() => onSelectColor(color.id)}
              className={`
                h-10 rounded-md relative overflow-hidden transition-all duration-200 group border
                ${
                  selectedColorId === color.id
                    ? 'border-white scale-105 z-10 shadow-lg'
                    : 'border-transparent hover:scale-105 hover:border-slate-500'
                }
              `}
              style={{ backgroundColor: color.hex }}
            >
              {selectedColorId === color.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_black]"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Ejemplos
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onLoadPreset(PRESETS.alien.data)}
            className="text-[10px] font-bold text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-cyan-500 rounded flex items-center gap-2 transition-all"
          >
            <Sparkles size={12} /> <span>ALIEN.IMG</span>
          </button>
          <button
            onClick={() => onLoadPreset(PRESETS.heart.data)}
            className="text-[10px] font-bold text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500 text-pink-500 rounded flex items-center gap-2 transition-all"
          >
            <Sparkles size={12} /> <span>CORAZON.IMG</span>
          </button>
          <button
            onClick={() => onLoadPreset(PRESETS.smile.data)}
            className="text-[10px] font-bold text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-yellow-500 text-yellow-500 rounded flex items-center gap-2 transition-all"
          >
            <Sparkles size={12} /> <span>SMILE.IMG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
