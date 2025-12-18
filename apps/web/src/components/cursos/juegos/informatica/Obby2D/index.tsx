/**
 * OBBY 2D - CREADOR DE NIVELES
 * ==============================
 *
 * Simulación de creador de niveles estilo Roblox Obby
 * Enseña lógica IF/THEN mediante reglas de bloques
 *
 * Conceptos:
 * - Las reglas que el programador define son ejecutadas por la computadora
 * - Lógica condicional (IF tocas lava THEN pierdes)
 * - Diseño de niveles y testing
 *
 * Grupos: B1 (6-7 años) y B2 (8-9 años)
 * Duración: 15-20 minutos
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Block, GameState, PlayerState, BlockType } from './types';
import {
  COLS,
  ROWS,
  CELL_SIZE,
  RULES,
  START_POS,
  END_POS,
  GRAVITY,
  FRICTION,
  MOVE_SPEED,
  MAX_SPEED,
  JUMP_FORCE,
  SUPER_JUMP_FORCE,
} from './constants';
import { GridCell } from './GridCell';
import { Player } from './Player';
import {
  Play,
  RotateCcw,
  Trash2,
  Info,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Eraser,
  X,
  Settings2,
} from 'lucide-react';

interface Obby2DProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

const createInitialGrid = (): Block[][] => {
  const grid: Block[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: Block[] = [];
    for (let x = 0; x < COLS; x++) {
      let type: BlockType = 'empty';
      if (y === ROWS - 1) type = 'floor';
      if (x === START_POS.x && y === START_POS.y) type = 'start';
      if (x === END_POS.x && y === END_POS.y) type = 'end';

      row.push({
        type,
        id: `block-${x}-${y}-${Date.now()}`,
      });
    }
    grid.push(row);
  }
  return grid;
};

const initialPlayerState: PlayerState = {
  x: START_POS.x * CELL_SIZE,
  y: START_POS.y * CELL_SIZE,
  vx: 0,
  vy: 0,
  isGrounded: false,
  isDead: false,
  facingRight: true,
  superJumpActive: false,
};

export default function Obby2D({ onCompleted, onExit }: Obby2DProps) {
  const [grid, setGrid] = useState<Block[][]>(createInitialGrid());
  const [gameState, setGameState] = useState<GameState>({
    mode: 'start',
    score: 0,
    lastRuleTriggered: null,
  });

  const [renderPlayer, setRenderPlayer] = useState<PlayerState>(initialPlayerState);
  const [selectedTool, setSelectedTool] = useState<BlockType>('floor');
  const [showRules, setShowRules] = useState(false);
  const [scale, setScale] = useState(1);

  const playerRef = useRef<PlayerState>({ ...initialPlayerState });
  const inputsRef = useRef({ left: false, right: false, jump: false });
  const requestRef = useRef<number>(0);
  const coinsCollectedRef = useRef<Set<string>>(new Set());

  // Scaling
  useEffect(() => {
    const handleResize = () => {
      const headerHeight = 60;
      const controlsHeight = gameState.mode === 'build' ? 140 : 180;
      const padding = 20;

      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - headerHeight - controlsHeight - padding;

      const gridWidth = COLS * CELL_SIZE;
      const gridHeight = ROWS * CELL_SIZE;

      const scaleX = availableWidth / gridWidth;
      const scaleY = availableHeight / gridHeight;

      setScale(Math.min(scaleX, scaleY, 1.8));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState.mode]);

  const paintBlock = useCallback(
    (x: number, y: number) => {
      if (gameState.mode !== 'build') return;

      setGrid((prev) => {
        if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return prev;

        const currentBlock = prev[y][x];

        if (currentBlock.type === selectedTool) return prev;
        if (currentBlock.type === 'start' || currentBlock.type === 'end') return prev;

        const newGrid = prev.map((row) => [...row]);
        newGrid[y][x] = {
          type: selectedTool,
          id: `block-${x}-${y}-${Date.now()}`,
        };
        return newGrid;
      });
    },
    [gameState.mode, selectedTool],
  );

  const clearGrid = () => {
    if (window.confirm('¿Borrar todo tu nivel y empezar de cero?')) {
      setGrid(createInitialGrid());
    }
  };

  const checkRectOverlap = (px: number, py: number, bx: number, by: number) => {
    const pMargin = 6;
    const pLeft = px + pMargin;
    const pRight = px + CELL_SIZE - pMargin;
    const pTop = py + pMargin;
    const pBottom = py + CELL_SIZE - pMargin;

    const bLeft = bx * CELL_SIZE;
    const bRight = (bx + 1) * CELL_SIZE;
    const bTop = by * CELL_SIZE;
    const bBottom = (by + 1) * CELL_SIZE;

    return pLeft < bRight && pRight > bLeft && pTop < bBottom && pBottom > bTop;
  };

  const checkSolidCollision = (newX: number, newY: number, blocks: Block[][]) => {
    const paddingX = 18;
    const paddingY = 2;

    const pLeft = newX + paddingX;
    const pRight = newX + CELL_SIZE - paddingX;
    const pTop = newY + paddingY;
    const pBottom = newY + CELL_SIZE;

    const startCol = Math.floor(pLeft / CELL_SIZE);
    const endCol = Math.floor(pRight / CELL_SIZE);
    const startRow = Math.floor(pTop / CELL_SIZE);
    const endRow = Math.floor(pBottom / CELL_SIZE);

    let collision = { solid: false, r: -1, c: -1 };

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
        const block = blocks[r][c];
        const isSolid = ['floor', 'jump'].includes(block.type);
        if (isSolid) {
          collision.solid = true;
          collision.r = r;
          collision.c = c;
          return collision;
        }
      }
    }
    return collision;
  };

  const updatePhysics = useCallback(() => {
    if (gameState.mode !== 'play') return;

    const p = playerRef.current;
    const inputs = inputsRef.current;

    if (p.isDead) return;

    if (inputs.left) {
      p.vx -= MOVE_SPEED;
      p.facingRight = false;
    }
    if (inputs.right) {
      p.vx += MOVE_SPEED;
      p.facingRight = true;
    }

    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;
    p.vx = Math.max(Math.min(p.vx, MAX_SPEED), -MAX_SPEED);

    let nextX = p.x + p.vx;

    if (nextX < 0) {
      nextX = 0;
      p.vx = 0;
    }
    if (nextX > COLS * CELL_SIZE - CELL_SIZE) {
      nextX = COLS * CELL_SIZE - CELL_SIZE;
      p.vx = 0;
    }

    const colX = checkSolidCollision(nextX, p.y, grid);
    if (colX.solid) {
      p.vx = 0;
    } else {
      p.x = nextX;
    }

    p.vy += GRAVITY;
    let nextY = p.y + p.vy;

    if (nextY > (ROWS + 2) * CELL_SIZE) {
      p.x = START_POS.x * CELL_SIZE;
      p.y = START_POS.y * CELL_SIZE;
      p.vy = 0;
      setRenderPlayer({ ...p });
      return;
    }

    const colY = checkSolidCollision(p.x, nextY, grid);
    p.isGrounded = false;

    if (colY.solid) {
      if (p.vy > 0) {
        p.isGrounded = true;
        p.vy = 0;
        p.y = colY.r * CELL_SIZE - CELL_SIZE;
      } else {
        p.vy = 0;
        p.y = (colY.r + 1) * CELL_SIZE;
      }
    } else {
      p.y = nextY;
    }

    if (inputs.jump && p.isGrounded) {
      p.vy = p.superJumpActive ? SUPER_JUMP_FORCE : JUMP_FORCE;
      p.isGrounded = false;
      p.superJumpActive = false;
    }

    const pGridX = Math.floor(p.x / CELL_SIZE);
    const pGridY = Math.floor(p.y / CELL_SIZE);

    for (let y = pGridY - 1; y <= pGridY + 1; y++) {
      for (let x = pGridX - 1; x <= pGridX + 1; x++) {
        if (y < 0 || y >= ROWS || x < 0 || x >= COLS) continue;

        const block = grid[y][x];
        if (!['lava', 'jump', 'coin', 'end'].includes(block.type)) continue;

        if (checkRectOverlap(p.x, p.y, x, y)) {
          if (block.type === 'lava') {
            p.isDead = true;
            setRenderPlayer({ ...p });
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                mode: 'gameover',
                lastRuleTriggered: 'LAVA = PERDÉS',
              }));
            }, 500);
            return;
          }

          if (block.type === 'jump') {
            if (!p.superJumpActive) p.superJumpActive = true;
          }

          if (block.type === 'coin') {
            if (!coinsCollectedRef.current.has(block.id)) {
              coinsCollectedRef.current.add(block.id);
              setGameState((prev) => ({
                ...prev,
                score: prev.score + 1,
                lastRuleTriggered: 'ESTRELLA = PUNTO',
              }));
              setGrid((oldGrid) => {
                const newG = oldGrid.map((r) => [...r]);
                newG[y][x] = { ...block, collected: true };
                return newG;
              });
            }
          }

          if (block.type === 'end') {
            confetti({ particleCount: 200, spread: 100 });
            setGameState((prev) => ({
              ...prev,
              mode: 'victory',
              lastRuleTriggered: 'META = GANASTE',
            }));
          }
        }
      }
    }

    setRenderPlayer({ ...p });
  }, [grid, gameState.mode]);

  useEffect(() => {
    const loop = () => {
      updatePhysics();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [updatePhysics]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) inputsRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) inputsRef.current.right = true;
      if (['ArrowUp', 'Space', 'KeyW'].includes(e.code)) inputsRef.current.jump = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) inputsRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) inputsRef.current.right = false;
      if (['ArrowUp', 'Space', 'KeyW'].includes(e.code)) inputsRef.current.jump = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    playerRef.current = {
      ...initialPlayerState,
      x: START_POS.x * CELL_SIZE,
      y: START_POS.y * CELL_SIZE,
    };
    inputsRef.current = { left: false, right: false, jump: false };
    coinsCollectedRef.current.clear();
    setGrid((prev) => prev.map((row) => row.map((b) => ({ ...b, collected: false }))));
    setGameState({ mode: 'play', score: 0, lastRuleTriggered: null });
  };

  const returnToBuild = () => {
    setGameState((prev) => ({ ...prev, mode: 'build', lastRuleTriggered: null }));
    setRenderPlayer({
      ...initialPlayerState,
      x: START_POS.x * CELL_SIZE,
      y: START_POS.y * CELL_SIZE,
    });
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      setGameState({ mode: 'start', score: 0, lastRuleTriggered: null });
    }
  };

  const handleVictoryExit = () => {
    confetti({ particleCount: 150, spread: 80 });
    if (onCompleted) {
      setTimeout(() => onCompleted(), 1500);
    } else {
      returnToBuild();
    }
  };

  const isBuilding = gameState.mode === 'build';
  const tools: BlockType[] = ['floor', 'lava', 'jump', 'coin', 'empty'];

  return (
    <div
      className="max-h-[85vh] h-full w-full bg-slate-900 flex flex-col overflow-hidden touch-none font-sans rounded-lg shadow-2xl mx-auto my-4"
      style={{ maxWidth: '1200px' }}
    >
      {/* TOP BAR */}
      <div className="bg-indigo-950 text-white h-14 px-4 flex justify-between items-center shrink-0 border-b-2 border-indigo-900 z-20 relative shadow-lg">
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-inner ${isBuilding ? 'bg-yellow-400 text-yellow-900' : 'bg-green-500 text-white'}`}
          >
            {isBuilding ? 'Constructor' : 'Jugando'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-lg border border-white/10">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="font-mono text-xl leading-none font-bold">{gameState.score}</span>
          </div>
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-500 text-white transition-colors"
          >
            <Info size={18} />
          </button>
          {onExit && (
            <button
              onClick={handleExit}
              className="w-8 h-8 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-900">
        <div
          style={{
            transform: `scale(${scale})`,
            width: COLS * CELL_SIZE,
            height: ROWS * CELL_SIZE,
          }}
          className="relative shadow-2xl transition-transform duration-300 ease-out origin-center"
        >
          <div
            className="absolute inset-0 opacity-5 rounded-xl"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          ></div>

          <div
            className="grid absolute inset-0 bg-slate-800/50 border-2 border-slate-700 rounded-xl overflow-hidden backdrop-blur-sm"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
            }}
            onTouchMove={(e) => {
              if (!isBuilding) return;
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.floor((touch.clientX - rect.left) / (CELL_SIZE * scale));
              const y = Math.floor((touch.clientY - rect.top) / (CELL_SIZE * scale));
              paintBlock(x, y);
            }}
          >
            {grid.map((row, y) =>
              row.map((block, x) => (
                <GridCell
                  key={block.id}
                  block={block}
                  x={x}
                  y={y}
                  isBuilder={isBuilding}
                  isSelected={isBuilding && selectedTool === block.type}
                  onClick={() => paintBlock(x, y)}
                  onDragEnter={() => paintBlock(x, y)}
                />
              )),
            )}
            <Player state={renderPlayer} />
          </div>
        </div>

        {/* START SCREEN */}
        {gameState.mode === 'start' && (
          <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-8">
            <div className="mb-8 animate-bounce text-8xl">🎮</div>
            <h1 className="text-5xl font-black mb-2 tracking-tighter text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              OBBY MAKER
            </h1>
            <p className="text-slate-400 mb-12 text-xl text-center">
              Crea tu nivel. Juega tu nivel.
            </p>
            <button
              onClick={() => setGameState((prev) => ({ ...prev, mode: 'build' }))}
              className="bg-yellow-400 text-yellow-900 px-12 py-6 rounded-full text-2xl font-black shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:scale-105 transition-transform"
            >
              ¡EMPEZAR!
            </button>
          </div>
        )}

        {/* GAME OVER */}
        {gameState.mode === 'gameover' && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center backdrop-blur-sm p-4">
            <div className="text-7xl mb-6">💀</div>
            <h2 className="text-4xl font-black text-red-500 mb-2">¡Perdiste!</h2>
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-3 rounded-xl mb-10 font-mono text-lg">
              Regla: {gameState.lastRuleTriggered}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-8">
              <button
                onClick={startGame}
                className="flex-1 bg-white text-slate-900 px-6 py-4 rounded-xl font-bold hover:scale-105 transition flex justify-center items-center gap-2"
              >
                <RotateCcw size={20} /> Reintentar
              </button>
              <button
                onClick={returnToBuild}
                className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2"
              >
                <Settings2 size={20} /> Editar
              </button>
            </div>
          </div>
        )}

        {/* VICTORY */}
        {gameState.mode === 'victory' && (
          <div className="absolute inset-0 z-50 bg-green-600/95 flex flex-col items-center justify-center backdrop-blur-sm p-4">
            <div className="text-7xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-5xl font-black text-white mb-2 text-center">¡GANASTE!</h2>
            <p className="text-green-100 mb-8 text-xl text-center">¡La compu siguió tus reglas!</p>
            <div className="bg-white/20 px-8 py-4 rounded-3xl mb-10 backdrop-blur-md border border-white/30">
              <span className="text-yellow-300 text-3xl mr-3">⭐</span>
              <span className="text-4xl font-black text-white">{gameState.score}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-8">
              <button
                onClick={startGame}
                className="flex-1 bg-white text-green-900 px-6 py-4 rounded-xl font-bold hover:scale-105 transition"
              >
                Jugar Otra Vez
              </button>
              <button
                onClick={handleVictoryExit}
                className="flex-1 bg-yellow-400 text-yellow-900 px-6 py-4 rounded-xl font-bold shadow-lg"
              >
                {onCompleted ? 'Continuar →' : 'Crear Nuevo'}
              </button>
            </div>
          </div>
        )}

        {/* RULES POPUP */}
        {showRules && (
          <div
            className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowRules(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-indigo-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">📚 Reglas del Juego</h3>
                <button
                  onClick={() => setShowRules(false)}
                  className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {Object.values(RULES)
                  .filter((r) => r.type !== 'empty')
                  .map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                        {r.icon}
                      </div>
                      <div>
                        <span className="font-black text-slate-800 block text-lg">{r.name}</span>
                        <span className="text-indigo-600 font-bold text-sm">{r.rule}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS AREA */}
      <div className="bg-slate-950 shrink-0 border-t border-white/5 z-30 pb-safe">
        {isBuilding ? (
          <div className="h-auto min-h-[140px] py-4 flex flex-col sm:flex-row items-center justify-between px-4 gap-4">
            <div className="flex-1 w-full overflow-x-auto flex gap-3 items-center pb-2 sm:pb-0 no-scrollbar">
              {tools.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTool(t)}
                  className={`
                    w-20 h-20 shrink-0 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-b-4 active:border-b-0 active:translate-y-1 active:shadow-none
                    ${
                      selectedTool === t
                        ? 'bg-indigo-600 border-indigo-800 text-white shadow-xl scale-105 z-10'
                        : 'bg-slate-800 border-slate-900 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }
                  `}
                >
                  <div className="text-3xl mb-1 filter drop-shadow-md">
                    {t === 'empty' ? <Eraser size={28} /> : RULES[t].icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                    {t === 'empty' ? 'Borrar' : RULES[t].name}
                  </span>
                </button>
              ))}

              <div className="w-px h-12 bg-white/10 mx-2"></div>

              <button
                onClick={clearGrid}
                className="w-20 h-20 shrink-0 rounded-2xl bg-red-900/20 border-b-4 border-red-900/50 text-red-400 hover:bg-red-900/40 flex flex-col items-center justify-center gap-1 active:border-b-0 active:translate-y-1 transition-all"
              >
                <Trash2 size={26} />
                <span className="text-[10px] font-black uppercase tracking-widest">Todo</span>
              </button>
            </div>

            <button
              onClick={startGame}
              className="w-full sm:w-auto px-10 h-20 bg-green-500 text-white rounded-2xl text-2xl font-black border-b-4 border-green-700 shadow-xl active:border-b-0 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 whitespace-nowrap hover:bg-green-400"
            >
              <Play fill="currentColor" size={32} />
              <span>JUGAR</span>
            </button>
          </div>
        ) : (
          <div className="h-44 relative flex justify-between items-center px-4 sm:px-12 select-none">
            <div className="flex gap-3 items-end h-full py-6">
              <button
                className="w-24 h-24 bg-slate-800 rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center group touch-manipulation shadow-2xl active:shadow-none"
                onPointerDown={(e) => {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                  inputsRef.current.left = true;
                }}
                onPointerUp={() => (inputsRef.current.left = false)}
                onPointerLeave={() => (inputsRef.current.left = false)}
              >
                <ArrowLeft size={48} className="text-slate-400 group-active:text-white" />
              </button>
              <button
                className="w-24 h-24 bg-slate-800 rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center group touch-manipulation shadow-2xl active:shadow-none"
                onPointerDown={(e) => {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                  inputsRef.current.right = true;
                }}
                onPointerUp={() => (inputsRef.current.right = false)}
                onPointerLeave={() => (inputsRef.current.right = false)}
              >
                <ArrowRight size={48} className="text-slate-400 group-active:text-white" />
              </button>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20">
              <button
                onClick={returnToBuild}
                className="bg-slate-800 text-indigo-400 text-xs font-bold flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-700 active:scale-95 transition-transform"
              >
                <Settings2 size={24} />
                EDITAR
              </button>
            </div>

            <div className="h-full py-6 flex items-end">
              <button
                className="w-32 h-32 bg-red-500 rounded-full border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center touch-manipulation shadow-2xl active:shadow-none hover:bg-red-400"
                onPointerDown={(e) => {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                  inputsRef.current.jump = true;
                }}
                onPointerUp={() => (inputsRef.current.jump = false)}
                onPointerLeave={() => (inputsRef.current.jump = false)}
              >
                <div className="flex flex-col items-center gap-1">
                  <ArrowUp size={56} strokeWidth={4} className="text-red-900" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
