import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { LivekitTokenService } from '../services/livekit-token.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('LivekitTokenService', () => {
  let service: LivekitTokenService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockClaseGrupo = {
    id: 'clase-grupo-123',
    nombre: 'Grupo B1 - Matemática',
    docente_id: 'docente-123',
    activo: true,
  };

  const mockComision = {
    id: 'comision-456',
    nombre: 'Colonia Turno Mañana',
    docente_id: 'docente-123',
    activo: true,
  };

  const mockInscripcionClaseGrupo = {
    id: 'inscripcion-1',
    clase_grupo_id: 'clase-grupo-123',
    estudiante_id: 'estudiante-789',
    fecha_baja: null, // Inscripción activa = sin fecha de baja
  };

  const mockInscripcionComision = {
    id: 'inscripcion-2',
    comision_id: 'comision-456',
    estudiante_id: 'estudiante-789',
    estado: 'Confirmada',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LivekitTokenService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                LIVEKIT_API_KEY: 'test-api-key',
                LIVEKIT_API_SECRET: 'test-api-secret-minimum-32-chars-long',
                LIVEKIT_URL: 'wss://test.livekit.cloud',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            claseGrupo: {
              findUnique: jest.fn(),
            },
            comision: {
              findUnique: jest.fn(),
            },
            inscripcionClaseGrupo: {
              findFirst: jest.fn(),
            },
            inscripcionComision: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LivekitTokenService>(LivekitTokenService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('generarTokenDocente', () => {
    it('should_generate_token_with_canPublish_true_when_docente_owns_ClaseGrupo', async () => {
      jest
        .spyOn(prisma.claseGrupo, 'findUnique')
        .mockResolvedValue(mockClaseGrupo as any);

      const result = await service.generarTokenDocente('docente-123', {
        claseGrupoId: 'clase-grupo-123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('wsUrl', 'wss://test.livekit.cloud');
      expect(result).toHaveProperty('roomName', 'clase-grupo-clase-grupo-123');
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('should_generate_token_with_canPublish_true_when_docente_owns_Comision', async () => {
      jest
        .spyOn(prisma.comision, 'findUnique')
        .mockResolvedValue(mockComision as any);

      const result = await service.generarTokenDocente('docente-123', {
        comisionId: 'comision-456',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('wsUrl', 'wss://test.livekit.cloud');
      expect(result).toHaveProperty('roomName', 'comision-comision-456');
      expect(typeof result.token).toBe('string');
    });

    it('should_reject_when_docente_does_not_own_ClaseGrupo', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue({
        ...mockClaseGrupo,
        docente_id: 'otro-docente',
      } as any);

      await expect(
        service.generarTokenDocente('docente-123', {
          claseGrupoId: 'clase-grupo-123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_reject_when_docente_does_not_own_Comision', async () => {
      jest.spyOn(prisma.comision, 'findUnique').mockResolvedValue({
        ...mockComision,
        docente_id: 'otro-docente',
      } as any);

      await expect(
        service.generarTokenDocente('docente-123', {
          comisionId: 'comision-456',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_reject_when_both_claseGrupoId_and_comisionId_are_provided', async () => {
      await expect(
        service.generarTokenDocente('docente-123', {
          claseGrupoId: 'clase-grupo-123',
          comisionId: 'comision-456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_reject_when_neither_claseGrupoId_nor_comisionId_are_provided', async () => {
      await expect(
        service.generarTokenDocente('docente-123', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_reject_when_ClaseGrupo_does_not_exist', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue(null);

      await expect(
        service.generarTokenDocente('docente-123', {
          claseGrupoId: 'no-existe',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_reject_when_Comision_does_not_exist', async () => {
      jest.spyOn(prisma.comision, 'findUnique').mockResolvedValue(null);

      await expect(
        service.generarTokenDocente('docente-123', {
          comisionId: 'no-existe',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generarTokenEstudiante', () => {
    it('should_generate_token_with_canPublish_false_when_estudiante_belongs_to_ClaseGrupo', async () => {
      jest
        .spyOn(prisma.claseGrupo, 'findUnique')
        .mockResolvedValue(mockClaseGrupo as any);
      jest
        .spyOn(prisma.inscripcionClaseGrupo, 'findFirst')
        .mockResolvedValue(mockInscripcionClaseGrupo as any);

      const result = await service.generarTokenEstudiante('estudiante-789', {
        claseGrupoId: 'clase-grupo-123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('wsUrl', 'wss://test.livekit.cloud');
      expect(result).toHaveProperty('roomName', 'clase-grupo-clase-grupo-123');
      expect(typeof result.token).toBe('string');
    });

    it('should_generate_token_with_canPublish_false_when_estudiante_has_active_InscripcionComision', async () => {
      jest
        .spyOn(prisma.comision, 'findUnique')
        .mockResolvedValue(mockComision as any);
      jest
        .spyOn(prisma.inscripcionComision, 'findFirst')
        .mockResolvedValue(mockInscripcionComision as any);

      const result = await service.generarTokenEstudiante('estudiante-789', {
        comisionId: 'comision-456',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('wsUrl', 'wss://test.livekit.cloud');
      expect(result).toHaveProperty('roomName', 'comision-comision-456');
    });

    it('should_reject_when_estudiante_does_not_belong_to_ClaseGrupo', async () => {
      jest
        .spyOn(prisma.claseGrupo, 'findUnique')
        .mockResolvedValue(mockClaseGrupo as any);
      jest
        .spyOn(prisma.inscripcionClaseGrupo, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.generarTokenEstudiante('estudiante-789', {
          claseGrupoId: 'clase-grupo-123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_reject_when_estudiante_does_not_have_active_InscripcionComision', async () => {
      jest
        .spyOn(prisma.comision, 'findUnique')
        .mockResolvedValue(mockComision as any);
      jest
        .spyOn(prisma.inscripcionComision, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.generarTokenEstudiante('estudiante-789', {
          comisionId: 'comision-456',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_reject_when_both_ids_are_provided', async () => {
      await expect(
        service.generarTokenEstudiante('estudiante-789', {
          claseGrupoId: 'clase-grupo-123',
          comisionId: 'comision-456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_reject_when_neither_id_is_provided', async () => {
      await expect(
        service.generarTokenEstudiante('estudiante-789', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should_reject_when_ClaseGrupo_does_not_exist', async () => {
      jest.spyOn(prisma.claseGrupo, 'findUnique').mockResolvedValue(null);

      await expect(
        service.generarTokenEstudiante('estudiante-789', {
          claseGrupoId: 'no-existe',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_reject_when_Comision_does_not_exist', async () => {
      jest.spyOn(prisma.comision, 'findUnique').mockResolvedValue(null);

      await expect(
        service.generarTokenEstudiante('estudiante-789', {
          comisionId: 'no-existe',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
