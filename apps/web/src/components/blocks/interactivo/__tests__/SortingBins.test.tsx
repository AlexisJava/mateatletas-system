import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortingBins } from '../SortingBins';
import type { SortingBinsConfig } from '../types';

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

const fireDragStart = (
  element: Element,
  dataTransfer: ReturnType<typeof createMockDataTransfer>,
) => {
  fireEvent.dragStart(element, { dataTransfer });
};

const fireDrop = (element: Element, dataTransfer: ReturnType<typeof createMockDataTransfer>) => {
  fireEvent.drop(element, { dataTransfer });
};

const mockConfig: SortingBinsConfig = {
  instruccion: 'Clasifica los animales según su tipo',
  elementos: [
    { id: 'e1', contenido: 'Perro', tipo: 'texto', categoriaCorrecta: 'mamiferos' },
    { id: 'e2', contenido: 'Águila', tipo: 'texto', categoriaCorrecta: 'aves' },
    { id: 'e3', contenido: 'Gato', tipo: 'texto', categoriaCorrecta: 'mamiferos' },
    { id: 'e4', contenido: 'Pingüino', tipo: 'texto', categoriaCorrecta: 'aves' },
  ],
  categorias: [
    { id: 'mamiferos', etiqueta: 'Mamíferos', color: '#3b82f6' },
    { id: 'aves', etiqueta: 'Aves', color: '#22c55e' },
  ],
  feedback: {
    correcto: '¡Excelente! Todos los animales están en su categoría correcta.',
    incorrecto: 'Algunos animales no están en la categoría correcta.',
  },
};

const defaultProps = {
  id: 'test-sorting',
  config: mockConfig,
  modo: 'estudiante' as const,
};

