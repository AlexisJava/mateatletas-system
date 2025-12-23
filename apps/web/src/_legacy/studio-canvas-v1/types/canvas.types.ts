export interface CanvasElement {
  id: string;
  componentType: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: Record<string, unknown>;
  zIndex: number;
  locked: boolean;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  zoom: number;
  gridSize: number;
  snapToGrid: boolean;
  themeId: string;
  history: CanvasElement[][];
  historyIndex: number;
}

export interface CanvasActions {
  addElement: (type: string, position?: { x: number; y: number }) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  updateSize: (id: string, size: { width: number; height: number }) => void;
  updateProps: (id: string, props: Record<string, unknown>) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number) => void;
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;
  setTheme: (themeId: string) => void;
  exportToJson: () => string;
  importFromJson: (json: string) => void;
  clear: () => void;
}

export type CanvasStore = CanvasState & CanvasActions;
