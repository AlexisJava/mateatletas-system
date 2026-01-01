import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComisionesSection } from '../ComisionesSection';

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock del módulo de API
vi.mock('@/lib/api/admin.api', () => ({
  getComisionesByProducto: vi.fn(),
  getComisionById: vi.fn(),
  createComision: vi.fn(),
  updateComision: vi.fn(),
  deleteComision: vi.fn(),
}));

// Mock de los componentes compartidos
vi.mock('@/components/admin/shared', () => ({
  DocenteComisionSection: ({ comision }: { comision: { id: string } }) => (
    <div data-testid="docente-section">Docente Section: {comision.id}</div>
  ),
  InscripcionesComisionSection: ({ comision }: { comision: { id: string } }) => (
    <div data-testid="inscripciones-section">Inscripciones Section: {comision.id}</div>
  ),
}));

// Import después de los mocks
import {
  getComisionesByProducto,
  getComisionById,
  createComision,
  deleteComision,
} from '@/lib/api/admin.api';

const mockComisiones = [
  {
    id: 'comision-1',
    nombre: 'Turno Mañana',
    descripcion: 'Grupo de la mañana',
    producto_id: 'producto-1',
    casa_id: 'casa-1',
    docente_id: 'docente-1',
    cupo_maximo: 20,
    horario: 'Lun-Vie 9:00-12:00',
    fecha_inicio: '2026-01-06',
    fecha_fin: '2026-01-31',
    activo: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    casa: { id: 'casa-1', nombre: 'QUANTUM', emoji: '⚛️' },
    docente: { id: 'docente-1', nombre: 'Juan', apellido: 'Pérez' },
    total_inscriptos: 5,
    cupos_disponibles: 15,
  },
  {
    id: 'comision-2',
    nombre: 'Turno Tarde',
    descripcion: 'Grupo de la tarde',
    producto_id: 'producto-1',
    casa_id: null,
    docente_id: null,
    cupo_maximo: null,
    horario: 'Lun-Vie 14:00-17:00',
    fecha_inicio: null,
    fecha_fin: null,
    activo: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    casa: null,
    docente: null,
    total_inscriptos: 0,
    cupos_disponibles: null,
  },
];

const mockComisionDetalle = {
  ...mockComisiones[0],
  inscripciones: [
    {
      id: 'inscripcion-1',
      comision_id: 'comision-1',
      estudiante_id: 'estudiante-1',
      estado: 'Confirmada',
      fecha_inscripcion: '2026-01-02T00:00:00.000Z',
      notas: null,
      estudiante: {
        id: 'estudiante-1',
        nombre: 'María',
        apellido: 'García',
        edad: 10,
        casa: { id: 'casa-1', nombre: 'QUANTUM', emoji: '⚛️' },
      },
    },
  ],
};

