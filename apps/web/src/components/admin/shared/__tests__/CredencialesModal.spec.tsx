/**
 * CredencialesModal - Test Suite
 *
 * Tests para el modal de credenciales generadas.
 * Cubre: renderizado, copiar al portapapeles, mensaje WhatsApp.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CredencialesModal } from '../CredencialesModal';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';
import type { CrearEstudianteConCredencialesResponse } from '@/lib/api/admin.api';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Variable para capturar el spy del clipboard
let clipboardSpy: ReturnType<typeof vi.spyOn<typeof navigator.clipboard, 'writeText'>>;

// Helper para crear credenciales mock
const createMockCredenciales = (
  overrides: Partial<CrearEstudianteConCredencialesResponse> = {},
): CrearEstudianteConCredencialesResponse => ({
  estudiante: {
    id: 'est-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    edad: 10,
  },
  tutor: {
    id: 'tutor-1',
    nombre: 'María',
    apellido: 'González',
    email: 'maria@test.com',
    telefono: '+5491155551234',
  },
  tutorCreado: true,
  credencialesEstudiante: {
    username: 'juan.perez.10',
    pin: '1234',
  },
  credencialesTutor: {
    username: 'maria.gonzalez',
    passwordTemporal: 'TempPass123!',
  },
  ...overrides,
});

describe('CredencialesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    credenciales: createMockCredenciales(),
  };

  beforeEach(() => {
    standardBeforeEach();
    // Espiar el clipboard que ya existe en setup.ts
    clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  });

  afterEach(() => {
    standardAfterEach();
  });

  /* ============================================================================
     RENDERIZADO
     ============================================================================ */
  describe('Renderizado', () => {
    it('no renderiza cuando isOpen es false', () => {
      render(<CredencialesModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Credenciales Generadas')).not.toBeInTheDocument();
    });

    it('no renderiza cuando credenciales es null', () => {
      render(<CredencialesModal {...defaultProps} credenciales={null} />);

      expect(screen.queryByText('Credenciales Generadas')).not.toBeInTheDocument();
    });

    it('renderiza el modal correctamente', () => {
      render(<CredencialesModal {...defaultProps} />);

      expect(screen.getByText('Credenciales Generadas')).toBeInTheDocument();
      expect(screen.getByText('Copia y envía por WhatsApp al tutor')).toBeInTheDocument();
    });

    it('muestra las credenciales del estudiante', () => {
      render(<CredencialesModal {...defaultProps} />);

      expect(screen.getByText(/Estudiante: Juan Pérez/)).toBeInTheDocument();
      expect(screen.getByText('juan.perez.10')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('muestra las credenciales del tutor nuevo', () => {
      render(<CredencialesModal {...defaultProps} />);

      expect(screen.getByText(/Tutor: María González/)).toBeInTheDocument();
      expect(screen.getByText('maria.gonzalez')).toBeInTheDocument();
      expect(screen.getByText('TempPass123!')).toBeInTheDocument();
      expect(screen.getByText('Nuevo')).toBeInTheDocument();
    });

    it('muestra aviso cuando tutor ya existía', () => {
      const credenciales = createMockCredenciales({
        tutorCreado: false,
        credencialesTutor: null,
      });

      render(<CredencialesModal {...defaultProps} credenciales={credenciales} />);

      expect(screen.getByText(/ya existía en el sistema/)).toBeInTheDocument();
    });

    it('no muestra sección de tutor nuevo cuando no hay credenciales de tutor', () => {
      const credenciales = createMockCredenciales({
        tutorCreado: false,
        credencialesTutor: null,
      });

      render(<CredencialesModal {...defaultProps} credenciales={credenciales} />);

      expect(screen.queryByText('Nuevo')).not.toBeInTheDocument();
      expect(screen.queryByText('Contraseña temporal')).not.toBeInTheDocument();
    });

    it('muestra el mensaje de cambio de contraseña para tutor nuevo', () => {
      render(<CredencialesModal {...defaultProps} />);

      expect(
        screen.getByText(/El tutor deberá cambiar la contraseña en su primer inicio de sesión/),
      ).toBeInTheDocument();
    });

    it('muestra botón de copiar para WhatsApp', () => {
      render(<CredencialesModal {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Copiar todo para WhatsApp/i }),
      ).toBeInTheDocument();
    });

    it('muestra los botones de copiar individual', () => {
      render(<CredencialesModal {...defaultProps} />);

      // 4 botones de copiar: username estudiante, pin estudiante, username tutor, password tutor
      const copyButtons = screen.getAllByTitle('Copiar');
      expect(copyButtons).toHaveLength(4);
    });
  });

  /* ============================================================================
     INTERACCIONES - CERRAR
     ============================================================================ */
  describe('Cerrar modal', () => {
    it('cierra el modal al hacer click en X', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<CredencialesModal {...defaultProps} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) => btn.querySelector('svg.lucide-x'));
      if (xButton) {
        await user.click(xButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('cierra el modal al hacer click en Cerrar', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<CredencialesModal {...defaultProps} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: /Cerrar/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('cierra el modal al hacer click en el backdrop', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      const { container } = render(<CredencialesModal {...defaultProps} onClose={mockOnClose} />);

      const backdrop = container.querySelector('.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  /* ============================================================================
     COPIAR AL PORTAPAPELES
     ============================================================================ */
  describe('Copiar al portapapeles', () => {
    it('copia el username del estudiante', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();

      render(<CredencialesModal {...defaultProps} />);

      const copyButtons = screen.getAllByTitle('Copiar');
      await user.click(copyButtons[0]); // Primer botón = username estudiante

      await waitFor(() => {
        expect(clipboardSpy).toHaveBeenCalledWith('juan.perez.10');
      });
      expect(toast.success).toHaveBeenCalledWith('Copiado al portapapeles');
    });

    it('copia el PIN del estudiante', async () => {
      const user = userEvent.setup();

      render(<CredencialesModal {...defaultProps} />);

      const copyButtons = screen.getAllByTitle('Copiar');
      await user.click(copyButtons[1]); // Segundo botón = PIN

      await waitFor(() => {
        expect(clipboardSpy).toHaveBeenCalledWith('1234');
      });
    });

    it('copia el username del tutor', async () => {
      const user = userEvent.setup();

      render(<CredencialesModal {...defaultProps} />);

      const copyButtons = screen.getAllByTitle('Copiar');
      await user.click(copyButtons[2]); // Tercer botón = username tutor

      await waitFor(() => {
        expect(clipboardSpy).toHaveBeenCalledWith('maria.gonzalez');
      });
    });

    it('copia la contraseña temporal del tutor', async () => {
      const user = userEvent.setup();

      render(<CredencialesModal {...defaultProps} />);

      const copyButtons = screen.getAllByTitle('Copiar');
      await user.click(copyButtons[3]); // Cuarto botón = password tutor

      await waitFor(() => {
        expect(clipboardSpy).toHaveBeenCalledWith('TempPass123!');
      });
    });

    it('copia todas las credenciales para WhatsApp', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();

      render(<CredencialesModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Copiar todo para WhatsApp/i }));

      await waitFor(() => {
        expect(clipboardSpy).toHaveBeenCalled();
      });

      // Verificar que el mensaje contiene toda la información
      const copiedText = clipboardSpy.mock.calls[0][0];
      expect(copiedText).toContain('Credenciales de Mateatletas');
      expect(copiedText).toContain('Juan Pérez');
      expect(copiedText).toContain('juan.perez.10');
      expect(copiedText).toContain('1234');
      expect(copiedText).toContain('María González');
      expect(copiedText).toContain('maria.gonzalez');
      expect(copiedText).toContain('TempPass123!');

      expect(toast.success).toHaveBeenCalledWith('Copiado al portapapeles');
    });

    it('muestra error cuando falla el copiado', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      clipboardSpy.mockRejectedValueOnce(new Error('Error'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<CredencialesModal {...defaultProps} />);

      const copyButtons = screen.getAllByTitle('Copiar');
      await user.click(copyButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al copiar');
      });
    });
  });

  /* ============================================================================
     MENSAJE WHATSAPP SIN TUTOR NUEVO
     ============================================================================ */
  describe('WhatsApp sin tutor nuevo', () => {
    it('no incluye credenciales de tutor si no se creó nuevo', async () => {
      const user = userEvent.setup();
      const credenciales = createMockCredenciales({
        tutorCreado: false,
        credencialesTutor: null,
      });

      render(<CredencialesModal {...defaultProps} credenciales={credenciales} />);

      await user.click(screen.getByRole('button', { name: /Copiar todo para WhatsApp/i }));

      await waitFor(() => {
        expect(clipboardSpy).toHaveBeenCalled();
      });

      const copiedText = clipboardSpy.mock.calls[0][0];
      expect(copiedText).toContain('Juan Pérez');
      expect(copiedText).toContain('juan.perez.10');
      expect(copiedText).not.toContain('Contraseña temporal');
      expect(copiedText).not.toContain('TempPass123!');
    });
  });

  /* ============================================================================
     VARIACIONES DE DATOS
     ============================================================================ */
  describe('Variaciones de datos', () => {
    it('muestra correctamente con tutor existente (sin credenciales de tutor)', () => {
      const credenciales = createMockCredenciales({
        tutorCreado: false,
        credencialesTutor: null,
      });

      render(<CredencialesModal {...defaultProps} credenciales={credenciales} />);

      // Muestra info del estudiante
      expect(screen.getByText('juan.perez.10')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();

      // Muestra mensaje de tutor existente
      expect(screen.getByText(/ya existía en el sistema/)).toBeInTheDocument();
      expect(screen.getByText(/María González/)).toBeInTheDocument();

      // Solo 2 botones de copiar (estudiante)
      const copyButtons = screen.getAllByTitle('Copiar');
      expect(copyButtons).toHaveLength(2);
    });

    it('muestra las etiquetas Usuario y PIN', () => {
      render(<CredencialesModal {...defaultProps} />);

      // Hay 2 etiquetas "Usuario" (estudiante y tutor)
      const usuarioLabels = screen.getAllByText('Usuario');
      expect(usuarioLabels).toHaveLength(2);
      expect(screen.getByText('PIN')).toBeInTheDocument();
    });
  });
});
