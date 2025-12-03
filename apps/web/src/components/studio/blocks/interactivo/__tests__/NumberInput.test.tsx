import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from '../NumberInput';
import type { NumberInputConfig } from '../types';

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: NumberInputConfig = {
  instruccion: '¿Cuál es la masa molar del agua?',
  label: 'Masa molar',
  min: 0,
  max: 1000,
  valorCorrecto: 18,
  tolerancia: 0.5,
  unidad: 'g/mol',
  feedback: {
    correcto: '¡Correcto! La masa molar del agua es 18 g/mol.',
    incorrecto: 'No es la respuesta correcta.',
  },
};

const defaultProps = {
  id: 'test-number-input',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('NumberInput', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<NumberInput {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_input_field', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
    });

    it('should_render_label', () => {
      render(<NumberInput {...defaultProps} />);
      expect(screen.getByText(mockConfig.label)).toBeInTheDocument();
    });

    it('should_render_unit_when_provided', () => {
      render(<NumberInput {...defaultProps} />);
      expect(screen.getByText(mockConfig.unidad!)).toBeInTheDocument();
    });

    it('should_render_verify_button_in_student_mode', () => {
      render(<NumberInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });

    it('should_have_correct_min_max_attributes', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '1000');
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<NumberInput {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_render_preview_mode_without_verify_button', () => {
      render(<NumberInput {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });
  });

  describe('Interaccion con el input', () => {
    it('should_update_value_when_typing', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '18' } });
      expect(input).toHaveValue(18);
    });

    it('should_allow_decimal_values_when_decimales_configured', () => {
      const configWithDecimals: NumberInputConfig = {
        ...mockConfig,
        decimales: 2,
      };
      render(<NumberInput {...defaultProps} config={configWithDecimals} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '18.02' } });
      expect(input).toHaveValue(18.02);
    });

    it('should_not_allow_interaction_when_disabled', () => {
      render(<NumberInput {...defaultProps} disabled />);
      const input = screen.getByRole('spinbutton');

      expect(input).toBeDisabled();
    });

    it('should_not_allow_interaction_after_verification', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '18' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(input).toBeDisabled();
    });
  });

  describe('Verificacion de respuestas', () => {
    it('should_show_correct_feedback_when_value_matches_exactly', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '18' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.correcto)).toBeInTheDocument();
    });

    it('should_show_correct_feedback_when_value_within_tolerance', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      // 18.4 está dentro de tolerancia 0.5 del valor correcto 18
      fireEvent.change(input, { target: { value: '18.4' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.correcto)).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_value_outside_tolerance', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      // 19 está fuera de tolerancia 0.5 del valor correcto 18
      fireEvent.change(input, { target: { value: '19' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.incorrecto)).toBeInTheDocument();
    });

    it('should_highlight_input_green_when_correct', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '18' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(input).toHaveClass(/green|correct/i);
    });

    it('should_highlight_input_red_when_incorrect', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(input).toHaveClass(/red|incorrect/i);
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_verification', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_input_when_retry_clicked', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      expect(input).toHaveValue(null);
      expect(input).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onComplete_when_verified', () => {
      const onComplete = vi.fn();
      render(<NumberInput {...defaultProps} onComplete={onComplete} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '18' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          puntuacion: expect.any(Number),
          respuesta: expect.any(Number),
          intentos: expect.any(Number),
        }),
      );
    });

    it('should_call_onProgress_when_value_changed', () => {
      const onProgress = vi.fn();
      render(<NumberInput {...defaultProps} onProgress={onProgress} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '25' } });

      // onProgress recibe un porcentaje (0-100)
      expect(onProgress).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('Configuraciones opcionales', () => {
    it('should_work_without_correct_value_for_free_input', () => {
      const configWithoutCorrect: NumberInputConfig = {
        instruccion: 'Ingresa un numero',
        label: 'Numero',
        min: 0,
        max: 100,
      };
      render(<NumberInput {...defaultProps} config={configWithoutCorrect} />);

      // Sin valorCorrecto, no debería mostrar botón verificar
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });

    it('should_show_description_when_provided', () => {
      const configWithDesc: NumberInputConfig = {
        ...mockConfig,
        descripcion: 'La masa molar se expresa en g/mol',
      };
      render(<NumberInput {...defaultProps} config={configWithDesc} />);

      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });

    it('should_render_placeholder_when_provided', () => {
      const configWithPlaceholder: NumberInputConfig = {
        ...mockConfig,
        placeholder: 'Ej: 18',
      };
      render(<NumberInput {...defaultProps} config={configWithPlaceholder} />);
      const input = screen.getByRole('spinbutton');

      expect(input).toHaveAttribute('placeholder', 'Ej: 18');
    });

    it('should_use_step_attribute_based_on_decimales', () => {
      const configWithDecimals: NumberInputConfig = {
        ...mockConfig,
        decimales: 2,
      };
      render(<NumberInput {...defaultProps} config={configWithDecimals} />);
      const input = screen.getByRole('spinbutton');

      expect(input).toHaveAttribute('step', '0.01');
    });
  });

  describe('Intentos maximos', () => {
    it('should_show_attempts_when_intentosMaximos_configured', () => {
      const configWithAttempts: NumberInputConfig = {
        ...mockConfig,
        intentosMaximos: 3,
      };
      render(<NumberInput {...defaultProps} config={configWithAttempts} />);
      expect(screen.getByText(/intento 0 de 3/i)).toBeInTheDocument();
    });

    it('should_disable_after_max_attempts', () => {
      const configWithAttempts: NumberInputConfig = {
        ...mockConfig,
        intentosMaximos: 1,
      };
      render(<NumberInput {...defaultProps} config={configWithAttempts} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
      expect(input).toBeDisabled();
    });

    it('should_show_correct_answer_after_max_attempts', () => {
      const configWithAttempts: NumberInputConfig = {
        ...mockConfig,
        intentosMaximos: 1,
        mostrarRespuestaTras: 1,
      };
      render(<NumberInput {...defaultProps} config={configWithAttempts} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByTestId('correct-answer-display')).toBeInTheDocument();
      expect(screen.getByText(/18/)).toBeInTheDocument();
    });
  });

  describe('Validacion de rango', () => {
    it('should_show_error_when_value_below_min', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '-5' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(/valor debe estar entre/i)).toBeInTheDocument();
    });

    it('should_show_error_when_value_above_max', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '1500' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(/valor debe estar entre/i)).toBeInTheDocument();
    });

    it('should_show_error_when_empty_value_submitted', () => {
      render(<NumberInput {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(/ingresa un valor/i)).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('should_have_proper_aria_attributes', () => {
      render(<NumberInput {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      expect(input).toHaveAttribute('aria-label', mockConfig.label);
    });

    it('should_submit_on_enter_key', () => {
      const onComplete = vi.fn();
      render(<NumberInput {...defaultProps} onComplete={onComplete} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '18' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onComplete).toHaveBeenCalled();
    });
  });
});
