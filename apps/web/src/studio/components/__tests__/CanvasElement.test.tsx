import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasElement } from '../CanvasElement';
import type { CanvasElement as CanvasElementType } from '../../types/canvas.types';

// Mock react-rnd
vi.mock('react-rnd', () => ({
  Rnd: ({
    children,
    style,
    disableDragging,
    enableResizing,
  }: {
    children: React.ReactNode;
    style: React.CSSProperties;
    disableDragging: boolean;
    enableResizing: boolean;
  }) => (
    <div
      data-testid="rnd-wrapper"
      data-disable-dragging={disableDragging}
      data-enable-resizing={enableResizing}
      style={style}
    >
      {children}
    </div>
  ),
}));

// Mock the canvas store
const mockUpdatePosition = vi.fn();
const mockUpdateSize = vi.fn();

vi.mock('../../stores/canvas.store', () => ({
  useCanvasStore: () => ({
    updatePosition: mockUpdatePosition,
    updateSize: mockUpdateSize,
  }),
}));

// Mock the block registry
vi.mock('@/components/blocks/registry', () => ({
  getBlockDefinition: (type: string) => {
    if (type === 'Quiz') {
      return {
        component: () => <div data-testid="quiz-component">Quiz Component</div>,
        category: 'EVALUACION',
        displayName: 'Quiz',
        icon: '❓',
        defaultSize: { width: 400, height: 300 },
        defaultProps: {},
      };
    }
    return undefined;
  },
}));

describe('CanvasElement', () => {
  const mockElement: CanvasElementType = {
    id: 'test-element-1',
    componentType: 'Quiz',
    position: { x: 100, y: 200 },
    size: { width: 400, height: 300 },
    props: {},
    zIndex: 1,
    locked: false,
  };

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the correct component based on componentType', () => {
    render(<CanvasElement element={mockElement} isSelected={false} onSelect={mockOnSelect} />);

    expect(screen.getByTestId('quiz-component')).toBeInTheDocument();
  });

  it('should show selection ring when isSelected is true', () => {
    render(<CanvasElement element={mockElement} isSelected={true} onSelect={mockOnSelect} />);

    const elementDiv = screen.getByTestId(`canvas-element-${mockElement.id}`);
    expect(elementDiv.className).toContain('ring-cyan-500');
  });

  it('should not show selection ring when isSelected is false', () => {
    render(<CanvasElement element={mockElement} isSelected={false} onSelect={mockOnSelect} />);

    const elementDiv = screen.getByTestId(`canvas-element-${mockElement.id}`);
    expect(elementDiv.className).not.toContain('ring-cyan-500');
    expect(elementDiv.className).toContain('ring-gray-300');
  });

  it('should disable dragging when element is locked', () => {
    const lockedElement = { ...mockElement, locked: true };
    render(<CanvasElement element={lockedElement} isSelected={false} onSelect={mockOnSelect} />);

    const rndWrapper = screen.getByTestId('rnd-wrapper');
    expect(rndWrapper.dataset.disableDragging).toBe('true');
  });

  it('should enable dragging when element is not locked', () => {
    render(<CanvasElement element={mockElement} isSelected={false} onSelect={mockOnSelect} />);

    const rndWrapper = screen.getByTestId('rnd-wrapper');
    expect(rndWrapper.dataset.disableDragging).toBe('false');
  });

  it('should call onSelect when clicked', () => {
    render(<CanvasElement element={mockElement} isSelected={false} onSelect={mockOnSelect} />);

    const elementDiv = screen.getByTestId(`canvas-element-${mockElement.id}`);
    fireEvent.click(elementDiv);

    expect(mockOnSelect).toHaveBeenCalledWith(mockElement.id);
  });

  it('should show lock indicator when element is locked', () => {
    const lockedElement = { ...mockElement, locked: true };
    render(<CanvasElement element={lockedElement} isSelected={false} onSelect={mockOnSelect} />);

    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('should show fallback when component type is not found', () => {
    const unknownElement = { ...mockElement, componentType: 'UnknownComponent' };
    render(<CanvasElement element={unknownElement} isSelected={false} onSelect={mockOnSelect} />);

    expect(screen.getByText('UnknownComponent')).toBeInTheDocument();
  });
});
