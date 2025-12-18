import { Grafo, Nodo, Arista } from './types';

// --- NEIGHBORHOOD MAP (Level 1) ---
export const MAPA_FACIL: Grafo = {
  nodos: [
    { id: 'A', x: 100, y: 150, emoji: '🏠', esInicio: true, esDestino: false, label: 'Casa' },
    { id: 'B', x: 280, y: 80, emoji: '🌲', esInicio: false, esDestino: false, label: 'Parque' },
    { id: 'C', x: 280, y: 220, emoji: '🏢', esInicio: false, esDestino: false, label: 'Centro' },
    { id: 'D', x: 450, y: 150, emoji: '🏥', esInicio: false, esDestino: false, label: 'Clínica' },
    { id: 'E', x: 600, y: 80, emoji: '🏪', esInicio: false, esDestino: false, label: 'Kiosco' },
    { id: 'F', x: 600, y: 220, emoji: '⛽', esInicio: false, esDestino: false, label: 'Estación' },
    { id: 'G', x: 700, y: 150, emoji: '🎯', esInicio: false, esDestino: true, label: 'Destino' },
  ],
  aristas: [
    { desde: 'A', hasta: 'B', costo: 4 },
    { desde: 'A', hasta: 'C', costo: 2 },
    { desde: 'B', hasta: 'D', costo: 5 },
    { desde: 'B', hasta: 'E', costo: 6 },
    { desde: 'C', hasta: 'D', costo: 3 },
    { desde: 'C', hasta: 'F', costo: 7 },
    { desde: 'D', hasta: 'E', costo: 2 },
    { desde: 'D', hasta: 'F', costo: 2 },
    { desde: 'D', hasta: 'G', costo: 4 }, // Shortcut center
    { desde: 'E', hasta: 'G', costo: 3 },
    { desde: 'F', hasta: 'G', costo: 2 },
  ],
};

// --- CYBER CITY GENERATOR (Level 2) ---
export function generarCyberCity(): Grafo {
  const nodos: Nodo[] = [];
  const aristas: Arista[] = [];

  // Grid settings
  const cols = 16;
  const rows = 10;
  const width = 800;
  const height = 500;
  const padding = 60;
  const cellW = (width - padding * 2) / (cols - 1);
  const cellH = (height - padding * 2) / (rows - 1);

  // Generate Hex-like distorted grid
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const id = `N-${x}-${y}`;

      // Random displacement for organic look
      const driftX = (Math.random() - 0.5) * 15;
      const driftY = (Math.random() - 0.5) * 15;

      const px = padding + x * cellW + driftX;
      const py = padding + y * cellH + driftY;

      // Start/End selection
      const isStart = x === 1 && y === Math.floor(rows / 2);
      const isEnd = x === cols - 2 && y === Math.floor(rows / 2);

      nodos.push({
        id,
        x: px,
        y: py,
        emoji: isStart ? '🚀' : isEnd ? '📍' : '',
        esInicio: isStart,
        esDestino: isEnd,
        label: '',
      });
    }
  }

  // Connect nodes
  // We want a "Forward flow" mostly, but some cross connections
  nodos.forEach((node) => {
    const parts = node.id.split('-');
    const x = parseInt(parts[1]);
    const y = parseInt(parts[2]);

    // Connect to Right
    if (x < cols - 1) {
      // Chance to skip connection for "holes" in map
      if (Math.random() > 0.1) {
        const right = nodos.find((n) => n.id === `N-${x + 1}-${y}`)!;
        const baseCost = 5 + Math.random() * 10;
        aristas.push({ desde: node.id, hasta: right.id, costo: Math.floor(baseCost) });
      }
    }

    // Connect Down
    if (y < rows - 1) {
      if (Math.random() > 0.1) {
        const down = nodos.find((n) => n.id === `N-${x}-${y + 1}`)!;
        const baseCost = 5 + Math.random() * 10;
        aristas.push({ desde: node.id, hasta: down.id, costo: Math.floor(baseCost) });
      }
    }

    // Diagonals (sometimes) to make it interesting
    if (x < cols - 1 && y < rows - 1 && Math.random() > 0.7) {
      const diag = nodos.find((n) => n.id === `N-${x + 1}-${y + 1}`)!;
      const baseCost = 7 + Math.random() * 10;
      aristas.push({ desde: node.id, hasta: diag.id, costo: Math.floor(baseCost) });
    }

    // Up Diagonals (sometimes)
    if (x < cols - 1 && y > 0 && Math.random() > 0.7) {
      const diag = nodos.find((n) => n.id === `N-${x + 1}-${y - 1}`)!;
      const baseCost = 7 + Math.random() * 10;
      aristas.push({ desde: node.id, hasta: diag.id, costo: Math.floor(baseCost) });
    }
  });

  return { nodos, aristas };
}

export const MAPA_COMPLEJO = generarCyberCity();
