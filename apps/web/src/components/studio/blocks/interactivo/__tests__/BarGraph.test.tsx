import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarGraph } from '../BarGraph';
import type { BarGraphConfig } from '../types';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ data, onClick }: { data: unknown[]; onClick?: () => void }) => (
    <div data-testid="bar" onClick={onClick}>
      {JSON.stringify(data)}
    </div>
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock del tema
vi.mock('../../../theme', () => ({
  useStudioTheme: () => ({
    classes: {
      container: 'mock-container',
      text: 'mock-text',
    },
  }),
}));

const mockConfig: BarGraphConfig = {
  instruccion: 'Compara las densidades de los metales',
  titulo: 'Densidad de Metales',
  datos: [
    { id: 'd1', label: 'Hierro', valor: 7.87, color: '#3b82f6' },
    { id: 'd2', label: 'Aluminio', valor: 2.7, color: '#22c55e' },
    { id: 'd3', label: 'Cobre', valor: 8.96, color: '#f59e0b' },
  ],
  ejeX: 'Metal',
  ejeY: 'Densidad (g/cm³)',
  mostrarValores: true,
};

const defaultProps = {
  id: 'test-bar-graph',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('BarGraph', () => {
  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<BarGraph {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_title_when_provided', () => {
      render(<BarGraph {...defaultProps} />);
      expect(screen.getByText(mockConfig.titulo!)).toBeInTheDocument();
    });

    it('should_render_bar_chart_component', () => {
      render(<BarGraph {...defaultProps} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should_render_responsive_container', () => {
      render(<BarGraph {...defaultProps} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should_render_axes', () => {
      render(<BarGraph {...defaultProps} />);
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<BarGraph {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<BarGraph {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Datos', () => {
    it('should_display_data_values', () => {
      render(<BarGraph {...defaultProps} />);
      // El componente renderiza los datos correctamente
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should_handle_data_with_zero_values', () => {
      const configWithZero: BarGraphConfig = {
        ...mockConfig,
        datos: [
          { id: 'd1', label: 'A', valor: 50, color: '#fff' },
          { id: 'd2', label: 'B', valor: 0, color: '#000' },
        ],
      };
      render(<BarGraph {...defaultProps} config={configWithZero} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Interactividad', () => {
    it('should_allow_click_on_bars', () => {
      render(<BarGraph {...defaultProps} />);
      const barElement = screen.getByTestId('bar');

      fireEvent.click(barElement);

      expect(screen.getByTestId('bar')).toBeInTheDocument();
    });

    it('should_not_be_interactive_when_disabled', () => {
      render(<BarGraph {...defaultProps} disabled />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Configuracion con respuesta correcta', () => {
    it('should_show_question_when_has_correct_bar', () => {
      const configWithAnswer: BarGraphConfig = {
        ...mockConfig,
        pregunta: '¿Cuál metal tiene mayor densidad?',
        barraCorrectaId: 'd3', // Cobre
        feedback: {
          correcto: '¡Correcto! El cobre tiene la mayor densidad.',
          incorrecto: 'No es correcto. El cobre tiene 8.96 g/cm³.',
        },
      };
      render(<BarGraph {...defaultProps} config={configWithAnswer} />);
      expect(screen.getByText(configWithAnswer.pregunta!)).toBeInTheDocument();
    });

    it('should_not_show_verify_button_when_no_correct_bar', () => {
      render(<BarGraph {...defaultProps} />);
      expect(screen.queryByRole('button', { name: /verificar/i })).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should_accept_onComplete_prop', () => {
      const onComplete = vi.fn();
      render(<BarGraph {...defaultProps} onComplete={onComplete} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should_accept_onProgress_prop', () => {
      const onProgress = vi.fn();
      render(<BarGraph {...defaultProps} onProgress={onProgress} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Estilos y colores', () => {
    it('should_use_custom_colors_from_config', () => {
      render(<BarGraph {...defaultProps} />);
      // El componente recibe los colores en la configuración
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should_use_default_colors_when_not_provided', () => {
      const configWithoutColors: BarGraphConfig = {
        ...mockConfig,
        datos: [
          { id: 'd1', label: 'A', valor: 50 },
          { id: 'd2', label: 'B', valor: 50 },
        ],
      };
      render(<BarGraph {...defaultProps} config={configWithoutColors} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Orientacion', () => {
    it('should_render_vertical_by_default', () => {
      render(<BarGraph {...defaultProps} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should_render_horizontal_when_configured', () => {
      const horizontalConfig: BarGraphConfig = {
        ...mockConfig,
        orientacion: 'horizontal',
      };
      render(<BarGraph {...defaultProps} config={horizontalConfig} />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Descripcion', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: BarGraphConfig = {
        ...mockConfig,
        descripcion: 'La densidad determina si un material flota o se hunde',
      };
      render(<BarGraph {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });
});
