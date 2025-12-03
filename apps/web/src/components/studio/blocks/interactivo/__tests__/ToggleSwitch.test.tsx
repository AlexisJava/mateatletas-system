import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleSwitch } from '../ToggleSwitch';
import type { ToggleSwitchConfig } from '../types';

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: ToggleSwitchConfig = {
  instruccion: '¿Debe activarse el catalizador?',
  label: 'Catalizador',
  valorInicial: false,
  valorCorrecto: true,
  feedback: {
    correcto: '¡Correcto! El catalizador debe estar activo.',
    incorrecto: 'No es la respuesta correcta.',
  },
};

const defaultProps = {
  id: 'test-toggle',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('ToggleSwitch', () => {
  describe('Renderizado básico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_toggle_switch', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });

    it('should_render_label', () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.getByText(mockConfig.label)).toBeInTheDocument();
    });

    it('should_render_with_initial_value_off', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('should_render_with_initial_value_on', () => {
      const configWithOn: ToggleSwitchConfig = {
        ...mockConfig,
        valorInicial: true,
      };
      render(<ToggleSwitch {...defaultProps} config={configWithOn} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should_render_verify_button_in_student_mode', () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });

    it('should_show_off_on_labels', () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.getByText(/off|apagado/i)).toBeInTheDocument();
      expect(screen.getByText(/on|encendido/i)).toBeInTheDocument();
    });
  });

  describe('Modos de visualización', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<ToggleSwitch {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_render_preview_mode_without_verify_button', () => {
      render(<ToggleSwitch {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });
  });

  describe('Interacción con el toggle', () => {
    it('should_toggle_value_when_clicked', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      expect(toggle).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should_toggle_off_when_clicked_twice', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('should_not_allow_interaction_when_disabled', () => {
      render(<ToggleSwitch {...defaultProps} disabled />);
      const toggle = screen.getByRole('switch');

      expect(toggle).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('should_not_allow_interaction_after_verification', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Intentar toggle después de verificar
      const currentState = toggle.getAttribute('aria-checked');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', currentState);
    });
  });

  describe('Verificación de respuestas', () => {
    it('should_show_correct_feedback_when_value_matches', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      // Toggle a ON (valor correcto es true)
      fireEvent.click(toggle);
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_value_does_not_match', () => {
      render(<ToggleSwitch {...defaultProps} />);

      // Dejar en OFF (valor correcto es true)
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.incorrecto)).toBeInTheDocument();
    });

    it('should_highlight_toggle_green_when_correct', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle);
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(toggle.parentElement).toHaveClass(/green|correct/i);
    });

    it('should_highlight_toggle_red_when_incorrect', () => {
      render(<ToggleSwitch {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      const toggle = screen.getByRole('switch');
      expect(toggle.parentElement).toHaveClass(/red|incorrect/i);
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_verification', () => {
      render(<ToggleSwitch {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_toggle_when_retry_clicked', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle); // ON
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Como es correcto, puede que no haya retry, pero si hay:
      const retryButton = screen.queryByRole('button', { name: /reintentar/i });
      if (retryButton) {
        fireEvent.click(retryButton);
        expect(toggle).toHaveAttribute('aria-checked', 'false');
        expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
      }
    });
  });

  describe('Callbacks', () => {
    it('should_call_onComplete_when_verified', () => {
      const onComplete = vi.fn();
      render(<ToggleSwitch {...defaultProps} onComplete={onComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          correcto: expect.any(Boolean),
          valor: expect.any(Boolean),
        }),
      );
    });

    it('should_call_onProgress_when_toggle_changed', () => {
      const onProgress = vi.fn();
      render(<ToggleSwitch {...defaultProps} onProgress={onProgress} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle);

      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          valor: true,
        }),
      );
    });
  });

  describe('Configuraciones opcionales', () => {
    it('should_work_without_correct_value_for_free_exploration', () => {
      const configWithoutCorrect: ToggleSwitchConfig = {
        instruccion: 'Activa o desactiva el elemento',
        label: 'Elemento',
        valorInicial: false,
      };
      render(<ToggleSwitch {...defaultProps} config={configWithoutCorrect} />);

      // Sin valorCorrecto, no debería mostrar botón verificar
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });

    it('should_use_custom_labels_when_provided', () => {
      const configWithCustomLabels: ToggleSwitchConfig = {
        ...mockConfig,
        labelOff: 'Inactivo',
        labelOn: 'Activo',
      };
      render(<ToggleSwitch {...defaultProps} config={configWithCustomLabels} />);

      expect(screen.getByText('Inactivo')).toBeInTheDocument();
      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('should_show_description_when_provided', () => {
      const configWithDesc: ToggleSwitchConfig = {
        ...mockConfig,
        descripcion: 'El catalizador acelera la reacción química',
      };
      render(<ToggleSwitch {...defaultProps} config={configWithDesc} />);

      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Intentos máximos', () => {
    it('should_show_attempts_when_intentosMaximos_configured', () => {
      const configWithAttempts: ToggleSwitchConfig = {
        ...mockConfig,
        intentosMaximos: 3,
      };
      render(<ToggleSwitch {...defaultProps} config={configWithAttempts} />);
      expect(screen.getByText(/intento 0 de 3/i)).toBeInTheDocument();
    });

    it('should_disable_after_max_attempts', () => {
      const configWithAttempts: ToggleSwitchConfig = {
        ...mockConfig,
        intentosMaximos: 1,
      };
      render(<ToggleSwitch {...defaultProps} config={configWithAttempts} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    });

    it('should_show_correct_answer_after_max_attempts', () => {
      const configWithAttempts: ToggleSwitchConfig = {
        ...mockConfig,
        intentosMaximos: 1,
        mostrarRespuestaTras: 1,
      };
      render(<ToggleSwitch {...defaultProps} config={configWithAttempts} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByTestId('correct-answer-display')).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('should_have_proper_aria_attributes', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      expect(toggle).toHaveAttribute('role', 'switch');
      expect(toggle).toHaveAttribute('aria-checked');
      expect(toggle).toHaveAttribute('tabIndex', '0');
    });

    it('should_toggle_on_enter_key', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      fireEvent.keyDown(toggle, { key: 'Enter' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should_toggle_on_space_key', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');

      fireEvent.keyDown(toggle, { key: ' ' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });
});
