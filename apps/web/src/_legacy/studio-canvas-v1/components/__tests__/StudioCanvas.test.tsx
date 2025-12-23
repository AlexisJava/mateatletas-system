import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudioCanvas } from '../StudioCanvas';

// Mock react-rnd
vi.mock('react-rnd', () => ({
  Rnd: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="rnd-wrapper">{children}</div>
  ),
}));

// Mock the block registry
vi.mock('@/components/blocks/registry', () => ({
  getBlockDefinition: () => ({
    component: () => <div>Block Component</div>,
    category: 'INTERACTIVO',
    displayName: 'Test Block',
    icon: '🎯',
    defaultSize: { width: 200, height: 150 },
    defaultProps: {},
  }),
}));

// Mock store with initial state
const mockSelectElement = vi.fn();
const createMockStore = (elements: unknown[] = [], selectedId: string | null = null) => ({
  elements,
  selectedId,
  selectElement: mockSelectElement,
  zoom: 1,
  snapToGrid: true,
  gridSize: 20,
  updatePosition: vi.fn(),
  updateSize: vi.fn(),
  removeElement: vi.fn(),
  duplicateElement: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
});

let mockStoreState = createMockStore();

vi.mock('../../stores/canvas.store', () => ({
  useCanvasStore: () => mockStoreState,
}));

// Mock the keyboard hook
vi.mock('../../hooks/useCanvasKeyboard', () => ({
  useCanvasKeyboard: vi.fn(),
}));

describe('StudioCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = createMockStore();
  });

  it('should render empty state when no elements', () => {
    render(<StudioCanvas />);

    expect(screen.getByText('Canvas vacío')).toBeInTheDocument();
    expect(screen.getByText('Arrastra componentes desde el panel lateral')).toBeInTheDocument();
  });

  it('should render all elements from the store', () => {
    const elements = [
      {
        id: 'element-1',
        componentType: 'Quiz',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        props: {},
        zIndex: 1,
        locked: false,
      },
      {
        id: 'element-2',
        componentType: 'Slider',
        position: { x: 300, y: 200 },
        size: { width: 200, height: 100 },
        props: {},
        zIndex: 2,
        locked: false,
      },
    ];

    mockStoreState = createMockStore(elements);
    render(<StudioCanvas />);

    expect(screen.getByTestId('canvas-element-element-1')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-element-element-2')).toBeInTheDocument();
  });

  it('should deselect when clicking on empty canvas area', () => {
    mockStoreState = createMockStore([], 'some-selected-id');
    render(<StudioCanvas />);

    const canvas = screen.getByTestId('studio-canvas');
    fireEvent.click(canvas);

    expect(mockSelectElement).toHaveBeenCalledWith(null);
  });

  it('should show grid when snapToGrid is enabled', () => {
    mockStoreState = createMockStore();
    mockStoreState.snapToGrid = true;
    mockStoreState.gridSize = 20;

    render(<StudioCanvas />);

    const backgroundDiv = screen
      .getByTestId('studio-canvas')
      .querySelector('[data-canvas-background]');
    expect(backgroundDiv).toHaveStyle({ backgroundSize: '20px 20px' });
  });

  it('should not show grid when snapToGrid is disabled', () => {
    mockStoreState = createMockStore();
    mockStoreState.snapToGrid = false;

    render(<StudioCanvas />);

    const backgroundDiv = screen
      .getByTestId('studio-canvas')
      .querySelector('[data-canvas-background]');
    expect(backgroundDiv).toHaveStyle({ backgroundSize: 'auto' });
  });

  it('should apply zoom transform', () => {
    mockStoreState = createMockStore();
    mockStoreState.zoom = 0.75;

    render(<StudioCanvas />);

    const canvas = screen.getByTestId('studio-canvas');
    expect(canvas).toHaveStyle({ transform: 'scale(0.75)' });
  });
});
