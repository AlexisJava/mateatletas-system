import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ClaseGrupoLiveService } from '../services/clase-grupo-live.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('ClaseGrupoLiveService', () => {
  let service: ClaseGrupoLiveService;
  let prisma: PrismaService;

  const mockClaseGrupo = {
    id: 'clase-grupo-123',
    nombre: 'Grupo Lunes 16:00 - Básico 1',
    docenteId: 'docente-123',
    estadoClase: 'Programada',
    activo: true,
    livekitRoomName: null,
    iniciadaEn: null,
    finalizadaEn: null,
  };

  const createMockPrismaService = () => ({
    claseGrupo: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaseGrupoLiveService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<ClaseGrupoLiveService>(ClaseGrupoLiveService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('iniciarClase', () => {
    it('should_start_class_when_docente_is_titular_and_class_is_programada', async () => {
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      jest
        .spyOn(prisma.claseGrupo, 'findUnique')
        .mockResolvedValue(mockClaseGrupo as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'EnVivo',
        iniciadaEn: now,
        livekitRoomName: 'clase-grupo-clase-grupo-123',
      } as any);

      const result = await service.iniciarClase(
        'clase-grupo-123',
        'docente-123',
      );

      expect(result.estadoClase).toBe('EnVivo');
      expect(result.iniciadaEn).toEqual(now);
      expect(result.mensaje).toBe('Clase iniciada exitosamente');
      expect(prisma.claseGrupo.update).toHaveBeenCalledWith({
        where: { id: 'clase-grupo-123' },
        data: {
          estadoClase: 'EnVivo',
          iniciadaEn: expect.any(Date),
          finalizadaEn: null,
          livekitRoomName: 'clase-grupo-clase-grupo-123',
        },
        select: expect.any(Object),
      });

      jest.useRealTimers();
    });

    it('should_throw_NotFoundException_when_class_does_not_exist', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue(null);

      await expect(
        service.iniciarClase('no-existe', 'docente-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_ForbiddenException_when_docente_is_not_titular', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        docenteId: 'otro-docente',
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_throw_BadRequestException_when_class_is_already_EnVivo', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'EnVivo',
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_throw_BadRequestException_when_class_is_Finalizada', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'Finalizada',
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_throw_BadRequestException_when_class_is_Cancelada', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'Cancelada',
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_throw_BadRequestException_when_class_is_not_activo', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        activo: false,
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_preserve_existing_livekitRoomName_if_already_set', async () => {
      const existingRoomName = 'clase-custom-room';
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        livekitRoomName: existingRoomName,
      } as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'EnVivo',
        iniciadaEn: new Date(),
        livekitRoomName: existingRoomName,
      } as any);

      await service.iniciarClase('clase-grupo-123', 'docente-123');

      expect(prisma.claseGrupo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            livekitRoomName: existingRoomName,
          }),
        }),
      );
    });
  });

  describe('finalizarClase', () => {
    it('should_finalize_class_and_calculate_duration', async () => {
      const iniciada = new Date('2025-01-06T14:00:00Z');
      const finalizada = new Date('2025-01-06T14:45:00Z');
      jest.useFakeTimers().setSystemTime(finalizada);

      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'EnVivo',
        iniciadaEn: iniciada,
      } as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'Finalizada',
        iniciadaEn: iniciada,
        finalizadaEn: finalizada,
      } as any);

      const result = await service.finalizarClase(
        'clase-grupo-123',
        'docente-123',
      );

      expect(result.estadoClase).toBe('Finalizada');
      expect(result.duracionMinutos).toBe(45);
      expect(result.mensaje).toBe('Clase finalizada exitosamente');

      jest.useRealTimers();
    });

    it('should_throw_NotFoundException_when_class_does_not_exist', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue(null);

      await expect(
        service.finalizarClase('no-existe', 'docente-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_ForbiddenException_when_docente_is_not_titular', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'EnVivo',
        docenteId: 'otro-docente',
      } as any);

      await expect(
        service.finalizarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_throw_BadRequestException_when_class_is_not_EnVivo', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'Programada',
      } as any);

      await expect(
        service.finalizarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_return_zero_duration_when_iniciadaEn_is_null', async () => {
      const finalizada = new Date('2025-01-06T14:45:00Z');
      jest.useFakeTimers().setSystemTime(finalizada);

      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'EnVivo',
        iniciadaEn: null,
      } as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        ...mockClaseGrupo,
        estadoClase: 'Finalizada',
        iniciadaEn: null,
        finalizadaEn: finalizada,
      } as any);

      const result = await service.finalizarClase(
        'clase-grupo-123',
        'docente-123',
      );

      expect(result.duracionMinutos).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('obtenerEstadoClase', () => {
    it('should_return_class_state', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        id: 'clase-grupo-123',
        nombre: 'Grupo Lunes',
        estadoClase: 'Programada',
        iniciadaEn: null,
        finalizadaEn: null,
        livekitRoomName: null,
      } as any);

      const result = await service.obtenerEstadoClase('clase-grupo-123');

      expect(result.id).toBe('clase-grupo-123');
      expect(result.estadoClase).toBe('Programada');
    });

    it('should_throw_NotFoundException_when_class_does_not_exist', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue(null);

      await expect(service.obtenerEstadoClase('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reiniciarEstadoClase', () => {
    it('should_reset_class_state_to_Programada', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        id: 'clase-grupo-123',
      } as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        id: 'clase-grupo-123',
        nombre: 'Grupo Lunes',
        estadoClase: 'Programada',
        iniciadaEn: null,
        finalizadaEn: null,
        livekitRoomName: 'clase-grupo-clase-grupo-123',
      } as any);

      const result = await service.reiniciarEstadoClase('clase-grupo-123');

      expect(result.estadoClase).toBe('Programada');
      expect(result.iniciadaEn).toBeNull();
      expect(result.finalizadaEn).toBeNull();
      expect(prisma.claseGrupo.update).toHaveBeenCalledWith({
        where: { id: 'clase-grupo-123' },
        data: {
          estadoClase: 'Programada',
          iniciadaEn: null,
          finalizadaEn: null,
        },
        select: expect.any(Object),
      });
    });

    it('should_throw_NotFoundException_when_class_does_not_exist', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue(null);

      await expect(service.reiniciarEstadoClase('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
