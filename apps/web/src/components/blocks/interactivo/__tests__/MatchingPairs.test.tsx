import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchingPairs } from '../MatchingPairs';
import type { MatchingPairsConfig } from '../types';

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: MatchingPairsConfig = {
  instruccion: 'Conecta cada fórmula con su nombre',
  pares: [
    { id: 'p1', izquierda: 'H2O', derecha: 'Agua' },
    { id: 'p2', izquierda: 'NaCl', derecha: 'Sal' },
    { id: 'p3', izquierda: 'CO2', derecha: 'Dióxido de carbono' },
  ],
  feedback: {
    correcto: '¡Excelente! Todas las conexiones son correctas.',
    incorrecto: 'Algunas conexiones no son correctas.',
  },
};

const defaultProps = {
  id: 'test-matching-pairs',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('MatchingPairs', () => {
  describe('Renderizado básico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<MatchingPairs {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_all_left_items_when_config_has_pairs', () => {
      render(<MatchingPairs {...defaultProps} />);
      expect(screen.getByText('H2O')).toBeInTheDocument();
      expect(screen.getByText('NaCl')).toBeInTheDocument();
      expect(screen.getByText('CO2')).toBeInTheDocument();
    });

    it('should_render_all_right_items_when_config_has_pairs', () => {
      render(<MatchingPairs {...defaultProps} />);
      expect(screen.getByText('Agua')).toBeInTheDocument();
      expect(screen.getByText('Sal')).toBeInTheDocument();
      expect(screen.getByText('Dióxido de carbono')).toBeInTheDocument();
    });

    it('should_render_verify_button_when_in_student_mode', () => {
      render(<MatchingPairs {...defaultProps} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Modos de visualización', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<MatchingPairs {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_render_preview_mode_when_modo_is_preview', () => {
      render(<MatchingPairs {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      // En preview no hay botón de verificar
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });
  });

  describe('Interacción de conexión', () => {
    it('should_select_left_item_when_clicked', () => {
      render(<MatchingPairs {...defaultProps} />);
      const leftItem = screen.getByTestId('left-item-p1');
      fireEvent.click(leftItem);
      expect(leftItem).toHaveClass('ring-2');
    });

    it('should_create_connection_when_left_then_right_clicked', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Click en item izquierdo
      fireEvent.click(screen.getByTestId('left-item-p1'));
      // Click en item derecho
      fireEvent.click(screen.getByTestId('right-item-p1'));

      // Verificar que se creó la conexión (ambos items conectados)
      expect(screen.getByTestId('left-item-p1')).toHaveClass('bg-blue-600');
      expect(screen.getByTestId('right-item-p1')).toHaveClass('bg-blue-600');
    });

    it('should_allow_selecting_right_first_then_left', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Click en item derecho primero
      fireEvent.click(screen.getByTestId('right-item-p2'));
      // Click en item izquierdo
      fireEvent.click(screen.getByTestId('left-item-p2'));

      // Verificar conexión
      expect(screen.getByTestId('left-item-p2')).toHaveClass('bg-blue-600');
      expect(screen.getByTestId('right-item-p2')).toHaveClass('bg-blue-600');
    });

    it('should_remove_connection_when_connected_item_clicked', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Crear conexión
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p1'));

      // Click en item conectado para desconectar
      fireEvent.click(screen.getByTestId('left-item-p1'));

      // Verificar que se removió la conexión
      expect(screen.getByTestId('left-item-p1')).not.toHaveClass('bg-blue-600');
      expect(screen.getByTestId('right-item-p1')).not.toHaveClass('bg-blue-600');
    });

    it('should_not_allow_interaction_when_disabled', () => {
      render(<MatchingPairs {...defaultProps} disabled />);

      const leftItem = screen.getByTestId('left-item-p1');
      fireEvent.click(leftItem);

      expect(leftItem).not.toHaveClass('ring-2');
    });
  });

  describe('Verificación de respuestas', () => {
    it('should_show_correct_feedback_when_all_pairs_matched_correctly', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Conectar todos correctamente
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p1'));
      fireEvent.click(screen.getByTestId('left-item-p2'));
      fireEvent.click(screen.getByTestId('right-item-p2'));
      fireEvent.click(screen.getByTestId('left-item-p3'));
      fireEvent.click(screen.getByTestId('right-item-p3'));

      // Verificar
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_pairs_matched_incorrectly', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Conectar incorrectamente (H2O con Sal)
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p2'));

      // Verificar
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.incorrecto)).toBeInTheDocument();
    });

    it('should_highlight_correct_connections_in_green_after_verify', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Conectar correctamente
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p1'));

      // Verificar
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByTestId('left-item-p1')).toHaveClass('bg-green-600');
      expect(screen.getByTestId('right-item-p1')).toHaveClass('bg-green-600');
    });

    it('should_highlight_incorrect_connections_in_red_after_verify', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Conectar incorrectamente
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p2')); // H2O con Sal (incorrecto)

      // Verificar
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByTestId('left-item-p1')).toHaveClass('bg-red-600');
    });

    it('should_disable_verify_button_when_no_connections_made', () => {
      render(<MatchingPairs {...defaultProps} />);

      const verifyButton = screen.getByRole('button', { name: /verificar/i });
      expect(verifyButton).toBeDisabled();
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_verification', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Conectar incorrectamente
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p2'));

      // Verificar
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_connections_when_retry_clicked', () => {
      render(<MatchingPairs {...defaultProps} />);

      // Conectar y verificar
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p2'));
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Reintentar
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      // Verificar que se resetearon las conexiones
      expect(screen.getByTestId('left-item-p1')).not.toHaveClass('bg-blue-600');
      expect(screen.getByTestId('left-item-p1')).not.toHaveClass('bg-red-600');
    });
  });

  describe('Callbacks', () => {
    it('should_call_onComplete_with_correct_data_when_all_correct', () => {
      const onComplete = vi.fn();
      render(<MatchingPairs {...defaultProps} onComplete={onComplete} />);

      // Conectar todos correctamente
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p1'));
      fireEvent.click(screen.getByTestId('left-item-p2'));
      fireEvent.click(screen.getByTestId('right-item-p2'));
      fireEvent.click(screen.getByTestId('left-item-p3'));
      fireEvent.click(screen.getByTestId('right-item-p3'));

      // Verificar
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          puntuacion: 100,
        }),
      );
    });

    it('should_call_onProgress_when_connection_made', () => {
      const onProgress = vi.fn();
      render(<MatchingPairs {...defaultProps} onProgress={onProgress} />);

      // Hacer una conexión
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p1'));

      // 1 de 3 conexiones = ~33%
      expect(onProgress).toHaveBeenCalledWith(33);
    });
  });

  describe('Intentos máximos', () => {
    it('should_show_attempts_when_intentosMaximos_configured', () => {
      const configWithAttempts: MatchingPairsConfig = {
        ...mockConfig,
        intentosMaximos: 3,
      };
      render(<MatchingPairs {...defaultProps} config={configWithAttempts} />);

      expect(screen.getByText(/intento 0 de 3/i)).toBeInTheDocument();
    });

    it('should_show_correct_answers_after_max_attempts', () => {
      const configWithAttempts: MatchingPairsConfig = {
        ...mockConfig,
        intentosMaximos: 1,
        mostrarRespuestasTras: 1,
      };
      render(<MatchingPairs {...defaultProps} config={configWithAttempts} />);

      // Conectar incorrectamente y verificar
      fireEvent.click(screen.getByTestId('left-item-p1'));
      fireEvent.click(screen.getByTestId('right-item-p2'));
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByTestId('correct-answers')).toBeInTheDocument();
    });
  });
});
