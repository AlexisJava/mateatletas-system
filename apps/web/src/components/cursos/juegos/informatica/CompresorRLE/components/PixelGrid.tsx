import React from 'react';
import { Cell, ColorId, CompressedGroup } from '../types';
import { COLORS, ROW_SIZE } from '../constants';

interface PixelGridProps {
  cells: Cell[];
  onCellClick: (id: number) => void;
  activeColorId: ColorId;
  highlightedGroupId?: string; // From hovering the data stream
  onHoverGroup: (groupId?: string) => void; // To tell parent we are hovering a pixel
  groups: CompressedGroup[]; // Needed to lookup group ID for pixel
}

export const PixelGrid: React.FC<PixelGridProps> = ({
  cells,
  onCellClick,
  activeColorId,
  highlightedGroupId,
  onHoverGroup,
  groups,
}) => {
  // Helper to find which group a cell belongs to
  const getGroupId = (index: number) => {
    return groups.find((g) => index >= g.startIndex && index < g.startIndex + g.count)?.id;
  };

  return (
    <div className="relative p-1 bg-slate-900 rounded-lg border-2 border-slate-700 shadow-2xl">
      {/* Grid Container */}
      <div
        className="grid grid-cols-8 gap-1 bg-slate-900"
        onMouseLeave={() => onHoverGroup(undefined)}
      >
        {cells.map((cell) => {
          const colorDef = COLORS[cell.colorId];
          const groupId = getGroupId(cell.id);
          const isHighlighted = highlightedGroupId === groupId;
          const isVoid = cell.colorId === 'void';

          return (
            <div
              key={cell.id}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent drag behavior
                if (e.buttons === 1) onCellClick(cell.id);
              }}
              onMouseEnter={(e) => {
                onHoverGroup(groupId);
                if (e.buttons === 1) onCellClick(cell.id); // Drag painting
              }}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12
                rounded-sm cursor-crosshair transition-all duration-150
                relative
                ${isHighlighted ? 'scale-105 z-10 brightness-150' : 'scale-100 opacity-90'}
              `}
              style={{
                backgroundColor: colorDef.hex,
                boxShadow: isHighlighted && !isVoid ? `0 0 15px ${colorDef.glowColor}` : 'none',
                border: isHighlighted
                  ? '2px solid white'
                  : `1px solid ${isVoid ? '#334155' : 'rgba(0,0,0,0.2)'}`,
              }}
            >
              {/* Index Number (Subtle) */}
              {isHighlighted && (
                <span className="absolute top-0 right-0 text-[8px] font-mono font-bold text-white/50 p-0.5 leading-none pointer-events-none">
                  {cell.id}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Decorative corners */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>
    </div>
  );
};
