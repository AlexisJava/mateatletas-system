import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DragAndDrop } from '../DragAndDrop';
import { StudioThemeProvider } from '../../../theme';
import type { DragAndDropConfig } from '../types';

// Helper to create mock DataTransfer for drag events
const createMockDataTransfer = () => {
  let data: Record<string, string> = {};
  return {
    setData: (format: string, value: string) => {
      data[format] = value;
    },
    getData: (format: string) => data[format] || '',
    clearData: () => {
      data = {};
    },
    dropEffect: 'none' as DataTransfer['dropEffect'],
    effectAllowed: 'all' as DataTransfer['effectAllowed'],
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [] as string[],
    setDragImage: vi.fn(),
  };
};

// Helper to fire drag events with proper dataTransfer
const fireDragStart = (
  element: Element,
  dataTransfer: ReturnType<typeof createMockDataTransfer>,
) => {
  fireEvent.dragStart(element, { dataTransfer });
};

const fireDrop = (element: Element, dataTransfer: ReturnType<typeof createMockDataTransfer>) => {
  fireEvent.drop(element, { dataTransfer });
};

const mockConfig: DragAndDropConfig = {
  instruccion: 'Arrastra cada número a su categoría correcta',
  elementos: [
    { id: 'e1', contenido: '2', tipo: 'texto', zonaCorrecta: 'pares' },
    { id: 'e2', contenido: '3', tipo: 'texto', zonaCorrecta: 'impares' },
    { id: 'e3', contenido: '4', tipo: 'texto', zonaCorrecta: 'pares' },
  ],
  zonas: [
    { id: 'pares', etiqueta: 'Números Pares', aceptaMultiples: true },
    { id: 'impares', etiqueta: 'Números Impares', aceptaMultiples: true },
  ],
  feedback: {
    correcto: '¡Excelente! Todos los números están en su lugar.',
    incorrecto: 'Algunos números no están en la categoría correcta.',
  },
};

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<StudioThemeProvider>{ui}</StudioThemeProvider>);
};

