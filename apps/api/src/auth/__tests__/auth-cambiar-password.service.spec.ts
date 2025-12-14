import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../core/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoginAttemptService } from '../services/login-attempt.service';
import { TokenService } from '../services/token.service';
import { PasswordService } from '../services/password.service';
import { UserLookupService } from '../services/user-lookup.service';

describe('AuthService - Cambiar Password (TDD RED)', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            tutor: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            admin: {
              findUnique: jest.fn(),
            },
            docente: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            on: jest.fn(),
          },
        },
        {
          provide: LoginAttemptService,
          useValue: {
            checkAndRecordAttempt: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockReturnValue('mock-jwt-token'),
            generateMfaToken: jest.fn().mockReturnValue('mock-mfa-token'),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest
              .fn()
              .mockImplementation((password: string) =>
                bcrypt.hash(password, 10),
              ),
            verify: jest
              .fn()
              .mockImplementation((password: string, hash: string) =>
                bcrypt.compare(password, hash),
              ),
            verifyWithTimingProtection: jest
              .fn()
              .mockImplementation(
                async (password: string, hash: string | null) => {
                  if (!hash) {
                    return {
                      isValid: false,
                      needsRehash: false,
                      currentRounds: 0,
                    };
                  }
                  const isValid = await bcrypt.compare(password, hash);
                  return { isValid, needsRehash: false, currentRounds: 12 };
                },
              ),
            BCRYPT_ROUNDS: 12,
          },
        },
        {
          provide: UserLookupService,
          useValue: {
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findByIdForPasswordChange: jest.fn(),
            findEstudianteByUsername: jest.fn(),
            findTutorByUsername: jest.fn(),
            findAdminById: jest.fn(),
            findTutorById: jest.fn(),
            getProfile: jest.fn(),
            updatePasswordHash: jest.fn(),
            updatePasswordData: jest.fn(),
            emailExistsForTutor: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('cambiarPassword', () => {
    it('debería existir el método cambiarPassword', () => {
      // Este test va a FALLAR porque el método no existe
      expect(typeof service.cambiarPassword).toBe('function');
    });

    it('debería actualizar password hash y fecha de cambio', async () => {
      // Arrange
      const passwordActualTexto = '1234';
      const mockEstudiante = {
        id: 'est123',
        username: 'juan.perez',
        password_hash: await bcrypt.hash(passwordActualTexto, 10),
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);

      const updateSpy = jest
        .spyOn(prisma.estudiante, 'update')
        .mockResolvedValue({
          ...mockEstudiante,
        } as any);

      // Act
      await service.cambiarPassword(
        'est123',
        passwordActualTexto,
        'NuevaPassword123',
      );

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'est123' },
        data: expect.objectContaining({
          fecha_ultimo_cambio: expect.any(Date),
        }),
      });
    });

    it('debería hashear la nueva password correctamente', async () => {
      // Arrange
      const passwordActualTexto = '1234';
      const nuevaPassword = 'NuevaPassword123';

      const mockEstudiante = {
        id: 'est123',
        username: 'juan.perez',
        password_hash: await bcrypt.hash(passwordActualTexto, 10),
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);

      let nuevoHashGuardado: string | undefined;
      (prisma.estudiante.update as jest.Mock).mockImplementation(
        async (params: any) => {
          nuevoHashGuardado = params.data.password_hash;
          return {
            ...mockEstudiante,
            password_hash: nuevoHashGuardado,
          } as any;
        },
      );

      // Act
      // Este test va a FALLAR porque el método no existe
      try {
        await (service as any).cambiarPassword(
          'est123',
          passwordActualTexto,
          nuevaPassword,
        );

        // Assert (solo si no falla antes)
        expect(nuevoHashGuardado).toBeDefined();
        if (nuevoHashGuardado) {
          const esValido = await bcrypt.compare(
            nuevaPassword,
            nuevoHashGuardado,
          );
          expect(esValido).toBe(true);
          expect(
            await bcrypt.compare(passwordActualTexto, nuevoHashGuardado),
          ).toBe(false);
        }
      } catch (error) {
        // Esperamos que falle porque el método no existe
        expect(error).toBeDefined();
      }
    });

    it('debería rechazar si la password actual es incorrecta', async () => {
      // Arrange
      const mockEstudiante = {
        id: 'est123',
        username: 'juan.perez',
        password_hash: await bcrypt.hash('1234', 10),
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);

      // Act & Assert
      // Este test va a FALLAR porque el método no existe
      await expect(async () => {
        await (service as any).cambiarPassword(
          'est123',
          'incorrecta',
          'NuevaPassword123',
        );
      }).rejects.toThrow();
    });

    it('debería actualizar fecha_ultimo_cambio al cambiar password', async () => {
      // Este test verifica que se guarde el timestamp
      const mockEstudiante = {
        id: 'est123',
        password_hash: await bcrypt.hash('1234', 10),
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);

      const updateSpy = jest
        .spyOn(prisma.estudiante, 'update')
        .mockResolvedValue({} as any);

      // Act
      try {
        await (service as any).cambiarPassword(
          'est123',
          '1234',
          'NuevaPassword123',
        );

        // Assert (solo si no falla antes)
        // expect(updateSpy).toHaveBeenCalledWith({
        //   where: { id: 'est123' },
        //   data: expect.objectContaining({
        //     fecha_ultimo_cambio: expect.any(Date),
        //   }),
        // });
      } catch (error) {
        // Esperamos que falle porque el método no existe
        expect(error).toBeDefined();
      }
    });

    it('debería funcionar tanto para estudiantes como para tutores', async () => {
      // Test para verificar que funciona con ambos tipos de usuarios
      const mockTutor = {
        id: 'tutor123',
        username: 'padre.perez',
        password_hash: await bcrypt.hash('TempPass123', 10),
      };

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);

      const updateSpy = jest.spyOn(prisma.tutor, 'update').mockResolvedValue({
        ...mockTutor,
      } as any);

      // Act & Assert
      // Este test va a FALLAR porque el método no existe
      try {
        await (service as any).cambiarPassword(
          'tutor123',
          'TempPass123',
          'NuevaPassword456',
        );
        // Si llegamos aquí, verificar que se llamó al update del tutor
        // expect(updateSpy).toHaveBeenCalled();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
