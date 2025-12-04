import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressTracker } from '../ProgressTracker';
import type { ProgressTrackerConfig } from '../types';

const mockConfig: ProgressTrackerConfig = {
  instruccion: 'Tu progreso en la lección',
  titulo: 'Progreso',
  pasos: [
    { id: 'p1', titulo: 'Introducción', completado: true },
    { id: 'p2', titulo: 'Ejercicio 1', completado: true },
    { id: 'p3', titulo: 'Ejercicio 2', completado: false },
    { id: 'p4', titulo: 'Evaluación', completado: false },
  ],
};

const defaultProps = {
  id: 'test-progress',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('ProgressTracker', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_title_when_provided', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByText(mockConfig.titulo!)).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByTestId('progress-tracker-test-progress')).toBeInTheDocument();
    });

    it('should_render_all_steps', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByText('Introducción')).toBeInTheDocument();
      expect(screen.getByText('Ejercicio 1')).toBeInTheDocument();
      expect(screen.getByText('Ejercicio 2')).toBeInTheDocument();
      expect(screen.getByText('Evaluación')).toBeInTheDocument();
    });

    it('should_render_progress_bar', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<ProgressTracker {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_step_count_in_editor_mode', () => {
      render(<ProgressTracker {...defaultProps} modo="editor" />);
      expect(screen.getByText(/4 pasos/)).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<ProgressTracker {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });
  });

  describe('Estados de pasos', () => {
    it('should_show_completed_steps_with_checkmark', () => {
      render(<ProgressTracker {...defaultProps} />);
      const step1 = screen.getByTestId('step-p1');
      const step2 = screen.getByTestId('step-p2');

      expect(step1).toHaveClass('completed');
      expect(step2).toHaveClass('completed');
    });

    it('should_show_pending_steps_without_checkmark', () => {
      render(<ProgressTracker {...defaultProps} />);
      const step3 = screen.getByTestId('step-p3');
      const step4 = screen.getByTestId('step-p4');

      expect(step3).not.toHaveClass('completed');
      expect(step4).not.toHaveClass('completed');
    });

    it('should_highlight_current_step', () => {
      const configWithCurrent: ProgressTrackerConfig = {
        ...mockConfig,
        pasoActual: 'p3',
      };
      render(<ProgressTracker {...defaultProps} config={configWithCurrent} />);
      const step3 = screen.getByTestId('step-p3');

      expect(step3).toHaveClass('current');
    });
  });

  describe('Calculo de progreso', () => {
    it('should_calculate_progress_percentage_correctly', () => {
      render(<ProgressTracker {...defaultProps} />);
      const progressFill = screen.getByTestId('progress-fill');
      // 2 de 4 completados = 50%
      expect(progressFill).toHaveStyle({ width: '50%' });
    });

    it('should_display_percentage_text', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should_show_0_percent_when_no_steps_completed', () => {
      const configNoProgress: ProgressTrackerConfig = {
        ...mockConfig,
        pasos: mockConfig.pasos.map((p) => ({ ...p, completado: false })),
      };
      render(<ProgressTracker {...defaultProps} config={configNoProgress} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should_show_100_percent_when_all_steps_completed', () => {
      const configComplete: ProgressTrackerConfig = {
        ...mockConfig,
        pasos: mockConfig.pasos.map((p) => ({ ...p, completado: true })),
      };
      render(<ProgressTracker {...defaultProps} config={configComplete} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Contador de pasos', () => {
    it('should_display_step_counter', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByText(/2 de 4/)).toBeInTheDocument();
    });
  });

  describe('Orientacion', () => {
    it('should_render_horizontal_by_default', () => {
      render(<ProgressTracker {...defaultProps} />);
      expect(screen.getByTestId('progress-tracker-test-progress')).toHaveClass('horizontal');
    });

    it('should_render_vertical_when_configured', () => {
      const configVertical: ProgressTrackerConfig = {
        ...mockConfig,
        orientacion: 'vertical',
      };
      render(<ProgressTracker {...defaultProps} config={configVertical} />);
      expect(screen.getByTestId('progress-tracker-test-progress')).toHaveClass('vertical');
    });
  });

  describe('Descripciones de pasos', () => {
    it('should_show_step_description_when_provided', () => {
      const configWithDesc: ProgressTrackerConfig = {
        instruccion: 'Tu progreso',
        pasos: [
          {
            id: 'p1',
            titulo: 'Intro',
            descripcion: 'Aprende los conceptos básicos',
            completado: true,
          },
        ],
      };
      render(<ProgressTracker {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText('Aprende los conceptos básicos')).toBeInTheDocument();
    });
  });

  describe('Descripcion general', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: ProgressTrackerConfig = {
        ...mockConfig,
        descripcion: 'Completa todos los pasos para terminar la lección',
      };
      render(<ProgressTracker {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Modo compacto', () => {
    it('should_render_compact_mode_when_configured', () => {
      const configCompact: ProgressTrackerConfig = {
        ...mockConfig,
        modoCompacto: true,
      };
      render(<ProgressTracker {...defaultProps} config={configCompact} />);
      expect(screen.getByTestId('progress-tracker-test-progress')).toHaveClass('compact');
    });

    it('should_only_show_progress_bar_in_compact_mode', () => {
      const configCompact: ProgressTrackerConfig = {
        ...mockConfig,
        modoCompacto: true,
      };
      render(<ProgressTracker {...defaultProps} config={configCompact} />);
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      // Los títulos de pasos no deberían mostrarse
      expect(screen.queryByText('Introducción')).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onProgress_with_current_percentage', () => {
      const onProgress = vi.fn();
      render(<ProgressTracker {...defaultProps} onProgress={onProgress} />);

      // Debería llamar onProgress con el progreso inicial
      expect(onProgress).toHaveBeenCalledWith(50);
    });
  });
});
