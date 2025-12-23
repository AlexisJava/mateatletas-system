import type { BloqueCategoria, BloqueComponent, BlockDefinition } from './types';

// Import all interactive blocks
import { AudioPlayer } from './interactivo/AudioPlayer';
import { BarGraph } from './interactivo/BarGraph';
import { DragAndDrop } from './interactivo/DragAndDrop';
import { Hotspot } from './interactivo/Hotspot';
import { ImageGallery } from './interactivo/ImageGallery';
import { MatchingPairs } from './interactivo/MatchingPairs';
import { NumberInput } from './interactivo/NumberInput';
import { OrderSequence } from './interactivo/OrderSequence';
import { PieChart } from './interactivo/PieChart';
import { ProgressTracker } from './interactivo/ProgressTracker';
import { Quiz } from './interactivo/Quiz';
import { ScaleBalance } from './interactivo/ScaleBalance';
import { Slider } from './interactivo/Slider';
import { SortingBins } from './interactivo/SortingBins';
import { TextInput } from './interactivo/TextInput';
import { Timeline } from './interactivo/Timeline';
import { ToggleSwitch } from './interactivo/ToggleSwitch';

// Legacy registry using Map (for backward compatibility)
type RegistryMap = Map<string, BloqueComponent>;
const registry: RegistryMap = new Map();

export function registrarBloque<TConfig = Record<string, unknown>>(
  tipo: string,
  componente: BloqueComponent<TConfig>,
): void {
  if (registry.has(tipo)) {
    console.warn(`Bloque "${tipo}" ya está registrado. Sobrescribiendo.`);
  }
  registry.set(tipo, componente as BloqueComponent);
}

export function obtenerBloque(tipo: string): BloqueComponent | undefined {
  return registry.get(tipo);
}

export function existeBloque(tipo: string): boolean {
  return registry.has(tipo);
}

export function listarBloques(): string[] {
  return Array.from(registry.keys());
}

export function limpiarRegistry(): void {
  registry.clear();
}

