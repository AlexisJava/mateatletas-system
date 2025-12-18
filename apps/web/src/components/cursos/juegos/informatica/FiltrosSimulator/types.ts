export interface Pixel {
  r: number;
  g: number;
  b: number;
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
