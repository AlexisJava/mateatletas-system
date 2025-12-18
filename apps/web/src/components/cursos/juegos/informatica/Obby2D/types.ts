export type BlockType = 'empty' | 'floor' | 'lava' | 'jump' | 'coin' | 'start' | 'end';

export interface Block {
  type: BlockType;
  id: string;
  collected?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isDead: boolean;
  facingRight: boolean;
  superJumpActive: boolean;
}

export interface GameState {
  mode: 'start' | 'build' | 'play' | 'gameover' | 'victory';
  score: number;
  lastRuleTriggered: string | null;
}

export interface RuleDef {
  type: BlockType;
  color: string;
  icon: string;
  name: string;
  rule: string;
  description: string;
}
