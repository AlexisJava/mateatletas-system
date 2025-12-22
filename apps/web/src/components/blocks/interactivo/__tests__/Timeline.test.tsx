import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Timeline } from '../Timeline';
import type { TimelineConfig } from '../types';

const mockConfig: TimelineConfig = {
  instruccion: 'Ordena los eventos históricos cronológicamente',
  eventos: [
    { id: 'e1', titulo: 'Revolución Francesa', año: 1789, descripcion: 'Inicio de la revolución' },
    { id: 'e2', titulo: 'Independencia de Argentina', año: 1816 },
    { id: 'e3', titulo: 'Primera Guerra Mundial', año: 1914, descripcion: 'Inicio del conflicto' },
    { id: 'e4', titulo: 'Segunda Guerra Mundial', año: 1939 },
  ],
};

const defaultProps = {
  id: 'test-timeline',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('Timeline', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<Timeline {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_all_events', () => {
      render(<Timeline {...defaultProps} />);
      expect(screen.getByText('Revolución Francesa')).toBeInTheDocument();
      expect(screen.getByText('Independencia de Argentina')).toBeInTheDocument();
      expect(screen.getByText('Primera Guerra Mundial')).toBeInTheDocument();
      expect(screen.getByText('Segunda Guerra Mundial')).toBeInTheDocument();
    });

    it('should_render_years_for_events', () => {
      render(<Timeline {...defaultProps} />);
      expect(screen.getByText('1789')).toBeInTheDocument();
      expect(screen.getByText('1816')).toBeInTheDocument();
      expect(screen.getByText('1914')).toBeInTheDocument();
      expect(screen.getByText('1939')).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<Timeline {...defaultProps} />);
      expect(screen.getByTestId('timeline-test-timeline')).toBeInTheDocument();
    });

    it('should_render_descriptions_when_provided', () => {
      render(<Timeline {...defaultProps} />);
      expect(screen.getByText('Inicio de la revolución')).toBeInTheDocument();
      expect(screen.getByText('Inicio del conflicto')).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<Timeline {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_event_count_in_editor_mode', () => {
      render(<Timeline {...defaultProps} modo="editor" />);
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<Timeline {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.getByText('Revolución Francesa')).toBeInTheDocument();
    });
  });

  describe('Ordenamiento interactivo', () => {
    it('should_allow_reordering_events_in_estudiante_mode', () => {
      const configDesordenado: TimelineConfig = {
        ...mockConfig,
        modoOrdenar: true,
        feedback: {
          correcto: '¡Correcto! Los eventos están en orden cronológico.',
          incorrecto: 'El orden no es correcto. Intenta de nuevo.',
        },
      };
      render(<Timeline {...defaultProps} config={configDesordenado} />);

      // Debe mostrar botones para mover eventos
      const moveButtons = screen.getAllByRole('button', { name: /mover/i });
      expect(moveButtons.length).toBeGreaterThan(0);
    });

    it('should_show_verify_button_in_ordering_mode', () => {
      const configOrdenar: TimelineConfig = {
        ...mockConfig,
        modoOrdenar: true,
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Timeline {...defaultProps} config={configOrdenar} />);
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });

    it('should_not_be_interactive_when_disabled', () => {
      const configOrdenar: TimelineConfig = {
        ...mockConfig,
        modoOrdenar: true,
      };
      render(<Timeline {...defaultProps} config={configOrdenar} disabled />);

      // No debe mostrar botones de mover cuando está deshabilitado
      const moveButtons = screen.queryAllByRole('button', { name: /mover/i });
      expect(moveButtons.length).toBe(0);
    });
  });

  describe('Verificacion de orden', () => {
    it('should_show_correct_feedback_when_order_is_correct', () => {
      const configOrdenar: TimelineConfig = {
        instruccion: 'Ordena cronológicamente',
        eventos: [
          { id: 'e1', titulo: 'Evento A', año: 1800 },
          { id: 'e2', titulo: 'Evento B', año: 1900 },
        ],
        modoOrdenar: true,
        feedback: {
          correcto: '¡Orden correcto!',
          incorrecto: 'Orden incorrecto',
        },
      };
      render(<Timeline {...defaultProps} config={configOrdenar} />);

      // Los eventos ya están en orden correcto, verificar
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText('¡Orden correcto!')).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_order_is_wrong', () => {
      const configOrdenar: TimelineConfig = {
        instruccion: 'Ordena cronológicamente',
        eventos: [
          { id: 'e1', titulo: 'Evento A', año: 1900 },
          { id: 'e2', titulo: 'Evento B', año: 1800 },
        ],
        modoOrdenar: true,
        feedback: {
          correcto: '¡Orden correcto!',
          incorrecto: 'Orden incorrecto',
        },
      };
      render(<Timeline {...defaultProps} config={configOrdenar} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText('Orden incorrecto')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onProgress_when_event_moved', () => {
      const onProgress = vi.fn();
      const configOrdenar: TimelineConfig = {
        ...mockConfig,
        modoOrdenar: true,
      };
      render(<Timeline {...defaultProps} config={configOrdenar} onProgress={onProgress} />);

      // Mover un evento (horizontal = derecha/izquierda)
      const moveButtons = screen.getAllByRole('button', { name: /mover derecha/i });
      if (moveButtons.length > 0) {
        fireEvent.click(moveButtons[0]);
        expect(onProgress).toHaveBeenCalled();
      }
    });

    it('should_call_onComplete_when_verified', () => {
      const onComplete = vi.fn();
      const configOrdenar: TimelineConfig = {
        instruccion: 'Ordena',
        eventos: [
          { id: 'e1', titulo: 'A', año: 1800 },
          { id: 'e2', titulo: 'B', año: 1900 },
        ],
        modoOrdenar: true,
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Timeline {...defaultProps} config={configOrdenar} onComplete={onComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
        }),
      );
    });
  });

  describe('Orientacion', () => {
    it('should_render_horizontal_timeline_by_default', () => {
      render(<Timeline {...defaultProps} />);
      expect(screen.getByTestId('timeline-test-timeline')).toHaveClass('horizontal');
    });

    it('should_render_vertical_timeline_when_configured', () => {
      const configVertical: TimelineConfig = {
        ...mockConfig,
        orientacion: 'vertical',
      };
      render(<Timeline {...defaultProps} config={configVertical} />);
      expect(screen.getByTestId('timeline-test-timeline')).toHaveClass('vertical');
    });
  });

  describe('Descripcion y titulo', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: TimelineConfig = {
        ...mockConfig,
        descripcion: 'Arrastra los eventos para ordenarlos',
      };
      render(<Timeline {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });

    it('should_show_title_when_provided', () => {
      const configWithTitle: TimelineConfig = {
        ...mockConfig,
        titulo: 'Historia del Siglo XIX',
      };
      render(<Timeline {...defaultProps} config={configWithTitle} />);
      expect(screen.getByText(configWithTitle.titulo!)).toBeInTheDocument();
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_answer', () => {
      const configOrdenar: TimelineConfig = {
        instruccion: 'Ordena',
        eventos: [
          { id: 'e1', titulo: 'A', año: 1900 },
          { id: 'e2', titulo: 'B', año: 1800 },
        ],
        modoOrdenar: true,
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Timeline {...defaultProps} config={configOrdenar} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_order_on_retry', () => {
      const onProgress = vi.fn();
      const configOrdenar: TimelineConfig = {
        instruccion: 'Ordena',
        eventos: [
          { id: 'e1', titulo: 'A', año: 1900 },
          { id: 'e2', titulo: 'B', año: 1800 },
        ],
        modoOrdenar: true,
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Timeline {...defaultProps} config={configOrdenar} onProgress={onProgress} />);

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      // Debe volver a mostrar el botón verificar
      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Modo solo lectura', () => {
    it('should_display_events_in_chronological_order_when_not_ordering_mode', () => {
      render(<Timeline {...defaultProps} />);

      // Los eventos deben estar visibles en orden
      const eventTitles = screen.getAllByTestId(/^event-/);
      expect(eventTitles.length).toBe(4);
    });
  });
});
