export type Phase = 'intro' | 'explanation' | 'map' | 'game' | 'distance' | 'final';

export interface Server {
  id: string;
  nombre: string;
  emoji: string;
  ping: number;
  x: number; // Percentage 0-100 relative to map width
  y: number; // Percentage 0-100 relative to map height
  descripcion: string;
}

export interface UserLocation {
  x: number;
  y: number;
  emoji: string;
}

export interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
}

export interface TargetCircle {
  id: string;
  x: number; // %
  y: number; // %
  status: 'active' | 'hit-waiting' | 'hit-confirmed';
}
