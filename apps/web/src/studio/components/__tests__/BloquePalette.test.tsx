/**
 * Tests para BloquePalette
 * TDD: Tests primero
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { BloquePalette } from '../BloquePalette';
import { blockRegistry } from '@/components/blocks/registry';

// Wrapper con DndContext requerido por dnd-kit
function renderWithDnd(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

describe('BloquePalette', () => {
  it('should_render_all_blocks_from_registry', () => {
    renderWithDnd(<BloquePalette />);

    // Verificar que se renderizan todos los bloques del registry
    const blockTypes = Object.keys(blockRegistry);
    expect(blockTypes.length).toBeGreaterThan(0);

    // Cada bloque debería tener su icono visible
    blockTypes.forEach((type) => {
      const blockDef = blockRegistry[type];
      if (blockDef) {
        // Verificar que el nombre del bloque está presente
        expect(screen.getByText(blockDef.displayName)).toBeInTheDocument();
      }
    });
  });

  it('should_render_block_icons', () => {
    renderWithDnd(<BloquePalette />);

    // Verificar que al menos un icono está presente
    const blockTypes = Object.keys(blockRegistry);
    const firstBlock = blockRegistry[blockTypes[0]];
    if (firstBlock?.icon) {
      expect(screen.getByText(firstBlock.icon)).toBeInTheDocument();
    }
  });

  it('should_have_draggable_blocks', () => {
    renderWithDnd(<BloquePalette />);

    // Verificar que los elementos tienen data-testid para drag
    const blockTypes = Object.keys(blockRegistry);
    blockTypes.forEach((type) => {
      const element = screen.getByTestId(`palette-block-${type}`);
      expect(element).toBeInTheDocument();
    });
  });

  it('should_group_blocks_by_category', () => {
    renderWithDnd(<BloquePalette />);

    // Verificar que hay headers de categoría
    expect(screen.getByText(/Interactivo/i)).toBeInTheDocument();
  });
});
