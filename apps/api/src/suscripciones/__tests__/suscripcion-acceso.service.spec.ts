/**
 * Tests TDD para SuscripcionAccesoService
 *
 * Verifica acceso de tutores/estudiantes basado en estado de suscripción.
 *
 * Estados y acceso:
 * - ACTIVA → ✅ Acceso completo
 * - EN_GRACIA → ✅ Acceso completo (máx 3 días)
 * - PENDIENTE → ⚠️ Acceso limitado (solo ver planes)
 * - MOROSA → ❌ Sin acceso
 * - CANCELADA → ❌ Sin acceso
 */
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { EstadoSuscripcion } from '@prisma/client';
import {
  SuscripcionAccesoService,
  AccesoResult,
} from '../services/suscripcion-acceso.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('SuscripcionAccesoService', () => {
  let service: SuscripcionAccesoService;
  let prisma: jest.Mocked<PrismaService>;

  // Mock de suscripción
  const createMockSuscripcion = (
    estado: EstadoSuscripcion,
    diasGracia = 0,
  ) => ({
    id: 'suscripcion-123',
    tutor_id: 'tutor-456',
    plan_id: 'plan-789',
    estado,
    mp_preapproval_id: 'mp-abc',
    precio_final: 40000,
    dias_gracia_usados: diasGracia,
    fecha_inicio_gracia: diasGracia > 0 ? new Date() : null,
    created_at: new Date(),
    updated_at: new Date(),
    plan: {
      id: 'plan-789',
      nombre: 'STEAM_LIBROS',
      descripcion: 'Plan básico',
    },
  });

  beforeEach(async () => {
    const mockPrisma = {
      suscripcion: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      estudiante: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuscripcionAccesoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SuscripcionAccesoService>(SuscripcionAccesoService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;

    // Silenciar logs
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarAccesoTutor', () => {
    describe('Suscripción ACTIVA', () => {
      it('debe permitir acceso completo con suscripción ACTIVA', async () => {
        // Arrange
        const suscripcion = createMockSuscripcion(EstadoSuscripcion.ACTIVA);
        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          suscripcion,
        );

        // Act
        const result = await service.verificarAccesoTutor('tutor-456');

        // Assert
        expect(result.tieneAcceso).toBe(true);
        expect(result.estado).toBe(EstadoSuscripcion.ACTIVA);
        expect(result.razon).toContain('activa');
      });
    });

    describe('Suscripción EN_GRACIA', () => {
      it('debe permitir acceso en período de gracia', async () => {
        // Arrange
        const suscripcion = createMockSuscripcion(
          EstadoSuscripcion.EN_GRACIA,
          2,
        );
        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          suscripcion,
        );

        // Act
        const result = await service.verificarAccesoTutor('tutor-456');

        // Assert
        expect(result.tieneAcceso).toBe(true);
        expect(result.estado).toBe(EstadoSuscripcion.EN_GRACIA);
        expect(result.diasRestantesGracia).toBeDefined();
      });

      it('debe indicar días restantes de gracia', async () => {
        // Arrange
        const suscripcion = createMockSuscripcion(
          EstadoSuscripcion.EN_GRACIA,
          1,
        );
        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          suscripcion,
        );

        // Act
        const result = await service.verificarAccesoTutor('tutor-456');

        // Assert
        expect(result.diasRestantesGracia).toBeGreaterThan(0);
        expect(result.diasRestantesGracia).toBeLessThanOrEqual(3);
      });
    });

    describe('Suscripción PENDIENTE', () => {
      it('debe dar acceso limitado con suscripción PENDIENTE', async () => {
        // Arrange
        const suscripcion = createMockSuscripcion(EstadoSuscripcion.PENDIENTE);
        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          suscripcion,
        );

        // Act
        const result = await service.verificarAccesoTutor('tutor-456');

        // Assert
        expect(result.tieneAcceso).toBe(false);
        expect(result.accesoLimitado).toBe(true);
        expect(result.estado).toBe(EstadoSuscripcion.PENDIENTE);
        expect(result.razon).toContain('pendiente');
      });
    });

    describe('Suscripción MOROSA', () => {
      it('debe negar acceso con suscripción MOROSA', async () => {
        // Arrange
        const suscripcion = createMockSuscripcion(EstadoSuscripcion.MOROSA);
        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          suscripcion,
        );

        // Act
        const result = await service.verificarAccesoTutor('tutor-456');

        // Assert
        expect(result.tieneAcceso).toBe(false);
        expect(result.accesoLimitado).toBe(false);
        expect(result.estado).toBe(EstadoSuscripcion.MOROSA);
        expect(result.razon).toContain('morosa');
      });
    });

    describe('Suscripción CANCELADA', () => {
      it('debe negar acceso con suscripción CANCELADA', async () => {
        // Arrange
        const suscripcion = createMockSuscripcion(EstadoSuscripcion.CANCELADA);
        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          suscripcion,
        );

        // Act
        const result = await service.verificarAccesoTutor('tutor-456');

        // Assert
        expect(result.tieneAcceso).toBe(false);
        expect(result.estado).toBe(EstadoSuscripcion.CANCELADA);
        expect(result.razon).toContain('cancelada');
      });
    });

    describe('Sin suscripción', () => {
      it('debe negar acceso si no tiene suscripción', async () => {
        // Arrange
        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(null);

        // Act
        const result = await service.verificarAccesoTutor('tutor-456');

        // Assert
        expect(result.tieneAcceso).toBe(false);
        expect(result.estado).toBeNull();
        expect(result.razon).toContain('sin suscripción');
      });
    });
  });

  describe('verificarAccesoEstudiante', () => {
    it('debe verificar acceso a través del tutor del estudiante', async () => {
      // Arrange
      const mockEstudiante = {
        id: 'estudiante-111',
        tutor_id: 'tutor-456',
        nombre: 'Juan',
      };
      const suscripcion = createMockSuscripcion(EstadoSuscripcion.ACTIVA);

      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(
        mockEstudiante,
      );
      (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
        suscripcion,
      );

      // Act
      const result = await service.verificarAccesoEstudiante('estudiante-111');

      // Assert
      expect(result.tieneAcceso).toBe(true);
      expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({
        where: { id: 'estudiante-111' },
        select: { tutor_id: true },
      });
    });

    it('debe negar acceso si estudiante no existe', async () => {
      // Arrange
      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.verificarAccesoEstudiante(
        'estudiante-inexistente',
      );

      // Assert
      expect(result.tieneAcceso).toBe(false);
      expect(result.razon).toContain('no encontrado');
    });

    it('debe negar acceso si el tutor del estudiante no tiene suscripción activa', async () => {
      // Arrange
      const mockEstudiante = {
        id: 'estudiante-111',
        tutor_id: 'tutor-456',
      };
      const suscripcionMorosa = createMockSuscripcion(EstadoSuscripcion.MOROSA);

      (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(
        mockEstudiante,
      );
      (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
        suscripcionMorosa,
      );

      // Act
      const result = await service.verificarAccesoEstudiante('estudiante-111');

      // Assert
      expect(result.tieneAcceso).toBe(false);
      expect(result.estado).toBe(EstadoSuscripcion.MOROSA);
    });
  });

  describe('obtenerEstadoSuscripcionActiva', () => {
    it('debe retornar la suscripción activa más reciente', async () => {
      // Arrange
      const suscripcionActiva = createMockSuscripcion(EstadoSuscripcion.ACTIVA);
      (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
        suscripcionActiva,
      );

      // Act
      const result = await service.obtenerEstadoSuscripcionActiva('tutor-456');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.estado).toBe(EstadoSuscripcion.ACTIVA);
      expect(prisma.suscripcion.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tutor_id: 'tutor-456',
            estado: expect.objectContaining({
              in: expect.arrayContaining([
                EstadoSuscripcion.ACTIVA,
                EstadoSuscripcion.EN_GRACIA,
              ]),
            }),
          }),
          orderBy: { created_at: 'desc' },
        }),
      );
    });

    it('debe retornar null si no tiene suscripción activa', async () => {
      // Arrange
      (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.obtenerEstadoSuscripcionActiva('tutor-456');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('tieneAccesoContenido', () => {
    it('debe permitir acceso a contenido si suscripción está ACTIVA', async () => {
      // Arrange
      const suscripcion = createMockSuscripcion(EstadoSuscripcion.ACTIVA);
      (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
        suscripcion,
      );

      // Act
      const tieneAcceso = await service.tieneAccesoContenido('tutor-456');

      // Assert
      expect(tieneAcceso).toBe(true);
    });

    it('debe permitir acceso a contenido si suscripción está EN_GRACIA', async () => {
      // Arrange
      const suscripcion = createMockSuscripcion(EstadoSuscripcion.EN_GRACIA, 2);
      (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
        suscripcion,
      );

      // Act
      const tieneAcceso = await service.tieneAccesoContenido('tutor-456');

      // Assert
      expect(tieneAcceso).toBe(true);
    });

    it('debe negar acceso a contenido si suscripción está MOROSA', async () => {
      // Arrange
      const suscripcion = createMockSuscripcion(EstadoSuscripcion.MOROSA);
      (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
        suscripcion,
      );

      // Act
      const tieneAcceso = await service.tieneAccesoContenido('tutor-456');

      // Assert
      expect(tieneAcceso).toBe(false);
    });
  });
});
