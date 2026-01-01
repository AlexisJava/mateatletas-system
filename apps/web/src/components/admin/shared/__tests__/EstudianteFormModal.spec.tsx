import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EstudianteFormModal } from '../EstudianteFormModal';

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock del módulo de API
vi.mock('@/lib/api/admin.api', () => ({
  getSectores: vi.fn(),
  getCasas: vi.fn(),
  crearEstudianteConCredenciales: vi.fn(),
}));

import { getSectores, getCasas, crearEstudianteConCredenciales } from '@/lib/api/admin.api';
import { toast } from 'react-hot-toast';

const mockSectores = [
  { id: 'sector-1', nombre: 'Capital Federal', activo: true },
  { id: 'sector-2', nombre: 'GBA Norte', activo: true },
  { id: 'sector-3', nombre: 'Inactivo', activo: false },
];

const mockCasas = [
  { id: 'casa-1', nombre: 'QUANTUM', emoji: '⚛️', activo: true },
  { id: 'casa-2', nombre: 'VERTEX', emoji: '🔺', activo: true },
  { id: 'casa-3', nombre: 'Inactiva', emoji: '❌', activo: false },
];

describe('EstudianteFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Renderizado', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      render(<EstudianteFormModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText('Crear Estudiante')).not.toBeInTheDocument();
    });

    it('renderiza el modal cuando isOpen es true', async () => {
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      // Usar getByRole para el heading específico
      expect(screen.getByRole('heading', { name: 'Crear Estudiante' })).toBeInTheDocument();
    });

    it('muestra loading mientras carga catálogos', async () => {
      vi.mocked(getSectores).mockImplementation(() => new Promise(() => {}));
      vi.mocked(getCasas).mockImplementation(() => new Promise(() => {}));

      const { container } = render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('muestra formulario cuando catálogos cargan', async () => {
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Datos del Estudiante')).toBeInTheDocument();
        expect(screen.getByText('Datos del Tutor/Padre')).toBeInTheDocument();
      });
    });

    it('filtra sectores y casas inactivas', async () => {
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Datos del Estudiante')).toBeInTheDocument();
      });

      // Verificar que las opciones activas existen en el DOM
      expect(screen.getByText('Capital Federal')).toBeInTheDocument();
      expect(screen.getByText('GBA Norte')).toBeInTheDocument();

      // La opción inactiva no debe existir
      expect(screen.queryByText('Inactivo')).not.toBeInTheDocument();
    });
  });

  describe('Validación', () => {
    it('muestra errores cuando campos requeridos están vacíos', async () => {
      const user = userEvent.setup();
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Datos del Estudiante')).toBeInTheDocument();
      });

      // Click en submit sin llenar campos
      const submitButton = screen.getByRole('button', { name: /crear estudiante/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
        expect(screen.getByText('El apellido es requerido')).toBeInTheDocument();
        expect(screen.getByText('La edad es requerida')).toBeInTheDocument();
      });
    });

    it('valida email del tutor cuando se proporciona', async () => {
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);
      // Mock de crearEstudianteConCredenciales para pausar si se llama
      let apiWasCalled = false;
      vi.mocked(crearEstudianteConCredenciales).mockImplementation(() => {
        apiWasCalled = true;
        return new Promise(() => {}); // Never resolves
      });

      const { container } = render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Datos del Estudiante')).toBeInTheDocument();
      });

      // Usar fireEvent.change para todos los campos
      fireEvent.change(container.querySelector('input[name="nombreEstudiante"]')!, {
        target: { name: 'nombreEstudiante', value: 'María' },
      });
      fireEvent.change(container.querySelector('input[name="apellidoEstudiante"]')!, {
        target: { name: 'apellidoEstudiante', value: 'García' },
      });
      fireEvent.change(container.querySelector('input[name="edadEstudiante"]')!, {
        target: { name: 'edadEstudiante', value: '12' },
      });
      fireEvent.change(container.querySelector('select[name="nivelEscolar"]')!, {
        target: { name: 'nivelEscolar', value: 'Primaria' },
      });
      fireEvent.change(container.querySelector('select[name="sectorId"]')!, {
        target: { name: 'sectorId', value: 'sector-1' },
      });
      fireEvent.change(container.querySelector('input[name="nombreTutor"]')!, {
        target: { name: 'nombreTutor', value: 'Pedro' },
      });
      fireEvent.change(container.querySelector('input[name="apellidoTutor"]')!, {
        target: { name: 'apellidoTutor', value: 'López' },
      });
      fireEvent.change(container.querySelector('input[name="emailTutor"]')!, {
        target: { name: 'emailTutor', value: 'email-invalido' },
      });

      // Encontrar el form y hacer submit directamente
      const form = container.querySelector('form')!;
      fireEvent.submit(form);

      // Verificar que aparece el error de email inválido
      await waitFor(() => {
        expect(screen.getByText('Email inválido')).toBeInTheDocument();
      });

      // Verificar que el API no fue llamado (la validación previno el envío)
      expect(apiWasCalled).toBe(false);
    });
  });

  describe('Cerrar modal', () => {
    it('llama onClose al hacer click en Cancelar', async () => {
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Datos del Estudiante')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('llama onClose al hacer click en el backdrop', async () => {
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      const { container } = render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Datos del Estudiante')).toBeInTheDocument();
      });

      const backdrop = container.querySelector('.bg-black\\/50');
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error en carga de catálogos', () => {
    it('muestra toast de error cuando falla la carga', async () => {
      vi.mocked(getSectores).mockRejectedValue(new Error('Network error'));
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al cargar sectores y casas');
      });
    });
  });

  describe('Race conditions', () => {
    it('ignora resultados si el modal se cierra durante la carga', async () => {
      let resolveSectores: (value: typeof mockSectores) => void;
      let resolveCasas: (value: typeof mockCasas) => void;

      vi.mocked(getSectores).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSectores = resolve;
          }),
      );
      vi.mocked(getCasas).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCasas = resolve;
          }),
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      // Cerrar el modal antes de que los catálogos carguen
      rerender(<EstudianteFormModal isOpen={false} onClose={mockOnClose} />);

      // Resolver los fetches después de cerrar
      resolveSectores!(mockSectores);
      resolveCasas!(mockCasas);

      // Esperar un poco
      await new Promise((r) => setTimeout(r, 100));

      // No debería haber errores
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('unmounted'));

      consoleSpy.mockRestore();
    });

    it('ignora resultados de apertura anterior cuando se abre/cierra rápidamente', async () => {
      let callCount = 0;
      const resolvers: Array<{
        sectores: (value: typeof mockSectores) => void;
        casas: (value: typeof mockCasas) => void;
      }> = [];

      vi.mocked(getSectores).mockImplementation(
        () =>
          new Promise((resolve) => {
            if (!resolvers[callCount]) {
              resolvers[callCount] = { sectores: resolve, casas: () => {} };
            } else {
              resolvers[callCount].sectores = resolve;
            }
          }),
      );

      vi.mocked(getCasas).mockImplementation(
        () =>
          new Promise((resolve) => {
            if (!resolvers[callCount]) {
              resolvers[callCount] = { sectores: () => {}, casas: resolve };
            } else {
              resolvers[callCount].casas = resolve;
            }
            callCount++;
          }),
      );

      const { rerender } = render(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      // Cerrar y reabrir rápidamente
      rerender(<EstudianteFormModal isOpen={false} onClose={mockOnClose} />);
      rerender(<EstudianteFormModal isOpen={true} onClose={mockOnClose} />);

      // Esperar a que se disparen las llamadas
      await waitFor(() => {
        expect(callCount).toBeGreaterThanOrEqual(1);
      });

      // Resolver el último primero
      const lastIndex = callCount - 1;
      if (resolvers[lastIndex]) {
        resolvers[lastIndex].sectores(mockSectores);
        resolvers[lastIndex].casas(mockCasas);
      }

      // Luego resolver el primero (debería ser ignorado)
      if (resolvers[0] && lastIndex > 0) {
        resolvers[0].sectores([{ ...mockSectores[0], nombre: 'Resultado Antiguo' }]);
        resolvers[0].casas(mockCasas);
      }

      // Verificar que se muestran los datos correctos
      await waitFor(() => {
        expect(screen.getByText('Capital Federal')).toBeInTheDocument();
      });

      // El resultado antiguo no debería aparecer
      expect(screen.queryByText('Resultado Antiguo')).not.toBeInTheDocument();
    });
  });

  describe('Preselección de sector', () => {
    it('preselecciona el sector cuando se proporciona preselectedSectorId', async () => {
      vi.mocked(getSectores).mockResolvedValue(mockSectores);
      vi.mocked(getCasas).mockResolvedValue(mockCasas);

      const { container } = render(
        <EstudianteFormModal isOpen={true} onClose={mockOnClose} preselectedSectorId="sector-1" />,
      );

      await waitFor(() => {
        expect(screen.getByText('Datos del Estudiante')).toBeInTheDocument();
      });

      // Buscar el select por su name attribute
      const sectorSelect = container.querySelector('select[name="sectorId"]');
      expect(sectorSelect).toHaveValue('sector-1');
    });
  });
});
