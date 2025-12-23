import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertiesPanel } from '../PropertiesPanel';

// Mock store state
const mockUpdatePosition = vi.fn();
const mockUpdateSize = vi.fn();
const mockUpdateProps = vi.fn();
const mockRemoveElement = vi.fn();
const mockDuplicateElement = vi.fn();
const mockBringToFront = vi.fn();
const mockSendToBack = vi.fn();

let mockStoreState = {
  selectedId: null as string | null,
  elements: [] as Array<{
    id: string;
    componentType: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    props: Record<string, unknown>;
    zIndex: number;
    locked: boolean;
  }>,
  updatePosition: mockUpdatePosition,
  updateSize: mockUpdateSize,
  updateProps: mockUpdateProps,
  removeElement: mockRemoveElement,
  duplicateElement: mockDuplicateElement,
  bringToFront: mockBringToFront,
  sendToBack: mockSendToBack,
};

vi.mock('../../../stores/canvas.store', () => ({
  useCanvasStore: () => mockStoreState,
}));

vi.mock('@/components/blocks/registry', () => ({
  getBlockDefinition: (type: string) => {
    if (type === 'Quiz') {
      return {
        displayName: 'Quiz',
        icon: '❓',
        category: 'EVALUACION',
      };
    }
    return undefined;
  },
}));

describe('PropertiesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      selectedId: null,
      elements: [],
      updatePosition: mockUpdatePosition,
      updateSize: mockUpdateSize,
      updateProps: mockUpdateProps,
      removeElement: mockRemoveElement,
      duplicateElement: mockDuplicateElement,
      bringToFront: mockBringToFront,
      sendToBack: mockSendToBack,
    };
  });

  it('should show empty message when no element is selected', () => {
    render(<PropertiesPanel />);

    expect(screen.getByText('Seleccioná un elemento')).toBeInTheDocument();
  });

  it('should show element info when an element is selected', () => {
    mockStoreState = {
      ...mockStoreState,
      selectedId: 'element-1',
      elements: [
        {
          id: 'element-1',
          componentType: 'Quiz',
          position: { x: 100, y: 200 },
          size: { width: 400, height: 300 },
          props: {},
          zIndex: 1,
          locked: false,
        },
      ],
    };

    render(<PropertiesPanel />);

    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('❓')).toBeInTheDocument();
  });

  it('should show position inputs with correct values', () => {
    mockStoreState = {
      ...mockStoreState,
      selectedId: 'element-1',
      elements: [
        {
          id: 'element-1',
          componentType: 'Quiz',
          position: { x: 150, y: 250 },
          size: { width: 400, height: 300 },
          props: {},
          zIndex: 1,
          locked: false,
        },
      ],
    };

    render(<PropertiesPanel />);

    const inputX = screen.getByTestId('input-x') as HTMLInputElement;
    const inputY = screen.getByTestId('input-y') as HTMLInputElement;

    expect(inputX.value).toBe('150');
    expect(inputY.value).toBe('250');
  });

  it('should update position when X input changes', async () => {
    mockStoreState = {
      ...mockStoreState,
      selectedId: 'element-1',
      elements: [
        {
          id: 'element-1',
          componentType: 'Quiz',
          position: { x: 100, y: 200 },
          size: { width: 400, height: 300 },
          props: {},
          zIndex: 1,
          locked: false,
        },
      ],
    };

    render(<PropertiesPanel />);

    const inputX = screen.getByTestId('input-x');
    fireEvent.change(inputX, { target: { value: '500' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockUpdatePosition).toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  it('should call duplicate when duplicate button is clicked', () => {
    mockStoreState = {
      ...mockStoreState,
      selectedId: 'element-1',
      elements: [
        {
          id: 'element-1',
          componentType: 'Quiz',
          position: { x: 100, y: 200 },
          size: { width: 400, height: 300 },
          props: {},
          zIndex: 1,
          locked: false,
        },
      ],
    };

    render(<PropertiesPanel />);

    const duplicateBtn = screen.getByTestId('btn-duplicate');
    fireEvent.click(duplicateBtn);

    expect(mockDuplicateElement).toHaveBeenCalledWith('element-1');
  });

  it('should show delete confirmation when delete is clicked', () => {
    mockStoreState = {
      ...mockStoreState,
      selectedId: 'element-1',
      elements: [
        {
          id: 'element-1',
          componentType: 'Quiz',
          position: { x: 100, y: 200 },
          size: { width: 400, height: 300 },
          props: {},
          zIndex: 1,
          locked: false,
        },
      ],
    };

    render(<PropertiesPanel />);

    const deleteBtn = screen.getByTestId('btn-delete');
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId('btn-confirm-delete')).toBeInTheDocument();
  });

  it('should remove element when delete is confirmed', () => {
    mockStoreState = {
      ...mockStoreState,
      selectedId: 'element-1',
      elements: [
        {
          id: 'element-1',
          componentType: 'Quiz',
          position: { x: 100, y: 200 },
          size: { width: 400, height: 300 },
          props: {},
          zIndex: 1,
          locked: false,
        },
      ],
    };

    render(<PropertiesPanel />);

    const deleteBtn = screen.getByTestId('btn-delete');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByTestId('btn-confirm-delete');
    fireEvent.click(confirmBtn);

    expect(mockRemoveElement).toHaveBeenCalledWith('element-1');
  });
});
