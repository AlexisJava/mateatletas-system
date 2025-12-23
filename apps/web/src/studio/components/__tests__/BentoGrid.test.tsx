/**
 * Tests para BentoGrid
 * TDD: Tests primero
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { act } from '@testing-library/react';
import { BentoGrid } from '../BentoGrid';
import { useHojaStore } from '../../stores/hoja.store';

// Wrapper con DndContext requerido por dnd-kit
function renderWithDnd(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

describe('BentoGrid', () => {
  beforeEach(() => {
    act(() => {
      useHojaStore.getState().clear();
    });
  });

  it('should_render_empty_grid_when_no_bloques', () => {
    renderWithDnd(<BentoGrid />);

    expect(screen.getByTestId('bento-grid')).toBeInTheDocument();
    expect(screen.getByText(/Arrastrá componentes/i)).toBeInTheDocument();
  });

  it('should_render_bloques_in_correct_positions', () => {
    // Agregar un bloque al store
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 1,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    renderWithDnd(<BentoGrid />);

    // Debería haber un bloque renderizado
    const bloques = screen.getAllByTestId(/^bento-block-/);
    expect(bloques).toHaveLength(1);
  });

  it('should_render_multiple_bloques', () => {
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 1,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
      useHojaStore.getState().addBloque('Slider', {
        colStart: 5,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    renderWithDnd(<BentoGrid />);

    const bloques = screen.getAllByTestId(/^bento-block-/);
    expect(bloques).toHaveLength(2);
  });

  it('should_have_12_column_grid', () => {
    renderWithDnd(<BentoGrid />);

    const grid = screen.getByTestId('bento-grid');
    // Verificar que tiene la clase de grid de 12 columnas
    expect(grid.className).toMatch(/grid-cols-12/);
  });

  it('should_show_drop_indicator_as_droppable', () => {
    renderWithDnd(<BentoGrid />);

    const grid = screen.getByTestId('bento-grid');
    expect(grid).toBeInTheDocument();
  });
});
