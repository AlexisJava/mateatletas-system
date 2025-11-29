import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../decorators/roles.decorator';
import { LoginAttemptService } from '../services/login-attempt.service';
import {
  ValidateCredentialsUseCase,
  LoginUseCase,
  LoginEstudianteUseCase,
  CompleteMfaLoginUseCase,
  CambiarPasswordUseCase,
  GetProfileUseCase,
} from '../use-cases';

/**
 * AuthService - Facade Tests
 *
 * Este archivo prueba que AuthService actúe correctamente como facade,
 * delegando a los use-cases correspondientes.
 *
 * Los tests detallados de cada funcionalidad están en:
 * - validate-credentials.use-case.spec.ts (11 tests)
 * - login.use-case.spec.ts (12 tests)
 * - login-estudiante.use-case.spec.ts (10 tests)
 * - complete-mfa-login.use-case.spec.ts (10 tests)
 * - cambiar-password.use-case.spec.ts (11 tests)
 * - get-profile.use-case.spec.ts (11 tests)
 */

// Mock bcrypt globally
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService - Facade', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let validateCredentialsUseCase: ValidateCredentialsUseCase;
  let loginUseCase: LoginUseCase;
  let loginEstudianteUseCase: LoginEstudianteUseCase;
  let completeMfaLoginUseCase: CompleteMfaLoginUseCase;
  let cambiarPasswordUseCase: CambiarPasswordUseCase;
  let getProfileUseCase: GetProfileUseCase;

  const mockPrismaService = {
    tutor: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    estudiante: {
      findUnique: jest.fn(),
    },
    logroEstudiante: {
      count: jest.fn().mockResolvedValue(0),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockLoginAttemptService = {
    checkAndRecordAttempt: jest.fn().mockResolvedValue(undefined),
  };

  // Mock use-cases
  const mockValidateCredentialsUseCase = {
    execute: jest.fn(),
  };

  const mockLoginUseCase = {
    execute: jest.fn(),
  };

  const mockLoginEstudianteUseCase = {
    execute: jest.fn(),
  };

  const mockCompleteMfaLoginUseCase = {
    execute: jest.fn(),
  };

  const mockCambiarPasswordUseCase = {
    execute: jest.fn(),
  };

  const mockGetProfileUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: LoginAttemptService, useValue: mockLoginAttemptService },
        {
          provide: ValidateCredentialsUseCase,
          useValue: mockValidateCredentialsUseCase,
        },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        {
          provide: LoginEstudianteUseCase,
          useValue: mockLoginEstudianteUseCase,
        },
        {
          provide: CompleteMfaLoginUseCase,
          useValue: mockCompleteMfaLoginUseCase,
        },
        {
          provide: CambiarPasswordUseCase,
          useValue: mockCambiarPasswordUseCase,
        },
        { provide: GetProfileUseCase, useValue: mockGetProfileUseCase },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    validateCredentialsUseCase = module.get<ValidateCredentialsUseCase>(
      ValidateCredentialsUseCase,
    );
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    loginEstudianteUseCase = module.get<LoginEstudianteUseCase>(
      LoginEstudianteUseCase,
    );
    completeMfaLoginUseCase = module.get<CompleteMfaLoginUseCase>(
      CompleteMfaLoginUseCase,
    );
    cambiarPasswordUseCase = module.get<CambiarPasswordUseCase>(
      CambiarPasswordUseCase,
    );
    getProfileUseCase = module.get<GetProfileUseCase>(GetProfileUseCase);

    jest.clearAllMocks();
  });

  describe('register - Registro de Tutores (implementación directa)', () => {
    it('should register a new tutor successfully', async () => {
      const registerDto = {
        email: 'nuevo@test.com',
        password: 'Password123!',
        nombre: 'Nuevo',
        apellido: 'Usuario',
        dni: '12345678',
        telefono: '555-1234',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrismaService.tutor.create.mockResolvedValue({
        id: 'new-tutor-id',
        email: registerDto.email,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        dni: registerDto.dni,
        telefono: registerDto.telefono,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result.message).toBe('Tutor registrado exitosamente');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.role).toBe(Role.TUTOR);
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const registerDto = {
        email: 'existing@test.com',
        password: 'Password123!',
        nombre: 'Test',
        apellido: 'User',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Delegación a Use-Cases', () => {
    it('should delegate validateUser to ValidateCredentialsUseCase', async () => {
      const mockResult = { id: 'tutor-1', email: 'test@test.com' };
      mockValidateCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const result = await service.validateUser('test@test.com', 'password');

      expect(mockValidateCredentialsUseCase.execute).toHaveBeenCalledWith(
        'test@test.com',
        'password',
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate login to LoginUseCase', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const mockResult = { access_token: 'token', user: { id: '1' } };
      mockLoginUseCase.execute.mockResolvedValue(mockResult);

      const result = await service.login(loginDto, '127.0.0.1');

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate loginEstudiante to LoginEstudianteUseCase', async () => {
      const loginDto = { username: 'student1', password: 'password' };
      const mockResult = {
        access_token: 'token',
        user: { id: '1', role: 'ESTUDIANTE' },
      };
      mockLoginEstudianteUseCase.execute.mockResolvedValue(mockResult);

      const result = await service.loginEstudiante(loginDto, '127.0.0.1');

      expect(mockLoginEstudianteUseCase.execute).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate completeMfaLogin to CompleteMfaLoginUseCase', async () => {
      const mockResult = { access_token: 'token', user: { id: '1' } };
      mockCompleteMfaLoginUseCase.execute.mockResolvedValue(mockResult);

      const result = await service.completeMfaLogin('mfa-token', '123456');

      expect(mockCompleteMfaLoginUseCase.execute).toHaveBeenCalledWith(
        'mfa-token',
        '123456',
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate cambiarPassword to CambiarPasswordUseCase', async () => {
      const mockResult = { success: true, message: 'Contraseña actualizada' };
      mockCambiarPasswordUseCase.execute.mockResolvedValue(mockResult);

      const result = await service.cambiarPassword(
        'user-1',
        'oldPass',
        'newPass',
      );

      expect(mockCambiarPasswordUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'oldPass',
        'newPass',
      );
      expect(result).toEqual(mockResult);
    });

    it('should delegate getProfile to GetProfileUseCase', async () => {
      const mockResult = {
        id: 'user-1',
        email: 'test@test.com',
        role: 'TUTOR',
      };
      mockGetProfileUseCase.execute.mockResolvedValue(mockResult);

      const result = await service.getProfile('user-1', 'TUTOR');

      expect(mockGetProfileUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'TUTOR',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Seguridad', () => {
    it('should NEVER return password_hash in register response', async () => {
      const registerDto = {
        email: 'secure@test.com',
        password: 'SecurePass123!',
        nombre: 'Secure',
        apellido: 'User',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValue(null);
      mockPrismaService.tutor.create.mockResolvedValue({
        id: 'secure-id',
        email: registerDto.email,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password_hash');
    });
  });
});