// New block registry with metadata for Studio
export const blockRegistry: Record<string, BlockDefinition> = {
  // INTERACTIVO category
  Quiz: {
    component: Quiz,
    category: 'EVALUACION',
    displayName: 'Quiz',
    icon: '❓',
    defaultSize: { width: 400, height: 300 },
    defaultProps: { pregunta: '', opciones: [], tipo: 'multiple' },
  },
  AudioPlayer: {
    component: AudioPlayer,
    category: 'MULTIMEDIA',
    displayName: 'Reproductor de Audio',
    icon: '🔊',
    defaultSize: { width: 400, height: 120 },
    defaultProps: { src: '', titulo: '' },
  },
  BarGraph: {
    component: BarGraph,
    category: 'INTERACTIVO',
    displayName: 'Gráfico de Barras',
    icon: '📊',
    defaultSize: { width: 500, height: 350 },
    defaultProps: { datos: [], titulo: '' },
  },
  DragAndDrop: {
    component: DragAndDrop,
    category: 'INTERACTIVO',
    displayName: 'Arrastrar y Soltar',
    icon: '🎯',
    defaultSize: { width: 600, height: 400 },
    defaultProps: { elementos: [], zonas: [] },
  },
  Hotspot: {
    component: Hotspot,
    category: 'INTERACTIVO',
    displayName: 'Puntos Calientes',
    icon: '📍',
    defaultSize: { width: 600, height: 450 },
    defaultProps: { imagen: '', zonas: [] },
  },
  ImageGallery: {
    component: ImageGallery,
    category: 'MULTIMEDIA',
    displayName: 'Galería de Imágenes',
    icon: '🖼️',
    defaultSize: { width: 500, height: 400 },
    defaultProps: { imagenes: [] },
  },
  MatchingPairs: {
    component: MatchingPairs,
    category: 'INTERACTIVO',
    displayName: 'Emparejar',
    icon: '🔗',
    defaultSize: { width: 600, height: 400 },
    defaultProps: { pares: [] },
  },
  NumberInput: {
    component: NumberInput,
    category: 'INTERACTIVO',
    displayName: 'Entrada Numérica',
    icon: '🔢',
    defaultSize: { width: 300, height: 150 },
    defaultProps: { min: 0, max: 100, paso: 1 },
  },
  OrderSequence: {
    component: OrderSequence,
    category: 'INTERACTIVO',
    displayName: 'Ordenar Secuencia',
    icon: '📝',
    defaultSize: { width: 400, height: 350 },
    defaultProps: { elementos: [] },
  },
  PieChart: {
    component: PieChart,
    category: 'INTERACTIVO',
    displayName: 'Gráfico Circular',
    icon: '🥧',
    defaultSize: { width: 400, height: 400 },
    defaultProps: { datos: [], titulo: '' },
  },
  ProgressTracker: {
    component: ProgressTracker,
    category: 'EVALUACION',
    displayName: 'Seguimiento de Progreso',
    icon: '📈',
    defaultSize: { width: 350, height: 200 },
    defaultProps: { pasos: [], pasoActual: 0 },
  },
  ScaleBalance: {
    component: ScaleBalance,
    category: 'SIMULADOR',
    displayName: 'Balanza',
    icon: '⚖️',
    defaultSize: { width: 500, height: 400 },
    defaultProps: { izquierda: [], derecha: [] },
  },
  Slider: {
    component: Slider,
    category: 'INTERACTIVO',
    displayName: 'Deslizador',
    icon: '🎚️',
    defaultSize: { width: 400, height: 100 },
    defaultProps: { min: 0, max: 100, valor: 50, paso: 1 },
  },
  SortingBins: {
    component: SortingBins,
    category: 'INTERACTIVO',
    displayName: 'Clasificar en Contenedores',
    icon: '🗂️',
    defaultSize: { width: 600, height: 450 },
    defaultProps: { elementos: [], contenedores: [] },
  },
  TextInput: {
    component: TextInput,
    category: 'INTERACTIVO',
    displayName: 'Entrada de Texto',
    icon: '✏️',
    defaultSize: { width: 400, height: 150 },
    defaultProps: { placeholder: '', validacion: '' },
  },
  Timeline: {
    component: Timeline,
    category: 'INTERACTIVO',
    displayName: 'Línea de Tiempo',
    icon: '📅',
    defaultSize: { width: 700, height: 300 },
    defaultProps: { eventos: [] },
  },
  ToggleSwitch: {
    component: ToggleSwitch,
    category: 'INTERACTIVO',
    displayName: 'Interruptor',
    icon: '🔘',
    defaultSize: { width: 200, height: 80 },
    defaultProps: { etiquetaOn: 'Sí', etiquetaOff: 'No', valor: false },
  },
};

/**
 * Get a block definition by type
 */
export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return blockRegistry[type];
}

/**
 * Get all blocks grouped by category
 */
export function getBlocksByCategory(): Record<BloqueCategoria, BlockDefinition[]> {
  const grouped: Record<BloqueCategoria, BlockDefinition[]> = {
    INTERACTIVO: [],
    MOTRICIDAD_FINA: [],
    SIMULADOR: [],
    EDITOR_CODIGO: [],
    CREATIVO: [],
    MULTIMEDIA: [],
    EVALUACION: [],
    MULTIPLAYER: [],
  };

  for (const [, definition] of Object.entries(blockRegistry)) {
    grouped[definition.category].push(definition);
  }

  return grouped;
}

/**
 * Get all available block types
 */
export function getAvailableBlockTypes(): string[] {
  return Object.keys(blockRegistry);
}

/**
 * Check if a block type exists in the registry
 */
export function hasBlockDefinition(type: string): boolean {
  return type in blockRegistry;
}
