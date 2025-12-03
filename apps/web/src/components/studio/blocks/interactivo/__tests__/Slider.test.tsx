import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from '../Slider';
import type { SliderConfig } from '../types';

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: SliderConfig = {
  instruccion: 'Ajusta el valor de temperatura',
  min: 0,
  max: 100,
  paso: 1,
  valorInicial: 50,
  valorCorrecto: 75,
  tolerancia: 5,
  unidad: '°C',
  feedback: {
    correcto: '¡Correcto! La temperatura ideal es 75°C.',
    incorrecto: 'No es el valor correcto. Intenta de nuevo.',
  },
};

const defaultProps = {
  id: 'test-slider',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('Slider', () => {
  describe('Renderizado básico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<Slider {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_slider_input', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should_render_with_initial_value', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue(String(mockConfig.valorInicial));
    });

    it('should_render_min_max_labels', () => {
      render(<Slider {...defaultProps} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should_render_current_value_with_unit', () => {
      render(<Slider {...defaultProps} />);
      expect(screen.getByText(/50.*°C/)).toBeInTheDocument();
    });

    it('should_render_verify_button_in_student_mode', () => {
      render(<Slider {...defaultProps} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Modos de visualización', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<Slider {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_render_preview_mode_without_verify_button', () => {
      render(<Slider {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });
  });

  describe('Interacción con el slider', () => {
    it('should_update_value_when_slider_changed', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '80' } });

      expect(slider).toHaveValue('80');
      expect(screen.getByText(/80.*°C/)).toBeInTheDocument();
    });

    it('should_respect_step_value', () => {
      const configWithStep: SliderConfig = {
        ...mockConfig,
        paso: 10,
      };
      render(<Slider {...defaultProps} config={configWithStep} />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('step', '10');
    });

    it('should_not_allow_interaction_when_disabled', () => {
      render(<Slider {...defaultProps} disabled />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });

    it('should_not_allow_interaction_after_verification', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(slider).toBeDisabled();
    });
  });

  describe('Verificación de respuestas', () => {
    it('should_show_correct_feedback_when_value_is_within_tolerance', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      // Valor correcto es 75, tolerancia 5, así que 73 debería ser correcto
      fireEvent.change(slider, { target: { value: '73' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_value_is_outside_tolerance', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      // Valor correcto es 75, tolerancia 5, así que 50 debería ser incorrecto
      fireEvent.change(slider, { target: { value: '50' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.incorrecto)).toBeInTheDocument();
    });

    it('should_show_exact_match_as_correct', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '75' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });

    it('should_highlight_correct_position_after_verify', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '50' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Debería mostrar indicador de la posición correcta
      expect(screen.getByTestId('correct-value-indicator')).toBeInTheDocument();
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_verification', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '20' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_slider_when_retry_clicked', () => {
      render(<Slider {...defaultProps} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '20' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      expect(slider).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onComplete_when_verified', () => {
      const onComplete = vi.fn();
      render(<Slider {...defaultProps} onComplete={onComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          correcto: expect.any(Boolean),
          valor: expect.any(Number),
        }),
      );
    });

    it('should_call_onProgress_when_slider_value_changes', () => {
      const onProgress = vi.fn();
      render(<Slider {...defaultProps} onProgress={onProgress} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '60' } });

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          valor: 60,
        }),
      );
    });
  });

  describe('Configuraciones opcionales', () => {
    it('should_work_without_unit', () => {
      const configWithoutUnit: SliderConfig = {
        ...mockConfig,
        unidad: undefined,
      };
      render(<Slider {...defaultProps} config={configWithoutUnit} />);

      // Debería mostrar solo el valor sin unidad
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should_work_without_correct_value_for_free_exploration', () => {
      const configWithoutCorrect: SliderConfig = {
        instruccion: 'Explora los valores',
        min: 0,
        max: 100,
        paso: 1,
        valorInicial: 50,
      };
      render(<Slider {...defaultProps} config={configWithoutCorrect} />);

      // Sin valorCorrecto, no debería mostrar botón verificar
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });

    it('should_show_markers_when_configured', () => {
      const configWithMarkers: SliderConfig = {
        ...mockConfig,
        marcadores: [
          { valor: 0, etiqueta: 'Frío' },
          { valor: 50, etiqueta: 'Templado' },
          { valor: 100, etiqueta: 'Caliente' },
        ],
      };
      render(<Slider {...defaultProps} config={configWithMarkers} />);

      expect(screen.getByText('Frío')).toBeInTheDocument();
      expect(screen.getByText('Templado')).toBeInTheDocument();
      expect(screen.getByText('Caliente')).toBeInTheDocument();
    });

    it('should_use_default_tolerance_of_zero_when_not_specified', () => {
      const configWithoutTolerance: SliderConfig = {
        ...mockConfig,
        tolerancia: undefined,
      };
      render(<Slider {...defaultProps} config={configWithoutTolerance} />);
      const slider = screen.getByRole('slider');

      // Valor exacto debería ser correcto
      fireEvent.change(slider, { target: { value: '75' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });
  });

  describe('Intentos máximos', () => {
    it('should_show_attempts_when_intentosMaximos_configured', () => {
      const configWithAttempts: SliderConfig = {
        ...mockConfig,
        intentosMaximos: 3,
      };
      render(<Slider {...defaultProps} config={configWithAttempts} />);
      expect(screen.getByText(/intento 0 de 3/i)).toBeInTheDocument();
    });

    it('should_disable_after_max_attempts', () => {
      const configWithAttempts: SliderConfig = {
        ...mockConfig,
        intentosMaximos: 1,
      };
      render(<Slider {...defaultProps} config={configWithAttempts} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '20' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Después del máximo de intentos, no debería poder reintentar
      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
      expect(slider).toBeDisabled();
    });

    it('should_show_correct_answer_after_max_attempts', () => {
      const configWithAttempts: SliderConfig = {
        ...mockConfig,
        intentosMaximos: 1,
        mostrarRespuestaTras: 1,
      };
      render(<Slider {...defaultProps} config={configWithAttempts} />);
      const slider = screen.getByRole('slider');

      fireEvent.change(slider, { target: { value: '20' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Debería mostrar la respuesta correcta
      expect(screen.getByTestId('correct-answer-display')).toBeInTheDocument();
      expect(screen.getByText(/75/)).toBeInTheDocument();
    });
  });
});
