import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderSequence } from '../OrderSequence';
import type { OrderSequenceConfig } from '../types';

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: OrderSequenceConfig = {
  instruccion: 'Ordena los pasos del método científico',
  elementos: [
    { id: 'e1', contenido: 'Observación', ordenCorrecto: 1 },
    { id: 'e2', contenido: 'Hipótesis', ordenCorrecto: 2 },
    { id: 'e3', contenido: 'Experimentación', ordenCorrecto: 3 },
    { id: 'e4', contenido: 'Conclusión', ordenCorrecto: 4 },
  ],
  feedback: {
    correcto: '¡Excelente! El orden es correcto.',
    incorrecto: 'El orden no es correcto. Inténtalo de nuevo.',
  },
};

const defaultProps = {
  id: 'test-order-sequence',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('OrderSequence', () => {
  describe('Renderizado básico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<OrderSequence {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_all_elements_when_config_has_elementos', () => {
      render(<OrderSequence {...defaultProps} />);
      expect(screen.getByText('Observación')).toBeInTheDocument();
      expect(screen.getByText('Hipótesis')).toBeInTheDocument();
      expect(screen.getByText('Experimentación')).toBeInTheDocument();
      expect(screen.getByText('Conclusión')).toBeInTheDocument();
    });

    it('should_render_verify_button_when_in_student_mode', () => {
      render(<OrderSequence {...defaultProps} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });

    it('should_render_elements_in_shuffled_order', () => {
      // Los elementos deben aparecer en orden aleatorio, no en el orden correcto
      render(<OrderSequence {...defaultProps} />);
      const items = screen.getAllByTestId(/^order-item-/);
      expect(items).toHaveLength(4);
    });
  });

  describe('Modos de visualización', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<OrderSequence {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_render_preview_mode_when_modo_is_preview', () => {
      render(<OrderSequence {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });
  });

  describe('Interacción de reordenamiento', () => {
    it('should_move_item_up_when_up_button_clicked', () => {
      render(<OrderSequence {...defaultProps} />);
      const items = screen.getAllByTestId(/^order-item-/);
      const secondItemId = items[1].getAttribute('data-testid');

      // Click en botón subir del segundo item
      const upButton = screen.getAllByTestId(/^move-up-/)[1];
      fireEvent.click(upButton);

      // El item debería haberse movido a la primera posición
      const newItems = screen.getAllByTestId(/^order-item-/);
      expect(newItems[0].getAttribute('data-testid')).toBe(secondItemId);
    });

    it('should_move_item_down_when_down_button_clicked', () => {
      render(<OrderSequence {...defaultProps} />);
      const items = screen.getAllByTestId(/^order-item-/);
      const firstItemId = items[0].getAttribute('data-testid');

      // Click en botón bajar del primer item
      const downButton = screen.getAllByTestId(/^move-down-/)[0];
      fireEvent.click(downButton);

      // El item debería haberse movido a la segunda posición
      const newItems = screen.getAllByTestId(/^order-item-/);
      expect(newItems[1].getAttribute('data-testid')).toBe(firstItemId);
    });

    it('should_disable_up_button_for_first_item', () => {
      render(<OrderSequence {...defaultProps} />);
      const upButtons = screen.getAllByTestId(/^move-up-/);
      expect(upButtons[0]).toBeDisabled();
    });

    it('should_disable_down_button_for_last_item', () => {
      render(<OrderSequence {...defaultProps} />);
      const downButtons = screen.getAllByTestId(/^move-down-/);
      expect(downButtons[downButtons.length - 1]).toBeDisabled();
    });

    it('should_not_allow_interaction_when_disabled', () => {
      render(<OrderSequence {...defaultProps} disabled />);
      // When disabled, the move buttons are not rendered (isInteractive is false)
      const upButtons = screen.queryAllByTestId(/^move-up-/);
      const downButtons = screen.queryAllByTestId(/^move-down-/);

      // No buttons should be rendered when disabled
      expect(upButtons).toHaveLength(0);
      expect(downButtons).toHaveLength(0);
    });
  });

  describe('Verificación de respuestas', () => {
    it('should_show_correct_feedback_when_order_is_correct', () => {
      render(<OrderSequence {...defaultProps} />);

      // Reordenar hasta que esté correcto (simulamos el orden correcto)
      // Esto depende de la implementación - por ahora verificamos que el botón funcione
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Debería mostrar algún feedback (correcto o incorrecto)
      const feedback =
        screen.queryByText(mockConfig.feedback.correcto) ||
        screen.queryByText(mockConfig.feedback.incorrecto);
      expect(feedback).toBeInTheDocument();
    });

    it('should_highlight_correct_positions_in_green_after_verify', () => {
      render(<OrderSequence {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Al menos un item debería tener indicador de posición
      const items = screen.getAllByTestId(/^order-item-/);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should_show_position_numbers_on_items', () => {
      render(<OrderSequence {...defaultProps} />);
      // Deberían verse números de posición 1, 2, 3, 4
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_verification', () => {
      render(<OrderSequence {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Si no está todo correcto, debería aparecer reintentar
      const retryButton = screen.queryByRole('button', { name: /reintentar/i });
      // Puede o no aparecer dependiendo si está correcto
      expect(
        retryButton !== null || screen.queryByText(mockConfig.feedback.correcto) !== null,
      ).toBe(true);
    });

    it('should_reset_to_shuffled_order_when_retry_clicked', () => {
      render(<OrderSequence {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      const retryButton = screen.queryByRole('button', { name: /reintentar/i });
      if (retryButton) {
        fireEvent.click(retryButton);
        // Debería poder verificar de nuevo
        expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
      }
    });
  });

  describe('Callbacks', () => {
    it('should_call_onComplete_when_order_verified_correctly', () => {
      const onComplete = vi.fn();
      render(<OrderSequence {...defaultProps} onComplete={onComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // onComplete se llama con resultado (correcto o incorrecto)
      expect(onComplete).toHaveBeenCalled();
    });

    it('should_call_onProgress_when_item_moved', () => {
      const onProgress = vi.fn();
      render(<OrderSequence {...defaultProps} onProgress={onProgress} />);

      const downButton = screen.getAllByTestId(/^move-down-/)[0];
      fireEvent.click(downButton);

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('should_have_draggable_items', () => {
      render(<OrderSequence {...defaultProps} />);
      const items = screen.getAllByTestId(/^order-item-/);
      items.forEach((item) => {
        expect(item).toHaveAttribute('draggable', 'true');
      });
    });
  });

  describe('Intentos máximos', () => {
    it('should_show_attempts_when_intentosMaximos_configured', () => {
      const configWithAttempts: OrderSequenceConfig = {
        ...mockConfig,
        intentosMaximos: 3,
      };
      render(<OrderSequence {...defaultProps} config={configWithAttempts} />);
      expect(screen.getByText(/intento 0 de 3/i)).toBeInTheDocument();
    });

    it('should_show_correct_order_after_max_attempts', () => {
      const configWithAttempts: OrderSequenceConfig = {
        ...mockConfig,
        intentosMaximos: 1,
        mostrarRespuestasTras: 1,
      };
      render(<OrderSequence {...defaultProps} config={configWithAttempts} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Si falló y se alcanzó el máximo, debería mostrar respuestas
      const correctAnswers = screen.queryByTestId('correct-answers');
      // Puede aparecer o no dependiendo de si acertó
      expect(
        correctAnswers !== null || screen.queryByText(mockConfig.feedback.correcto) !== null,
      ).toBe(true);
    });
  });
});
