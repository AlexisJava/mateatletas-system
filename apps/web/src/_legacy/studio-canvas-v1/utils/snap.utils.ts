export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const snapPosition = (
  position: { x: number; y: number },
  gridSize: number,
): { x: number; y: number } => ({
  x: snapToGrid(position.x, gridSize),
  y: snapToGrid(position.y, gridSize),
});
