import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsignarDocenteModal } from '../AsignarDocenteModal';

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock del módulo de API
vi.mock('@/lib/api/admin.api', () => ({
  getDocentes: vi.fn(),
}));

import { getDocentes } from '@/lib/api/admin.api';

const mockDocentes = [
  {
    id: 'docente-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
    titulo: 'Profesor',
    activo: true,
  },
  {
    id: 'docente-2',
    nombre: 'María',
    apellido: 'García',
    email: 'maria@email.com',
    titulo: null,
    activo: true,
  },
  {
    id: 'docente-3',
    nombre: 'Carlos',
    apellido: 'López',
    email: 'carlos@email.com',
    titulo: 'Licenciado',
    activo: true,
  },
];

describe('AsignarDocenteModal', () => {
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
      render(<AsignarDocenteModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />);

      expect(screen.queryByText('Asignar Docente')).not.toBeInTheDocument();
    });

    it('renderiza el modal con título "Asignar Docente" cuando no hay docente actual', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      expect(screen.getByText('Asignar Docente')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Buscar por nombre o email...')).toBeInTheDocument();
    });

    it('renderiza el modal con título "Cambiar Docente" cuando hay docente actual', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(
        <AsignarDocenteModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          currentDocenteId="docente-1"
          currentDocenteNombre="Juan Pérez"
        />,
      );

      expect(screen.getByText('Cambiar Docente')).toBeInTheDocument();
      expect(screen.getByText('Actual: Juan Pérez')).toBeInTheDocument();
    });

    it('muestra loading mientras carga docentes', async () => {
      vi.mocked(getDocentes).mockImplementation(() => new Promise(() => {}));

      const { container } = render(
        <AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('muestra lista de docentes cuando carga', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('María García')).toBeInTheDocument();
        expect(screen.getByText('Carlos López')).toBeInTheDocument();
      });
    });

    it('muestra email y título del docente', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText(/juan@email.com/)).toBeInTheDocument();
        expect(screen.getByText(/Profesor/)).toBeInTheDocument();
      });
    });

    it('muestra mensaje cuando no hay docentes', async () => {
      vi.mocked(getDocentes).mockResolvedValue([]);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('No hay docentes disponibles')).toBeInTheDocument();
      });
    });
  });

  describe('Búsqueda', () => {
    it('filtra docentes por nombre', async () => {
      const user = userEvent.setup();
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      await user.type(searchInput, 'María');

      // Solo María debería aparecer
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      expect(screen.queryByText('Carlos López')).not.toBeInTheDocument();
    });

    it('filtra docentes por email', async () => {
      const user = userEvent.setup();
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      await user.type(searchInput, 'carlos@');

      // Solo Carlos debería aparecer
      expect(screen.getByText('Carlos López')).toBeInTheDocument();
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay resultados de búsqueda', async () => {
      const user = userEvent.setup();
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      await user.type(searchInput, 'xyz');

      expect(screen.getByText('No se encontraron docentes')).toBeInTheDocument();
    });
  });

  describe('Selección', () => {
    it('llama onSelect al hacer click en un docente', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);
      mockOnSelect.mockResolvedValue(undefined);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const docenteButton = screen.getByText('Juan Pérez').closest('button');
      fireEvent.click(docenteButton!);

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith('docente-1');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('marca el docente actual como "(Actual)"', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(
        <AsignarDocenteModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          currentDocenteId="docente-1"
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('(Actual)')).toBeInTheDocument();
      });
    });

    it('cierra el modal sin llamar onSelect si se selecciona el docente actual', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(
        <AsignarDocenteModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          currentDocenteId="docente-1"
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const docenteButton = screen.getByText('Juan Pérez').closest('button');
      fireEvent.click(docenteButton!);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Quitar docente', () => {
    it('muestra botón "Quitar docente" cuando hay docente asignado', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(
        <AsignarDocenteModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          currentDocenteId="docente-1"
        />,
      );

      expect(screen.getByText('Quitar docente asignado')).toBeInTheDocument();
    });

    it('no muestra botón "Quitar docente" cuando no hay docente asignado', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      expect(screen.queryByText('Quitar docente asignado')).not.toBeInTheDocument();
    });

    it('llama onSelect con null al quitar docente', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);
      mockOnSelect.mockResolvedValue(undefined);

      render(
        <AsignarDocenteModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          currentDocenteId="docente-1"
        />,
      );

      const quitarButton = screen.getByText('Quitar docente asignado');
      fireEvent.click(quitarButton);

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(null);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Cerrar modal', () => {
    it('llama onClose al hacer click en Cancelar', async () => {
      vi.mocked(getDocentes).mockResolvedValue([]);

      render(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('llama onClose al hacer click en el backdrop', async () => {
      vi.mocked(getDocentes).mockResolvedValue([]);

      const { container } = render(
        <AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      const backdrop = container.querySelector('.bg-black\\/50');
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resetea estado al cerrar y reabrir', async () => {
      vi.mocked(getDocentes).mockResolvedValue(mockDocentes);

      const { rerender } = render(
        <AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Escribir en búsqueda
      const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(searchInput).toHaveValue('test');

      // Cerrar modal
      rerender(
        <AsignarDocenteModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // Reabrir
      rerender(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      // El searchQuery debería haberse reseteado
      const newSearchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      expect(newSearchInput).toHaveValue('');
    });
  });

  describe('Race conditions', () => {
    it('ignora resultados si el modal se cierra durante la carga', async () => {
      let resolveFetch: (value: typeof mockDocentes) => void;

      vi.mocked(getDocentes).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // Cerrar el modal antes de que los docentes carguen
      rerender(
        <AsignarDocenteModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // Resolver el fetch después de cerrar
      resolveFetch!(mockDocentes);

      // Esperar un poco
      await new Promise((r) => setTimeout(r, 100));

      // No debería haber errores de "Can't perform state update on unmounted component"
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('unmounted'));

      consoleSpy.mockRestore();
    });

    it('ignora resultados de apertura anterior cuando se abre/cierra rápidamente', async () => {
      let callCount = 0;
      const resolvers: Array<(value: typeof mockDocentes) => void> = [];

      vi.mocked(getDocentes).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvers[callCount++] = resolve;
          }),
      );

      const { rerender } = render(
        <AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );

      // Cerrar y reabrir rápidamente
      rerender(
        <AsignarDocenteModal isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />,
      );
      rerender(<AsignarDocenteModal isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />);

      // Esperar a que se disparen las llamadas
      await waitFor(() => {
        expect(callCount).toBeGreaterThanOrEqual(1);
      });

      // Resolver el último primero
      const lastIndex = callCount - 1;
      if (resolvers[lastIndex]) {
        resolvers[lastIndex]([{ ...mockDocentes[0], nombre: 'Resultado Final' }]);
      }

      // Luego resolver el primero (debería ser ignorado)
      if (resolvers[0] && lastIndex > 0) {
        resolvers[0]([{ ...mockDocentes[0], nombre: 'Resultado Antiguo' }]);
      }

      // Verificar que se muestran los datos correctos
      await waitFor(() => {
        expect(screen.getByText('Resultado Final Pérez')).toBeInTheDocument();
      });

      // El resultado antiguo no debería aparecer
      expect(screen.queryByText('Resultado Antiguo Pérez')).not.toBeInTheDocument();
    });
  });
});
