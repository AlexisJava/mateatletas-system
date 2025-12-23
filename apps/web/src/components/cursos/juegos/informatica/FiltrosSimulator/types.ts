export interface Pixel {
  r: number;
  g: number;
  b: number;
}

/**
 * Pixel grid con acceso seguro a través de helper functions.
 * Internamente usa un array plano para garantizar acceso O(1) y tipo-seguro.
 */
export interface PixelGrid {
  readonly data: Pixel[];
  readonly width: number;
  readonly height: number;
}

/**
 * Crea una grilla de pixels vacía con valores por defecto
 */
export function createPixelGrid(width: number, height: number): PixelGrid {
  const data: Pixel[] = new Array(width * height);
  for (let i = 0; i < data.length; i++) {
    data[i] = { r: 0, g: 0, b: 0 };
  }
  return { data, width, height };
}

/**
 * Obtiene un pixel de forma segura, retorna negro si está fuera de bounds
 */
export function getPixel(grid: PixelGrid, x: number, y: number): Pixel {
  if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
    return { r: 0, g: 0, b: 0 };
  }
  const index = y * grid.width + x;
  return grid.data[index] ?? { r: 0, g: 0, b: 0 };
}

/**
 * Establece un pixel de forma segura, ignora si está fuera de bounds
 */
export function setPixel(grid: PixelGrid, x: number, y: number, pixel: Pixel): void {
  if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
    return;
  }
  const index = y * grid.width + x;
  grid.data[index] = pixel;
}

/**
 * Convierte PixelGrid a array bidimensional legacy (para compatibilidad)
 */
export function gridToPixels2D(grid: PixelGrid): Pixel[][] {
  const pixels: Pixel[][] = [];
  for (let y = 0; y < grid.height; y++) {
    pixels[y] = [];
    for (let x = 0; x < grid.width; x++) {
      pixels[y]![x] = getPixel(grid, x, y);
    }
  }
  return pixels;
}

/**
 * Convierte array bidimensional legacy a PixelGrid
 */
export function pixels2DToGrid(pixels: Pixel[][], width: number, height: number): PixelGrid {
  const grid = createPixelGrid(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const row = pixels[y];
      if (row) {
        const pixel = row[x];
        if (pixel) {
          setPixel(grid, x, y, pixel);
        }
      }
    }
  }
  return grid;
}

export interface ImagenData {
  width: number;
  height: number;
  pixels: Pixel[][];
}

export type TipoFiltro =
  | 'ninguno'
  | 'escala-gris'
  | 'brillo'
  | 'invertir'
  | 'pixelar'
  | 'blur'
  | 'bordes';

export type FaseSimulacion =
  | 'inicio'
  | 'explicacion'
  | 'elegir-imagen'
  | 'explorar'
  | 'filtros'
  | 'final';

export interface ImageOption {
  id: string;
  nombre: string;
  emoji: string;
  url: string;
}

export interface FiltroInfo {
  id: TipoFiltro;
  nombre: string;
  icono: string;
  formula: string;
  descripcion: string;
}