describe('DragAndDrop', () => {
  const mockOnComplete = vi.fn();
  const mockOnProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('modo preview', () => {
    it('should_render_instruction', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="preview" />);

      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_all_elements', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="preview" />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should_render_all_zones', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="preview" />);

      expect(screen.getByText('Números Pares')).toBeInTheDocument();
      expect(screen.getByText('Números Impares')).toBeInTheDocument();
    });

    it('should_not_be_interactive_in_preview', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="preview" />);

      // Los elementos no deben ser arrastrables en preview
      const element = screen.getByText('2');
      expect(element.closest('[draggable="true"]')).toBeNull();
    });
  });

  describe('modo estudiante', () => {
    it('should_allow_dragging_elements', () => {
      renderWithTheme(
        <DragAndDrop
          id="test-1"
          config={mockConfig}
          modo="estudiante"
          onComplete={mockOnComplete}
          onProgress={mockOnProgress}
        />,
      );

      const element = screen.getByText('2');
      const draggable = element.closest('[draggable="true"]');
      expect(draggable).not.toBeNull();
    });

    it('should_show_verify_button', () => {
      renderWithTheme(
        <DragAndDrop
          id="test-1"
          config={mockConfig}
          modo="estudiante"
          onComplete={mockOnComplete}
        />,
      );

      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });

    it('should_call_onProgress_when_element_dropped', () => {
      renderWithTheme(
        <DragAndDrop
          id="test-1"
          config={mockConfig}
          modo="estudiante"
          onProgress={mockOnProgress}
        />,
      );

      // Simular drag and drop con dataTransfer mock
      const element = screen.getByText('2').closest('[draggable="true"]');
      const zone = screen.getByTestId('dropzone-pares');

      if (element && zone) {
        const dataTransfer = createMockDataTransfer();
        fireDragStart(element, dataTransfer);
        fireEvent.dragOver(zone);
        fireDrop(zone, dataTransfer);
      }

      expect(mockOnProgress).toHaveBeenCalled();
    });

    it('should_show_feedback_after_verification', () => {
      renderWithTheme(
        <DragAndDrop
          id="test-1"
          config={mockConfig}
          modo="estudiante"
          onComplete={mockOnComplete}
        />,
      );

      // Colocar elementos y verificar
      const element = screen.getByText('2').closest('[draggable="true"]');
      const zone = screen.getByTestId('dropzone-pares');

      if (element && zone) {
        const dataTransfer = createMockDataTransfer();
        fireDragStart(element, dataTransfer);
        fireDrop(zone, dataTransfer);
      }

      const verifyButton = screen.getByRole('button', { name: /verificar/i });
      fireEvent.click(verifyButton);

      // Debe mostrar algún feedback (correcto o incorrecto)
      const feedbackElements = document.querySelectorAll('.bg-green-100, .bg-red-100');
      expect(feedbackElements.length).toBeGreaterThan(0);
    });

    it('should_call_onComplete_when_all_correct', () => {
      renderWithTheme(
        <DragAndDrop
          id="test-1"
          config={mockConfig}
          modo="estudiante"
          onComplete={mockOnComplete}
        />,
      );

      // Colocar todos los elementos correctamente
      const el2 = screen.getByText('2').closest('[draggable="true"]');
      const el3 = screen.getByText('3').closest('[draggable="true"]');
      const el4 = screen.getByText('4').closest('[draggable="true"]');
      const zonePares = screen.getByTestId('dropzone-pares');
      const zoneImpares = screen.getByTestId('dropzone-impares');

      // Colocar 2 en pares
      if (el2 && zonePares) {
        const dt1 = createMockDataTransfer();
        fireDragStart(el2, dt1);
        fireDrop(zonePares, dt1);
      }

      // Colocar 3 en impares
      if (el3 && zoneImpares) {
        const dt2 = createMockDataTransfer();
        fireDragStart(el3, dt2);
        fireDrop(zoneImpares, dt2);
      }

      // Colocar 4 en pares
      if (el4 && zonePares) {
        const dt3 = createMockDataTransfer();
        fireDragStart(el4, dt3);
        fireDrop(zonePares, dt3);
      }

      // Verificar
      const verifyButton = screen.getByRole('button', { name: /verificar/i });
      fireEvent.click(verifyButton);

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
        }),
      );
    });

    it('should_disable_when_disabled_prop_is_true', () => {
      renderWithTheme(
        <DragAndDrop id="test-1" config={mockConfig} modo="estudiante" disabled={true} />,
      );

      const element = screen.getByText('2');
      const draggable = element.closest('[draggable="true"]');
      expect(draggable).toBeNull();
    });
  });

  describe('modo editor', () => {
    it('should_show_edit_indicator', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="editor" />);

      // En modo editor debe mostrar algún indicador de edición
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_display_config_summary', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="editor" />);

      // Debe mostrar resumen de la configuración
      expect(screen.getByText(/3 elementos/i)).toBeInTheDocument();
      expect(screen.getByText(/2 zonas/i)).toBeInTheDocument();
    });
  });

  describe('intentos y límites', () => {
    it('should_track_attempts', () => {
      const configWithLimit: DragAndDropConfig = {
        ...mockConfig,
        intentosMaximos: 3,
      };

      renderWithTheme(
        <DragAndDrop
          id="test-1"
          config={configWithLimit}
          modo="estudiante"
          onComplete={mockOnComplete}
        />,
      );

      // Verificar varias veces con respuestas incorrectas
      const verifyButton = screen.getByRole('button', { name: /verificar/i });

      fireEvent.click(verifyButton);
      expect(screen.getByText(/intento 1/i)).toBeInTheDocument();
    });

    it('should_show_correct_answers_after_max_attempts', () => {
      const configWithShowAnswers: DragAndDropConfig = {
        ...mockConfig,
        intentosMaximos: 2,
        mostrarRespuestasTras: 2,
      };

      renderWithTheme(
        <DragAndDrop
          id="test-1"
          config={configWithShowAnswers}
          modo="estudiante"
          onComplete={mockOnComplete}
        />,
      );

      const verifyButton = screen.getByRole('button', { name: /verificar/i });

      // Primer intento
      fireEvent.click(verifyButton);

      // Segundo intento (debe mostrar respuestas)
      const retryButton = screen.getByRole('button', { name: /intentar/i });
      fireEvent.click(retryButton);
      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      // Debe mostrar las respuestas correctas
      expect(screen.getByTestId('correct-answers')).toBeInTheDocument();
    });
  });

  describe('accesibilidad', () => {
    it('should_have_accessible_drop_zones', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="estudiante" />);

      const zones = screen.getAllByRole('region');
      expect(zones.length).toBeGreaterThan(0);
    });

    it('should_announce_drop_results', () => {
      renderWithTheme(<DragAndDrop id="test-1" config={mockConfig} modo="estudiante" />);

      // Debe tener aria-live para anuncios
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