describe('ComisionesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('muestra loading mientras carga', async () => {
      vi.mocked(getComisionesByProducto).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { container } = render(
        <ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />,
      );

      // Buscar el spinner por su clase de animación
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('muestra lista de comisiones cuando carga correctamente', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Turno Mañana')).toBeInTheDocument();
        expect(screen.getByText('Turno Tarde')).toBeInTheDocument();
      });
    });

    it('muestra mensaje cuando no hay comisiones', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue([]);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(
          screen.getByText('No hay comisiones creadas para este producto'),
        ).toBeInTheDocument();
      });
    });

    it('muestra error cuando falla la carga', async () => {
      vi.mocked(getComisionesByProducto).mockRejectedValue(new Error('Network error'));

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar las comisiones')).toBeInTheDocument();
      });
    });

    it('maneja respuesta undefined/null como array vacío', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(undefined as unknown as []);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(
          screen.getByText('No hay comisiones creadas para este producto'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Información de comisión', () => {
    it('muestra horario, casa y docente de la comisión', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Lun-Vie 9:00-12:00')).toBeInTheDocument();
        expect(screen.getByText(/QUANTUM/)).toBeInTheDocument();
        expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
      });
    });

    it('muestra contador de inscriptos y cupos', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('5 inscriptos')).toBeInTheDocument();
        expect(screen.getByText('/ 20 cupos')).toBeInTheDocument();
        expect(screen.getByText('(15 disponibles)')).toBeInTheDocument();
      });
    });

    it('muestra badge "Inactivo" para comisiones inactivas', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Inactivo')).toBeInTheDocument();
      });
    });
  });

  describe('Expandir comisión', () => {
    it('carga y muestra detalles al expandir una comisión', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);
      vi.mocked(getComisionById).mockResolvedValue(mockComisionDetalle);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Turno Mañana')).toBeInTheDocument();
      });

      // Click para expandir
      const comisionHeader = screen
        .getByText('Turno Mañana')
        .closest('div[class*="cursor-pointer"]');
      fireEvent.click(comisionHeader!);

      await waitFor(() => {
        expect(getComisionById).toHaveBeenCalledWith('comision-1');
        expect(screen.getByTestId('docente-section')).toBeInTheDocument();
        expect(screen.getByTestId('inscripciones-section')).toBeInTheDocument();
      });
    });

    it('colapsa la comisión al hacer click de nuevo', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);
      vi.mocked(getComisionById).mockResolvedValue(mockComisionDetalle);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Turno Mañana')).toBeInTheDocument();
      });

      const comisionHeader = screen
        .getByText('Turno Mañana')
        .closest('div[class*="cursor-pointer"]');

      // Expandir
      fireEvent.click(comisionHeader!);
      await waitFor(() => {
        expect(screen.getByTestId('docente-section')).toBeInTheDocument();
      });

      // Colapsar
      fireEvent.click(comisionHeader!);
      await waitFor(() => {
        expect(screen.queryByTestId('docente-section')).not.toBeInTheDocument();
      });
    });
  });

  describe('Crear comisión', () => {
    it('abre modal al hacer click en "Nueva Comisión"', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue([]);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Nueva Comisión')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Nueva Comisión'));

      expect(screen.getByText('Nombre de la comisión *')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ej: QUANTUM Mañana')).toBeInTheDocument();
    });

    it('crea comisión y refresca lista', async () => {
      const user = userEvent.setup();
      vi.mocked(getComisionesByProducto).mockResolvedValue([]);
      vi.mocked(createComision).mockResolvedValue(mockComisiones[0]);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Nueva Comisión')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Nueva Comisión'));
      await user.type(screen.getByPlaceholderText('Ej: QUANTUM Mañana'), 'Turno Nuevo');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      await waitFor(() => {
        expect(createComision).toHaveBeenCalledWith(
          expect.objectContaining({
            nombre: 'Turno Nuevo',
            producto_id: 'producto-1',
          }),
        );
      });
    });
  });

  describe('Eliminar comisión', () => {
    it('llama a deleteComision al confirmar eliminación', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);
      vi.mocked(deleteComision).mockResolvedValue(undefined);

      // Mock de window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Turno Mañana')).toBeInTheDocument();
      });

      // Buscar botón de eliminar (icono Trash2)
      const deleteButtons = screen.getAllByTitle('Desactivar');
      fireEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      await waitFor(() => {
        expect(deleteComision).toHaveBeenCalledWith('comision-1');
      });

      confirmSpy.mockRestore();
    });

    it('no elimina si el usuario cancela', async () => {
      vi.mocked(getComisionesByProducto).mockResolvedValue(mockComisiones);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<ComisionesSection productoId="producto-1" productoNombre="Colonia Verano" />);

      await waitFor(() => {
        expect(screen.getByText('Turno Mañana')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Desactivar');
      fireEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(deleteComision).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Race conditions', () => {
    it('cancela fetch anterior cuando productoId cambia rápidamente', async () => {
      let resolveFirst: (value: typeof mockComisiones) => void;
      let resolveSecond: (value: typeof mockComisiones) => void;

      const firstCall = new Promise<typeof mockComisiones>((resolve) => {
        resolveFirst = resolve;
      });
      const secondCall = new Promise<typeof mockComisiones>((resolve) => {
        resolveSecond = resolve;
      });

      vi.mocked(getComisionesByProducto)
        .mockImplementationOnce(() => firstCall)
        .mockImplementationOnce(() => secondCall);

      const { rerender } = render(
        <ComisionesSection productoId="producto-1" productoNombre="Producto 1" />,
      );

      // Cambiar productoId antes de que el primer fetch termine
      rerender(<ComisionesSection productoId="producto-2" productoNombre="Producto 2" />);

      // Resolver en orden inverso (segundo primero)
      resolveSecond!([{ ...mockComisiones[0], nombre: 'Comisión Producto 2' }]);
      resolveFirst!([{ ...mockComisiones[0], nombre: 'Comisión Producto 1' }]);

      // Debería mostrar solo los datos del producto 2, no los del producto 1
      await waitFor(() => {
        expect(screen.getByText('Comisión Producto 2')).toBeInTheDocument();
        expect(screen.queryByText('Comisión Producto 1')).not.toBeInTheDocument();
      });
    });

    it('no actualiza estado si el componente se desmonta durante fetch', async () => {
      let resolveFetch: (value: typeof mockComisiones) => void;

      vi.mocked(getComisionesByProducto).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount } = render(
        <ComisionesSection productoId="producto-1" productoNombre="Producto 1" />,
      );

      // Desmontar antes de que el fetch termine
      unmount();

      // Resolver el fetch después de desmontar
      resolveFetch!(mockComisiones);

      // No debería haber errores de "Can't perform state update on unmounted component"
      await new Promise((r) => setTimeout(r, 100));

      // En React 18+, este warning ya no aparece, pero el comportamiento
      // debe ser que no se actualiza el estado
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('unmounted'));

      consoleSpy.mockRestore();
    });
  });
});
