import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../Toolbar';

// Mock store state
const mockSetZoom = vi.fn();
const mockToggleSnapToGrid = vi.fn();
const mockSetGridSize = vi.fn();
const mockSetTheme = vi.fn();
const mockUndo = vi.fn();
const mockRedo = vi.fn();
const mockExportToJson = vi.fn(() => '{}');

let mockStoreState = {
  zoom: 1,
  setZoom: mockSetZoom,
  snapToGrid: true,
  toggleSnapToGrid: mockToggleSnapToGrid,
  gridSize: 20,
  setGridSize: mockSetGridSize,
  themeId: 'terminal',
  setTheme: mockSetTheme,
  history: [] as unknown[],
  historyIndex: -1,
  undo: mockUndo,
  redo: mockRedo,
  exportToJson: mockExportToJson,
};

vi.mock('../../stores/canvas.store', () => ({
  useCanvasStore: () => mockStoreState,
}));

vi.mock('@/design-system/themes', () => ({
  allThemeList: [
    { id: 'terminal', name: 'Terminal', emoji: '💻', area: 'programming' },
    { id: 'blueprint', name: 'Blueprint', emoji: '📐', area: 'math' },
    { id: 'lab', name: 'Lab', emoji: '🧪', area: 'science' },
  ],
}));

describe('Toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      zoom: 1,
      setZoom: mockSetZoom,
      snapToGrid: true,
      toggleSnapToGrid: mockToggleSnapToGrid,
      gridSize: 20,
      setGridSize: mockSetGridSize,
      themeId: 'terminal',
      setTheme: mockSetTheme,
      history: [],
      historyIndex: -1,
      undo: mockUndo,
      redo: mockRedo,
      exportToJson: mockExportToJson,
    };
  });

  it('should render toolbar', () => {
    render(<Toolbar />);

    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('should show correct zoom level', () => {
    mockStoreState.zoom = 0.75;
    render(<Toolbar />);

    expect(screen.getByTestId('zoom-level')).toHaveTextContent('75%');
  });

  it('should zoom in when zoom in button is clicked', () => {
    mockStoreState.zoom = 1;
    render(<Toolbar />);

    const zoomInBtn = screen.getByTestId('btn-zoom-in');
    fireEvent.click(zoomInBtn);

    expect(mockSetZoom).toHaveBeenCalledWith(1.25);
  });

  it('should zoom out when zoom out button is clicked', () => {
    mockStoreState.zoom = 1;
    render(<Toolbar />);

    const zoomOutBtn = screen.getByTestId('btn-zoom-out');
    fireEvent.click(zoomOutBtn);

    expect(mockSetZoom).toHaveBeenCalledWith(0.75);
  });

  it('should disable undo when no history', () => {
    mockStoreState.history = [];
    mockStoreState.historyIndex = -1;
    render(<Toolbar />);

    const undoBtn = screen.getByTestId('btn-undo');
    expect(undoBtn).toBeDisabled();
  });

  it('should enable undo when there is history', () => {
    mockStoreState.history = [[], []];
    mockStoreState.historyIndex = 1;
    render(<Toolbar />);

    const undoBtn = screen.getByTestId('btn-undo');
    expect(undoBtn).not.toBeDisabled();
  });

  it('should disable redo when at end of history', () => {
    mockStoreState.history = [[]];
    mockStoreState.historyIndex = 0;
    render(<Toolbar />);

    const redoBtn = screen.getByTestId('btn-redo');
    expect(redoBtn).toBeDisabled();
  });

  it('should enable redo when not at end of history', () => {
    mockStoreState.history = [[], [], []];
    mockStoreState.historyIndex = 1;
    render(<Toolbar />);

    const redoBtn = screen.getByTestId('btn-redo');
    expect(redoBtn).not.toBeDisabled();
  });

  it('should toggle snap to grid when snap button is clicked', () => {
    render(<Toolbar />);

    const snapBtn = screen.getByTestId('btn-snap');
    fireEvent.click(snapBtn);

    expect(mockToggleSnapToGrid).toHaveBeenCalled();
  });

  it('should show snap button as active when snapToGrid is true', () => {
    mockStoreState.snapToGrid = true;
    render(<Toolbar />);

    const snapBtn = screen.getByTestId('btn-snap');
    expect(snapBtn.className).toContain('bg-cyan-100');
  });

  it('should open theme dropdown when theme selector is clicked', () => {
    render(<Toolbar />);

    const themeSelector = screen.getByTestId('theme-selector');
    fireEvent.click(themeSelector);

    expect(screen.getByTestId('theme-dropdown')).toBeInTheDocument();
  });

  it('should change theme when a theme is selected', () => {
    render(<Toolbar />);

    const themeSelector = screen.getByTestId('theme-selector');
    fireEvent.click(themeSelector);

    const blueprintOption = screen.getByText('Blueprint');
    fireEvent.click(blueprintOption);

    expect(mockSetTheme).toHaveBeenCalledWith('blueprint');
  });

  it('should show grid size selector when snap is enabled', () => {
    mockStoreState.snapToGrid = true;
    render(<Toolbar />);

    expect(screen.getByTestId('grid-size')).toBeInTheDocument();
  });

  it('should hide grid size selector when snap is disabled', () => {
    mockStoreState.snapToGrid = false;
    render(<Toolbar />);

    expect(screen.queryByTestId('grid-size')).not.toBeInTheDocument();
  });

  it('should have save and preview buttons', () => {
    render(<Toolbar />);

    expect(screen.getByTestId('btn-save')).toBeInTheDocument();
    expect(screen.getByTestId('btn-preview')).toBeInTheDocument();
  });
});
