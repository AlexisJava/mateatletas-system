import { ColorDefinition, ColorId } from './types';

export const GRID_SIZE = 64; // 8x8 Grid
export const ROW_SIZE = 8;

export const COLORS: Record<ColorId, ColorDefinition> = {
  void: {
    id: 'void',
    name: 'VACÍO',
    hex: '#1e293b',
    glowColor: 'transparent',
  },
  'neon-red': {
    id: 'neon-red',
    name: 'PLASMA',
    hex: '#ff0055',
    glowColor: '#ff0055',
  },
  'neon-blue': {
    id: 'neon-blue',
    name: 'LÁSER',
    hex: '#00ccff',
    glowColor: '#00ccff',
  },
  'neon-green': {
    id: 'neon-green',
    name: 'TÓXICO',
    hex: '#00ff99',
    glowColor: '#00ff99',
  },
  'neon-yellow': {
    id: 'neon-yellow',
    name: 'VOLT',
    hex: '#ffff00',
    glowColor: '#ffff00',
  },
  'neon-purple': {
    id: 'neon-purple',
    name: 'UV',
    hex: '#bf00ff',
    glowColor: '#bf00ff',
  },
  'neon-cyan': {
    id: 'neon-cyan',
    name: 'CIAN',
    hex: '#00ffff',
    glowColor: '#00ffff',
  },
  'neon-orange': {
    id: 'neon-orange',
    name: 'FUEGO',
    hex: '#ff6600',
    glowColor: '#ff6600',
  },
};

// --- PRESETS (ARTWORK) ---

// Helper to fill grid
const fill = (indices: number[], color: ColorId, grid: ColorId[]) => {
  indices.forEach((i) => (grid[i] = color));
};

// 1. SPACE INVADER
const alienGrid = Array(GRID_SIZE).fill('void');
const green = 'neon-green';
fill(
  [
    2, 3, 4, 5, 10, 13, 16, 17, 18, 19, 20, 21, 24, 25, 27, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38,
    39, 42, 43, 44, 45, 50, 53, 57, 58, 61, 62,
  ],
  green,
  alienGrid,
);

// 2. HEART
const heartGrid = Array(GRID_SIZE).fill('void');
const red = 'neon-red';
fill(
  [
    10, 11, 13, 14, 17, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30, 33, 34, 35, 36, 37, 38, 42, 43,
    44, 45, 51, 52,
  ],
  red,
  heartGrid,
);

// 3. SMILEY
const smileGrid = Array(GRID_SIZE).fill('void');
const yellow = 'neon-yellow';
const blue = 'neon-blue';
fill(
  [
    2,
    3,
    4,
    5,
    9,
    14,
    16,
    23,
    16,
    23, // Cheeks
    24,
    31,
    32,
    39,
    41,
    46,
    50,
    51,
    52,
    53,
  ],
  yellow,
  smileGrid,
);
// Eyes
smileGrid[18] = blue;
smileGrid[21] = blue;
// Mouth
smileGrid[42] = 'neon-red';
smileGrid[43] = 'neon-red';
smileGrid[44] = 'neon-red';
smileGrid[45] = 'neon-red';

export const PRESETS = {
  alien: { name: 'INVADER', data: alienGrid },
  heart: { name: 'VIDA EXTRA', data: heartGrid },
  smile: { name: 'FELIZ', data: smileGrid },
};
