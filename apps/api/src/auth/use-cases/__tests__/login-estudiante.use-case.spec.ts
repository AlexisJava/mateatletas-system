/**
 * Test Suite: LoginEstudianteUseCase
 *
 * TDD: Tests escritos PRIMERO antes de la implementación
 *
 * RESPONSABILIDAD ÚNICA:
 * - Autenticar estudiantes por username + password
 * - Incluir datos de casa y tutor
 * - Protección contra timing attacks
 * - Tracking de intentos de login
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginEstudianteUseCase } from '../login-estudiante.use-case';
import { PrismaService } from '../../../core/database/prisma.service';
import { LoginAttemptService } from '../../services/login-attempt.service';
import * as bcrypt from 'bcrypt';

describe('LoginEstudianteUseCase', () => {
  let useCase: LoginEstudianteUseCase;

  const BCRYPT_ROUNDS = 12;

  const mockPrismaService = {
    estudiante: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockLoginAttemptService = {
    checkAndRecordAttempt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginEstudianteUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: LoginAttemptService, useValue: mockLoginAttemptService },
      ],
    }).compile();

    useCase = module.get<LoginEstudianteUseCase>(LoginEstudianteUseCase);

    jest.clearAllMocks();
  });

  describe('Login exitoso', () => {
    /**
     * TEST 1: should_login_estudiante_successfully
     */
    it('should_login_estudiante_successfully', async () => {
      const password = 'student-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockEstudiante = {
        id: 'est-123',
        username: 'juanito2024',
        email: 'juanito@test.com',
        password_hash: hashedPassword,
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 12,
        nivelEscolar: 'PRIMARIA',
        fotoUrl: null,
        avatarUrl: 'https://avatar.url',
        animacion_idle_url: null,
        xp_total: 100,
        nivel_actual: 5,
        roles: '["estudiante"]',
        tutor: {
          id: 'tutor-123',
          nombre: 'María',
          apellido: 'Pérez',
          email: 'maria@test.com',
        },
        casa: {
          id: 'casa-1',
          nombre: 'Casa Roja',
          colorPrimary: '#FF0000',
        },
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { username: 'juanito2024', password },
        '127.0.0.1',
      );

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.id).toBe('est-123');
      expect(result.user.nombre).toBe('Juan');
      expect(result.user.role).toBe('ESTUDIANTE');
      expect(result.user.casa).toEqual({
        id: 'casa-1',
        nombre: 'Casa Roja',
        colorPrimary: '#FF0000',
      });
      expect(result.user.tutor).toEqual({
        id: 'tutor-123',
        nombre: 'María',
        apellido: 'Pérez',
        email: 'maria@test.com',
      });
    });

    /**
     * TEST 2: should_include_avatar_and_animation_data
     */
    it('should_include_avatar_and_animation_data', async () => {
      const password = 'student-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockEstudiante = {
        id: 'est-avatar',
        username: 'gamer2024',
        password_hash: hashedPassword,
        nombre: 'Gamer',
        apellido: 'Pro',
        edad: 10,
        nivelEscolar: 'PRIMARIA',
        fotoUrl: 'https://foto.url',
        avatarUrl: 'https://readyplayerme.avatar.url',
        animacion_idle_url: 'https://animation.idle.url',
        xp_total: 500,
        nivel_actual: 10,
        roles: '["estudiante"]',
        tutor: null,
        casa: null,
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { username: 'gamer2024', password },
        '127.0.0.1',
      );

      expect(result.user.avatarUrl).toBe('https://readyplayerme.avatar.url');
      expect(result.user.animacion_idle_url).toBe('https://animation.idle.url');
      expect(result.user.fotoUrl).toBe('https://foto.url');
    });
  });

  describe('Credenciales inválidas', () => {
    /**
     * TEST 3: should_throw_unauthorized_when_username_not_found
     */
    it('should_throw_unauthorized_when_username_not_found', async () => {
      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        useCase.execute(
          { username: 'nonexistent', password: 'password' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        mockLoginAttemptService.checkAndRecordAttempt,
      ).toHaveBeenCalledWith('nonexistent', '127.0.0.1', false);
    });

    /**
     * TEST 4: should_throw_unauthorized_when_password_invalid
     */
    it('should_throw_unauthorized_when_password_invalid', async () => {
      const hashedPassword = await bcrypt.hash(
        'correct-password',
        BCRYPT_ROUNDS,
      );
      const mockEstudiante = {
        id: 'est-123',
        username: 'student1',
        password_hash: hashedPassword,
        nombre: 'Test',
        apellido: 'User',
        roles: '["estudiante"]',
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        useCase.execute(
          { username: 'student1', password: 'wrong-password' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * TEST 5: should_throw_unauthorized_when_no_password_hash
     */
    it('should_throw_unauthorized_when_no_password_hash', async () => {
      const mockEstudiante = {
        id: 'est-no-hash',
        username: 'student-no-hash',
        password_hash: null, // Sin credenciales propias
        nombre: 'No',
        apellido: 'Credentials',
        roles: '["estudiante"]',
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        useCase.execute(
          { username: 'student-no-hash', password: 'any-password' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Seguridad', () => {
    /**
     * TEST 6: should_always_execute_bcrypt_for_timing_attack_protection
     */
    it('should_always_execute_bcrypt_for_timing_attack_protection', async () => {
      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const startTime = Date.now();
      await expect(
        useCase.execute(
          { username: 'nonexistent', password: 'any-password' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);
      const duration = Date.now() - startTime;

      // Debe tomar tiempo (bcrypt ejecutado contra dummy hash)
      expect(duration).toBeGreaterThan(10);
    });

    /**
     * TEST 7: should_record_failed_attempt
     */
    it('should_record_failed_attempt', async () => {
      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(null);
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await expect(
        useCase.execute(
          { username: 'hacker', password: 'guess' },
          '192.168.1.100',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(
        mockLoginAttemptService.checkAndRecordAttempt,
      ).toHaveBeenCalledWith('hacker', '192.168.1.100', false);
    });

    /**
     * TEST 8: should_record_successful_attempt
     */
    it('should_record_successful_attempt', async () => {
      const password = 'valid-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockEstudiante = {
        id: 'est-success',
        username: 'success-student',
        password_hash: hashedPassword,
        nombre: 'Success',
        apellido: 'Student',
        roles: '["estudiante"]',
        tutor: null,
        casa: null,
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      await useCase.execute(
        { username: 'success-student', password },
        '192.168.1.100',
      );

      expect(
        mockLoginAttemptService.checkAndRecordAttempt,
      ).toHaveBeenCalledWith('success-student', '192.168.1.100', true);
    });
  });

  describe('Estructura de respuesta', () => {
    /**
     * TEST 9: should_return_correct_structure
     */
    it('should_return_correct_structure', async () => {
      const password = 'student-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockEstudiante = {
        id: 'est-structure',
        username: 'structure-test',
        email: 'structure@test.com',
        password_hash: hashedPassword,
        nombre: 'Structure',
        apellido: 'Test',
        edad: 11,
        nivelEscolar: 'SECUNDARIA',
        fotoUrl: null,
        avatarUrl: null,
        animacion_idle_url: null,
        xp_total: 250,
        nivel_actual: 7,
        roles: '["estudiante"]',
        tutor: {
          id: 'tutor-1',
          nombre: 'Tutor',
          apellido: 'Test',
          email: 'tutor@test.com',
        },
        casa: {
          id: 'casa-2',
          nombre: 'Casa Azul',
          colorPrimary: '#0000FF',
        },
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { username: 'structure-test', password },
        '127.0.0.1',
      );

      expect(result).toHaveProperty('access_token');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('nombre');
      expect(result.user).toHaveProperty('apellido');
      expect(result.user).toHaveProperty('edad');
      expect(result.user).toHaveProperty('nivelEscolar');
      expect(result.user).toHaveProperty('fotoUrl');
      expect(result.user).toHaveProperty('avatarUrl');
      expect(result.user).toHaveProperty('animacion_idle_url');
      expect(result.user).toHaveProperty('xp_total');
      expect(result.user).toHaveProperty('nivel_actual');
      expect(result.user).toHaveProperty('casa');
      expect(result.user).toHaveProperty('tutor');
      expect(result.user).toHaveProperty('role');
    });

    /**
     * TEST 10: should_use_username_as_email_fallback
     */
    it('should_use_username_as_email_fallback', async () => {
      const password = 'student-password';
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const mockEstudiante = {
        id: 'est-no-email',
        username: 'no-email-student',
        email: null, // Sin email
        password_hash: hashedPassword,
        nombre: 'No',
        apellido: 'Email',
        roles: '["estudiante"]',
        tutor: null,
        casa: null,
      };

      mockPrismaService.estudiante.findUnique.mockResolvedValueOnce(
        mockEstudiante,
      );
      mockLoginAttemptService.checkAndRecordAttempt.mockResolvedValueOnce(
        undefined,
      );

      const result = await useCase.execute(
        { username: 'no-email-student', password },
        '127.0.0.1',
      );

      // Debe usar username como fallback de email
      expect(result.user.email).toBe('no-email-student');
    });
  });
});
