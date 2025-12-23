/**
 * Tests para BloqueCard
 * TDD: Tests primero
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { BloqueCard } from '../BloqueCard';
import type { BloqueHoja } from '../../types/studio.types';

// Wrapper con DndContext
function renderWithDnd(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

const mockBloque: BloqueHoja = {
  id: 'test-123',
  componentType: 'Quiz',
  position: {
    colStart: 1,
    colSpan: 4,
    rowStart: 1,
    rowSpan: 2,
  },
  props: {},
};

describe('BloqueCard', () => {
  it('should_render_block_with_correct_testid', () => {
    const onSelect = vi.fn();
    renderWithDnd(<BloqueCard bloque={mockBloque} isSelected={false} onSelect={onSelect} />);

    expect(screen.getByTestId(`bento-block-${mockBloque.id}`)).toBeInTheDocument();
  });

  it('should_show_selected_state_when_isSelected_is_true', () => {
    const onSelect = vi.fn();
    renderWithDnd(<BloqueCard bloque={mockBloque} isSelected={true} onSelect={onSelect} />);

    const card = screen.getByTestId(`bento-block-${mockBloque.id}`);
    expect(card.className).toMatch(/ring-cyan/);
  });

  it('should_call_onSelect_when_clicked', () => {
    const onSelect = vi.fn();
    renderWithDnd(<BloqueCard bloque={mockBloque} isSelected={false} onSelect={onSelect} />);

    const card = screen.getByTestId(`bento-block-${mockBloque.id}`);
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should_display_block_icon_and_type', () => {
    const onSelect = vi.fn();
    renderWithDnd(<BloqueCard bloque={mockBloque} isSelected={false} onSelect={onSelect} />);

    // Quiz tiene el icono ❓ (aparece en header y body)
    const icons = screen.getAllByText('❓');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('should_apply_correct_grid_position_styles', () => {
    const onSelect = vi.fn();
    renderWithDnd(<BloqueCard bloque={mockBloque} isSelected={false} onSelect={onSelect} />);

    const card = screen.getByTestId(`bento-block-${mockBloque.id}`);
    const style = card.style;

    expect(style.gridColumn).toBe('1 / span 4');
    expect(style.gridRow).toBe('1 / span 2');
  });
});
