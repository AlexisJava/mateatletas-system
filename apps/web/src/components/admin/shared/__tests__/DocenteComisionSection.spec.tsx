/**
 * DocenteComisionSection - Test Suite
 *
 * Tests para la sección de gestión de docente de una comisión.
 * Cubre: renderizado, asignación de docente, error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocenteComisionSection } from '../DocenteComisionSection';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';
import type { Comision } from '@/lib/api/admin.api';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API
const mockUpdateComision = vi.fn();
vi.mock('@/lib/api/admin.api', async () => {
  const actual = await vi.importActual('@/lib/api/admin.api');
  return {
    ...actual,
    updateComision: (...args: unknown[]) => mockUpdateComision(...args),
  };
});

// Mock AsignarDocenteModal - maneja errores de onSelect para evitar unhandled rejections
vi.mock('../AsignarDocenteModal', () => ({
  AsignarDocenteModal: ({
    isOpen,
    onClose,
    onSelect,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (docenteId: string | null) => Promise<void>;
  }) =>
    isOpen ? (
      <div data-testid="mock-modal">
        <button onClick={onClose}>Cerrar Modal</button>
        <button onClick={() => onSelect('docente-nuevo').catch(() => {})}>
          Seleccionar Docente
        </button>
        <button onClick={() => onSelect(null).catch(() => {})}>Remover Docente</button>
      </div>
    ) : null,
}));

// Helper para crear mock de Comision
const createMockComision = (overrides: Partial<Comision> = {}): Comision => ({
  id: 'comision-1',
  nombre: 'Comisión Test',
  descripcion: 'Descripción test',
  producto_id: 'producto-1',
  casa_id: null,
  docente_id: null,
  cupo_maximo: 20,
  horario: 'Lun-Vie 9:00-12:00',
  fecha_inicio: '2024-01-01',
  fecha_fin: '2024-12-31',
  activo: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  docente: null,
  total_inscriptos: 0,
  cupos_disponibles: 20,
  ...overrides,
});

describe('DocenteComisionSection', () => {
  const defaultProps = {
    comision: createMockComision(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    standardBeforeEach();
    mockUpdateComision.mockResolvedValue({});
  });

  afterEach(() => {
    standardAfterEach();
  });

  /* ============================================================================
     RENDERIZADO
     ============================================================================ */
  describe('Renderizado', () => {
    it('muestra "Sin docente asignado" cuando no hay docente', () => {
      render(<DocenteComisionSection {...defaultProps} />);

      expect(screen.getByText('Docente Asignado')).toBeInTheDocument();
      expect(screen.getByText('Sin docente asignado')).toBeInTheDocument();
    });

    it('muestra botón "Asignar" cuando no hay docente', () => {
      render(<DocenteComisionSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Asignar/i })).toBeInTheDocument();
    });

    it('muestra el nombre del docente cuando está asignado', () => {
      const comisionConDocente = createMockComision({
        docente_id: 'docente-1',
        docente: {
          id: 'docente-1',
          nombre: 'Juan',
          apellido: 'García',
          email: 'juan@test.com',
        },
      });

      render(<DocenteComisionSection comision={comisionConDocente} onRefresh={vi.fn()} />);

      expect(screen.getByText('Juan García')).toBeInTheDocument();
      expect(screen.getByText('(juan@test.com)')).toBeInTheDocument();
    });

    it('muestra botón "Cambiar" cuando hay docente asignado', () => {
      const comisionConDocente = createMockComision({
        docente_id: 'docente-1',
        docente: {
          id: 'docente-1',
          nombre: 'Juan',
          apellido: 'García',
        },
      });

      render(<DocenteComisionSection comision={comisionConDocente} onRefresh={vi.fn()} />);

      expect(screen.getByRole('button', { name: /Cambiar/i })).toBeInTheDocument();
    });
  });

  /* ============================================================================
     INTERACCIONES
     ============================================================================ */
  describe('Interacciones', () => {
    it('abre el modal al hacer click en Asignar', async () => {
      const user = userEvent.setup();

      render(<DocenteComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Asignar/i }));

      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    it('cierra el modal al hacer click en Cerrar', async () => {
      const user = userEvent.setup();

      render(<DocenteComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Asignar/i }));
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Cerrar Modal/i }));
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  /* ============================================================================
     ASIGNAR DOCENTE
     ============================================================================ */
  describe('Asignar docente', () => {
    it('llama a updateComision y onRefresh al asignar docente', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      const mockOnRefresh = vi.fn();

      render(<DocenteComisionSection comision={createMockComision()} onRefresh={mockOnRefresh} />);

      await user.click(screen.getByRole('button', { name: /Asignar/i }));
      await user.click(screen.getByRole('button', { name: /Seleccionar Docente/i }));

      await waitFor(() => {
        expect(mockUpdateComision).toHaveBeenCalledWith('comision-1', {
          docente_id: 'docente-nuevo',
        });
      });

      expect(mockOnRefresh).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Docente asignado exitosamente');
    });

    it('muestra toast de éxito al remover docente', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();

      render(<DocenteComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Asignar/i }));
      await user.click(screen.getByRole('button', { name: /Remover Docente/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Docente removido');
      });
    });

    it('muestra toast de error cuando falla la actualización', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      mockUpdateComision.mockRejectedValueOnce(new Error('Error de red'));

      // Suprimir el error del console.error del componente
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<DocenteComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Asignar/i }));
      await user.click(screen.getByRole('button', { name: /Seleccionar Docente/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al actualizar docente');
      });

      consoleSpy.mockRestore();
    });
  });

  /* ============================================================================
     ESTADO DE LOADING
     ============================================================================ */
  describe('Estado de loading', () => {
    it('deshabilita el botón mientras está actualizando', async () => {
      const user = userEvent.setup();

      // Hacer que la API tarde en responder
      mockUpdateComision.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

      render(<DocenteComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Asignar/i }));
      await user.click(screen.getByRole('button', { name: /Seleccionar Docente/i }));

      // El botón debería estar deshabilitado
      const button = screen.getByRole('button', { name: '' }); // Tiene solo el spinner
      expect(button).toBeDisabled();
    });
  });
});
