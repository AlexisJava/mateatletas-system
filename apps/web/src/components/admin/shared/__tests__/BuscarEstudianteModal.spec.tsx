import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuscarEstudianteModal } from '../BuscarEstudianteModal';

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock del módulo de API
vi.mock('@/lib/api/admin.api', () => ({
  getAllEstudiantes: vi.fn(),
}));

import { getAllEstudiantes } from '@/lib/api/admin.api';

const mockEstudiantes = [
  {
    id: 'est-1',
    nombre: 'María',
    apellido: 'García',
    edad: 10,
    tutor: { id: 'tutor-1', nombre: 'Carlos', apellido: 'García' },
  },
  {
    id: 'est-2',
    nombre: 'Juan',
    apellido: 'Pérez',
    edad: 12,
    tutor: { id: 'tutor-2', nombre: 'Ana', apellido: 'Pérez' },
  },
  {
    id: 'est-3',
    nombre: 'Lucía',
    apellido: 'López',
    edad: 8,
    tutor: null,
  },
];

describe('BuscarEstudianteModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Renderizado', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      render(
        <BuscarEstudianteModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      expect(screen.queryByText('Buscar Estudiante')).not.toBeInTheDocument();
    });

    it('renderiza el modal cuando isOpen es true', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: mockEstudiantes, total: 3 });

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      expect(screen.getByText('Buscar Estudiante')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Buscar por nombre, apellido...')).toBeInTheDocument();
    });

    it('muestra loading mientras busca', async () => {
      vi.mocked(getAllEstudiantes).mockImplementation(() => new Promise(() => {}));

      const { container } = render(
        <BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('muestra estudiantes cuando carga', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: mockEstudiantes, total: 3 });

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('María García')).toBeInTheDocument();
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('Lucía López')).toBeInTheDocument();
      });
    });

    it('muestra información del tutor cuando existe', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: mockEstudiantes, total: 3 });

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText(/Tutor: Carlos García/)).toBeInTheDocument();
      });
    });
  });

  describe('Búsqueda', () => {
    it('busca al cambiar el texto de búsqueda', async () => {
      const user = userEvent.setup();
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: mockEstudiantes, total: 3 });

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(getAllEstudiantes).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Buscar por nombre, apellido...');
      await user.type(searchInput, 'María');

      await waitFor(() => {
        expect(getAllEstudiantes).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'María' }),
        );
      });
    });

    it('muestra mensaje cuando no hay resultados', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: [], total: 0 });

      const user = userEvent.setup();

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      const searchInput = screen.getByPlaceholderText('Buscar por nombre, apellido...');
      await user.type(searchInput, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('No se encontraron estudiantes')).toBeInTheDocument();
      });
    });
  });

  describe('Selección', () => {
    it('llama onSelect al hacer click en un estudiante', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: mockEstudiantes, total: 3 });
      mockOnSelect.mockResolvedValue(undefined);

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('María García')).toBeInTheDocument();
      });

      const estudianteButton = screen.getByText('María García').closest('button');
      fireEvent.click(estudianteButton!);

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith('est-1');
      });
    });
  });

  describe('Filtro excludeIds', () => {
    it('filtra estudiantes ya inscriptos', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: mockEstudiantes, total: 3 });

      render(
        <BuscarEstudianteModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          excludeIds={['est-1', 'est-2']}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Lucía López')).toBeInTheDocument();
      });

      expect(screen.queryByText('María García')).not.toBeInTheDocument();
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    });
  });

  describe('Cerrar modal', () => {
    it('llama onClose al hacer click en el botón Cancelar', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: [], total: 0 });

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('llama onClose al hacer click en el backdrop', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: [], total: 0 });

      const { container } = render(
        <BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // El backdrop tiene clases específicas
      const backdrop = container.querySelector('.bg-black\\/50');
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resetea estado al cerrar y reabrir', async () => {
      vi.mocked(getAllEstudiantes).mockResolvedValue({ data: mockEstudiantes, total: 3 });

      const { rerender } = render(
        <BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      await waitFor(() => {
        expect(screen.getByText('María García')).toBeInTheDocument();
      });

      // Cerrar modal
      rerender(
        <BuscarEstudianteModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // Reabrir
      rerender(
        <BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // El searchQuery debería haberse reseteado
      const searchInput = screen.getByPlaceholderText('Buscar por nombre, apellido...');
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Race conditions', () => {
    it('ignora resultados de búsquedas anteriores cuando searchQuery cambia rápido', async () => {
      const user = userEvent.setup();
      let callCount = 0;
      const resolvers: Array<(value: { data: typeof mockEstudiantes; total: number }) => void> = [];

      vi.mocked(getAllEstudiantes).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvers[callCount++] = resolve;
          }),
      );

      render(<BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      // Primera búsqueda se dispara al abrir
      // Escribir texto rápidamente
      const searchInput = screen.getByPlaceholderText('Buscar por nombre, apellido...');
      await user.type(searchInput, 'abc');

      // Esperar a que se disparen múltiples llamadas
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(1);
      });

      // Resolver en orden inverso (último primero)
      const lastIndex = callCount - 1;
      resolvers[lastIndex]!({
        data: [{ ...mockEstudiantes[0], nombre: 'Resultado Final' }],
        total: 1,
      });

      // Luego resolver el primero
      if (resolvers[0]) {
        resolvers[0]({ data: [{ ...mockEstudiantes[0], nombre: 'Resultado Antiguo' }], total: 1 });
      }

      // Debería mostrar solo el resultado del último request
      await waitFor(() => {
        expect(screen.getByText('Resultado Final García')).toBeInTheDocument();
      });

      // El resultado antiguo no debería aparecer
      expect(screen.queryByText('Resultado Antiguo García')).not.toBeInTheDocument();
    });

    it('no actualiza estado si el modal se cierra durante la búsqueda', async () => {
      let resolveFetch: (value: { data: typeof mockEstudiantes; total: number }) => void;

      vi.mocked(getAllEstudiantes).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <BuscarEstudianteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // Cerrar el modal antes de que el fetch termine
      rerender(
        <BuscarEstudianteModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // Resolver el fetch después de cerrar
      resolveFetch!({ data: mockEstudiantes, total: 3 });

      // Esperar un poco para ver si hay errores
      await new Promise((r) => setTimeout(r, 100));

      // No debería haber errores
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('unmounted'));

      consoleSpy.mockRestore();
    });
  });
});
