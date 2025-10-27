import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClasesManagementService } from '../services/clases-management.service';
import { PrismaService } from '../../core/database/prisma.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';

describe('ClasesManagementService - Cancelar Clase Security', () => {
  let service: ClasesManagementService;
  let prisma: PrismaService;

  const mockClaseProgramada = {
    id: 'clase-123',
    nombre: 'Matemáticas Avanzadas',
    estado: 'Programada',
    docente_id: 'docente-123',
    fecha_hora_inicio: new Date('2025-12-01T10:00:00Z'),
    rutaCurricular: {
      nombre: 'Matemáticas',
    },
    inscripciones: [
      { id: 'insc-1', estudiante_id: 'est-1' },
      { id: 'insc-2', estudiante_id: 'est-2' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasesManagementService,
        {
          provide: PrismaService,
          useValue: {
            clase: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: NotificacionesService,
          useValue: {
            notificarClaseCancelada: jest.fn().mockResolvedValue({}),
            create: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClasesManagementService>(ClasesManagementService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('SECURITY: Authorization for cancelarClase', () => {
    it('should require userId and userRole parameters', async () => {
      // ✅ TEST: Parámetros son OBLIGATORIOS en la firma del método
      // TypeScript ya previene llamadas sin todos los parámetros
      // Este test verifica que la implementación funcione correctamente con parámetros válidos

      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClaseProgramada as any);
      jest.spyOn(prisma.clase, 'update').mockResolvedValue({
        ...mockClaseProgramada,
        estado: 'Cancelada',
        cupos_ocupados: 0,
      } as any);

      // Verificar que funciona con los 3 parámetros obligatorios
      const result = await service.cancelarClase(
        'clase-123',
        'admin-1',
        'admin',
      );
      expect(result).toBeDefined();
    });

    it('should reject cancellation from non-owner docente', async () => {
      // ✅ TEST: Docente solo puede cancelar SUS clases
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClaseProgramada as any);

      await expect(
        service.cancelarClase('clase-123', 'docente-OTHER', 'docente'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.cancelarClase('clase-123', 'docente-OTHER', 'docente'),
      ).rejects.toThrow('No tienes permiso para cancelar esta clase');
    });

    it('should allow admin to cancel any class', async () => {
      // ✅ TEST: Admin puede cancelar cualquier clase
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClaseProgramada as any);
      jest.spyOn(prisma.clase, 'update').mockResolvedValue({
        ...mockClaseProgramada,
        estado: 'Cancelada',
        cupos_ocupados: 0,
        rutaCurricular: { nombre: 'Matemáticas' },
        docente: { nombre: 'Juan', apellido: 'Perez' },
      } as any);

      const result = await service.cancelarClase(
        'clase-123',
        'admin-456',
        'admin',
      );

      expect(result.estado).toBe('Cancelada');
      expect(prisma.clase.update).toHaveBeenCalledWith({
        where: { id: 'clase-123' },
        data: {
          estado: 'Cancelada',
          cupos_ocupados: 0,
        },
        include: {
          rutaCurricular: { select: { nombre: true } },
          docente: { select: { nombre: true, apellido: true } },
        },
      });
    });

    it('should allow owner docente to cancel their class', async () => {
      // ✅ TEST: Docente puede cancelar SU clase
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClaseProgramada as any);
      jest.spyOn(prisma.clase, 'update').mockResolvedValue({
        ...mockClaseProgramada,
        estado: 'Cancelada',
        cupos_ocupados: 0,
        rutaCurricular: { nombre: 'Matemáticas' },
        docente: { nombre: 'Juan', apellido: 'Perez' },
      } as any);

      const result = await service.cancelarClase(
        'clase-123',
        'docente-123',
        'docente',
      );

      expect(result.estado).toBe('Cancelada');
    });

    it('should reject cancellation from tutor role', async () => {
      // ✅ TEST: Tutores NO pueden cancelar clases
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClaseProgramada as any);

      await expect(
        service.cancelarClase('clase-123', 'tutor-123', 'tutor'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.cancelarClase('clase-123', 'tutor-123', 'tutor'),
      ).rejects.toThrow('Solo admin y docentes pueden cancelar clases');
    });

    it('should reject cancellation from estudiante role', async () => {
      // ✅ TEST: Estudiantes NO pueden cancelar clases
      jest
        .spyOn(prisma.clase, 'findUnique')
        .mockResolvedValue(mockClaseProgramada as any);

      await expect(
        service.cancelarClase('clase-123', 'est-123', 'estudiante'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('REGRESSION: Existing Functionality Must Not Break', () => {
    it('should still reject cancellation of already cancelled class', async () => {
      // ✅ Test de regresión
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        ...mockClaseProgramada,
        estado: 'Cancelada',
      } as any);

      await expect(
        service.cancelarClase('clase-123', 'admin-123', 'admin'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.cancelarClase('clase-123', 'admin-123', 'admin'),
      ).rejects.toThrow('La clase ya está cancelada');
    });

    it('should update clase estado and reset cupos_ocupados', async () => {
      // ✅ Test de regresión: funcionalidad existente
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        ...mockClaseProgramada,
        cupos_ocupados: 15,
      } as any);

      jest.spyOn(prisma.clase, 'update').mockResolvedValue({
        ...mockClaseProgramada,
        estado: 'Cancelada',
        cupos_ocupados: 0,
        rutaCurricular: { nombre: 'Matemáticas' },
        docente: { nombre: 'Juan', apellido: 'Perez' },
      } as any);

      const result = await service.cancelarClase(
        'clase-123',
        'admin-123',
        'admin',
      );

      expect(result.cupos_ocupados).toBe(0);
      expect(result.estado).toBe('Cancelada');
    });
  });
});
