import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Quiz } from '../Quiz';
import type { QuizConfig } from '../types';

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

const mockConfig: QuizConfig = {
  instruccion: 'Responde las siguientes preguntas',
  titulo: 'Quiz de Matemáticas',
  preguntas: [
    {
      id: 'q1',
      tipo: 'opcionMultiple',
      pregunta: '¿Cuánto es 2 + 2?',
      opciones: ['3', '4', '5', '6'],
      respuestaCorrecta: '4',
    },
    {
      id: 'q2',
      tipo: 'opcionMultiple',
      pregunta: '¿Cuál es la capital de Francia?',
      opciones: ['Madrid', 'París', 'Roma', 'Londres'],
      respuestaCorrecta: 'París',
    },
    {
      id: 'q3',
      tipo: 'verdaderoFalso',
      pregunta: 'El sol es una estrella',
      respuestaCorrecta: true,
    },
  ],
  feedback: {
    correcto: '¡Excelente trabajo!',
    incorrecto: 'Sigue practicando.',
  },
};

const defaultProps = {
  id: 'test-quiz',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('Quiz', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<Quiz {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_title_when_provided', () => {
      render(<Quiz {...defaultProps} />);
      expect(screen.getByText(mockConfig.titulo!)).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<Quiz {...defaultProps} />);
      expect(screen.getByTestId('quiz-test-quiz')).toBeInTheDocument();
    });

    it('should_render_first_question', () => {
      render(<Quiz {...defaultProps} />);
      expect(screen.getByText('¿Cuánto es 2 + 2?')).toBeInTheDocument();
    });

    it('should_render_question_counter', () => {
      render(<Quiz {...defaultProps} />);
      expect(screen.getByText(/1 de 3/)).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<Quiz {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_question_count_in_editor_mode', () => {
      render(<Quiz {...defaultProps} modo="editor" />);
      expect(screen.getByText(/3 preguntas/)).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<Quiz {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.getByText('¿Cuánto es 2 + 2?')).toBeInTheDocument();
    });
  });

  describe('Navegacion entre preguntas', () => {
    it('should_show_next_button_after_answering', () => {
      render(<Quiz {...defaultProps} />);

      // Responder primera pregunta
      fireEvent.click(screen.getByText('4'));

      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    });

    it('should_go_to_next_question_when_next_clicked', () => {
      render(<Quiz {...defaultProps} />);

      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

      expect(screen.getByText('¿Cuál es la capital de Francia?')).toBeInTheDocument();
      expect(screen.getByText(/2 de 3/)).toBeInTheDocument();
    });

    it('should_show_previous_button_from_second_question', () => {
      render(<Quiz {...defaultProps} />);

      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

      expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    });

    it('should_go_back_to_previous_question', () => {
      render(<Quiz {...defaultProps} />);

      // Ir a la segunda pregunta
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

      // Volver
      fireEvent.click(screen.getByRole('button', { name: /anterior/i }));

      expect(screen.getByText('¿Cuánto es 2 + 2?')).toBeInTheDocument();
    });
  });

  describe('Tipos de preguntas', () => {
    it('should_render_multiple_choice_options', () => {
      render(<Quiz {...defaultProps} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should_render_true_false_options', () => {
      render(<Quiz {...defaultProps} />);

      // Navegar a la pregunta verdadero/falso (tercera)
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('París'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

      expect(screen.getByText('Verdadero')).toBeInTheDocument();
      expect(screen.getByText('Falso')).toBeInTheDocument();
    });

    it('should_highlight_selected_option', () => {
      render(<Quiz {...defaultProps} />);

      const option = screen.getByText('4');
      fireEvent.click(option);

      expect(option.closest('button')).toHaveClass('selected');
    });
  });

  describe('Timer', () => {
    it('should_show_timer_when_configured', () => {
      const configWithTimer: QuizConfig = {
        ...mockConfig,
        tiempoLimite: 60, // 60 segundos
      };
      render(<Quiz {...defaultProps} config={configWithTimer} />);

      expect(screen.getByTestId('quiz-timer')).toBeInTheDocument();
      expect(screen.getByText('1:00')).toBeInTheDocument();
    });

    it('should_countdown_timer', () => {
      const configWithTimer: QuizConfig = {
        ...mockConfig,
        tiempoLimite: 60,
      };
      render(<Quiz {...defaultProps} config={configWithTimer} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('0:55')).toBeInTheDocument();
    });

    it('should_auto_submit_when_time_runs_out', () => {
      const onComplete = vi.fn();
      const configWithTimer: QuizConfig = {
        ...mockConfig,
        tiempoLimite: 5, // 5 segundos
      };
      render(<Quiz {...defaultProps} config={configWithTimer} onComplete={onComplete} />);

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('should_not_show_timer_when_not_configured', () => {
      render(<Quiz {...defaultProps} />);
      expect(screen.queryByTestId('quiz-timer')).not.toBeInTheDocument();
    });
  });

  describe('Verificacion y resultados', () => {
    it('should_show_submit_button_on_last_question', () => {
      render(<Quiz {...defaultProps} />);

      // Responder todas las preguntas
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('París'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('Verdadero'));

      expect(screen.getByRole('button', { name: /finalizar/i })).toBeInTheDocument();
    });

    it('should_show_results_after_submit', () => {
      render(<Quiz {...defaultProps} />);

      // Responder correctamente todas
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('París'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('Verdadero'));
      fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

      expect(screen.getByText(/3.*de.*3/)).toBeInTheDocument();
      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });

    it('should_calculate_score_correctly', () => {
      render(<Quiz {...defaultProps} />);

      // Responder 2 correctas, 1 incorrecta
      fireEvent.click(screen.getByText('4')); // Correcta
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('Madrid')); // Incorrecta
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('Verdadero')); // Correcta
      fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

      expect(screen.getByText(/2.*de.*3/)).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onProgress_when_question_answered', () => {
      const onProgress = vi.fn();
      render(<Quiz {...defaultProps} onProgress={onProgress} />);

      fireEvent.click(screen.getByText('4'));

      expect(onProgress).toHaveBeenCalled();
    });

    it('should_call_onComplete_when_quiz_finished', () => {
      const onComplete = vi.fn();
      render(<Quiz {...defaultProps} onComplete={onComplete} />);

      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('París'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('Verdadero'));
      fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          puntuacion: 100,
        }),
      );
    });
  });

  describe('Estado deshabilitado', () => {
    it('should_not_allow_selection_when_disabled', () => {
      render(<Quiz {...defaultProps} disabled />);

      const option = screen.getByText('4');
      fireEvent.click(option);

      expect(option.closest('button')).not.toHaveClass('selected');
    });
  });

  describe('Descripcion', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: QuizConfig = {
        ...mockConfig,
        descripcion: 'Tienes 10 minutos para completar',
      };
      render(<Quiz {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_submit', () => {
      const configWithRetry: QuizConfig = {
        ...mockConfig,
        permitirReintentar: true,
      };
      render(<Quiz {...defaultProps} config={configWithRetry} />);

      // Completar quiz
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('París'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('Verdadero'));
      fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_quiz_on_retry', () => {
      const configWithRetry: QuizConfig = {
        ...mockConfig,
        permitirReintentar: true,
      };
      render(<Quiz {...defaultProps} config={configWithRetry} />);

      // Completar quiz
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('París'));
      fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
      fireEvent.click(screen.getByText('Verdadero'));
      fireEvent.click(screen.getByRole('button', { name: /finalizar/i }));

      // Reintentar
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      // Debe volver a la primera pregunta
      expect(screen.getByText('¿Cuánto es 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText(/1 de 3/)).toBeInTheDocument();
    });
  });

  describe('Barra de progreso', () => {
    it('should_show_progress_bar', () => {
      render(<Quiz {...defaultProps} />);
      expect(screen.getByTestId('quiz-progress')).toBeInTheDocument();
    });

    it('should_update_progress_bar_as_questions_answered', () => {
      render(<Quiz {...defaultProps} />);

      const progressBar = screen.getByTestId('quiz-progress-fill');
      expect(progressBar).toHaveStyle({ width: '0%' });

      fireEvent.click(screen.getByText('4'));

      expect(progressBar).toHaveStyle({ width: '33%' });
    });
  });
});
