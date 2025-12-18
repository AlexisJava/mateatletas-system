import { RuleDef } from './types';

export const COLS = 10;
export const ROWS = 7;
export const CELL_SIZE = 64;

export const GRAVITY = 0.5;
export const FRICTION = 0.85;
export const MOVE_SPEED = 1.2;
export const MAX_SPEED = 6;
export const JUMP_FORCE = -10.5;
export const SUPER_JUMP_FORCE = -16;

export const START_POS = { x: 1, y: 5 };
export const END_POS = { x: 8, y: 2 };

export const RULES: Record<string, RuleDef> = {
  floor: {
    type: 'floor',
    color: 'bg-stone-400 border-b-4 border-stone-600',
    icon: '',
    name: 'Piso',
    rule: 'SI tocas → Caminas',
    description: 'Bloque sólido normal.',
  },
  lava: {
    type: 'lava',
    color: 'bg-red-500 border-b-4 border-red-700 animate-pulse',
    icon: '🔥',
    name: 'Lava',
    rule: 'SI tocas → Perdés',
    description: '¡Cuidado! Quema.',
  },
  jump: {
    type: 'jump',
    color: 'bg-lime-400 border-b-4 border-lime-600',
    icon: '🦘',
    name: 'Trampolín',
    rule: 'SI tocas → Saltás Alto',
    description: '¡Doble salto automático!',
  },
  coin: {
    type: 'coin',
    color: 'bg-transparent',
    icon: '⭐',
    name: 'Estrella',
    rule: 'SI tocas → +1 Punto',
    description: '¡Juntalos todos!',
  },
  start: {
    type: 'start',
    color: 'bg-sky-300 border-b-4 border-sky-500 opacity-90',
    icon: '🏁',
    name: 'Inicio',
    rule: 'Punto de partida',
    description: 'Aquí comienza el jugador.',
  },
  end: {
    type: 'end',
    color: 'bg-purple-500 border-b-4 border-purple-700',
    icon: '🏰',
    name: 'Meta',
    rule: 'SI llegas → ¡Ganaste!',
    description: 'El objetivo final.',
  },
  empty: {
    type: 'empty',
    color: 'bg-transparent',
    icon: '',
    name: 'Borrar',
    rule: '',
    description: '',
  },
};
