import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScaleBalance } from '../ScaleBalance';
import type { ScaleBalanceConfig } from '../types';

const mockConfig: ScaleBalanceConfig = {
  instruccion: 'Equilibra la balanza',
  ladoIzquierdo: {
    items: [
      { id: 'i1', etiqueta: '5kg', peso: 5 },
      { id: 'i2', etiqueta: '3kg', peso: 3 },
    ],
  },
  ladoDerecho: {
    items: [{ id: 'd1', etiqueta: '4kg', peso: 4 }],
  },
  itemsDisponibles: [
    { id: 'a1', etiqueta: '2kg', peso: 2 },
    { id: 'a2', etiqueta: '1kg', peso: 1 },
    { id: 'a3', etiqueta: '3kg', peso: 3 },
  ],
  feedback: {
    correcto: '¡La balanza está equilibrada!',
    incorrecto: 'La balanza no está equilibrada.',
  },
};

const defaultProps = {
  id: 'test-balance',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('ScaleBalance', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.getByTestId('scale-balance-test-balance')).toBeInTheDocument();
    });

    it('should_render_left_side_items', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.getByTestId('left-item-i1')).toHaveTextContent('5kg');
      expect(screen.getByTestId('left-item-i2')).toHaveTextContent('3kg');
    });

    it('should_render_right_side_items', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.getByText('4kg')).toBeInTheDocument();
    });

    it('should_render_available_items', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.getByText('2kg')).toBeInTheDocument();
      expect(screen.getByText('1kg')).toBeInTheDocument();
    });

    it('should_render_balance_visual', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.getByTestId('balance-beam')).toBeInTheDocument();
      expect(screen.getByTestId('balance-left-pan')).toBeInTheDocument();
      expect(screen.getByTestId('balance-right-pan')).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<ScaleBalance {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_config_summary_in_editor_mode', () => {
      render(<ScaleBalance {...defaultProps} modo="editor" />);
      expect(screen.getByText(/Izquierdo:/)).toBeInTheDocument();
      expect(screen.getByText(/Derecho:/)).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<ScaleBalance {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.getByTestId('balance-beam')).toBeInTheDocument();
    });
  });

  describe('Estado de la balanza', () => {
    it('should_show_left_heavier_when_left_side_is_heavier', () => {
      // Left: 5+3=8, Right: 4
      render(<ScaleBalance {...defaultProps} />);
      const beam = screen.getByTestId('balance-beam');
      expect(beam).toHaveClass('tilt-left');
    });

    it('should_show_right_heavier_when_right_side_is_heavier', () => {
      const configRightHeavy: ScaleBalanceConfig = {
        ...mockConfig,
        ladoIzquierdo: { items: [{ id: 'i1', etiqueta: '2kg', peso: 2 }] },
        ladoDerecho: { items: [{ id: 'd1', etiqueta: '10kg', peso: 10 }] },
      };
      render(<ScaleBalance {...defaultProps} config={configRightHeavy} />);
      const beam = screen.getByTestId('balance-beam');
      expect(beam).toHaveClass('tilt-right');
    });

    it('should_show_balanced_when_both_sides_equal', () => {
      const configBalanced: ScaleBalanceConfig = {
        ...mockConfig,
        ladoIzquierdo: { items: [{ id: 'i1', etiqueta: '5kg', peso: 5 }] },
        ladoDerecho: { items: [{ id: 'd1', etiqueta: '5kg', peso: 5 }] },
        itemsDisponibles: [],
      };
      render(<ScaleBalance {...defaultProps} config={configBalanced} />);
      const beam = screen.getByTestId('balance-beam');
      expect(beam).toHaveClass('balanced');
    });
  });

  describe('Interactividad - Drag and Drop', () => {
    it('should_allow_dragging_available_items', () => {
      render(<ScaleBalance {...defaultProps} />);
      const item = screen.getByTestId('available-item-a1');
      expect(item).toHaveAttribute('draggable', 'true');
    });

    it('should_not_be_draggable_when_disabled', () => {
      render(<ScaleBalance {...defaultProps} disabled />);
      const item = screen.getByTestId('available-item-a1');
      expect(item).toHaveAttribute('draggable', 'false');
    });

    it('should_drop_item_on_left_pan', () => {
      render(<ScaleBalance {...defaultProps} />);
      const item = screen.getByTestId('available-item-a1');
      const leftPan = screen.getByTestId('balance-left-pan');

      // Simulate drag start
      fireEvent.dragStart(item, {
        dataTransfer: { setData: vi.fn(), effectAllowed: '' },
      });

      // Simulate drop
      fireEvent.drop(leftPan, {
        dataTransfer: { getData: () => 'a1' },
        preventDefault: vi.fn(),
      });

      // Item should be in left pan now
      expect(screen.getByTestId('left-item-a1')).toBeInTheDocument();
    });

    it('should_drop_item_on_right_pan', () => {
      render(<ScaleBalance {...defaultProps} />);
      const item = screen.getByTestId('available-item-a1');
      const rightPan = screen.getByTestId('balance-right-pan');

      fireEvent.dragStart(item, {
        dataTransfer: { setData: vi.fn(), effectAllowed: '' },
      });

      fireEvent.drop(rightPan, {
        dataTransfer: { getData: () => 'a1' },
        preventDefault: vi.fn(),
      });

      expect(screen.getByTestId('right-item-a1')).toBeInTheDocument();
    });
  });

  describe('Mostrar pesos', () => {
    it('should_show_total_weight_on_each_side_when_configured', () => {
      const configWithTotals: ScaleBalanceConfig = {
        ...mockConfig,
        mostrarPesos: true,
      };
      render(<ScaleBalance {...defaultProps} config={configWithTotals} />);
      expect(screen.getByTestId('weight-left')).toHaveTextContent('8'); // 5+3
      expect(screen.getByTestId('weight-right')).toHaveTextContent('4');
    });

    it('should_not_show_weights_when_not_configured', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.queryByTestId('weight-left')).not.toBeInTheDocument();
    });
  });

  describe('Verificacion', () => {
    it('should_show_verify_button_in_estudiante_mode', () => {
      render(<ScaleBalance {...defaultProps} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });

    it('should_show_correct_feedback_when_balanced', () => {
      const configBalanced: ScaleBalanceConfig = {
        ...mockConfig,
        ladoIzquierdo: { items: [{ id: 'i1', etiqueta: '5kg', peso: 5 }] },
        ladoDerecho: { items: [{ id: 'd1', etiqueta: '5kg', peso: 5 }] },
        itemsDisponibles: [],
      };
      render(<ScaleBalance {...defaultProps} config={configBalanced} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_not_balanced', () => {
      render(<ScaleBalance {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.incorrecto)).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onProgress_when_item_placed', () => {
      const onProgress = vi.fn();
      render(<ScaleBalance {...defaultProps} onProgress={onProgress} />);

      const item = screen.getByTestId('available-item-a1');
      const leftPan = screen.getByTestId('balance-left-pan');

      fireEvent.dragStart(item, {
        dataTransfer: { setData: vi.fn(), effectAllowed: '' },
      });

      fireEvent.drop(leftPan, {
        dataTransfer: { getData: () => 'a1' },
        preventDefault: vi.fn(),
      });

      expect(onProgress).toHaveBeenCalled();
    });

    it('should_call_onComplete_when_verified', () => {
      const onComplete = vi.fn();
      const configBalanced: ScaleBalanceConfig = {
        ...mockConfig,
        ladoIzquierdo: { items: [{ id: 'i1', etiqueta: '5kg', peso: 5 }] },
        ladoDerecho: { items: [{ id: 'd1', etiqueta: '5kg', peso: 5 }] },
        itemsDisponibles: [],
      };
      render(<ScaleBalance {...defaultProps} config={configBalanced} onComplete={onComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          puntuacion: 100,
        }),
      );
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect', () => {
      render(<ScaleBalance {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_state_on_retry', () => {
      render(<ScaleBalance {...defaultProps} />);
      const leftPan = screen.getByTestId('balance-left-pan');

      // Add item
      fireEvent.dragStart(screen.getByTestId('available-item-a1'), {
        dataTransfer: { setData: vi.fn(), effectAllowed: '' },
      });
      fireEvent.drop(leftPan, {
        dataTransfer: { getData: () => 'a1' },
        preventDefault: vi.fn(),
      });

      // Verify (incorrect)
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Retry
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      // Item should be back in available
      expect(screen.getByTestId('available-item-a1')).toBeInTheDocument();
    });
  });

  describe('Descripcion', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: ScaleBalanceConfig = {
        ...mockConfig,
        descripcion: 'Arrastra pesas para equilibrar',
      };
      render(<ScaleBalance {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Quitar items de los platos', () => {
    it('should_allow_removing_added_items_from_pan', () => {
      render(<ScaleBalance {...defaultProps} />);
      const leftPan = screen.getByTestId('balance-left-pan');

      // Add item to left
      fireEvent.dragStart(screen.getByTestId('available-item-a1'), {
        dataTransfer: { setData: vi.fn(), effectAllowed: '' },
      });
      fireEvent.drop(leftPan, {
        dataTransfer: { getData: () => 'a1' },
        preventDefault: vi.fn(),
      });

      // Click to remove
      const addedItem = screen.getByTestId('left-item-a1');
      fireEvent.click(addedItem);

      // Should be back in available
      expect(screen.getByTestId('available-item-a1')).toBeInTheDocument();
    });
  });
});
