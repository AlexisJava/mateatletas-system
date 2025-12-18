import { ImageOption, FiltroInfo } from './types';

export const IMAGENES_EJEMPLO: ImageOption[] = [
  {
    id: 'gato',
    nombre: 'Gato',
    emoji: '🐱',
    url: 'https://picsum.photos/id/40/400/400',
  },
  {
    id: 'casa',
    nombre: 'Casa',
    emoji: '🏠',
    url: 'https://picsum.photos/id/18/400/400',
  },
  {
    id: 'flor',
    nombre: 'Flor',
    emoji: '🌸',
    url: 'https://picsum.photos/id/249/400/400',
  },
  {
    id: 'cara',
    nombre: 'Persona',
    emoji: '😀',
    url: 'https://picsum.photos/id/64/400/400',
  },
];

export const INFO_FILTROS: Record<string, FiltroInfo> = {
  ninguno: {
    id: 'ninguno',
    nombre: 'Original',
    icono: '🖼️',
    formula: 'R = R, G = G, B = B',
    descripcion: 'La imagen tal como la ve la cámara.',
  },
  'escala-gris': {
    id: 'escala-gris',
    nombre: 'Escala de Gris',
    icono: '⬜',
    formula: 'Gris = (Rojo + Verde + Azul) / 3',
    descripcion:
      'Promediamos los 3 colores para quitar la información de color, dejando solo la luz.',
  },
  brillo: {
    id: 'brillo',
    nombre: 'Brillo (+50)',
    icono: '🔆',
    formula: 'Nuevo = Actual + 50',
    descripcion: 'Sumamos luz a cada píxel. Si pasa de 255, se queda en 255 (blanco).',
  },
  invertir: {
    id: 'invertir',
    nombre: 'Invertir',
    icono: '🎭',
    formula: 'Nuevo = 255 - Actual',
    descripcion: 'Los colores claros se vuelven oscuros y los oscuros claros. ¡Como un negativo!',
  },
  pixelar: {
    id: 'pixelar',
    nombre: 'Pixelar',
    icono: '🔲',
    formula: 'Bloque = Color del 1er píxel',
    descripcion:
      'Tomamos un píxel y copiamos su color a todos sus vecinos para hacer "cuadrados" grandes.',
  },
  blur: {
    id: 'blur',
    nombre: 'Difuminar',
    icono: '🌫️',
    formula: 'Promedio de vecinos',
    descripcion: 'Mezclamos el color de cada píxel con los que tiene alrededor para suavizar.',
  },
  bordes: {
    id: 'bordes',
    nombre: 'Detectar Bordes',
    icono: '📐',
    formula: 'Cambio Brusco = Borde',
    descripcion:
      'Usamos matemática para encontrar dónde cambian los colores drásticamente. ¡Así ve la IA las formas!',
  },
};
