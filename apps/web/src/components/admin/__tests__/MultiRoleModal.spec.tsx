/**
 * MultiRoleModal - Test Suite
 *
 * Tests para el modal de gestión de roles de usuario.
 * Cubre: renderizado, selección de roles, restricciones.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiRoleModal from '../MultiRoleModal';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';
import type { AdminUser } from '@/types/admin.types';

// Mock user base
const createMockUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 'user-1',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@test.com',
  role: 'admin',
  roles: ['admin'],
  estado: 'activo',
  activo: true,
  createdAt: '2024-01-01',
  telefono: '+5491155551234',
  ...overrides,
});

describe('MultiRoleModal', () => {
  const defaultProps = {
    user: createMockUser(),
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(true),
    isLoading: false,
  };

  beforeEach(() => {
    standardBeforeEach();
  });

  afterEach(() => {
    standardAfterEach();
  });

  /* ============================================================================
     RENDERIZADO
     ============================================================================ */
  describe('Renderizado', () => {
    it('renderiza el modal con el título correcto', () => {
      render(<MultiRoleModal {...defaultProps} />);

      expect(screen.getByText('Gestionar Roles')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    it('muestra todos los roles disponibles', () => {
      render(<MultiRoleModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Administrador/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Docente/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tutor/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Estudiante/i })).toBeInTheDocument();
    });

    it('marca los roles actuales como seleccionados', () => {
      const user = createMockUser({ roles: ['admin', 'docente'] });
      render(<MultiRoleModal {...defaultProps} user={user} />);

      // Verificar que se muestran 2 roles seleccionados
      expect(screen.getByText('Roles seleccionados (2)')).toBeInTheDocument();
    });

    it('usa role único si roles array está vacío', () => {
      const user = createMockUser({ role: 'tutor', roles: [] });
      render(<MultiRoleModal {...defaultProps} user={user} />);

      expect(screen.getByText('Roles seleccionados (1)')).toBeInTheDocument();
    });

    it('muestra botones de Cancelar y Guardar', () => {
      render(<MultiRoleModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Guardar Roles/i })).toBeInTheDocument();
    });
  });

  /* ============================================================================
     INTERACCIONES
     ============================================================================ */
  describe('Interacciones', () => {
    it('cierra el modal al hacer click en X', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<MultiRoleModal {...defaultProps} onClose={mockOnClose} />);

      // El botón X está en el header
      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) => btn.querySelector('svg.lucide-x'));
      if (xButton) {
        await user.click(xButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('cierra el modal al hacer click en Cancelar', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<MultiRoleModal {...defaultProps} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('selecciona un rol adicional al hacer click', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ roles: ['admin'] });

      render(<MultiRoleModal {...defaultProps} user={mockUser} />);

      // Inicialmente 1 rol
      expect(screen.getByText('Roles seleccionados (1)')).toBeInTheDocument();

      // Agregar rol Docente
      await user.click(screen.getByRole('button', { name: /Docente/i }));

      // Ahora debería haber 2 roles
      await waitFor(() => {
        expect(screen.getByText('Roles seleccionados (2)')).toBeInTheDocument();
      });
    });

    it('deselecciona un rol al hacer click nuevamente', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ roles: ['admin', 'docente'] });

      render(<MultiRoleModal {...defaultProps} user={mockUser} />);

      // Inicialmente 2 roles
      expect(screen.getByText('Roles seleccionados (2)')).toBeInTheDocument();

      // Quitar rol Docente
      await user.click(screen.getByRole('button', { name: /Docente/i }));

      // Ahora debería haber 1 rol
      await waitFor(() => {
        expect(screen.getByText('Roles seleccionados (1)')).toBeInTheDocument();
      });
    });

    it('no permite deseleccionar el último rol', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ roles: ['admin'] });

      render(<MultiRoleModal {...defaultProps} user={mockUser} />);

      // Inicialmente 1 rol
      expect(screen.getByText('Roles seleccionados (1)')).toBeInTheDocument();

      // Intentar quitar el único rol
      await user.click(screen.getByRole('button', { name: /Administrador/i }));

      // Debería seguir habiendo 1 rol
      expect(screen.getByText('Roles seleccionados (1)')).toBeInTheDocument();
    });

    it('muestra mensaje cuando solo hay un rol', () => {
      const mockUser = createMockUser({ roles: ['admin'] });
      render(<MultiRoleModal {...defaultProps} user={mockUser} />);

      expect(
        screen.getByText(/Un usuario debe tener al menos un rol asignado/i),
      ).toBeInTheDocument();
    });
  });

  /* ============================================================================
     GUARDAR ROLES
     ============================================================================ */
  describe('Guardar roles', () => {
    it('llama a onSave con los roles seleccionados', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn().mockResolvedValue(true);
      const mockUser = createMockUser({ roles: ['admin'] });

      render(<MultiRoleModal {...defaultProps} user={mockUser} onSave={mockOnSave} />);

      // Agregar rol docente
      await user.click(screen.getByRole('button', { name: /Docente/i }));

      // Guardar
      await user.click(screen.getByRole('button', { name: /Guardar Roles/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          'user-1',
          expect.arrayContaining(['admin', 'docente']),
        );
      });
    });

    it('cierra el modal después de guardar exitosamente', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn().mockResolvedValue(true);
      const mockOnClose = vi.fn();

      render(<MultiRoleModal {...defaultProps} onSave={mockOnSave} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: /Guardar Roles/i }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('no cierra el modal si onSave retorna false', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn().mockResolvedValue(false);
      const mockOnClose = vi.fn();

      render(<MultiRoleModal {...defaultProps} onSave={mockOnSave} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: /Guardar Roles/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      // No debería cerrar
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  /* ============================================================================
     ESTADO DE LOADING
     ============================================================================ */
  describe('Estado de loading', () => {
    it('deshabilita botones durante loading', () => {
      render(<MultiRoleModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Guardando.../i })).toBeDisabled();
    });

    it('deshabilita selección de roles durante loading', () => {
      render(<MultiRoleModal {...defaultProps} isLoading={true} />);

      // Los botones de roles deberían estar deshabilitados
      const adminButton = screen.getByRole('button', { name: /Administrador/i });
      expect(adminButton).toBeDisabled();
    });

    it('muestra texto "Guardando..." durante loading', () => {
      render(<MultiRoleModal {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });
  });
});
