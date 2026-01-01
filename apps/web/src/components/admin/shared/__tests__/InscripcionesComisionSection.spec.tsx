/**
 * InscripcionesComisionSection - Test Suite
 *
 * Tests para la sección de gestión de inscripciones de una comisión.
 * Cubre: renderizado, crear/inscribir/remover estudiantes, cupos.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InscripcionesComisionSection } from '../InscripcionesComisionSection';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';
import type { Comision, InscripcionComision } from '@/lib/api/admin.api';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API
const mockCrearEstudianteEInscribir = vi.fn();
const mockInscribirEstudiantesComision = vi.fn();
const mockRemoverEstudianteComision = vi.fn();

vi.mock('@/lib/api/admin.api', async () => {
  const actual = await vi.importActual('@/lib/api/admin.api');
  return {
    ...actual,
    crearEstudianteEInscribir: (...args: unknown[]) => mockCrearEstudianteEInscribir(...args),
    inscribirEstudiantesComision: (...args: unknown[]) => mockInscribirEstudiantesComision(...args),
    removerEstudianteComision: (...args: unknown[]) => mockRemoverEstudianteComision(...args),
  };
});

// Mock Modales
vi.mock('../EstudianteFormModal', () => ({
  EstudianteFormModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="estudiante-form-modal">
        <button onClick={onClose}>Cerrar Form</button>
      </div>
    ) : null,
}));

vi.mock('../BuscarEstudianteModal', () => ({
  BuscarEstudianteModal: ({
    isOpen,
    onClose,
    onSelect,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="buscar-modal">
        <button onClick={onClose}>Cerrar Buscar</button>
        <button onClick={() => onSelect('estudiante-existente')}>Seleccionar Estudiante</button>
      </div>
    ) : null,
}));

vi.mock('../CredencialesModal', () => ({
  CredencialesModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="credenciales-modal">
        <button onClick={onClose}>Cerrar Credenciales</button>
      </div>
    ) : null,
}));

// Mock confirm
const originalConfirm = window.confirm;

// Helper para crear mock de inscripción
const createMockInscripcion = (
  overrides: Partial<InscripcionComision> = {},
): InscripcionComision => ({
  id: 'inscripcion-1',
  comision_id: 'comision-1',
  estudiante_id: 'estudiante-1',
  estado: 'Confirmada',
  fecha_inscripcion: '2024-01-01',
  notas: null,
  estudiante: {
    id: 'estudiante-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    edad: 10,
    casa: { id: 'casa-1', nombre: 'Gryffindor', emoji: '🦁' },
  },
  ...overrides,
});

// Helper para crear mock de Comision
const createMockComision = (
  overrides: Partial<Comision & { inscripciones?: InscripcionComision[] }> = {},
): Comision & { inscripciones?: InscripcionComision[] } => ({
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
  inscripciones: [],
  ...overrides,
});

describe('InscripcionesComisionSection', () => {
  const defaultProps = {
    comision: createMockComision(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    standardBeforeEach();
    mockCrearEstudianteEInscribir.mockResolvedValue({});
    mockInscribirEstudiantesComision.mockResolvedValue({});
    mockRemoverEstudianteComision.mockResolvedValue({});
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    standardAfterEach();
    window.confirm = originalConfirm;
  });

  /* ============================================================================
     RENDERIZADO
     ============================================================================ */
  describe('Renderizado', () => {
    it('muestra el título y contador de inscriptos', () => {
      render(<InscripcionesComisionSection {...defaultProps} />);

      expect(screen.getByText('Estudiantes Inscriptos')).toBeInTheDocument();
      expect(screen.getByText('(0)')).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay inscriptos', () => {
      render(<InscripcionesComisionSection {...defaultProps} />);

      expect(screen.getByText('No hay estudiantes inscriptos')).toBeInTheDocument();
    });

    it('muestra los botones de agregar estudiantes', () => {
      render(<InscripcionesComisionSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Crear nuevo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Buscar existente/i })).toBeInTheDocument();
    });

    it('muestra los estudiantes inscriptos', () => {
      const comision = createMockComision({
        inscripciones: [createMockInscripcion()],
      });

      render(<InscripcionesComisionSection comision={comision} onRefresh={vi.fn()} />);

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('10 años')).toBeInTheDocument();
      expect(screen.getByText('Confirmada')).toBeInTheDocument();
    });

    it('muestra indicador de cupos disponibles', () => {
      const comision = createMockComision({ cupo_maximo: 20 });

      render(<InscripcionesComisionSection comision={comision} onRefresh={vi.fn()} />);

      expect(screen.getByText('20 cupos disponibles')).toBeInTheDocument();
    });

    it('muestra "Sin cupos" cuando no hay disponibilidad', () => {
      const comision = createMockComision({
        cupo_maximo: 1,
        inscripciones: [createMockInscripcion()],
      });

      render(<InscripcionesComisionSection comision={comision} onRefresh={vi.fn()} />);

      expect(screen.getByText('Sin cupos')).toBeInTheDocument();
    });

    it('deshabilita botones cuando no hay cupos', () => {
      const comision = createMockComision({
        cupo_maximo: 1,
        inscripciones: [createMockInscripcion()],
      });

      render(<InscripcionesComisionSection comision={comision} onRefresh={vi.fn()} />);

      expect(screen.getByRole('button', { name: /Crear nuevo/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Buscar existente/i })).toBeDisabled();
    });
  });

  /* ============================================================================
     INTERACCIONES
     ============================================================================ */
  describe('Interacciones', () => {
    it('abre modal de crear estudiante', async () => {
      const user = userEvent.setup();

      render(<InscripcionesComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Crear nuevo/i }));

      expect(screen.getByTestId('estudiante-form-modal')).toBeInTheDocument();
    });

    it('abre modal de buscar estudiante', async () => {
      const user = userEvent.setup();

      render(<InscripcionesComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Buscar existente/i }));

      expect(screen.getByTestId('buscar-modal')).toBeInTheDocument();
    });
  });

  /* ============================================================================
     INSCRIBIR EXISTENTE
     ============================================================================ */
  describe('Inscribir estudiante existente', () => {
    it('inscribe estudiante y llama onRefresh', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      const mockOnRefresh = vi.fn();

      render(
        <InscripcionesComisionSection comision={createMockComision()} onRefresh={mockOnRefresh} />,
      );

      await user.click(screen.getByRole('button', { name: /Buscar existente/i }));
      await user.click(screen.getByRole('button', { name: /Seleccionar Estudiante/i }));

      await waitFor(() => {
        expect(mockInscribirEstudiantesComision).toHaveBeenCalledWith('comision-1', {
          estudiantes_ids: ['estudiante-existente'],
        });
      });

      expect(mockOnRefresh).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Estudiante inscripto exitosamente');
    });

    it('muestra error cuando falla inscripción', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      mockInscribirEstudiantesComision.mockRejectedValueOnce(new Error('Error'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<InscripcionesComisionSection {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Buscar existente/i }));
      await user.click(screen.getByRole('button', { name: /Seleccionar Estudiante/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al inscribir estudiante');
      });
    });
  });

  /* ============================================================================
     REMOVER ESTUDIANTE
     ============================================================================ */
  describe('Remover estudiante', () => {
    it('remueve estudiante con confirmación', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      const mockOnRefresh = vi.fn();
      const comision = createMockComision({
        inscripciones: [createMockInscripcion()],
      });

      render(<InscripcionesComisionSection comision={comision} onRefresh={mockOnRefresh} />);

      // Click en botón de remover
      const removeButton = screen.getByTitle('Remover de la comisión');
      await user.click(removeButton);

      await waitFor(() => {
        expect(mockRemoverEstudianteComision).toHaveBeenCalledWith('comision-1', 'estudiante-1');
      });

      expect(mockOnRefresh).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Estudiante removido');
    });

    it('no remueve si usuario cancela confirmación', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn().mockReturnValue(false);
      const comision = createMockComision({
        inscripciones: [createMockInscripcion()],
      });

      render(<InscripcionesComisionSection comision={comision} onRefresh={vi.fn()} />);

      const removeButton = screen.getByTitle('Remover de la comisión');
      await user.click(removeButton);

      expect(mockRemoverEstudianteComision).not.toHaveBeenCalled();
    });

    it('muestra error cuando falla remover', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      mockRemoverEstudianteComision.mockRejectedValueOnce(new Error('Error'));
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const comision = createMockComision({
        inscripciones: [createMockInscripcion()],
      });

      render(<InscripcionesComisionSection comision={comision} onRefresh={vi.fn()} />);

      const removeButton = screen.getByTitle('Remover de la comisión');
      await user.click(removeButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al remover estudiante');
      });
    });
  });
});
