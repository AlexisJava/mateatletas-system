import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentPanel } from '../ComponentPanel';

// Mock the canvas store
const mockAddElement = vi.fn();

vi.mock('../../../stores/canvas.store', () => ({
  useCanvasStore: () => ({
    addElement: mockAddElement,
  }),
}));

// Mock the block registry
vi.mock('@/components/blocks/registry', () => ({
  blockRegistry: {
    Quiz: {
      component: () => null,
      category: 'EVALUACION',
      displayName: 'Quiz',
      icon: '❓',
      defaultSize: { width: 400, height: 300 },
      defaultProps: {},
    },
    Slider: {
      component: () => null,
      category: 'INTERACTIVO',
      displayName: 'Deslizador',
      icon: '🎚️',
      defaultSize: { width: 400, height: 100 },
      defaultProps: {},
    },
    AudioPlayer: {
      component: () => null,
      category: 'MULTIMEDIA',
      displayName: 'Reproductor de Audio',
      icon: '🔊',
      defaultSize: { width: 400, height: 120 },
      defaultProps: {},
    },
  },
  getBlocksByCategory: () => ({
    INTERACTIVO: [{ displayName: 'Deslizador', icon: '🎚️', category: 'INTERACTIVO' }],
    MOTRICIDAD_FINA: [],
    SIMULADOR: [],
    EDITOR_CODIGO: [],
    CREATIVO: [],
    MULTIMEDIA: [{ displayName: 'Reproductor de Audio', icon: '🔊', category: 'MULTIMEDIA' }],
    EVALUACION: [{ displayName: 'Quiz', icon: '❓', category: 'EVALUACION' }],
    MULTIPLAYER: [],
  }),
  getBlockDefinition: (type: string) => {
    const blocks: Record<string, unknown> = {
      Quiz: {
        component: () => null,
        category: 'EVALUACION',
        displayName: 'Quiz',
        icon: '❓',
        defaultSize: { width: 400, height: 300 },
        defaultProps: {},
      },
      Slider: {
        component: () => null,
        category: 'INTERACTIVO',
        displayName: 'Deslizador',
        icon: '🎚️',
        defaultSize: { width: 400, height: 100 },
        defaultProps: {},
      },
    };
    return blocks[type];
  },
}));

describe('ComponentPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render component panel with categories', () => {
    render(<ComponentPanel />);

    expect(screen.getByTestId('component-panel')).toBeInTheDocument();
    expect(screen.getByText('Componentes')).toBeInTheDocument();
  });

  it('should render categories with blocks', () => {
    render(<ComponentPanel />);

    // Check for categories that have blocks
    expect(screen.getByTestId('category-INTERACTIVO')).toBeInTheDocument();
    expect(screen.getByTestId('category-EVALUACION')).toBeInTheDocument();
    expect(screen.getByTestId('category-MULTIMEDIA')).toBeInTheDocument();
  });

  it('should filter blocks when searching', () => {
    render(<ComponentPanel />);

    const searchInput = screen.getByTestId('component-search');
    fireEvent.change(searchInput, { target: { value: 'Quiz' } });

    // Quiz should still be visible
    expect(screen.getByTestId('block-Quiz')).toBeInTheDocument();
  });

  it('should call addElement when clicking a block', () => {
    render(<ComponentPanel />);

    const quizBlock = screen.getByTestId('block-Quiz');
    fireEvent.click(quizBlock);

    expect(mockAddElement).toHaveBeenCalledWith('Quiz', { x: 400, y: 300 });
  });

  it('should show empty state when search has no results', () => {
    render(<ComponentPanel />);

    const searchInput = screen.getByTestId('component-search');
    fireEvent.change(searchInput, { target: { value: 'NonExistentComponent' } });

    expect(screen.getByText('No se encontraron componentes')).toBeInTheDocument();
  });

  it('should toggle category expansion', () => {
    render(<ComponentPanel />);

    // INTERACTIVO should be expanded by default
    expect(screen.getByTestId('block-Slider')).toBeInTheDocument();

    // Click to collapse
    const categoryButton = screen.getByText('Interactivos');
    fireEvent.click(categoryButton);

    // Slider should not be visible now
    expect(screen.queryByTestId('block-Slider')).not.toBeInTheDocument();
  });
});
