import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Hotspot } from '../Hotspot';
import type { HotspotConfig } from '../types';

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: HotspotConfig = {
  instruccion: 'Identifica las partes de la célula',
  imagenUrl: '/images/celula.png',
  imagenAlt: 'Diagrama de una célula',
  zonas: [
    {
      id: 'z1',
      label: 'Núcleo',
      x: 50,
      y: 50,
      ancho: 20,
      alto: 20,
      forma: 'circulo',
    },
    {
      id: 'z2',
      label: 'Mitocondria',
      x: 30,
      y: 70,
      ancho: 15,
      alto: 10,
      forma: 'rectangulo',
    },
    {
      id: 'z3',
      label: 'Membrana',
      x: 10,
      y: 50,
      ancho: 80,
      alto: 5,
      forma: 'rectangulo',
    },
  ],
};

const defaultProps = {
  id: 'test-hotspot',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('Hotspot', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<Hotspot {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_image_with_alt_text', () => {
      render(<Hotspot {...defaultProps} />);
      const img = screen.getByAltText(mockConfig.imagenAlt);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockConfig.imagenUrl);
    });

    it('should_render_all_hotspot_zones', () => {
      render(<Hotspot {...defaultProps} />);
      expect(screen.getByTestId('zona-z1')).toBeInTheDocument();
      expect(screen.getByTestId('zona-z2')).toBeInTheDocument();
      expect(screen.getByTestId('zona-z3')).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<Hotspot {...defaultProps} />);
      expect(screen.getByTestId('hotspot-test-hotspot')).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<Hotspot {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_zone_labels_in_editor_mode', () => {
      render(<Hotspot {...defaultProps} modo="editor" />);
      expect(screen.getByText('Núcleo')).toBeInTheDocument();
      expect(screen.getByText('Mitocondria')).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<Hotspot {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.getByAltText(mockConfig.imagenAlt)).toBeInTheDocument();
    });
  });

  describe('Interactividad', () => {
    it('should_highlight_zone_on_click', () => {
      render(<Hotspot {...defaultProps} />);
      const zona = screen.getByTestId('zona-z1');

      fireEvent.click(zona);

      expect(zona).toHaveClass('selected');
    });

    it('should_show_tooltip_on_zone_hover', () => {
      render(<Hotspot {...defaultProps} />);
      const zona = screen.getByTestId('zona-z1');

      fireEvent.mouseEnter(zona);

      expect(screen.getByText('Núcleo')).toBeInTheDocument();
    });

    it('should_not_be_interactive_when_disabled', () => {
      render(<Hotspot {...defaultProps} disabled />);
      const zona = screen.getByTestId('zona-z1');

      fireEvent.click(zona);

      expect(zona).not.toHaveClass('selected');
    });

    it('should_allow_multiple_zone_selection_when_configured', () => {
      const multiConfig: HotspotConfig = {
        ...mockConfig,
        seleccionMultiple: true,
      };
      render(<Hotspot {...defaultProps} config={multiConfig} />);

      fireEvent.click(screen.getByTestId('zona-z1'));
      fireEvent.click(screen.getByTestId('zona-z2'));

      expect(screen.getByTestId('zona-z1')).toHaveClass('selected');
      expect(screen.getByTestId('zona-z2')).toHaveClass('selected');
    });

    it('should_deselect_previous_when_single_selection', () => {
      render(<Hotspot {...defaultProps} />);

      fireEvent.click(screen.getByTestId('zona-z1'));
      fireEvent.click(screen.getByTestId('zona-z2'));

      expect(screen.getByTestId('zona-z1')).not.toHaveClass('selected');
      expect(screen.getByTestId('zona-z2')).toHaveClass('selected');
    });
  });

  describe('Configuracion con respuesta correcta', () => {
    it('should_show_question_when_has_correct_zones', () => {
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        pregunta: '¿Dónde se encuentra el material genético?',
        zonasCorrectasIds: ['z1'],
        feedback: {
          correcto: '¡Correcto! El núcleo contiene el ADN.',
          incorrecto: 'No es correcto. Busca el núcleo.',
        },
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} />);
      expect(screen.getByText(configWithAnswer.pregunta!)).toBeInTheDocument();
    });

    it('should_show_verify_button_when_zone_selected', () => {
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        zonasCorrectasIds: ['z1'],
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} />);

      fireEvent.click(screen.getByTestId('zona-z1'));

      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });

    it('should_show_correct_feedback_when_correct_zone_selected', () => {
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        zonasCorrectasIds: ['z1'],
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} />);

      fireEvent.click(screen.getByTestId('zona-z1'));
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_wrong_zone_selected', () => {
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        zonasCorrectasIds: ['z1'],
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} />);

      fireEvent.click(screen.getByTestId('zona-z2'));
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText('Incorrecto')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_call_onProgress_when_zone_selected', () => {
      const onProgress = vi.fn();
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        zonasCorrectasIds: ['z1'],
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} onProgress={onProgress} />);

      fireEvent.click(screen.getByTestId('zona-z1'));

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('should_call_onComplete_when_verified', () => {
      const onComplete = vi.fn();
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        zonasCorrectasIds: ['z1'],
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} onComplete={onComplete} />);

      fireEvent.click(screen.getByTestId('zona-z1'));
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          puntuacion: 100,
        }),
      );
    });
  });

  describe('Formas de zonas', () => {
    it('should_render_circular_zones', () => {
      render(<Hotspot {...defaultProps} />);
      const zona = screen.getByTestId('zona-z1');
      expect(zona).toHaveClass('rounded-full');
    });

    it('should_render_rectangular_zones', () => {
      render(<Hotspot {...defaultProps} />);
      const zona = screen.getByTestId('zona-z2');
      expect(zona).toHaveClass('rounded');
    });
  });

  describe('Descripcion', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: HotspotConfig = {
        ...mockConfig,
        descripcion: 'Haz clic en las diferentes partes para aprender más',
      };
      render(<Hotspot {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Tooltip personalizado', () => {
    it('should_show_zone_description_in_tooltip', () => {
      const configWithTooltips: HotspotConfig = {
        ...mockConfig,
        zonas: [
          {
            id: 'z1',
            label: 'Núcleo',
            descripcion: 'Centro de control de la célula',
            x: 50,
            y: 50,
            ancho: 20,
            alto: 20,
            forma: 'circulo',
          },
        ],
      };
      render(<Hotspot {...defaultProps} config={configWithTooltips} />);

      fireEvent.mouseEnter(screen.getByTestId('zona-z1'));

      expect(screen.getByText('Centro de control de la célula')).toBeInTheDocument();
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect_answer', () => {
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        zonasCorrectasIds: ['z1'],
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} />);

      fireEvent.click(screen.getByTestId('zona-z2'));
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_selection_on_retry', () => {
      const configWithAnswer: HotspotConfig = {
        ...mockConfig,
        zonasCorrectasIds: ['z1'],
        feedback: {
          correcto: '¡Correcto!',
          incorrecto: 'Incorrecto',
        },
      };
      render(<Hotspot {...defaultProps} config={configWithAnswer} />);

      fireEvent.click(screen.getByTestId('zona-z2'));
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      expect(screen.getByTestId('zona-z2')).not.toHaveClass('selected');
    });
  });
});