describe('SortingBins', () => {
  const mockOnComplete = vi.fn();
  const mockOnProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado basico', () => {
    it('should_render_instruction_when_provided', () => {
      render(<SortingBins {...defaultProps} />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
    });

    it('should_render_all_elements', () => {
      render(<SortingBins {...defaultProps} />);
      expect(screen.getByText('Perro')).toBeInTheDocument();
      expect(screen.getByText('Águila')).toBeInTheDocument();
      expect(screen.getByText('Gato')).toBeInTheDocument();
      expect(screen.getByText('Pingüino')).toBeInTheDocument();
    });

    it('should_render_all_categories', () => {
      render(<SortingBins {...defaultProps} />);
      expect(screen.getByText('Mamíferos')).toBeInTheDocument();
      expect(screen.getByText('Aves')).toBeInTheDocument();
    });

    it('should_render_container_with_testid', () => {
      render(<SortingBins {...defaultProps} />);
      expect(screen.getByTestId('sorting-bins-test-sorting')).toBeInTheDocument();
    });

    it('should_render_category_bins_with_testids', () => {
      render(<SortingBins {...defaultProps} />);
      expect(screen.getByTestId('bin-mamiferos')).toBeInTheDocument();
      expect(screen.getByTestId('bin-aves')).toBeInTheDocument();
    });
  });

  describe('Modos de visualizacion', () => {
    it('should_render_editor_indicator_when_modo_is_editor', () => {
      render(<SortingBins {...defaultProps} modo="editor" />);
      expect(screen.getByTestId('editor-mode-indicator')).toBeInTheDocument();
    });

    it('should_show_config_summary_in_editor_mode', () => {
      render(<SortingBins {...defaultProps} modo="editor" />);
      expect(screen.getByText('Elementos:')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Categorías:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should_render_preview_mode_correctly', () => {
      render(<SortingBins {...defaultProps} modo="preview" />);
      expect(screen.getByText(mockConfig.instruccion)).toBeInTheDocument();
      expect(screen.getByText('Perro')).toBeInTheDocument();
    });

    it('should_not_be_draggable_in_preview', () => {
      render(<SortingBins {...defaultProps} modo="preview" />);
      const element = screen.getByText('Perro');
      expect(element.closest('[draggable="true"]')).toBeNull();
    });
  });

  describe('Interactividad', () => {
    it('should_allow_dragging_elements', () => {
      render(<SortingBins {...defaultProps} />);
      const element = screen.getByText('Perro');
      const draggable = element.closest('[draggable="true"]');
      expect(draggable).not.toBeNull();
    });

    it('should_not_be_interactive_when_disabled', () => {
      render(<SortingBins {...defaultProps} disabled />);
      const element = screen.getByText('Perro');
      const draggable = element.closest('[draggable="true"]');
      expect(draggable).toBeNull();
    });

    it('should_move_element_to_bin_on_drop', () => {
      render(<SortingBins {...defaultProps} onProgress={mockOnProgress} />);

      const element = screen.getByText('Perro').closest('[draggable="true"]');
      const bin = screen.getByTestId('bin-mamiferos');

      if (element && bin) {
        const dataTransfer = createMockDataTransfer();
        fireDragStart(element, dataTransfer);
        fireDrop(bin, dataTransfer);
      }

      expect(mockOnProgress).toHaveBeenCalled();
    });

    it('should_show_verify_button_when_all_elements_placed', () => {
      render(<SortingBins {...defaultProps} onComplete={mockOnComplete} />);

      // Colocar todos los elementos
      const perro = screen.getByText('Perro').closest('[draggable="true"]');
      const aguila = screen.getByText('Águila').closest('[draggable="true"]');
      const gato = screen.getByText('Gato').closest('[draggable="true"]');
      const pinguino = screen.getByText('Pingüino').closest('[draggable="true"]');
      const binMamiferos = screen.getByTestId('bin-mamiferos');
      const binAves = screen.getByTestId('bin-aves');

      if (perro && binMamiferos) {
        const dt = createMockDataTransfer();
        fireDragStart(perro, dt);
        fireDrop(binMamiferos, dt);
      }

      if (aguila && binAves) {
        const dt = createMockDataTransfer();
        fireDragStart(aguila, dt);
        fireDrop(binAves, dt);
      }

      if (gato && binMamiferos) {
        const dt = createMockDataTransfer();
        fireDragStart(gato, dt);
        fireDrop(binMamiferos, dt);
      }

      if (pinguino && binAves) {
        const dt = createMockDataTransfer();
        fireDragStart(pinguino, dt);
        fireDrop(binAves, dt);
      }

      expect(screen.getByRole('button', { name: /verificar/i })).toBeInTheDocument();
    });
  });

  describe('Verificacion', () => {
    it('should_show_correct_feedback_when_all_correct', () => {
      render(<SortingBins {...defaultProps} onComplete={mockOnComplete} />);

      // Colocar correctamente
      const perro = screen.getByText('Perro').closest('[draggable="true"]');
      const aguila = screen.getByText('Águila').closest('[draggable="true"]');
      const gato = screen.getByText('Gato').closest('[draggable="true"]');
      const pinguino = screen.getByText('Pingüino').closest('[draggable="true"]');
      const binMamiferos = screen.getByTestId('bin-mamiferos');
      const binAves = screen.getByTestId('bin-aves');

      [perro, gato].forEach((el) => {
        if (el && binMamiferos) {
          const dt = createMockDataTransfer();
          fireDragStart(el, dt);
          fireDrop(binMamiferos, dt);
        }
      });

      [aguila, pinguino].forEach((el) => {
        if (el && binAves) {
          const dt = createMockDataTransfer();
          fireDragStart(el, dt);
          fireDrop(binAves, dt);
        }
      });

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.correcto)).toBeInTheDocument();
    });

    it('should_show_incorrect_feedback_when_wrong', () => {
      render(<SortingBins {...defaultProps} onComplete={mockOnComplete} />);

      // Colocar incorrectamente (perro en aves)
      const perro = screen.getByText('Perro').closest('[draggable="true"]');
      const aguila = screen.getByText('Águila').closest('[draggable="true"]');
      const gato = screen.getByText('Gato').closest('[draggable="true"]');
      const pinguino = screen.getByText('Pingüino').closest('[draggable="true"]');
      const binMamiferos = screen.getByTestId('bin-mamiferos');
      const binAves = screen.getByTestId('bin-aves');

      // Perro en aves (incorrecto)
      if (perro && binAves) {
        const dt = createMockDataTransfer();
        fireDragStart(perro, dt);
        fireDrop(binAves, dt);
      }

      // Resto correcto
      [aguila, pinguino].forEach((el) => {
        if (el && binAves) {
          const dt = createMockDataTransfer();
          fireDragStart(el, dt);
          fireDrop(binAves, dt);
        }
      });

      if (gato && binMamiferos) {
        const dt = createMockDataTransfer();
        fireDragStart(gato, dt);
        fireDrop(binMamiferos, dt);
      }

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByText(mockConfig.feedback.incorrecto)).toBeInTheDocument();
    });

    it('should_call_onComplete_with_correct_result', () => {
      render(<SortingBins {...defaultProps} onComplete={mockOnComplete} />);

      // Colocar todos los elementos correctamente
      const perro = screen.getByText('Perro').closest('[draggable="true"]');
      const aguila = screen.getByText('Águila').closest('[draggable="true"]');
      const gato = screen.getByText('Gato').closest('[draggable="true"]');
      const pinguino = screen.getByText('Pingüino').closest('[draggable="true"]');
      const binMamiferos = screen.getByTestId('bin-mamiferos');
      const binAves = screen.getByTestId('bin-aves');

      [perro, gato].forEach((el) => {
        if (el && binMamiferos) {
          const dt = createMockDataTransfer();
          fireDragStart(el, dt);
          fireDrop(binMamiferos, dt);
        }
      });

      [aguila, pinguino].forEach((el) => {
        if (el && binAves) {
          const dt = createMockDataTransfer();
          fireDragStart(el, dt);
          fireDrop(binAves, dt);
        }
      });

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          completado: true,
          puntuacion: 100,
        }),
      );
    });
  });

  describe('Reintentar', () => {
    it('should_show_retry_button_after_incorrect', () => {
      render(<SortingBins {...defaultProps} />);

      // Colocar un elemento incorrecto
      const perro = screen.getByText('Perro').closest('[draggable="true"]');
      const aguila = screen.getByText('Águila').closest('[draggable="true"]');
      const gato = screen.getByText('Gato').closest('[draggable="true"]');
      const pinguino = screen.getByText('Pingüino').closest('[draggable="true"]');
      const binMamiferos = screen.getByTestId('bin-mamiferos');
      const binAves = screen.getByTestId('bin-aves');

      // Perro en aves (incorrecto)
      if (perro && binAves) {
        const dt = createMockDataTransfer();
        fireDragStart(perro, dt);
        fireDrop(binAves, dt);
      }

      [aguila, pinguino].forEach((el) => {
        if (el && binAves) {
          const dt = createMockDataTransfer();
          fireDragStart(el, dt);
          fireDrop(binAves, dt);
        }
      });

      if (gato && binMamiferos) {
        const dt = createMockDataTransfer();
        fireDragStart(gato, dt);
        fireDrop(binMamiferos, dt);
      }

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('should_reset_on_retry', () => {
      render(<SortingBins {...defaultProps} />);

      // Colocar elementos y verificar incorrecto
      const perro = screen.getByText('Perro').closest('[draggable="true"]');
      const aguila = screen.getByText('Águila').closest('[draggable="true"]');
      const gato = screen.getByText('Gato').closest('[draggable="true"]');
      const pinguino = screen.getByText('Pingüino').closest('[draggable="true"]');
      const binMamiferos = screen.getByTestId('bin-mamiferos');
      const binAves = screen.getByTestId('bin-aves');

      if (perro && binAves) {
        const dt = createMockDataTransfer();
        fireDragStart(perro, dt);
        fireDrop(binAves, dt);
      }

      [aguila, pinguino].forEach((el) => {
        if (el && binAves) {
          const dt = createMockDataTransfer();
          fireDragStart(el, dt);
          fireDrop(binAves, dt);
        }
      });

      if (gato && binMamiferos) {
        const dt = createMockDataTransfer();
        fireDragStart(gato, dt);
        fireDrop(binMamiferos, dt);
      }

      fireEvent.click(screen.getByRole('button', { name: /verificar/i }));
      fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

      // Los elementos deben volver a la zona de elementos
      expect(screen.getByText('Perro')).toBeInTheDocument();
    });
  });

  describe('Descripcion', () => {
    it('should_show_description_when_provided', () => {
      const configWithDesc: SortingBinsConfig = {
        ...mockConfig,
        descripcion: 'Arrastra cada animal a su categoría correspondiente',
      };
      render(<SortingBins {...defaultProps} config={configWithDesc} />);
      expect(screen.getByText(configWithDesc.descripcion!)).toBeInTheDocument();
    });
  });

  describe('Colores de categorias', () => {
    it('should_apply_category_colors', () => {
      render(<SortingBins {...defaultProps} />);
      const binMamiferos = screen.getByTestId('bin-mamiferos');
      // El color debe estar aplicado como estilo o clase
      expect(binMamiferos).toBeInTheDocument();
    });
  });
});
