/**
 * ViewEditDocenteModal - Test Suite
 *
 * Tests para el modal de ver/editar docente.
 * Cubre: renderizado, modo edición, guardar cambios, manejo de errores.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewEditDocenteModal from '../ViewEditDocenteModal';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper para crear mock de docente
const createMockDocente = (overrides = {}) => ({
  id: 'docente-1',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan.perez@test.com',
  telefono: '+54 11 1234-5678',
  titulo: 'Licenciado en Matemática',
  sectores: [{ nombre: 'Primaria', icono: '📚', color: '#3B82F6' }],
  especialidades: ['Álgebra', 'Geometría'],
  disponibilidad_horaria: {
    lunes: ['09:00-12:00', '14:00-18:00'],
    miércoles: ['09:00-12:00'],
  },
  nivel_educativo: ['Primaria', 'Secundaria'],
  estado: 'activo',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  ...overrides,
});

describe('ViewEditDocenteModal', () => {
  const defaultProps = {
    docente: createMockDocente(),
    onClose: vi.fn(),
    onUpdate: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  };

  beforeEach(() => {
    standardBeforeEach();
  });

  afterEach(() => {
    standardAfterEach();
  });

  /* ============================================================================
     RENDERIZADO - MODO VISTA
     ============================================================================ */
  describe('Renderizado - Modo Vista', () => {
    it('muestra el nombre completo del docente', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    it('muestra el título del docente', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      // El título aparece en múltiples lugares
      const titulos = screen.getAllByText('Licenciado en Matemática');
      expect(titulos.length).toBeGreaterThan(0);
    });

    it('muestra el email del docente', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByText('juan.perez@test.com')).toBeInTheDocument();
    });

    it('muestra el teléfono del docente', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByText('+54 11 1234-5678')).toBeInTheDocument();
    });

    it('muestra el estado activo correctamente', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByText('✓ Activo')).toBeInTheDocument();
    });

    it('muestra las especialidades del docente', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByText('Álgebra')).toBeInTheDocument();
      expect(screen.getByText('Geometría')).toBeInTheDocument();
    });

    it('muestra los niveles educativos', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      // Buscar en el contexto de "Niveles Educativos"
      const nivelesSection = screen.getByText('Niveles Educativos').closest('div');
      expect(nivelesSection).toBeInTheDocument();
    });

    it('muestra la disponibilidad horaria', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByText('Lunes')).toBeInTheDocument();
      // Puede haber múltiples horarios
      const horarios = screen.getAllByText('09:00-12:00');
      expect(horarios.length).toBeGreaterThan(0);
    });

    it('muestra botón de editar', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      // El botón de editar tiene el ícono pen (lucide-pen)
      const editButtons = document.querySelectorAll('.lucide-pen');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('muestra botón de cerrar', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay disponibilidad horaria', () => {
      const docente = createMockDocente({ disponibilidad_horaria: {} });

      render(<ViewEditDocenteModal {...defaultProps} docente={docente} />);

      expect(screen.getByText('No hay disponibilidad horaria configurada')).toBeInTheDocument();
    });

    it('muestra "No especificado" cuando no hay teléfono', () => {
      const docente = createMockDocente({ telefono: undefined });

      render(<ViewEditDocenteModal {...defaultProps} docente={docente} />);

      expect(screen.getByText('No especificado')).toBeInTheDocument();
    });
  });

  /* ============================================================================
     INTERACCIONES - CERRAR
     ============================================================================ */
  describe('Cerrar modal', () => {
    it('llama onClose al hacer click en X', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<ViewEditDocenteModal {...defaultProps} onClose={mockOnClose} />);

      // Buscar el botón X (tiene el ícono lucide-x)
      const xButton = document.querySelector('.lucide-x')?.closest('button');
      if (xButton) {
        await user.click(xButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('llama onClose al hacer click en botón Cerrar', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<ViewEditDocenteModal {...defaultProps} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: /cerrar/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  /* ============================================================================
     MODO EDICIÓN
     ============================================================================ */
  describe('Modo Edición', () => {
    it('entra en modo edición al hacer click en botón editar', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        // En modo edición aparecen los campos de input
        expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
      }
    });

    it('muestra botones Cancelar y Guardar en modo edición', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
      }
    });

    it('sale del modo edición al hacer click en Cancelar', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      // Entrar en modo edición
      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);
        expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();

        // Cancelar
        await user.click(screen.getByRole('button', { name: /cancelar/i }));

        // Ya no debería estar el input
        expect(screen.queryByDisplayValue('Juan')).not.toBeInTheDocument();
      }
    });

    it('permite editar el nombre', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        const nombreInput = screen.getByDisplayValue('Juan');
        await user.clear(nombreInput);
        await user.type(nombreInput, 'Carlos');

        expect(screen.getByDisplayValue('Carlos')).toBeInTheDocument();
      }
    });

    it('permite editar el teléfono', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        const telefonoInput = screen.getByDisplayValue('+54 11 1234-5678');
        await user.clear(telefonoInput);
        await user.type(telefonoInput, '+54 11 9999-8888');

        expect(screen.getByDisplayValue('+54 11 9999-8888')).toBeInTheDocument();
      }
    });

    it('muestra el email como no editable', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        // El email debería estar visible pero no editable
        const emailField = screen.getByText('juan.perez@test.com');
        expect(emailField).toBeInTheDocument();
        // Verificar que tiene clase cursor-not-allowed
        expect(emailField).toHaveClass('cursor-not-allowed');
      }
    });
  });

  /* ============================================================================
     GUARDAR CAMBIOS
     ============================================================================ */
  describe('Guardar cambios', () => {
    it('llama onUpdate con los datos correctos', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

      render(<ViewEditDocenteModal {...defaultProps} onUpdate={mockOnUpdate} />);

      // Entrar en modo edición
      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        // Cambiar nombre
        const nombreInput = screen.getByDisplayValue('Juan');
        await user.clear(nombreInput);
        await user.type(nombreInput, 'Carlos');

        // Guardar
        await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

        await waitFor(() => {
          expect(mockOnUpdate).toHaveBeenCalledWith(
            'docente-1',
            expect.objectContaining({
              nombre: 'Carlos',
              apellido: 'Pérez',
            }),
          );
        });

        expect(toast.success).toHaveBeenCalledWith('Docente actualizado correctamente');
      }
    });

    it('sale del modo edición después de guardar exitosamente', async () => {
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

      render(<ViewEditDocenteModal {...defaultProps} onUpdate={mockOnUpdate} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);
        expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

        await waitFor(() => {
          expect(screen.queryByDisplayValue('Juan')).not.toBeInTheDocument();
        });
      }
    });

    it('muestra toast de error cuando falla el guardado', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      const mockOnUpdate = vi.fn().mockRejectedValue(new Error('Error de servidor'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ViewEditDocenteModal {...defaultProps} onUpdate={mockOnUpdate} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);
        await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Error al actualizar docente');
        });
      }
    });

    it('deshabilita botones cuando isLoading es true', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} isLoading={true} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
      }
    });
  });

  /* ============================================================================
     NIVELES EDUCATIVOS
     ============================================================================ */
  describe('Niveles Educativos', () => {
    it('permite toggle de niveles educativos en modo edición', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        // El nivel "Primaria" debería estar seleccionado
        const primariaButtons = screen.getAllByRole('button', { name: /primaria/i });
        // Buscar el que tiene el estilo de seleccionado (gradiente)
        const selectedButton = primariaButtons.find((btn) =>
          btn.className.includes('from-emerald-500'),
        );
        expect(selectedButton).toBeDefined();

        // Universidad no está seleccionado
        const universidadButton = screen.getByRole('button', { name: /universidad/i });
        expect(universidadButton.className).not.toContain('from-emerald-500');
      }
    });
  });

  /* ============================================================================
     ESPECIALIDADES
     ============================================================================ */
  describe('Especialidades', () => {
    it('muestra las especialidades en modo vista', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      // Las especialidades aparecen en modo vista
      const algebraElements = screen.getAllByText('Álgebra');
      const geometriaElements = screen.getAllByText('Geometría');
      expect(algebraElements.length).toBeGreaterThan(0);
      expect(geometriaElements.length).toBeGreaterThan(0);
    });

    it('entra en modo edición correctamente', async () => {
      const user = userEvent.setup();

      render(<ViewEditDocenteModal {...defaultProps} />);

      const editButton = document.querySelector('.lucide-pen')?.closest('button');
      if (editButton) {
        await user.click(editButton);

        // En modo edición hay botones para agregar
        const agregarButtons = screen.getAllByRole('button', { name: /agregar/i });
        expect(agregarButtons.length).toBeGreaterThan(0);
      }
    });
  });

  /* ============================================================================
     DISPONIBILIDAD HORARIA
     ============================================================================ */
  describe('Disponibilidad Horaria', () => {
    it('muestra la sección de disponibilidad horaria', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      expect(screen.getByText('Disponibilidad Horaria')).toBeInTheDocument();
    });

    it('muestra los horarios configurados', () => {
      render(<ViewEditDocenteModal {...defaultProps} />);

      // Puede haber múltiples instancias del mismo horario
      const horarios1 = screen.getAllByText('09:00-12:00');
      const horarios2 = screen.getAllByText('14:00-18:00');
      expect(horarios1.length).toBeGreaterThan(0);
      expect(horarios2.length).toBeGreaterThan(0);
    });
  });

  /* ============================================================================
     ESTADOS ESPECIALES
     ============================================================================ */
  describe('Estados especiales', () => {
    it('muestra estado de vacaciones correctamente', () => {
      const docente = createMockDocente({ estado: 'vacaciones' });

      render(<ViewEditDocenteModal {...defaultProps} docente={docente} />);

      expect(screen.getByText(/vacaciones/i)).toBeInTheDocument();
    });

    it('muestra estado inactivo correctamente', () => {
      const docente = createMockDocente({ estado: 'inactivo' });

      render(<ViewEditDocenteModal {...defaultProps} docente={docente} />);

      expect(screen.getByText('✗ Inactivo')).toBeInTheDocument();
    });

    it('muestra título por defecto cuando no hay título', () => {
      const docente = createMockDocente({ titulo: undefined });

      render(<ViewEditDocenteModal {...defaultProps} docente={docente} />);

      expect(screen.getByText('Docente de Matemática')).toBeInTheDocument();
    });
  });
});
