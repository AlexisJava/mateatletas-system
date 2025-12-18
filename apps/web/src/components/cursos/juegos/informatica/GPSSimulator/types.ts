export interface Nodo {
  id: string;
  x: number;
  y: number;
  emoji: string;
  esInicio: boolean;
  esDestino: boolean;
  label: string;
}

export interface Arista {
  desde: string;
  hasta: string;
  costo: number;
}

export interface Grafo {
  nodos: Nodo[];
  aristas: Arista[];
}

// --- New Simulation Types ---

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
  startTime: number; // When fluid enters this edge
  endTime: number; // When fluid finishes traversing this edge
  isOptimal: boolean; // Is this edge part of the final shortest path?
}

export interface FlowNode {
  id: string;
  discoveryTime: number; // Time when the node was first fully reached (shortest path found)
  isOptimal: boolean;
  predecessor: string | null;
}

export interface SimulationTimeline {
  edges: FlowEdge[];
  nodes: Map<string, FlowNode>;
  maxTime: number;
  optimalPath: string[]; // List of Node IDs
}

export type AppPhase = 'START' | 'MANUAL' | 'ALGORITHM' | 'COMPARISON';
