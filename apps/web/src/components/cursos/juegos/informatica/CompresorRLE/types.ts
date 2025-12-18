export type ColorId =
  | 'void'
  | 'neon-red'
  | 'neon-blue'
  | 'neon-green'
  | 'neon-yellow'
  | 'neon-purple'
  | 'neon-cyan'
  | 'neon-orange';

export interface ColorDefinition {
  id: ColorId;
  name: string;
  hex: string;
  glowColor: string;
}

export interface Cell {
  id: number;
  colorId: ColorId;
  groupId?: string; // Links cell to a specific RLE group
}

export interface CompressedGroup {
  id: string; // Unique ID for highlighting linkage
  colorId: ColorId;
  count: number;
  startIndex: number; // To know which cells belong to this group
}

export interface Stats {
  originalSize: number; // in bytes/blocks
  compressedSize: number; // in chunks
  savings: number; // percentage
  groups: CompressedGroup[];
}
