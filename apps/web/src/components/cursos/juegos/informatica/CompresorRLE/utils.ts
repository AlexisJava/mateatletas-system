import { Cell, CompressedGroup, Stats, ColorId } from './types';
import { GRID_SIZE } from './constants';

export const calculateStats = (cells: Cell[]): Stats => {
  if (cells.length === 0) {
    return { originalSize: 0, compressedSize: 0, savings: 0, groups: [] };
  }

  const groups: CompressedGroup[] = [];
  let currentColor = cells[0].colorId;
  let count = 1;
  let startIndex = 0;

  for (let i = 1; i < cells.length; i++) {
    if (cells[i].colorId === currentColor) {
      count++;
    } else {
      groups.push({
        id: `group-${groups.length}`,
        colorId: currentColor,
        count,
        startIndex,
      });
      currentColor = cells[i].colorId;
      count = 1;
      startIndex = i;
    }
  }

  // Add last group
  groups.push({
    id: `group-${groups.length}`,
    colorId: currentColor,
    count,
    startIndex,
  });

  const originalSize = GRID_SIZE; // 64 blocks
  const compressedSize = groups.length; // Number of packets

  // Savings calculation
  // If we assume uncompressed is 64 instructions vs compressed is X instructions
  const savings = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

  return {
    originalSize,
    compressedSize,
    savings,
    groups,
  };
};

export const getCellGroupId = (index: number, groups: CompressedGroup[]): string | undefined => {
  for (const group of groups) {
    if (index >= group.startIndex && index < group.startIndex + group.count) {
      return group.id;
    }
  }
  return undefined;
};
