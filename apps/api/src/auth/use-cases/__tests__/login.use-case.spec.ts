/**
 * Test Suite: LoginUseCase
 *
 * TDD: Tests escritos PRIMERO antes de la implementación
 *
 * RESPONSABILIDAD ÚNICA:
 * - Autenticar usuarios (tutor, docente, admin) por email + password
 * - Manejar protección contra timing attacks
 * - Detectar si requiere MFA
 * - Generar JWT token
 * - Emitir eventos de login
 *
 * SEGURIDAD:
 * - Timing attack protection (bcrypt siempre ejecutado)
 * - Login attempt tracking (lockout)
 * - MFA para admin
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoginUseCase } from '../login.use-case';
import { PrismaService } from '../../../core/database/prisma.service';
import { LoginAttemptService } from '../../services/login-attempt.service';
import * as bcrypt from 'bcrypt';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let eventEmitter: EventEmitter2;
  let loginAttemptService: LoginAttemptService;

  const BCRYPT_ROUNDS = 12;

  const mockPrismaService = {
    tutor: {
      findUnique: jest.fn(),
    },
    docente: {
      findUnique: jest.fn(),
    },
    admin: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockLoginAttemptService = {
    checkAndRecordAttempt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: LoginAttemptService, useValue: mockLoginAttemptService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    loginAttemptService = module.get<LoginAttemptService>(LoginAttemptService);

    jest.clearAllMocks();
  });

  describe('Login de Tutor', () => {
    /**
     * TEST 1: should_login_tutor_successfully
     */
    it('should_login_tutor_successfully', async () => {
      const password = 'valid-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockTutor = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        password_hash: hashedPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        telefono: '1234567890',
        fecha_registro: new Date(),
        ha_completado_onboarding: true,
        roles: '["tutor"]',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { email: 'tutor@test.com', password },
        '127.0.0.1',
      );

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.id).toBe('tutor-123');
      expect(result.user.email).toBe('tutor@test.com');
      expect(result.user.role).toBe('TUTOR');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-in',
        expect.any(Object),
      );
    });

    /**
     * TEST 2: should_throw_unauthorized_when_tutor_not_found
     */
    it('should_throw_unauthorized_when_tutor_not_found', async () => {
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(null);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        useCase.execute(
          { email: 'nonexistent@test.com', password: 'password' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        mockLoginAttemptService.checkAndRecordAttempt,
      ).toHaveBeenCalledWith('nonexistent@test.com', '127.0.0.1', false);
    });

    /**
     * TEST 3: should_throw_unauthorized_when_password_invalid
     */
    it('should_throw_unauthorized_when_password_invalid', async () => {
      const hashedPassword = await bcrypt.hash(
        'correct-password',
        BCRYPT_ROUNDS,
      );
      const mockTutor = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        password_hash: hashedPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
        roles: '["tutor"]',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        useCase.execute(
          { email: 'tutor@test.com', password: 'wrong-password' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Login de Docente', () => {
    /**
     * TEST 4: should_login_docente_successfully
     */
    it('should_login_docente_successfully', async () => {
      const password = 'docente-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockDocente = {
        id: 'docente-123',
        email: 'docente@test.com',
        password_hash: hashedPassword,
        nombre: 'María',
        apellido: 'González',
        titulo: 'Profesora de Matemáticas',
        bio: 'Docente con 10 años de experiencia',
        roles: '["docente"]',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(mockDocente);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { email: 'docente@test.com', password },
        '127.0.0.1',
      );

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.id).toBe('docente-123');
      expect(result.user.role).toBe('DOCENTE');
      expect(result.user).toHaveProperty('titulo');
    });
  });

  describe('Login de Admin', () => {
    /**
     * TEST 5: should_login_admin_successfully_without_mfa
     */
    it('should_login_admin_successfully_without_mfa', async () => {
      const password = 'admin-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@test.com',
        password_hash: hashedPassword,
        nombre: 'Carlos',
        apellido: 'Admin',
        fecha_registro: new Date(),
        dni: '99999999',
        telefono: '9999999999',
        roles: '["admin"]',
        mfa_enabled: false,
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { email: 'admin@test.com', password },
        '127.0.0.1',
      );

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.role).toBe('ADMIN');
    });

    /**
     * TEST 6: should_require_mfa_for_admin_with_mfa_enabled
     */
    it('should_require_mfa_for_admin_with_mfa_enabled', async () => {
      const password = 'admin-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockAdmin = {
        id: 'admin-mfa-123',
        email: 'admin-mfa@test.com',
        password_hash: hashedPassword,
        nombre: 'Admin',
        apellido: 'MFA',
        roles: '["admin"]',
        mfa_enabled: true,
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { email: 'admin-mfa@test.com', password },
        '127.0.0.1',
      );

      expect(result.requires_mfa).toBe(true);
      expect(result.mfa_token).toBeDefined();
      expect(result.access_token).toBeUndefined();
    });
  });

  describe('Seguridad', () => {
    /**
     * TEST 7: should_always_execute_bcrypt_compare_for_timing_attack_protection
     */
    it('should_always_execute_bcrypt_compare_for_timing_attack_protection', async () => {
      // Cuando el usuario no existe, igual debe ejecutar bcrypt.compare
      // para evitar timing attacks
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(null);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const startTime = Date.now();
      await expect(
        useCase.execute(
          { email: 'nonexistent@test.com', password: 'any-password' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);
      const duration = Date.now() - startTime;

      // Debe tomar al menos algo de tiempo (bcrypt ejecutado)
      // Normalmente >50ms con 12 rounds
      expect(duration).toBeGreaterThan(10);
    });

    /**
     * TEST 8: should_record_failed_attempt_on_invalid_credentials
     */
    it('should_record_failed_attempt_on_invalid_credentials', async () => {
      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(null);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        useCase.execute(
          { email: 'test@test.com', password: 'password' },
          '192.168.1.1',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        mockLoginAttemptService.checkAndRecordAttempt,
      ).toHaveBeenCalledWith(
        'test@test.com',
        '192.168.1.1',
        false, // failed attempt
      );
    });

    /**
     * TEST 9: should_record_successful_attempt_on_valid_credentials
     */
    it('should_record_successful_attempt_on_valid_credentials', async () => {
      const password = 'valid-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockTutor = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        password_hash: hashedPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
        roles: '["tutor"]',
        ha_completado_onboarding: true,
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await useCase.execute(
        { email: 'tutor@test.com', password },
        '192.168.1.1',
      );

      expect(
        mockLoginAttemptService.checkAndRecordAttempt,
      ).toHaveBeenCalledWith(
        'tutor@test.com',
        '192.168.1.1',
        true, // successful attempt
      );
    });
  });

  describe('Eventos', () => {
    /**
     * TEST 10: should_emit_user_logged_in_event_on_success
     */
    it('should_emit_user_logged_in_event_on_success', async () => {
      const password = 'valid-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockTutor = {
        id: 'tutor-event-123',
        email: 'tutor-event@test.com',
        password_hash: hashedPassword,
        nombre: 'Event',
        apellido: 'User',
        roles: '["tutor"]',
        ha_completado_onboarding: true,
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await useCase.execute(
        { email: 'tutor-event@test.com', password },
        '127.0.0.1',
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-in',
        expect.objectContaining({
          userId: 'tutor-event-123',
          userType: 'tutor',
          email: 'tutor-event@test.com',
        }),
      );
    });

    /**
     * TEST 11: should_not_emit_event_when_mfa_required
     */
    it('should_not_emit_event_when_mfa_required', async () => {
      const password = 'admin-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockAdmin = {
        id: 'admin-mfa-123',
        email: 'admin-mfa@test.com',
        password_hash: hashedPassword,
        nombre: 'Admin',
        apellido: 'MFA',
        roles: '["admin"]',
        mfa_enabled: true,
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.docente.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await useCase.execute(
        { email: 'admin-mfa@test.com', password },
        '127.0.0.1',
      );

      // No debe emitir evento cuando se requiere MFA
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('Tipos explícitos', () => {
    /**
     * TEST 12: should_return_correct_structure_for_tutor
     */
    it('should_return_correct_structure_for_tutor', async () => {
      const password = 'valid-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockTutor = {
        id: 'tutor-structure',
        email: 'tutor@test.com',
        password_hash: hashedPassword,
        nombre: 'Structure',
        apellido: 'Test',
        dni: '12345678',
        telefono: '1234567890',
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
        roles: '["tutor"]',
      };

      mockPrismaService.tutor.findUnique.mockResolvedValueOnce(mockTutor);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { email: 'tutor@test.com', password },
        '127.0.0.1',
      );

      expect(result).toHaveProperty('access_token');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('nombre');
      expect(result.user).toHaveProperty('apellido');
      expect(result.user).toHaveProperty('dni');
      expect(result.user).toHaveProperty('telefono');
      expect(result.user).toHaveProperty('ha_completado_onboarding');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('roles');
    });
  });
});
