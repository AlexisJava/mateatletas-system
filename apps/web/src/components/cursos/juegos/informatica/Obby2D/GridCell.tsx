import React from 'react';
import { Block } from './types';
import { RULES } from './constants';

interface GridCellProps {
  block: Block;
  x: number;
  y: number;
  onClick?: () => void;
  onDragEnter?: () => void;
  isBuilder: boolean;
  isSelected?: boolean;
}

export const GridCell: React.FC<GridCellProps> = ({
  block,
  x,
  y,
  onClick,
  onDragEnter,
  isBuilder,
  isSelected,
}) => {
  const rule = RULES[block.type];

  let innerContent = null;
  let cellClasses = 'w-full h-full relative box-border transition-all duration-100 ';

  const builderBorder = isBuilder ? 'border border-white/10 ' : '';

  if (block.type === 'empty') {
    cellClasses += `${builderBorder} bg-white/5 hover:bg-white/10`;
    if (isBuilder) {
      innerContent = (
        <div className="w-1 h-1 bg-white/10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      );
    }
  } else if (block.type === 'coin') {
    cellClasses += `${builderBorder} flex items-center justify-center`;
    if (!block.collected) {
      innerContent = <div className="text-3xl animate-bounce drop-shadow-lg filter">⭐</div>;
    } else {
      innerContent = <div className="w-2 h-2 bg-yellow-200/30 rounded-full" />;
    }
  } else {
    cellClasses += `${rule.color} shadow-lg rounded-lg `;

    if (block.type === 'lava') {
      cellClasses += ' animate-pulse ring-2 ring-red-500/50 ';
    }

    if (rule.icon) {
      innerContent = (
        <div className="w-full h-full flex items-center justify-center text-2xl drop-shadow-md select-none">
          {rule.icon}
        </div>
      );
    }
  }

  if (isBuilder && isSelected) {
    cellClasses += ' ring-4 ring-yellow-300 ring-offset-2 ring-offset-blue-400 z-10 scale-105';
  }

  return (
    <div
      className={cellClasses}
      onPointerDown={onClick}
      onPointerEnter={(e) => {
        if (e.buttons === 1) {
          onDragEnter && onDragEnter();
        }
      }}
      data-x={x}
      data-y={y}
    >
      {innerContent}
    </div>
  );
};
