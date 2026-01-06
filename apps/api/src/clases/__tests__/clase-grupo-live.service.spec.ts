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
    docente_id: 'docente-123',
    estado_clase: 'Programada',
    activo: true,
    livekit_room_name: null,
    iniciada_en: null,
    finalizada_en: null,
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
        estado_clase: 'EnVivo',
        iniciada_en: now,
        livekit_room_name: 'clase-grupo-clase-grupo-123',
      } as any);

      const result = await service.iniciarClase(
        'clase-grupo-123',
        'docente-123',
      );

      expect(result.estado_clase).toBe('EnVivo');
      expect(result.iniciada_en).toEqual(now);
      expect(result.mensaje).toBe('Clase iniciada exitosamente');
      expect(prisma.claseGrupo.update).toHaveBeenCalledWith({
        where: { id: 'clase-grupo-123' },
        data: {
          estado_clase: 'EnVivo',
          iniciada_en: expect.any(Date),
          finalizada_en: null,
          livekit_room_name: 'clase-grupo-clase-grupo-123',
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
        docente_id: 'otro-docente',
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_throw_BadRequestException_when_class_is_already_EnVivo', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'EnVivo',
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_throw_BadRequestException_when_class_is_Finalizada', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'Finalizada',
      } as any);

      await expect(
        service.iniciarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_throw_BadRequestException_when_class_is_Cancelada', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'Cancelada',
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

    it('should_preserve_existing_livekit_room_name_if_already_set', async () => {
      const existingRoomName = 'clase-custom-room';
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        livekit_room_name: existingRoomName,
      } as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'EnVivo',
        iniciada_en: new Date(),
        livekit_room_name: existingRoomName,
      } as any);

      await service.iniciarClase('clase-grupo-123', 'docente-123');

      expect(prisma.claseGrupo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            livekit_room_name: existingRoomName,
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
        estado_clase: 'EnVivo',
        iniciada_en: iniciada,
      } as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'Finalizada',
        iniciada_en: iniciada,
        finalizada_en: finalizada,
      } as any);

      const result = await service.finalizarClase(
        'clase-grupo-123',
        'docente-123',
      );

      expect(result.estado_clase).toBe('Finalizada');
      expect(result.duracion_minutos).toBe(45);
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
        estado_clase: 'EnVivo',
        docente_id: 'otro-docente',
      } as any);

      await expect(
        service.finalizarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_throw_BadRequestException_when_class_is_not_EnVivo', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'Programada',
      } as any);

      await expect(
        service.finalizarClase('clase-grupo-123', 'docente-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_return_zero_duration_when_iniciada_en_is_null', async () => {
      const finalizada = new Date('2025-01-06T14:45:00Z');
      jest.useFakeTimers().setSystemTime(finalizada);

      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'EnVivo',
        iniciada_en: null,
      } as any);

      jest.spyOn(prisma.claseGrupo, 'update').mockResolvedValue({
        ...mockClaseGrupo,
        estado_clase: 'Finalizada',
        iniciada_en: null,
        finalizada_en: finalizada,
      } as any);

      const result = await service.finalizarClase(
        'clase-grupo-123',
        'docente-123',
      );

      expect(result.duracion_minutos).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('obtenerEstadoClase', () => {
    it('should_return_class_state', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        id: 'clase-grupo-123',
        nombre: 'Grupo Lunes',
        estado_clase: 'Programada',
        iniciada_en: null,
        finalizada_en: null,
        livekit_room_name: null,
      } as any);

      const result = await service.obtenerEstadoClase('clase-grupo-123');

      expect(result.id).toBe('clase-grupo-123');
      expect(result.estado_clase).toBe('Programada');
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
        estado_clase: 'Programada',
        iniciada_en: null,
        finalizada_en: null,
        livekit_room_name: 'clase-grupo-clase-grupo-123',
      } as any);

      const result = await service.reiniciarEstadoClase('clase-grupo-123');

      expect(result.estado_clase).toBe('Programada');
      expect(result.iniciada_en).toBeNull();
      expect(result.finalizada_en).toBeNull();
      expect(prisma.claseGrupo.update).toHaveBeenCalledWith({
        where: { id: 'clase-grupo-123' },
        data: {
          estado_clase: 'Programada',
          iniciada_en: null,
          finalizada_en: null,
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
