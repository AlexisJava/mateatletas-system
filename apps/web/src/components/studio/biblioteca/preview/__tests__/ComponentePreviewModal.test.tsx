import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentePreviewModal } from '../ComponentePreviewModal';
import { BloqueMetadata } from '../../../blocks/types';

// Mock del registry
vi.mock('../preview-registry', () => ({
  getPreview: vi.fn(),
  hasPreview: vi.fn(),
}));

const mockComponente: BloqueMetadata = {
  tipo: 'MultipleChoice',
  nombre: 'Pregunta de Opción Múltiple',
  descripcion: 'Componente para preguntas con múltiples opciones de respuesta',
  categoria: 'EVALUACION',
  icono: '📝',
  configSchema: {},
  ejemploConfig: {},
  implementado: true,
  habilitado: true,
  orden: 1,
};

const mockComponentePendiente: BloqueMetadata = {
  tipo: 'SimuladorFisica',
  nombre: 'Simulador de Física',
  descripcion: 'Simulador interactivo de física',
  categoria: 'SIMULADOR',
  icono: '🔬',
  configSchema: {},
  ejemploConfig: {},
  implementado: false,
  habilitado: false,
  orden: 2,
};

describe('ComponentePreviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should_not_render_when_closed', () => {
      render(
        <ComponentePreviewModal isOpen={false} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should_not_render_when_componente_is_null', () => {
      render(<ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={null} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should_render_modal_when_open_with_componente', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should_display_componente_name', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(screen.getByText('Pregunta de Opción Múltiple')).toBeInTheDocument();
    });

    it('should_display_componente_description', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(
        screen.getByText('Componente para preguntas con múltiples opciones de respuesta'),
      ).toBeInTheDocument();
    });

    it('should_display_componente_icon', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('should_display_categoria_badge', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(screen.getByText('Evaluación')).toBeInTheDocument();
    });

    it('should_display_implementado_status_for_implemented', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(screen.getByText('Implementado')).toBeInTheDocument();
    });

    it('should_display_pendiente_status_for_not_implemented', () => {
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={mockComponentePendiente}
        />,
      );

      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('should_display_tipo_code', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      // El tipo aparece en múltiples lugares (header y placeholder)
      const tipoElements = screen.getAllByText('MultipleChoice');
      expect(tipoElements.length).toBeGreaterThan(0);
    });
  });

  describe('interactions', () => {
    it('should_call_onClose_when_close_button_clicked', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      const closeButton = screen.getByLabelText('Cerrar modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should_call_onClose_when_backdrop_clicked', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should_call_onClose_when_escape_pressed', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should_not_close_when_modal_content_clicked', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('toggle functionality', () => {
    it('should_show_toggle_button_when_implemented', () => {
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={mockComponente}
          onToggle={mockOnToggle}
        />,
      );

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should_not_show_toggle_button_when_not_implemented', () => {
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={mockComponentePendiente}
          onToggle={mockOnToggle}
        />,
      );

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('should_call_onToggle_when_toggle_clicked', () => {
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={mockComponente}
          onToggle={mockOnToggle}
        />,
      );

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith('MultipleChoice', false);
    });

    it('should_disable_toggle_when_isToggling', () => {
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={mockComponente}
          onToggle={mockOnToggle}
          isToggling={true}
        />,
      );

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });

    it('should_show_habilitado_label_when_enabled', () => {
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={mockComponente}
          onToggle={mockOnToggle}
        />,
      );

      expect(screen.getByText('Habilitado')).toBeInTheDocument();
    });

    it('should_show_deshabilitado_label_when_disabled', () => {
      const disabledComponente = { ...mockComponente, habilitado: false };
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={disabledComponente}
          onToggle={mockOnToggle}
        />,
      );

      expect(screen.getByText('Deshabilitado')).toBeInTheDocument();
    });
  });

  describe('preview area', () => {
    it('should_show_not_implemented_placeholder_for_pending', () => {
      render(
        <ComponentePreviewModal
          isOpen={true}
          onClose={mockOnClose}
          componente={mockComponentePendiente}
        />,
      );

      expect(screen.getByText(/Este componente aún no está implementado/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should_have_dialog_role', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should_have_aria_labelledby', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should_trap_focus_inside_modal', () => {
      render(
        <ComponentePreviewModal isOpen={true} onClose={mockOnClose} componente={mockComponente} />,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
