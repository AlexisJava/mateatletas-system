import React from 'react';
import { PlayerState } from './types';
import { CELL_SIZE } from './constants';

interface PlayerProps {
  state: PlayerState;
}

export const Player: React.FC<PlayerProps> = ({ state }) => {
  const tilt = state.vx * 3;
  const scaleX = state.facingRight ? 1 : -1;
  const jumpScale = !state.isGrounded ? 'scale-110' : 'scale-100';
  const deathClass = state.isDead ? 'rotate-180 scale-0 opacity-0' : 'scale-100 opacity-100';

  return (
    <div
      className={`absolute z-30 will-change-transform transition-all duration-500 ease-in-out ${state.isDead ? 'duration-500' : 'duration-75'}`}
      style={{
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        transform: `translate(${state.x}px, ${state.y}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        className={`w-full h-full flex items-center justify-center text-4xl drop-shadow-2xl filter ${jumpScale} ${deathClass}`}
        style={{
          transformOrigin: 'center',
          transform: state.isDead
            ? 'rotate(720deg) scale(0)'
            : `scaleX(${scaleX}) rotate(${tilt}deg)`,
          transition: state.isDead ? 'all 0.5s' : 'transform 0.1s ease-out',
        }}
      >
        {state.superJumpActive ? '🦸' : '😎'}
      </div>

      {state.isGrounded && !state.isDead && (
        <div className="absolute bottom-1 left-1/4 w-1/2 h-2 bg-black/20 rounded-full blur-sm" />
      )}
    </div>
  );
};
