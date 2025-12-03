import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from '../TextInput';
import type { TextInputConfig } from '../types';

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: TextInputConfig = {
  instruccion: '¿Cuál es el símbolo del agua?',
  label: 'Símbolo químico',
  placeholder: 'Ej: H2O',
  respuestaCorrecta: 'H2O',
  caseSensitive: false,
  feedback: {
    correcto: '¡Correcto! El agua es H2O.',
    incorrecto: 'No es la respuesta correcta.',
  },
};

const defaultProps = {
  id: 'test-text-input',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('TextInput', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<TextInput {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_input_field', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should_render_label', () => {
      render(<TextInput {...defaultProps} />);
      expect(screen.getByText(mockConfig.label)).toBeInTheDocument();
    });

    it('should_render_placeholder_when_provided', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', mockConfig.placeholder);
    });

    it('should_render_verify_button_in_student_mode', () => {
      render(<TextInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<TextInput {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_render_preview_mode_without_verify_button', () => {
      render(<TextInput {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });
  });

  describe('Interaccion con el input', () => {
    it('should_update_value_when_typing', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'H2O' } });
      expect(input).toHaveValue('H2O');
    });

    it('should_not_allow_interaction_when_disabled', () => {
      render(<TextInput {...defaultProps} disabled />);
      const input = screen.getByRole('textbox');

      expect(input).toBeDisabled();
    });

    it('should_not_allow_interaction_after_verification', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'H2O' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(input).toBeDisabled();
    });
  });

  describe('Verificacion de respuestas', () => {
    it('should_show_correct_feedback_when_value_matches_exactly', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'H2O' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.correcto)).toBeInTheDocument();
    });

    it('should_be_case_insensitive_by_default', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'h2o' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.correcto)).toBeInTheDocument();
    });

    it('should_respect_case_sensitive_when_enabled', () => {
      const caseSensitiveConfig: TextInputConfig = {
        ...mockConfig,
        caseSensitive: true,
      };
      render(<TextInput {...defaultProps} config={caseSensitiveConfig} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'h2o' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.incorrecto)).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_value_does_not_match', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'NaCl' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.incorrecto)).toBeInTheDocument();
    });

    it('should_highlight_input_green_when_correct', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'H2O' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(input).toHaveClass(/green|correct/i);
    });

    it('should_highlight_input_red_when_incorrect', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(input).toHaveClass(/red|incorrect/i);
    });

    it('should_trim_whitespace_before_comparing', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: '  H2O  ' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.correcto)).toBeInTheDocument();
    });
  });

  describe('Respuestas alternativas', () => {
    it('should_accept_alternative_answers', () => {
      const configWithAlternatives: TextInputConfig = {
        ...mockConfig,
        respuestasAlternativas: ['agua', 'water'],
      };
      render(<TextInput {...defaultProps} config={configWithAlternatives} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'agua' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback!.correcto)).toBeInTheDocument();
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_verification', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_input_when_retry_clicked', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      expect(input).toHaveValue('');
      expect(input).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onComplete_when_verified', () => {
      const onComplete = vi.fn();
      render(<TextInput {...defaultProps} onComplete={onComplete} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'H2O' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          puntuacion: expect.any(Number),
          respuesta: expect.any(String),
          intentos: expect.any(Number),
        }),
      );
    });

    it('should_call_onProgress_when_value_changed', () => {
      const onProgress = vi.fn();
      render(<TextInput {...defaultProps} onProgress={onProgress} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'test' } });

      expect(onProgress).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('Modo libre (sin respuesta correcta)', () => {
    it('should_work_without_correct_answer_for_free_input', () => {
      const freeInputConfig: TextInputConfig = {
        instruccion: 'Escribe tu respuesta',
        label: 'Respuesta',
      };
      render(<TextInput {...defaultProps} config={freeInputConfig} />);

      // Sin respuestaCorrecta, no debería mostrar botón verificar
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });

    it('should_call_onComplete_with_value_in_free_mode_on_blur', () => {
      const onComplete = vi.fn();
      const freeInputConfig: TextInputConfig = {
        instruccion: 'Escribe tu respuesta',
        label: 'Respuesta',
      };
      render(<TextInput {...defaultProps} config={freeInputConfig} onComplete={onComplete} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'Mi respuesta libre' } });
      fireEvent.blur(input);

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          respuesta: 'Mi respuesta libre',
        }),
      );
    });
  });

  describe('Configuraciones opcionales', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: TextInputConfig = {
        ...mockConfig,
        descripcion: 'El símbolo se compone de elementos',
      };
      render(<TextInput {...defaultProps} config={configWithDesc} />);

      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });

    it('should_respect_maxLength_when_provided', () => {
      const configWithMaxLength: TextInputConfig = {
        ...mockConfig,
        maxLength: 10,
      };
      render(<TextInput {...defaultProps} config={configWithMaxLength} />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should_render_as_textarea_when_multiline_enabled', () => {
      const multilineConfig: TextInputConfig = {
        ...mockConfig,
        multiline: true,
        rows: 4,
      };
      render(<TextInput {...defaultProps} config={multilineConfig} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
    });
  });

  describe('Intentos maximos', () => {
    it('should_show_attempts_when_intentosMaximos_configured', () => {
      const configWithAttempts: TextInputConfig = {
        ...mockConfig,
        intentosMaximos: 3,
      };
      render(<TextInput {...defaultProps} config={configWithAttempts} />);
      expect(screen.getByText(/intento 0 de 3/i)).toBeInTheDocument();
    });

    it('should_disable_after_max_attempts', () => {
      const configWithAttempts: TextInputConfig = {
        ...mockConfig,
        intentosMaximos: 1,
      };
      render(<TextInput {...defaultProps} config={configWithAttempts} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
      expect(input).toBeDisabled();
    });

    it('should_show_correct_answer_after_max_attempts', () => {
      const configWithAttempts: TextInputConfig = {
        ...mockConfig,
        intentosMaximos: 1,
        mostrarRespuestaTras: 1,
      };
      render(<TextInput {...defaultProps} config={configWithAttempts} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByTestId('correct-answer-display')).toBeInTheDocument();
      expect(screen.getByText(/H2O/)).toBeInTheDocument();
    });
  });

  describe('Validacion', () => {
    it('should_show_error_when_empty_value_submitted', () => {
      render(<TextInput {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(/ingresa una respuesta/i)).toBeInTheDocument();
    });

    it('should_validate_with_pattern_when_provided', () => {
      const configWithPattern: TextInputConfig = {
        ...mockConfig,
        patron: '^[A-Z][a-z]*$', // Primera mayúscula, resto minúsculas
        mensajePatron: 'Debe empezar con mayúscula',
      };
      render(<TextInput {...defaultProps} config={configWithPattern} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'agua' } });
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(/debe empezar con mayúscula/i)).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('should_have_proper_aria_attributes', () => {
      render(<TextInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('aria-label', mockConfig.label);
    });

    it('should_submit_on_enter_key', () => {
      const onComplete = vi.fn();
      render(<TextInput {...defaultProps} onComplete={onComplete} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'H2O' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onComplete).toHaveBeenCalled();
    });

    it('should_not_submit_on_enter_in_multiline_mode', () => {
      const onComplete = vi.fn();
      const multilineConfig: TextInputConfig = {
        ...mockConfig,
        multiline: true,
      };
      render(<TextInput {...defaultProps} config={multilineConfig} onComplete={onComplete} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'H2O' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
